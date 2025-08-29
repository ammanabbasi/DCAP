import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Knex } from 'knex';

export interface MockUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  dealershipId: number;
  role: 'admin' | 'manager' | 'sales' | 'finance';
  isActive: boolean;
}

export interface MockVehicle {
  id: number;
  vin: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  dealershipId: number;
  status: 'available' | 'sold' | 'pending';
}

export interface MockLead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted';
  assignedToId: number;
  dealershipId: number;
}

export class TestHelpers {
  static createMockRequest(overrides: Partial<Request> = {}): Partial<Request> {
    return {
      body: {},
      params: {},
      query: {},
      headers: {},
      ip: '127.0.0.1',
      ...overrides
    };
  }

  static createMockResponse(): Partial<Response> {
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis()
    };
    return res;
  }

  static generateJWT(payload: any, secret?: string): string {
    return jwt.sign(
      payload,
      secret || process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  }

  static createAuthenticatedRequest(user: Partial<MockUser>): Partial<Request> {
    const token = this.generateJWT({ userId: user.id, email: user.email });
    return this.createMockRequest({
      headers: {
        authorization: `Bearer ${token}`
      },
      user: user as any
    });
  }

  static async cleanDatabase(db: Knex): Promise<void> {
    // Clean tables in reverse order to respect foreign key constraints
    const tables = [
      'tasks',
      'transactions',
      'documents',
      'messages',
      'leads',
      'customers',
      'vehicles',
      'users',
      'dealerships'
    ];

    for (const table of tables) {
      try {
        await db(table).del();
      } catch (error) {
        // Ignore table not found errors
        if (!error.message?.includes('no such table')) {
          throw error;
        }
      }
    }
  }

  static generateRandomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static generateVIN(): string {
    const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
    let vin = '';
    for (let i = 0; i < 17; i++) {
      vin += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return vin;
  }

  static wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static expectToThrow<T extends Error>(
    fn: () => any,
    expectedError?: new (...args: any[]) => T
  ): void {
    let thrownError: any;
    
    try {
      fn();
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeDefined();
    if (expectedError) {
      expect(thrownError).toBeInstanceOf(expectedError);
    }
  }

  static async expectToThrowAsync<T extends Error>(
    fn: () => Promise<any>,
    expectedError?: new (...args: any[]) => T
  ): Promise<void> {
    let thrownError: any;
    
    try {
      await fn();
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeDefined();
    if (expectedError) {
      expect(thrownError).toBeInstanceOf(expectedError);
    }
  }
}