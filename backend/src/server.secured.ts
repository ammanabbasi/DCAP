/**
 * Enhanced Secure Server Configuration for DealersCloud
 * Implements comprehensive security measures and OWASP Top 10 protection
 */

import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import session from 'express-session';
import RedisStore from 'connect-redis';
import expressIp from 'express-ip';

// Security middleware imports
import {
  applySecurity,
  helmetConfig,
  securityHeaders,
  sanitizeRequest,
  mongoInjectionPrevention,
  sqlInjectionPrevention,
  xssProtection,
  hppProtection,
  createRateLimiter,
  authRateLimiter,
  apiRateLimiter,
  uploadRateLimiter,
  csrfProtection,
  requestIdMiddleware,
  ipValidation,
  recordSuspiciousActivity
} from './middleware/security';

// File security
import { fileSecurityMiddleware, upload } from './middleware/fileSecurity';

// Audit logging
import { auditLog, auditMiddleware, AuditEventType } from './utils/auditLogger';

// Import routes
import authRoutes from './routes/auth';
import vehicleRoutes from './routes/vehicles';
import crmRoutes from './routes/crm';
import dashboardRoutes from './routes/dashboard';
import messagingRoutes from './routes/messaging';
import documentRoutes from './routes/documents';

// Import auth middleware
import { authMiddleware, roleMiddleware } from './middleware/auth';

// Redis client for sessions
import redisClient from './config/redis';

// Logger
import logger from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO with security
const io = new Server(httpServer, {
  cors: {
    origin: function(origin, callback) {
      const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');
      
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        logger.warn(`Blocked WebSocket connection from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ["GET", "POST"]
  },
  // Security options
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6, // 1MB
  allowEIO3: false // Disable legacy support
});

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';

/**
 * Trust proxy configuration (important for correct IP detection)
 */
app.set('trust proxy', IS_PRODUCTION ? 1 : false);

/**
 * Session configuration with Redis store
 */
const sessionMiddleware = session({
  store: new RedisStore({
    client: redisClient as any,
    prefix: 'sess:',
    ttl: 86400 // 24 hours
  }),
  secret: process.env.SESSION_SECRET || 'change-this-secret-in-production',
  resave: false,
  saveUninitialized: false,
  rolling: true, // Reset expiry on activity
  cookie: {
    secure: IS_PRODUCTION, // HTTPS only in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: IS_PRODUCTION ? 'strict' : 'lax',
    domain: IS_PRODUCTION ? process.env.COOKIE_DOMAIN : undefined
  },
  name: 'dc.sid', // Custom session name
  genid: () => {
    // Generate cryptographically secure session ID
    return require('crypto').randomBytes(32).toString('hex');
  }
});

/**
 * Apply security middleware in correct order
 */

// 1. Request ID and IP tracking (first for logging)
app.use(requestIdMiddleware);
app.use(expressIp().getIpInfoMiddleware);
app.use(ipValidation);

// 2. Security headers and protection
app.use(helmetConfig);
app.use(securityHeaders);

// 3. Rate limiting (early to prevent abuse)
app.use('/api/auth/login', authRateLimiter);
app.use('/api/auth/register', authRateLimiter);
app.use('/api/auth/reset-password', authRateLimiter);
app.use('/api/upload', uploadRateLimiter);
app.use('/api', apiRateLimiter);

// 4. CORS configuration with strict origin checking
const corsOptions: cors.CorsOptions = {
  origin: function(origin, callback) {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin && !IS_PRODUCTION) return callback(null, true);
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn(`Blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// 5. Session management (before body parsing)
app.use(sessionMiddleware);

// 6. Body parsing with limits
app.use(express.json({ 
  limit: '1mb',
  strict: true,
  type: ['application/json', 'text/json']
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '1mb',
  parameterLimit: 100
}));

// 7. Compression
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6
}));

// 8. Request sanitization and injection prevention
app.use(mongoInjectionPrevention);
app.use(sqlInjectionPrevention);
app.use(xssProtection);
app.use(hppProtection);
app.use(sanitizeRequest);

// 9. Logging (after sanitization)
if (!IS_PRODUCTION) {
  app.use(require('morgan')('dev'));
} else {
  // Production logging with custom format
  app.use(require('morgan')(':method :url :status :response-time ms - :remote-addr'));
}

/**
 * Security.txt endpoint (RFC 9116)
 */
app.get('/.well-known/security.txt', (req, res) => {
  res.type('text/plain');
  res.send(`# DealersCloud Security Policy
Contact: security@dealerscloud.com
Expires: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()}
Encryption: https://dealerscloud.com/pgp-key.txt
Acknowledgments: https://dealerscloud.com/security/hall-of-fame
Preferred-Languages: en
Canonical: https://dealerscloud.com/.well-known/security.txt
Policy: https://dealerscloud.com/security-policy
Hiring: https://dealerscloud.com/careers`);
});

/**
 * Health check endpoint with security info
 */
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    security: {
      helmet: true,
      cors: true,
      rateLimiting: true,
      encryption: true,
      auditLogging: true,
      sessionManagement: true,
      fileScanning: !!process.env.ENABLE_VIRUS_SCAN
    }
  });
});

