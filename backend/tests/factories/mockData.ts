import { MockUser, MockVehicle, MockLead, TestHelpers } from '../utils/testHelpers';

export class MockDataFactory {
  private static userIdCounter = 1;
  private static vehicleIdCounter = 1;
  private static leadIdCounter = 1;
  private static dealershipIdCounter = 1;

  static createUser(overrides: Partial<MockUser> = {}): MockUser {
    const id = this.userIdCounter++;
    return {
      id,
      email: `user${id}@example.com`,
      firstName: `FirstName${id}`,
      lastName: `LastName${id}`,
      dealershipId: 1,
      role: 'sales',
      isActive: true,
      ...overrides
    };
  }

  static createUsers(count: number, overrides: Partial<MockUser> = {}): MockUser[] {
    return Array.from({ length: count }, () => this.createUser(overrides));
  }

  static createAdminUser(overrides: Partial<MockUser> = {}): MockUser {
    return this.createUser({
      role: 'admin',
      email: 'admin@dealerscloud.com',
      firstName: 'Admin',
      lastName: 'User',
      ...overrides
    });
  }

  static createVehicle(overrides: Partial<MockVehicle> = {}): MockVehicle {
    const id = this.vehicleIdCounter++;
    const makes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Audi'];
    const models = ['Camry', 'Accord', 'F-150', 'Silverado', '3 Series', 'C-Class', 'A4'];
    const make = makes[Math.floor(Math.random() * makes.length)];
    
    return {
      id,
      vin: TestHelpers.generateVIN(),
      make,
      model: models[Math.floor(Math.random() * models.length)],
      year: 2015 + Math.floor(Math.random() * 9), // 2015-2023
      price: 15000 + Math.floor(Math.random() * 50000), // $15,000 - $65,000
      mileage: Math.floor(Math.random() * 100000), // 0-100,000 miles
      dealershipId: 1,
      status: 'available',
      ...overrides
    };
  }

  static createVehicles(count: number, overrides: Partial<MockVehicle> = {}): MockVehicle[] {
    return Array.from({ length: count }, () => this.createVehicle(overrides));
  }

  static createLuxuryVehicle(overrides: Partial<MockVehicle> = {}): MockVehicle {
    return this.createVehicle({
      make: 'BMW',
      model: 'X5',
      year: 2022,
      price: 75000,
      mileage: 5000,
      ...overrides
    });
  }

  static createLead(overrides: Partial<MockLead> = {}): MockLead {
    const id = this.leadIdCounter++;
    const sources = ['website', 'phone', 'referral', 'walk-in', 'email', 'social-media'];
    
    return {
      id,
      firstName: `Lead${id}`,
      lastName: `Customer${id}`,
      email: `lead${id}@example.com`,
      phone: `555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      source: sources[Math.floor(Math.random() * sources.length)],
      status: 'new',
      assignedToId: 1,
      dealershipId: 1,
      ...overrides
    };
  }

  static createLeads(count: number, overrides: Partial<MockLead> = {}): MockLead[] {
    return Array.from({ length: count }, () => this.createLead(overrides));
  }

  static createQualifiedLead(overrides: Partial<MockLead> = {}): MockLead {
    return this.createLead({
      status: 'qualified',
      firstName: 'Qualified',
      lastName: 'Customer',
      email: 'qualified@example.com',
      ...overrides
    });
  }

  static createDealership(overrides: any = {}): any {
    const id = this.dealershipIdCounter++;
    return {
      id,
      name: `Test Dealership ${id}`,
      address: '123 Main St',
      city: 'Test City',
      state: 'CA',
      zipCode: '90210',
      phone: '555-0123',
      email: `dealership${id}@example.com`,
      isActive: true,
      ...overrides
    };
  }

  static createAuthPayload(user: MockUser): any {
    return {
      email: user.email,
      password: 'TestPassword123!',
      firstName: user.firstName,
      lastName: user.lastName
    };
  }

  static createVehiclePayload(vehicle: MockVehicle): any {
    return {
      vin: vehicle.vin,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      price: vehicle.price,
      mileage: vehicle.mileage,
      condition: 'used',
      transmission: 'automatic',
      fuel_type: 'gasoline',
      exterior_color: 'black',
      interior_color: 'black',
      body_style: 'sedan'
    };
  }

  static createLeadPayload(lead: MockLead): any {
    return {
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      notes: 'Test lead created for testing purposes',
      interestedVehicles: []
    };
  }

  static createCreditApplicationPayload(): any {
    return {
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        ssn: '123-45-6789',
        dateOfBirth: '1985-06-15',
        phone: '555-1234',
        email: 'john.doe@example.com'
      },
      address: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '90210',
        monthsAtAddress: 24
      },
      employment: {
        employer: 'Test Company Inc',
        position: 'Software Engineer',
        monthsEmployed: 36,
        monthlyIncome: 8000,
        workPhone: '555-5678'
      },
      references: [
        {
          name: 'Jane Smith',
          relationship: 'Friend',
          phone: '555-9876'
        }
      ]
    };
  }

  static createTaskPayload(): any {
    return {
      title: 'Follow up with lead',
      description: 'Call the customer to discuss financing options',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      priority: 'medium',
      type: 'call'
    };
  }

  static createMessagePayload(): any {
    return {
      recipientId: 2,
      subject: 'Test Message',
      body: 'This is a test message for integration testing.',
      type: 'internal'
    };
  }

  static resetCounters(): void {
    this.userIdCounter = 1;
    this.vehicleIdCounter = 1;
    this.leadIdCounter = 1;
    this.dealershipIdCounter = 1;
  }
}