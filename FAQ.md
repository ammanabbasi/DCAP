# Frequently Asked Questions (FAQ)

![FAQ](https://img.shields.io/badge/FAQ-Updated-blue)
![Support](https://img.shields.io/badge/support-available-green)

## 📋 Table of Contents

- [General Questions](#general-questions)
- [Installation & Setup](#installation--setup)
- [Mobile App](#mobile-app)
- [Backend & API](#backend--api)
- [Database](#database)
- [Security & Privacy](#security--privacy)
- [Performance](#performance)
- [Troubleshooting](#troubleshooting)
- [Business Features](#business-features)

---

## 🏢 General Questions

### Q: What is DealersCloud?
**A:** DealersCloud (DEALERVAiT) is a comprehensive automotive dealership management platform that includes CRM, inventory management, real-time communication, and document management features. It's built with React Native for mobile and Express.js for the backend.

### Q: Who can use DealersCloud?
**A:** DealersCloud is designed for:
- Automotive dealerships of all sizes
- Used car lots
- Auto brokers
- Fleet management companies
- Independent car dealers

### Q: Is DealersCloud open source?
**A:** Yes, DealersCloud is open source under the MIT License. You can contribute, modify, and distribute it according to the license terms.

### Q: What platforms does DealersCloud support?
**A:** 
- **Mobile**: iOS 13+ and Android 5.0+ (API Level 21+)
- **Backend**: Windows, macOS, Linux
- **Cloud**: Azure, AWS (with modifications)

---

## 🛠️ Installation & Setup

### Q: What are the system requirements?
**A:** 
- **Node.js**: 18.0 or higher
- **React Native**: 0.75.2
- **SQL Server**: 2019 or higher
- **Redis**: 6.0 or higher
- **Memory**: 8GB RAM minimum (16GB recommended)
- **Storage**: 10GB free space

### Q: Can I use a different database instead of SQL Server?
**A:** Currently, DealersCloud is optimized for SQL Server. While it's technically possible to modify the database layer to support other databases like PostgreSQL or MySQL, it would require significant code changes and is not officially supported.

### Q: Do I need Azure services to run DealersCloud?
**A:** For production deployment, Azure services are recommended but not strictly required:
- **Azure Blob Storage**: Can be replaced with AWS S3 or local file storage
- **Azure SQL Database**: Can use local SQL Server instance
- **Azure Redis Cache**: Can use local Redis instance
- **SendGrid**: Can be replaced with other email services

### Q: How do I get a local development environment running?
**A:** Follow the [Installation Guide](INSTALLATION_GUIDE.md). The basic steps are:
1. Clone the repository
2. Install Node.js dependencies
3. Set up SQL Server database
4. Configure environment variables
5. Start backend and frontend servers

### Q: Can I deploy DealersCloud on-premises?
**A:** Yes, DealersCloud can be deployed on-premises. You'll need to set up local instances of SQL Server, Redis, and file storage. See the deployment section in the [Installation Guide](INSTALLATION_GUIDE.md).

---

## 📱 Mobile App

### Q: Why won't the mobile app connect to my backend?
**A:** Check these common issues:
1. **Network connectivity**: Ensure your device can reach the backend server
2. **Backend URL**: Verify the API_BASE_URL in your .env file
3. **Backend running**: Make sure the backend server is running
4. **Firewall**: Check if firewall is blocking the connection
5. **HTTPS/HTTP**: Ensure protocol matches between app and server

### Q: The mobile app is running slowly. How can I improve performance?
**A:** Try these optimization steps:
1. **Enable Hermes**: Ensure Hermes JavaScript engine is enabled (Android)
2. **Clear cache**: Clear React Native metro cache
3. **Optimize images**: Ensure images are properly sized and compressed
4. **Check network**: Verify stable internet connection
5. **Device specs**: Ensure device meets minimum requirements

### Q: Can I build the mobile app for distribution?
**A:** Yes, you can build for both iOS App Store and Google Play Store:
- **Android**: Run `cd android && ./gradlew assembleRelease`
- **iOS**: Use Xcode to archive and distribute
- See the deployment section in docs for detailed instructions

### Q: How do I add new screens or features to the mobile app?
**A:** Follow the existing project structure:
1. Create new screen component in `src/Screens/`
2. Add navigation route in `src/Navigation/`
3. Add any required Redux state in `src/redux/slices/`
4. Test on both iOS and Android devices

### Q: Why am I getting build errors on iOS/Android?
**A:** Common solutions:
- **iOS**: Run `cd ios && pod install` after any dependency changes
- **Android**: Clean build with `cd android && ./gradlew clean`
- **Metro cache**: Clear with `npx react-native start --reset-cache`
- **Node modules**: Delete and reinstall with `rm -rf node_modules && npm install`

---

## 🖥️ Backend & API

### Q: How do I add new API endpoints?
**A:** Follow the MVC pattern:
1. Create controller in `controllers/` directory
2. Add route in appropriate `routes/` subdirectory
3. Add database model if needed in `models/`
4. Update Swagger documentation with JSDoc comments
5. Add authentication middleware if required

### Q: Why are my API requests failing with 401 Unauthorized?
**A:** This usually indicates authentication issues:
1. **Token expired**: JWT tokens expire after 24 hours by default
2. **Missing token**: Ensure Authorization header is included
3. **Invalid token**: Check if token format is correct
4. **Server restart**: Tokens become invalid after server restart

### Q: How do I enable HTTPS in development?
**A:** For local development with HTTPS:
1. Generate self-signed certificates
2. Update Express.js configuration to use HTTPS
3. Update mobile app to trust self-signed certificates (development only)
4. Use tools like mkcert for trusted local certificates

### Q: Can I customize the GraphQL schema?
**A:** Yes, you can modify the GraphQL implementation:
1. Edit schema in `graphql/schema/`
2. Update resolvers in `graphql/resolvers/`
3. Add new types in `graphql/types/`
4. Test with GraphQL playground

### Q: How do I monitor API performance?
**A:** Several options available:
1. **Built-in logging**: Winston logs are available in `logs/` directory
2. **Application Insights**: Configure Azure Application Insights
3. **Performance middleware**: Add custom performance monitoring
4. **Database profiling**: Enable SQL Server query profiling

---

## 🗄️ Database

### Q: How do I backup the database?
**A:** For SQL Server:
```sql
BACKUP DATABASE dealerscloud_db 
TO DISK = 'C:\Backups\dealerscloud_backup.bak'
```
For automated backups, set up SQL Server Agent jobs or Azure SQL Database automatic backups.

### Q: Can I migrate existing dealership data?
**A:** Yes, create data migration scripts:
1. Export data from your current system
2. Create SQL scripts to import into DealersCloud schema
3. Test migration on development environment first
4. Plan for downtime during production migration

### Q: How do I optimize database performance?
**A:** Performance optimization strategies:
1. **Indexes**: Ensure proper indexes on frequently queried columns
2. **Query optimization**: Use SQL Server Query Store to identify slow queries
3. **Connection pooling**: Configure appropriate pool sizes
4. **Partitioning**: For very large datasets, consider table partitioning
5. **Regular maintenance**: Schedule index rebuilding and statistics updates

### Q: What if I need to modify the database schema?
**A:** Schema modification process:
1. Create migration scripts for schema changes
2. Test changes in development environment
3. Plan for data migration if needed
4. Update application code to handle schema changes
5. Deploy changes during maintenance window

---

## 🔒 Security & Privacy

### Q: How secure is DealersCloud?
**A:** DealersCloud implements industry-standard security practices:
- JWT authentication with secure tokens
- bcrypt password hashing
- Input validation and sanitization
- SQL injection prevention
- HTTPS encryption in transit
- Role-based access control

### Q: How is customer data protected?
**A:** Data protection measures include:
- Encrypted storage (Azure SQL TDE)
- Secure file storage (Azure Blob Storage)
- Access logging and audit trails
- GDPR compliance considerations
- Regular security updates

### Q: Can I configure different user roles?
**A:** Yes, DealersCloud supports role-based access control:
- **Admin**: Full system access
- **Manager**: CRM and inventory management
- **Sales**: Customer interaction and lead management
- **User**: Read-only access to assigned data

### Q: How do I report a security vulnerability?
**A:** Please report security issues privately:
- Email: security@dealerscloud.com
- Do NOT create public GitHub issues for security vulnerabilities
- See [SECURITY.md](SECURITY.md) for full reporting guidelines

---

## 🚀 Performance

### Q: How many concurrent users can DealersCloud handle?
**A:** Performance depends on your infrastructure:
- **Development**: 10-20 concurrent users
- **Small deployment**: 50-100 concurrent users  
- **Enterprise deployment**: 500+ concurrent users with proper scaling

### Q: Why is the application running slowly?
**A:** Common performance issues:
1. **Database queries**: Check for slow or unoptimized queries
2. **Network latency**: Verify network connection between components
3. **Redis cache**: Ensure Redis is properly configured and connected
4. **File storage**: Large file operations can impact performance
5. **Server resources**: Check CPU, memory, and disk usage

### Q: How can I improve application performance?
**A:** Performance optimization techniques:
1. **Enable Redis caching**: Properly configure Redis for frequently accessed data
2. **Database optimization**: Add indexes, optimize queries
3. **Image optimization**: Compress and resize images before upload
4. **CDN usage**: Use CDN for static assets
5. **Code splitting**: Implement lazy loading where appropriate

### Q: What monitoring tools are recommended?
**A:** Monitoring recommendations:
- **Application Insights**: For Azure deployments
- **New Relic**: Third-party APM solution
- **DataDog**: Comprehensive monitoring platform
- **Built-in logging**: Winston logs with log aggregation
- **Database monitoring**: SQL Server performance monitors

---

## 🔧 Troubleshooting

### Q: The application won't start. What should I check?
**A:** Startup troubleshooting checklist:
1. **Node.js version**: Ensure Node.js 18+ is installed
2. **Dependencies**: Run `npm install` in both backend and frontend
3. **Environment variables**: Check .env files are properly configured
4. **Database connection**: Verify SQL Server is running and accessible
5. **Port conflicts**: Ensure ports 3000 and 8081 are available
6. **Logs**: Check console output and log files for error messages

### Q: I'm getting "ECONNREFUSED" errors. How do I fix this?
**A:** Connection refused errors usually indicate:
1. **Service not running**: The target service (database, Redis, API) is not running
2. **Wrong connection details**: Check host, port, and credentials
3. **Firewall blocking**: Firewall rules may be blocking connections
4. **Network issues**: DNS resolution or network connectivity problems

### Q: Mobile app crashes on startup. What could be wrong?
**A:** Mobile app crash troubleshooting:
1. **Check logs**: Use React Native debugging tools to see crash logs
2. **Clear cache**: Clear Metro bundler cache
3. **Rebuild app**: Clean and rebuild the mobile app
4. **Dependencies**: Ensure all native dependencies are properly linked
5. **Device compatibility**: Verify device meets minimum requirements

### Q: Database queries are timing out. How can I fix this?
**A:** Query timeout solutions:
1. **Query optimization**: Review and optimize slow queries
2. **Indexes**: Add appropriate indexes for frequently queried columns
3. **Connection pool**: Increase database connection pool size
4. **Timeout settings**: Increase query timeout values if necessary
5. **Database performance**: Check database server performance metrics

---

## 💼 Business Features

### Q: Can I customize the CRM workflow?
**A:** Yes, the CRM system is designed to be flexible:
- Modify lead statuses and types in the database
- Customize customer fields and forms
- Add new interaction types
- Configure automated workflows (requires development)

### Q: How do I integrate with third-party services?
**A:** Integration options:
1. **CarFax**: API integration is supported for vehicle history reports
2. **Email services**: SendGrid is configured, but other services can be added
3. **Payment gateways**: Add payment processing through API integrations
4. **Accounting software**: Custom integrations can be developed

### Q: Can I generate reports from the system?
**A:** Current reporting capabilities:
- Dashboard analytics and metrics
- Customer interaction history
- Inventory reports
- Sales pipeline data
- Custom reports can be developed using the GraphQL API

### Q: How do I manage inventory across multiple locations?
**A:** Multi-location support can be implemented:
1. Add location fields to vehicle records
2. Modify filters to include location-based queries
3. Update user permissions for location-specific access
4. Customize reports to show location-based data

### Q: Is there support for different languages/locales?
**A:** Currently, DealersCloud is built for English. Internationalization (i18n) support would require:
- Adding react-i18next for React Native
- Creating translation files
- Modifying UI components to support different languages
- Database modifications for locale-specific data

---

## 🆘 Still Need Help?

If you can't find the answer to your question:

### 📞 Contact Options
- **GitHub Issues**: [Report bugs or request features](https://github.com/ammanabbasi/DCAP/issues)
- **GitHub Discussions**: [Community discussions and questions](https://github.com/ammanabbasi/DCAP/discussions)
- **Email Support**: support@dealerscloud.com
- **Security Issues**: security@dealerscloud.com

### 📚 Documentation Resources
- [Installation Guide](INSTALLATION_GUIDE.md)
- [API Documentation](API_DOCUMENTATION.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Security Policy](SECURITY.md)

### 🤝 Community Support
- Join our community discussions
- Check existing issues for similar problems
- Contribute to the documentation
- Help other users with their questions

---

**Last Updated**: January 2025  
**Version**: 1.0.0

> This FAQ is regularly updated. If you have suggestions for additional questions or improvements, please [open an issue](https://github.com/ammanabbasi/DCAP/issues) or submit a pull request.