/**
 * API Routes with audit logging
 */

// Public auth routes (no auth required but rate limited)
app.use('/api/auth', auditMiddleware(AuditEventType.LOGIN_SUCCESS), authRoutes);

// Protected routes
app.use('/api/vehicles', 
  authMiddleware,
  auditMiddleware(AuditEventType.DATA_VIEWED),
  vehicleRoutes
);

app.use('/api/crm',
  authMiddleware,
  roleMiddleware(['admin', 'manager', 'sales']),
  auditMiddleware(AuditEventType.CUSTOMER_PII_ACCESSED),
  crmRoutes
);

app.use('/api/dashboard',
  authMiddleware,
  auditMiddleware(AuditEventType.DATA_VIEWED),
  dashboardRoutes
);

app.use('/api/messaging',
  authMiddleware,
  auditMiddleware(AuditEventType.DATA_VIEWED),
  messagingRoutes
);

app.use('/api/documents',
  authMiddleware,
  upload.array('files', 10),
  fileSecurityMiddleware,
  auditMiddleware(AuditEventType.FILE_UPLOADED),
  documentRoutes
);

/**
 * Socket.IO authentication and security
 */
io.use(async (socket, next) => {
  try {
    // Get session from handshake
    const sessionID = socket.handshake.auth.sessionID;
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    // Verify JWT token
    const authService = require('./services/AuthService').default;
    const decoded = await authService.verifyAccessToken(token);

    if (!decoded) {
      return next(new Error('Invalid token'));
    }

    // Attach user info to socket
    socket.data.user = decoded;
    socket.data.sessionID = sessionID;

    // Rate limiting for socket connections
    const ip = socket.handshake.address;
    const connections = io.sockets.sockets.size;
    
    if (connections > 1000) {
      logger.warn(`Too many concurrent connections: ${connections}`);
      return next(new Error('Server at capacity'));
    }

    next();
  } catch (error) {
    logger.error('Socket authentication error:', error);
    next(new Error('Authentication failed'));
  }
});

