import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create tasks table
  await knex.schema.createTable('tasks', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('NEWID()'));
    table.uuid('dealership_id').notNullable().references('id').inTable('dealerships').onDelete('CASCADE');
    table.uuid('created_by').notNullable().references('id').inTable('users');
    table.uuid('assigned_to').references('id').inTable('users');
    
    // Task details
    table.string('title', 255).notNullable();
    table.text('description');
    table.enum('type', [
      'follow_up', 'appointment', 'document', 'inspection',
      'delivery', 'service', 'call', 'email', 'other'
    ]).notNullable();
    table.enum('status', ['pending', 'in_progress', 'completed', 'cancelled', 'overdue']).defaultTo('pending');
    table.enum('priority', ['low', 'medium', 'high', 'urgent']).defaultTo('medium');
    
    // Relations
    table.uuid('lead_id').references('id').inTable('leads');
    table.uuid('customer_id').references('id').inTable('customers');
    table.uuid('vehicle_id').references('id').inTable('vehicles');
    table.uuid('parent_task_id').references('id').inTable('tasks');
    
    // Scheduling
    table.datetime('due_date');
    table.datetime('start_date');
    table.datetime('completed_at');
    table.uuid('completed_by').references('id').inTable('users');
    table.integer('estimated_minutes');
    table.integer('actual_minutes');
    
    // Reminders
    table.boolean('send_reminder').defaultTo(false);
    table.integer('reminder_minutes_before');
    table.datetime('reminder_sent_at');
    
    // Recurring tasks
    table.boolean('is_recurring').defaultTo(false);
    table.string('recurrence_pattern', 50); // daily, weekly, monthly
    table.json('recurrence_config');
    table.datetime('recurrence_end_date');
    
    // Additional data
    table.json('metadata');
    table.json('checklist'); // Sub-tasks or checklist items
    table.text('completion_notes');
    
    table.timestamps(true, true);
    
    // Indexes
    table.index('dealership_id');
    table.index('assigned_to');
    table.index('status');
    table.index('priority');
    table.index('due_date');
    table.index('lead_id');
    table.index('customer_id');
    table.index('vehicle_id');
  });

  // Create transactions table
  await knex.schema.createTable('transactions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('NEWID()'));
    table.uuid('dealership_id').notNullable().references('id').inTable('dealerships').onDelete('CASCADE');
    table.string('transaction_number', 50).unique().notNullable();
    
    // Transaction parties
    table.uuid('customer_id').notNullable().references('id').inTable('customers');
    table.uuid('salesperson_id').references('id').inTable('users');
    table.uuid('finance_manager_id').references('id').inTable('users');
    
    // Vehicle details
    table.uuid('vehicle_id').notNullable().references('id').inTable('vehicles');
    table.uuid('trade_in_vehicle_id').references('id').inTable('vehicles');
    
    // Transaction type and status
    table.enum('type', ['sale', 'lease', 'finance', 'cash', 'wholesale']).notNullable();
    table.enum('status', [
      'pending', 'approved', 'in_finance', 'funded',
      'delivered', 'completed', 'cancelled', 'reversed'
    ]).defaultTo('pending');
    
    // Pricing
    table.decimal('vehicle_price', 12, 2).notNullable();
    table.decimal('discount', 10, 2).defaultTo(0);
    table.decimal('rebate', 10, 2).defaultTo(0);
    table.decimal('trade_in_value', 12, 2).defaultTo(0);
    table.decimal('trade_in_payoff', 12, 2).defaultTo(0);
    table.decimal('down_payment', 12, 2).defaultTo(0);
    table.decimal('amount_financed', 12, 2);
    
    // Fees and taxes
    table.decimal('documentation_fee', 10, 2).defaultTo(0);
    table.decimal('registration_fee', 10, 2).defaultTo(0);
    table.decimal('tax_amount', 10, 2).defaultTo(0);
    table.decimal('other_fees', 10, 2).defaultTo(0);
    table.json('fee_breakdown');
    
    // Totals
    table.decimal('total_price', 12, 2).notNullable();
    table.decimal('gross_profit', 12, 2);
    table.decimal('commission_amount', 10, 2);
    
    // Finance details
    table.string('finance_company', 100);
    table.string('finance_application_id', 100);
    table.decimal('interest_rate', 5, 2);
    table.integer('term_months');
    table.decimal('monthly_payment', 10, 2);
    table.date('first_payment_date');
    
    // Warranties and products
    table.json('warranties');
    table.json('add_on_products');
    table.decimal('warranty_profit', 10, 2).defaultTo(0);
    table.decimal('product_profit', 10, 2).defaultTo(0);
    
    // Important dates
    table.datetime('deal_date');
    table.datetime('approval_date');
    table.datetime('finance_submitted_date');
    table.datetime('funded_date');
    table.datetime('delivery_date');
    table.datetime('cancelled_date');
    
    // Documents
    table.json('required_documents');
    table.json('signed_documents');
    table.boolean('paperwork_complete').defaultTo(false);
    
    // Notes
    table.text('sales_notes');
    table.text('finance_notes');
    table.text('delivery_notes');
    table.string('cancellation_reason', 500);
    
    table.timestamps(true, true);
    
    // Indexes
    table.index('dealership_id');
    table.index('transaction_number');
    table.index('customer_id');
    table.index('vehicle_id');
    table.index('salesperson_id');
    table.index('status');
    table.index('type');
    table.index('deal_date');
  });

  // Create commissions table
  await knex.schema.createTable('commissions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('NEWID()'));
    table.uuid('transaction_id').notNullable().references('id').inTable('transactions').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users');
    table.enum('type', ['sales', 'finance', 'warranty', 'product', 'bonus']).notNullable();
    table.decimal('amount', 10, 2).notNullable();
    table.decimal('percentage', 5, 2);
    table.enum('status', ['pending', 'approved', 'paid', 'cancelled']).defaultTo('pending');
    table.datetime('approved_date');
    table.uuid('approved_by').references('id').inTable('users');
    table.datetime('paid_date');
    table.string('payment_reference', 100);
    table.text('notes');
    table.timestamps(true, true);
    
    // Indexes
    table.index('transaction_id');
    table.index('user_id');
    table.index('status');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('commissions');
  await knex.schema.dropTableIfExists('transactions');
  await knex.schema.dropTableIfExists('tasks');
}