# Contributing to DealersCloud

![Contributors](https://img.shields.io/badge/contributors-welcome-brightgreen)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

We love your input! We want to make contributing to DealersCloud as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Bug Reports](#bug-reports)
- [Feature Requests](#feature-requests)
- [Testing Guidelines](#testing-guidelines)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Pledge

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

Before contributing, make sure you have completed the [Installation Guide](INSTALLATION_GUIDE.md).

### Setting Up Your Development Environment

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/DCAP.git
   cd DCAP
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ammanabbasi/DCAP.git
   ```

3. **Install dependencies**
   ```bash
   # Backend dependencies
   cd backend && npm install
   
   # Frontend dependencies
   cd ../frontend && npm install && cd ios && pod install
   ```

4. **Set up environment variables**
   ```bash
   # Copy example files and configure
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

5. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm start
   
   # Terminal 3 - Mobile app
   npm run android  # or npm run ios
   ```

## 🔄 Development Workflow

### Branching Strategy

We use a simplified Git Flow:

```
main
├── develop (default branch for development)
├── feature/feature-name
├── bugfix/issue-description
├── hotfix/critical-fix
└── release/version-number
```

### Creating a Feature Branch

```bash
# Make sure you're on develop branch and up to date
git checkout develop
git pull upstream develop

# Create and switch to your feature branch
git checkout -b feature/your-feature-name

# Work on your feature...
git add .
git commit -m "feat: add amazing new feature"

# Push to your fork
git push origin feature/your-feature-name
```

### Keeping Your Branch Updated

```bash
# Regularly sync with upstream
git fetch upstream
git checkout develop
git merge upstream/develop
git push origin develop

# Rebase your feature branch
git checkout feature/your-feature-name
git rebase develop
```

## 💻 Coding Standards

### General Guidelines

1. **Write clean, readable code**
   - Use meaningful variable and function names
   - Keep functions small and focused
   - Add comments for complex logic
   - Follow the existing code style

2. **Follow established patterns**
   - Use existing project structure
   - Follow naming conventions
   - Use established error handling patterns

### Backend (Node.js/Express)

```javascript
// ✅ Good
const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  } catch (error) {
    logger.error('Error fetching user:', error);
    throw error;
  }
};

// ❌ Bad
const getUser = (id) => {
  const u = User.findById(id);
  return u;
};
```

#### Backend Code Style

- Use `const` and `let` instead of `var`
- Use async/await instead of callbacks
- Handle errors properly
- Use meaningful commit messages
- Add JSDoc comments for functions

```javascript
/**
 * Creates a new vehicle in the inventory
 * @param {Object} vehicleData - The vehicle information
 * @param {string} vehicleData.make - Vehicle manufacturer
 * @param {string} vehicleData.model - Vehicle model
 * @param {number} vehicleData.year - Vehicle year
 * @returns {Promise<Object>} Created vehicle object
 * @throws {AppError} When validation fails
 */
const createVehicle = async (vehicleData) => {
  // Implementation...
};
```

### Frontend (React Native/TypeScript)

```typescript
// ✅ Good
interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
}

const UserProfile: React.FC<{ user: User }> = ({ user }) => {
  const [loading, setLoading] = useState<boolean>(false);
  
  const handleUpdateProfile = useCallback(async () => {
    setLoading(true);
    try {
      await updateUserProfile(user.id, profileData);
      showSuccess('Profile updated successfully');
    } catch (error) {
      showError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  }, [user.id, profileData]);

  return (
    <View style={styles.container}>
      {/* Component JSX */}
    </View>
  );
};

// ❌ Bad
const UserProfile = (props) => {
  const [loading, setLoading] = useState(false);
  
  const handleUpdate = () => {
    updateUserProfile(props.user.id, profileData);
  };

  return <View>{/* JSX */}</View>;
};
```

#### Frontend Code Style

- Use TypeScript for type safety
- Use functional components with hooks
- Follow React Native best practices
- Use proper prop typing
- Implement proper error boundaries

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Changes to build system or dependencies
- **ci**: Changes to CI configuration
- **chore**: Other changes that don't modify src or test files

### Examples

```bash
# Feature commits
git commit -m "feat(crm): add customer search functionality"
git commit -m "feat(inventory): implement vehicle image upload"

# Bug fix commits
git commit -m "fix(auth): resolve JWT token expiration issue"
git commit -m "fix(ui): correct responsive layout on tablets"

# Documentation commits
git commit -m "docs: update API documentation for vehicle endpoints"
git commit -m "docs(readme): add installation instructions for Linux"

# Other commits
git commit -m "refactor(database): optimize customer query performance"
git commit -m "test(crm): add unit tests for lead controller"
git commit -m "chore(deps): update React Native to version 0.75.2"
```

## 🔄 Pull Request Process

### Before Submitting

1. **Test your changes**
   ```bash
   # Run backend tests
   cd backend && npm test
   
   # Run frontend tests
   cd frontend && npm test
   
   # Test the app manually
   npm run android  # or npm run ios
   ```

2. **Check code quality**
   ```bash
   # Lint backend code
   cd backend && npm run lint
   
   # Lint frontend code
   cd frontend && npm run lint
   ```

3. **Update documentation** if needed

### Pull Request Template

When you create a PR, please include:

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] I have tested this change manually
- [ ] I have added/updated unit tests
- [ ] All existing tests pass

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
```

### Review Process

1. **Automated checks must pass**
   - ESLint checks
   - Unit tests
   - Build process
   - TypeScript compilation

2. **Code review**
   - At least one maintainer approval required
   - Address all review comments
   - No merge conflicts

3. **Final testing**
   - Manual testing by reviewer
   - Integration testing

## 🐛 Bug Reports

### Before Submitting a Bug Report

1. **Check existing issues** - Someone might have already reported the bug
2. **Try the latest version** - The bug might already be fixed
3. **Reproduce the bug** - Make sure you can consistently reproduce it

### Good Bug Report Format

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g. iOS 17, Android 13]
- Device: [e.g. iPhone 14, Samsung Galaxy S23]
- App Version: [e.g. 1.0.0]
- Backend Version: [e.g. 1.0.0]