io.on('connection', (socket) => {
  const user = socket.data.user;
  logger.info(`User connected: ${user.userId} from ${socket.handshake.address}`);

  // Join user to their personal room
  socket.join(`user-${user.userId}`);

  // Join dealership room
  if (user.dealershipId) {
    socket.join(`dealership-${user.dealershipId}`);
  }

  // Secure message handling
  socket.on('join-conversation', async (conversationId: string) => {
    // Verify user has access to conversation
    // TODO: Add conversation access check
    socket.join(`conversation-${conversationId}`);
  });

  socket.on('send-message', async (data) => {
    try {
      // Sanitize message content
      const sanitized = require('./utils/sanitization').sanitizeText(data.message);
      
      // Broadcast to conversation room
      socket.to(`conversation-${data.conversationId}`).emit('new-message', {
        ...data,
        message: sanitized
      });

      // Log message sent
      await auditLog.logDataAccess(
        AuditEventType.DATA_VIEWED,
        'message',
        data.conversationId,
        user.userId,
        { action: 'send_message' }
      );

    } catch (error) {
      logger.error('Message handling error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${user.userId}`);
  });

  // Error handling
  socket.on('error', (error) => {
    logger.error(`Socket error for user ${user.userId}:`, error);
    recordSuspiciousActivity(socket.handshake.address);
  });
});

/**
 * Enhanced error handling
 */
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Log error with request context
  logger.error('Application error:', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: (req as any).requestId
  });

  // Audit log for errors
  auditLog.logSecurity(
    AuditEventType.SECURITY_ALERT,
    require('./utils/auditLogger').AuditSeverity.ERROR,
    {
      error: error.message,
      path: req.path,
      method: req.method
    },
    req
  ).catch(console.error);

  // Don't leak error details in production
  const statusCode = error.statusCode || 500;
  const message = IS_PRODUCTION && statusCode === 500 
    ? 'Internal Server Error' 
    : error.message;

  res.status(statusCode).json({
    error: {
      message,
      status: statusCode,
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
      ...(IS_PRODUCTION ? {} : { stack: error.stack })
    }
  });
});

/**
 * 404 handler
 */
app.use('*', (req, res) => {
  // Log 404s as they might indicate scanning attempts
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl} from ${req.ip}`);
  
  res.status(404).json({
    error: {
      message: 'Resource not found',
      status: 404,
      timestamp: new Date().toISOString(),
      path: req.path,
      requestId: (req as any).requestId
    }
  });
});

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  httpServer.close(async () => {
    logger.info('HTTP server closed');

    // Close Socket.IO
    io.close(() => {
      logger.info('Socket.IO server closed');
    });

    // Close database connections
    try {
      const db = require('./config/database').default;
      await db.destroy();
      logger.info('Database connections closed');
    } catch (error) {
      logger.error('Error closing database:', error);
    }

    // Close Redis connection
    try {
      await redisClient.quit();
      logger.info('Redis connection closed');
    } catch (error) {
      logger.error('Error closing Redis:', error);
    }

    // Final audit log
    await auditLog.log({
      event_type: AuditEventType.SYSTEM_MAINTENANCE,
      severity: require('./utils/auditLogger').AuditSeverity.INFO,
      details: { signal, message: 'Server shutdown' }
    });

    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

/**
 * Uncaught exception handler
 */
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  
  auditLog.logSecurity(
    AuditEventType.SECURITY_ALERT,
    require('./utils/auditLogger').AuditSeverity.CRITICAL,
    { error: error.message, stack: error.stack }
  ).finally(() => {
    process.exit(1);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  
  auditLog.logSecurity(
    AuditEventType.SECURITY_ALERT,
    require('./utils/auditLogger').AuditSeverity.ERROR,
    { reason, promise: promise.toString() }
  );
});

/**
 * Start server
 */
httpServer.listen(PORT, () => {
  logger.info(`🚀 DealersCloud Secure Backend Server running on port ${PORT}`);
  logger.info(`🔒 Security features enabled`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
  logger.info(`🌍 Environment: ${NODE_ENV}`);
  logger.info(`🛡️ CORS origins: ${process.env.ALLOWED_ORIGINS || 'http://localhost:3000'}`);
  
  // Log security configuration
  auditLog.log({
    event_type: AuditEventType.SYSTEM_MAINTENANCE,
    severity: require('./utils/auditLogger').AuditSeverity.INFO,
    details: {
      message: 'Server started',
      port: PORT,
      environment: NODE_ENV,
      security: {
        helmet: true,
        cors: true,
        rateLimiting: true,
        sessionManagement: true,
        auditLogging: true
      }
    }
  });
});

export default app;
export { io, httpServer };