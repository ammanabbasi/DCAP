import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create dealerships table (multi-tenant)
  await knex.schema.createTable('dealerships', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('NEWID()'));
    table.string('name', 255).notNullable();
    table.string('legal_name', 255);
    table.string('slug', 100).unique().notNullable();
    table.string('dealer_code', 50).unique();
    table.string('license_number', 100);
    table.string('tax_id', 50);
    
    // Contact information
    table.string('email', 255).notNullable();
    table.string('phone', 20).notNullable();
    table.string('fax', 20);
    table.string('website', 255);
    
    // Address
    table.string('address_line1', 255).notNullable();
    table.string('address_line2', 255);
    table.string('city', 100).notNullable();
    table.string('state', 50).notNullable();
    table.string('postal_code', 20).notNullable();
    table.string('country', 50).defaultTo('USA');
    table.decimal('latitude', 10, 7);
    table.decimal('longitude', 10, 7);
    
    // Business details
    table.json('brands'); // Array of car brands
    table.json('services'); // Services offered
    table.string('timezone', 50).defaultTo('America/New_York');
    table.json('business_hours'); // Operating hours
    
    // Subscription & Settings
    table.enum('subscription_tier', ['basic', 'professional', 'enterprise']).defaultTo('basic');
    table.datetime('subscription_expires');
    table.integer('user_limit').defaultTo(10);
    table.integer('vehicle_limit').defaultTo(100);
    table.json('features'); // Enabled features
    table.json('settings'); // Custom settings
    
    // Integrations
    table.json('integrations'); // Third-party integrations config
    table.string('dms_provider', 50);
    table.string('dms_dealer_id', 100);
    
    // Branding
    table.string('logo_url', 500);
    table.string('banner_url', 500);
    table.json('theme'); // Custom theme settings
    
    // Status
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_verified').defaultTo(false);
    table.datetime('verified_at');
    table.uuid('verified_by');
    
    table.timestamps(true, true);
    
    // Indexes
    table.index('slug');
    table.index('dealer_code');
    table.index('is_active');
    table.index('subscription_tier');
  });

  // Create dealership_departments table
  await knex.schema.createTable('dealership_departments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('NEWID()'));
    table.uuid('dealership_id').notNullable().references('id').inTable('dealerships').onDelete('CASCADE');
    table.string('name', 100).notNullable();
    table.enum('type', ['sales', 'service', 'parts', 'finance', 'admin']).notNullable();
    table.uuid('manager_id').references('id').inTable('users');
    table.string('email', 255);
    table.string('phone', 20);
    table.json('settings');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    // Indexes
    table.index('dealership_id');
    table.index('type');
    table.unique(['dealership_id', 'type']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('dealership_departments');
  await knex.schema.dropTableIfExists('dealerships');
}