**Additional context**
Add any other context about the problem here.

**Logs**
```
Paste relevant logs here
```
```

## ✨ Feature Requests

### Before Submitting

1. **Check roadmap** - Feature might already be planned
2. **Search existing issues** - Feature might already be requested
3. **Consider alternatives** - Is there another way to achieve the goal?

### Feature Request Format

```markdown
**Is your feature request related to a problem?**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.

**Implementation suggestions**
If you have ideas about how this could be implemented, share them here.
```

## 🧪 Testing Guidelines

### Writing Tests

#### Backend Tests (Jest)

```javascript
// tests/controllers/crm.test.js
describe('CRM Controller', () => {
  beforeEach(() => {
    // Setup test data
  });

  describe('addNewLead', () => {
    it('should create a new lead with valid data', async () => {
      const leadData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      };

      const result = await addNewLead(leadData);

      expect(result).toHaveProperty('leadID');
      expect(result.leadDetails.firstName).toBe('John');
    });

    it('should return error for invalid email', async () => {
      const leadData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email'
      };

      await expect(addNewLead(leadData)).rejects.toThrow('Invalid email');
    });
  });
});
```

#### Frontend Tests (React Native Testing Library)

```typescript
// __tests__/components/LoginScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../src/Screens/AuthFlow/LogIn/LogIn';

describe('LoginScreen', () => {
  it('should display error for invalid credentials', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    fireEvent.changeText(getByPlaceholderText('Username'), 'invalid');
    fireEvent.changeText(getByPlaceholderText('Password'), 'wrong');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(getByText('Invalid credentials')).toBeTruthy();
    });
  });
});
```

### Running Tests

```bash
# Run all backend tests
cd backend && npm test

# Run specific test file
npm test -- controllers/crm.test.js

# Run with coverage
npm test -- --coverage

# Run frontend tests
cd frontend && npm test

# Run tests in watch mode
npm test -- --watch
```

## 📚 Documentation Guidelines

### API Documentation

- Update Swagger/OpenAPI specifications for new endpoints
- Include request/response examples
- Document error codes and messages
- Add authentication requirements

### Code Documentation

- Add JSDoc comments for public functions
- Document complex algorithms
- Include usage examples
- Keep README files updated

### User Documentation

- Update user guides for new features
- Add screenshots for UI changes
- Include troubleshooting steps
- Maintain FAQ section

## 🏷️ Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Incompatible API changes
- **MINOR**: New functionality (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

### Release Steps

1. **Create release branch**
   ```bash
   git checkout -b release/1.2.0
   ```

2. **Update version numbers**
   - `package.json` files
   - App version codes
   - Documentation

3. **Update CHANGELOG.md**

4. **Final testing**

5. **Merge to main**

6. **Create GitHub release**

7. **Deploy to production**

## 🆘 Getting Help

### Community Support

- **GitHub Discussions**: For general questions and discussions
- **GitHub Issues**: For bug reports and feature requests
- **Email**: development@dealerscloud.com

### Maintainer Contact

- **Lead Developer**: [@ammanabbasi](https://github.com/ammanabbasi)

## 🎉 Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- GitHub contributor stats
- Annual contributor appreciation

## 📄 License

By contributing to DealersCloud, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to DealersCloud!** 🚀

Your contributions help make this project better for everyone in the automotive industry.

---

**Last Updated**: January 2025  
**Version**: 1.0.0