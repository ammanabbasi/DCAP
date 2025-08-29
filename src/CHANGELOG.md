# Changelog

## [1.0.0] - 2024-01-29

### Added
- Initial release of DealersCloud API Client
- JWT Bearer authentication support
- Automatic retry on rate limiting (429 status)
- Full TypeScript support with strict typing
- Zero dependencies - uses native Node.js 18+ fetch
- Comprehensive API coverage:
  - Health endpoint
  - Authentication (profile, verify token)
  - Vehicles CRUD operations
  - CRM lead management
  - Messaging system
  - Document upload and management
- Multipart file upload support
- Request cancellation via AbortSignal
- Detailed error handling with typed ApiError
- Environment variable configuration
- Example usage file
- Comprehensive documentation

### Security
- No hardcoded tokens or secrets
- Secure token handling
- Environment-based configuration only

### Files
- `apiClient.ts` - Core implementation (277 LOC)
- `types.d.ts` - TypeScript type exports
- `exampleUsage.ts` - Usage examples
- `package.json` - NPM package configuration
- `tsconfig.json` - TypeScript build configuration
- `.env.example` - Environment template
- `.gitignore` - Git ignore patterns
- `README.md` - Complete documentation
- `CHANGELOG.md` - This file