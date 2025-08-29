import {
  UserSchema,
  VehicleSchema,
  LeadSchema,
  DealershipSchema,
  LoginSchema,
  RegisterSchema,
  UpdatePasswordSchema,
} from '../index';

describe('Schema Validation Tests', () => {
  describe('UserSchema', () => {
    const validUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'customer' as const,
      dealershipId: '1',
      isVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('should validate a correct user object', () => {
      const result = UserSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it('should reject user with invalid email', () => {
      const invalidUser = { ...validUser, email: 'invalid-email' };
      const result = UserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });

    it('should reject user with empty firstName', () => {
      const invalidUser = { ...validUser, firstName: '' };
      const result = UserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('firstName');
      }
    });

    it('should reject user with invalid role', () => {
      const invalidUser = { ...validUser, role: 'invalid_role' };
      const result = UserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('role');
      }
    });

    it('should accept optional fields as undefined', () => {
      const userWithoutOptionals = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'customer' as const,
        isVerified: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const result = UserSchema.safeParse(userWithoutOptionals);
      expect(result.success).toBe(true);
    });

    it('should reject user with XSS in name fields', () => {
      const xssUser = { 
        ...validUser, 
        firstName: '<script>alert("xss")</script>' 
      };
      const result = UserSchema.safeParse(xssUser);
      // The schema should either reject or sanitize XSS content
      if (result.success) {
        expect(result.data.firstName).not.toContain('<script>');
      }
    });

    it('should handle extremely long names', () => {
      const longNameUser = {
        ...validUser,
        firstName: 'A'.repeat(1000),
        lastName: 'B'.repeat(1000),
      };
      const result = UserSchema.safeParse(longNameUser);
      // Should validate string length constraints
      expect(result.success).toBe(false);
    });

    it('should validate phone number format when provided', () => {
      const userWithPhone = { ...validUser, phone: '555-123-4567' };
      const result = UserSchema.safeParse(userWithPhone);
      expect(result.success).toBe(true);

      const userWithInvalidPhone = { ...validUser, phone: 'not-a-phone' };
      const invalidResult = UserSchema.safeParse(userWithInvalidPhone);
      expect(invalidResult.success).toBe(false);
    });
  });

  describe('VehicleSchema', () => {
    const validVehicle = {
      id: '1',
      vin: 'JH4KA8260PC123456',
      make: 'Honda',
      model: 'Accord',
      year: 2022,
      price: 25000,
      mileage: 15000,
      condition: 'used' as const,
      status: 'available' as const,
      dealershipId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('should validate a correct vehicle object', () => {
      const result = VehicleSchema.safeParse(validVehicle);
      expect(result.success).toBe(true);
    });

    it('should reject vehicle with invalid VIN', () => {
      const invalidVehicle = { ...validVehicle, vin: 'INVALID' };
      const result = VehicleSchema.safeParse(invalidVehicle);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('vin');
      }
    });

    it('should reject vehicle with negative price', () => {
      const invalidVehicle = { ...validVehicle, price: -1000 };
      const result = VehicleSchema.safeParse(invalidVehicle);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('price');
      }
    });

    it('should reject vehicle with negative mileage', () => {
      const invalidVehicle = { ...validVehicle, mileage: -500 };
      const result = VehicleSchema.safeParse(invalidVehicle);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('mileage');
      }
    });

    it('should reject vehicle with future year', () => {
      const currentYear = new Date().getFullYear();
      const futureVehicle = { ...validVehicle, year: currentYear + 5 };
      const result = VehicleSchema.safeParse(futureVehicle);
      expect(result.success).toBe(false);
    });

    it('should reject vehicle with very old year', () => {
      const oldVehicle = { ...validVehicle, year: 1800 };
      const result = VehicleSchema.safeParse(oldVehicle);
      expect(result.success).toBe(false);
    });

    it('should validate vehicle condition enum', () => {
      const newVehicle = { ...validVehicle, condition: 'new' as const };
      const certifiedVehicle = { ...validVehicle, condition: 'certified' as const };
      
      expect(VehicleSchema.safeParse(newVehicle).success).toBe(true);
      expect(VehicleSchema.safeParse(certifiedVehicle).success).toBe(true);

      const invalidCondition = { ...validVehicle, condition: 'invalid' };
      expect(VehicleSchema.safeParse(invalidCondition).success).toBe(false);
    });

    it('should validate vehicle status enum', () => {
      const soldVehicle = { ...validVehicle, status: 'sold' as const };
      const pendingVehicle = { ...validVehicle, status: 'pending' as const };
      
      expect(VehicleSchema.safeParse(soldVehicle).success).toBe(true);
      expect(VehicleSchema.safeParse(pendingVehicle).success).toBe(true);

      const invalidStatus = { ...validVehicle, status: 'invalid' };
      expect(VehicleSchema.safeParse(invalidStatus).success).toBe(false);
    });

    it('should handle extremely high mileage', () => {
      const highMileageVehicle = { ...validVehicle, mileage: 999999999 };
      const result = VehicleSchema.safeParse(highMileageVehicle);
      // Should have reasonable upper limits
      expect(result.success).toBe(false);
    });

    it('should handle extremely high price', () => {
      const expensiveVehicle = { ...validVehicle, price: Number.MAX_SAFE_INTEGER };
      const result = VehicleSchema.safeParse(expensiveVehicle);
      // Should have reasonable upper limits for price
      expect(result.success).toBe(false);
    });
  });

  describe('LeadSchema', () => {
    const validLead = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '555-1234',
      source: 'website' as const,
      status: 'new' as const,
      assignedToId: '1',
      dealershipId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('should validate a correct lead object', () => {
      const result = LeadSchema.safeParse(validLead);
      expect(result.success).toBe(true);
    });

    it('should reject lead with invalid email', () => {
      const invalidLead = { ...validLead, email: 'invalid-email' };
      const result = LeadSchema.safeParse(invalidLead);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });

    it('should validate lead source enum', () => {
      const sources = ['website', 'phone', 'referral', 'walk-in', 'email', 'social-media'];
      
      sources.forEach(source => {
        const leadWithSource = { ...validLead, source: source as any };
        const result = LeadSchema.safeParse(leadWithSource);
        expect(result.success).toBe(true);
      });

      const invalidSource = { ...validLead, source: 'invalid' };
      expect(LeadSchema.safeParse(invalidSource).success).toBe(false);
    });

    it('should validate lead status enum', () => {
      const statuses = ['new', 'contacted', 'qualified', 'converted', 'lost'];
      
      statuses.forEach(status => {
        const leadWithStatus = { ...validLead, status: status as any };
        const result = LeadSchema.safeParse(leadWithStatus);
        expect(result.success).toBe(true);
      });

      const invalidStatus = { ...validLead, status: 'invalid' };
      expect(LeadSchema.safeParse(invalidStatus).success).toBe(false);
    });

    it('should handle optional notes field', () => {
      const leadWithNotes = { ...validLead, notes: 'Customer is interested in SUVs' };
      expect(LeadSchema.safeParse(leadWithNotes).success).toBe(true);

      const leadWithoutNotes = validLead;
      expect(LeadSchema.safeParse(leadWithoutNotes).success).toBe(true);
    });

    it('should prevent XSS in notes field', () => {
      const leadWithXSS = { 
        ...validLead, 
        notes: '<script>alert("xss")</script><img src=x onerror=alert("xss")>' 
      };
      const result = LeadSchema.safeParse(leadWithXSS);
      
      if (result.success) {
        expect(result.data.notes).not.toContain('<script>');
        expect(result.data.notes).not.toContain('onerror=');
      }
    });

    it('should handle very long notes', () => {
      const longNotes = 'A'.repeat(10000);
      const leadWithLongNotes = { ...validLead, notes: longNotes };
      const result = LeadSchema.safeParse(leadWithLongNotes);
      
      // Should have reasonable length limits
      expect(result.success).toBe(false);
    });
  });

  describe('LoginSchema', () => {
    const validLogin = {
      email: 'test@example.com',
      password: 'SecurePassword123!',
    };

    it('should validate correct login credentials', () => {
      const result = LoginSchema.safeParse(validLogin);
      expect(result.success).toBe(true);
    });

    it('should reject login with invalid email', () => {
      const invalidLogin = { ...validLogin, email: 'not-an-email' };
      const result = LoginSchema.safeParse(invalidLogin);
      expect(result.success).toBe(false);
    });

    it('should reject login with short password', () => {
      const weakLogin = { ...validLogin, password: '123' };
      const result = LoginSchema.safeParse(weakLogin);
      expect(result.success).toBe(false);
    });

    it('should require both email and password', () => {
      const emailOnly = { email: 'test@example.com' };
      const passwordOnly = { password: 'password' };

      expect(LoginSchema.safeParse(emailOnly).success).toBe(false);
      expect(LoginSchema.safeParse(passwordOnly).success).toBe(false);
    });

    it('should handle special characters in password', () => {
      const specialCharPassword = { ...validLogin, password: 'P@$$w0rd!#$%^&*()' };
      const result = LoginSchema.safeParse(specialCharPassword);
      expect(result.success).toBe(true);
    });

    it('should prevent SQL injection in email field', () => {
      const sqlInjection = { 
        ...validLogin, 
        email: "admin@example.com'; DROP TABLE users; --" 
      };
      const result = LoginSchema.safeParse(sqlInjection);
      // Should either reject or sanitize
      expect(result.success).toBe(false);
    });
  });

  describe('RegisterSchema', () => {
    const validRegistration = {
      email: 'newuser@example.com',
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
      firstName: 'John',
      lastName: 'Doe',
      phone: '555-1234',
    };

    it('should validate correct registration data', () => {
      const result = RegisterSchema.safeParse(validRegistration);
      expect(result.success).toBe(true);
    });

    it('should reject when passwords do not match', () => {
      const mismatchedPasswords = {
        ...validRegistration,
        confirmPassword: 'DifferentPassword123!',
      };
      const result = RegisterSchema.safeParse(mismatchedPasswords);
      expect(result.success).toBe(false);
    });

    it('should enforce password strength requirements', () => {
      const weakPassword = { ...validRegistration, password: 'weak', confirmPassword: 'weak' };
      const result = RegisterSchema.safeParse(weakPassword);
      expect(result.success).toBe(false);
    });

    it('should validate phone number format', () => {
      const invalidPhone = { ...validRegistration, phone: 'not-a-phone' };
      const result = RegisterSchema.safeParse(invalidPhone);
      expect(result.success).toBe(false);
    });

    it('should sanitize name fields', () => {
      const maliciousNames = {
        ...validRegistration,
        firstName: '<script>alert("xss")</script>',
        lastName: '<img src=x onerror=alert("xss")>',
      };
      const result = RegisterSchema.safeParse(maliciousNames);
      
      if (result.success) {
        expect(result.data.firstName).not.toContain('<script>');
        expect(result.data.lastName).not.toContain('onerror=');
      }
    });

    it('should handle international phone numbers', () => {
      const internationalPhone = { ...validRegistration, phone: '+1-555-123-4567' };
      const result = RegisterSchema.safeParse(internationalPhone);
      expect(result.success).toBe(true);
    });
  });

  describe('UpdatePasswordSchema', () => {
    const validPasswordUpdate = {
      currentPassword: 'CurrentPassword123!',
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    };

    it('should validate correct password update', () => {
      const result = UpdatePasswordSchema.safeParse(validPasswordUpdate);
      expect(result.success).toBe(true);
    });

    it('should reject when new passwords do not match', () => {
      const mismatchedNewPasswords = {
        ...validPasswordUpdate,
        confirmPassword: 'DifferentPassword123!',
      };
      const result = UpdatePasswordSchema.safeParse(mismatchedNewPasswords);
      expect(result.success).toBe(false);
    });

    it('should enforce new password strength', () => {
      const weakNewPassword = {
        ...validPasswordUpdate,
        newPassword: 'weak',
        confirmPassword: 'weak',
      };
      const result = UpdatePasswordSchema.safeParse(weakNewPassword);
      expect(result.success).toBe(false);
    });

    it('should require current password', () => {
      const missingCurrentPassword = {
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };
      const result = UpdatePasswordSchema.safeParse(missingCurrentPassword);
      expect(result.success).toBe(false);
    });
  });

  describe('Security Edge Cases', () => {
    it('should handle null and undefined values', () => {
      const schemas = [UserSchema, VehicleSchema, LeadSchema, LoginSchema, RegisterSchema];
      
      schemas.forEach(schema => {
        expect(schema.safeParse(null).success).toBe(false);
        expect(schema.safeParse(undefined).success).toBe(false);
        expect(schema.safeParse({}).success).toBe(false);
      });
    });

    it('should handle extremely large objects', () => {
      const largeObject = {
        id: '1',
        email: 'test@example.com',
        firstName: 'A'.repeat(100000),
        lastName: 'B'.repeat(100000),
        role: 'customer' as const,
        isVerified: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        extraField: 'C'.repeat(1000000),
      };

      const result = UserSchema.safeParse(largeObject);
      // Should handle or reject extremely large inputs
      expect(typeof result.success).toBe('boolean');
    });

    it('should handle circular references', () => {
      const circularObj: any = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };
      circularObj.self = circularObj;

      const result = UserSchema.safeParse(circularObj);
      // Should not cause infinite loops
      expect(typeof result.success).toBe('boolean');
    });

    it('should handle unicode and emoji in text fields', () => {
      const unicodeUser = {
        id: '1',
        email: 'test@example.com',
        firstName: '李小明',
        lastName: 'González',
        role: 'customer' as const,
        isVerified: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = UserSchema.safeParse(unicodeUser);
      expect(result.success).toBe(true);
    });

    it('should handle prototype pollution attempts', () => {
      const maliciousObject = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'customer' as const,
        '__proto__': { isAdmin: true },
        'constructor': { prototype: { isAdmin: true } },
        isVerified: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = UserSchema.safeParse(maliciousObject);
      if (result.success) {
        expect(result.data).not.toHaveProperty('__proto__');
        expect(result.data).not.toHaveProperty('constructor.prototype');
      }
    });
  });

  describe('Performance Tests', () => {
    it('should validate schemas efficiently', () => {
      const testData = Array.from({ length: 1000 }, (_, i) => ({
        id: String(i),
        email: `user${i}@example.com`,
        firstName: `User${i}`,
        lastName: 'Test',
        role: 'customer' as const,
        isVerified: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      const start = performance.now();
      testData.forEach(data => UserSchema.safeParse(data));
      const end = performance.now();

      // Should complete validation in reasonable time (under 100ms for 1000 items)
      expect(end - start).toBeLessThan(100);
    });

    it('should handle concurrent validation', async () => {
      const testData = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'customer' as const,
        isVerified: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const promises = Array.from({ length: 100 }, () => 
        Promise.resolve(UserSchema.safeParse(testData))
      );

      const results = await Promise.all(promises);
      expect(results.every(result => result.success)).toBe(true);
    });
  });
});