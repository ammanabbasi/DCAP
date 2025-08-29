import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create customers table
  await knex.schema.createTable('customers', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('NEWID()'));
    table.uuid('dealership_id').notNullable().references('id').inTable('dealerships').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users'); // If customer has an account
    
    // Personal information
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('middle_name', 100);
    table.string('email', 255);
    table.string('phone', 20);
    table.string('mobile_phone', 20);
    table.string('work_phone', 20);
    table.date('date_of_birth');
    table.string('ssn_last_four', 4);
    table.string('drivers_license', 50);
    table.string('drivers_license_state', 2);
    
    // Address
    table.string('address_line1', 255);
    table.string('address_line2', 255);
    table.string('city', 100);
    table.string('state', 50);
    table.string('postal_code', 20);
    table.string('country', 50).defaultTo('USA');
    
    // Employment
    table.string('employer', 255);
    table.string('job_title', 100);
    table.decimal('annual_income', 12, 2);
    table.string('employment_status', 50);
    table.integer('years_employed');
    
    // Preferences
    table.json('preferences');
    table.json('vehicle_interests');
    table.string('preferred_contact_method', 50);
    table.string('best_time_to_contact', 50);
    
    // Credit information (encrypted/hashed)
    table.integer('credit_score');
    table.string('credit_tier', 20);
    table.datetime('credit_pulled_date');
    
    // Customer lifecycle
    table.enum('type', ['prospect', 'lead', 'customer', 'repeat_customer']).defaultTo('prospect');
    table.decimal('lifetime_value', 12, 2).defaultTo(0);
    table.integer('vehicles_purchased').defaultTo(0);
    table.datetime('first_contact_date');
    table.datetime('last_contact_date');
    table.datetime('last_purchase_date');
    
    // Marketing
    table.boolean('email_opt_in').defaultTo(true);
    table.boolean('sms_opt_in').defaultTo(false);
    table.boolean('mail_opt_in').defaultTo(true);
    table.string('source', 100);
    table.string('campaign', 100);
    
    table.timestamps(true, true);
    
    // Indexes
    table.index('dealership_id');
    table.index('email');
    table.index('phone');
    table.index(['first_name', 'last_name']);
    table.index('type');
  });

  // Create leads table (CRM pipeline)
  await knex.schema.createTable('leads', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('NEWID()'));
    table.uuid('dealership_id').notNullable().references('id').inTable('dealerships').onDelete('CASCADE');
    table.uuid('customer_id').notNullable().references('id').inTable('customers').onDelete('CASCADE');
    table.uuid('assigned_to').references('id').inTable('users');
    table.uuid('vehicle_id').references('id').inTable('vehicles');
    
    // Lead details
    table.enum('status', [
      'new', 'contacted', 'qualified', 'appointment_scheduled',
      'appointment_completed', 'negotiating', 'closed_won', 'closed_lost', 'on_hold'
    ]).defaultTo('new');
    table.enum('type', ['walk_in', 'phone', 'email', 'chat', 'referral', 'returning']).notNullable();
    table.string('source', 100);
    table.string('source_detail', 255);
    table.enum('priority', ['low', 'medium', 'high', 'urgent']).defaultTo('medium');
    table.decimal('temperature', 3, 0); // Lead score 0-100
    
    // Interest details
    table.json('interested_vehicles'); // Array of vehicle IDs
    table.string('budget_range', 50);
    table.decimal('budget_min', 12, 2);
    table.decimal('budget_max', 12, 2);
    table.string('financing_method', 50);
    table.boolean('has_trade_in').defaultTo(false);
    table.json('trade_in_details');
    table.date('purchase_timeframe');
    
    // Communication
    table.text('initial_message');
    table.text('notes');
    table.integer('follow_up_count').defaultTo(0);
    table.datetime('last_contact');
    table.datetime('next_follow_up');
    table.string('preferred_contact_time', 50);
    
    // Conversion tracking
    table.datetime('qualified_date');
    table.datetime('appointment_date');
    table.datetime('test_drive_date');
    table.datetime('closed_date');
    table.string('lost_reason', 255);
    
    // Metrics
    table.integer('response_time_minutes');
    table.integer('days_in_pipeline').defaultTo(0);
    table.decimal('deal_value', 12, 2);
    table.decimal('gross_profit', 12, 2);
    
    table.timestamps(true, true);
    
    // Indexes
    table.index('dealership_id');
    table.index('customer_id');
    table.index('assigned_to');
    table.index('vehicle_id');
    table.index('status');
    table.index('type');
    table.index('priority');
    table.index('created_at');
  });

  // Create lead_activities table
  await knex.schema.createTable('lead_activities', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('NEWID()'));
    table.uuid('lead_id').notNullable().references('id').inTable('leads').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users');
    table.enum('type', [
      'note', 'call', 'email', 'sms', 'meeting', 'test_drive',
      'follow_up', 'status_change', 'assignment_change'
    ]).notNullable();
    table.string('subject', 255);
    table.text('description');
    table.json('metadata');
    table.datetime('scheduled_at');
    table.datetime('completed_at');
    table.timestamps(true, true);
    
    // Indexes
    table.index('lead_id');
    table.index('user_id');
    table.index('type');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('lead_activities');
  await knex.schema.dropTableIfExists('leads');
  await knex.schema.dropTableIfExists('customers');
}