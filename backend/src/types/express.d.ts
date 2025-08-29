import { TokenPayload } from '../services/AuthService';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      requestId?: string;
      sessionID?: string;
      files?: Express.Multer.File[];
      file?: Express.Multer.File;
    }
  }
}

export {};