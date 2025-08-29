import { Knex } from 'knex';

/**
 * Performance Optimization Migration
 * Creates indexes and optimizations for better query performance
 */

export async function up(knex: Knex): Promise<void> {
  console.log('Creating performance indexes...');

  // Users table indexes
  await knex.schema.alterTable('users', (table) => {
    // Email lookup (for authentication)
    table.index(['email'], 'idx_users_email');
    
    // Active users lookup
    table.index(['is_active'], 'idx_users_active');
    
    // Dealership users lookup
    table.index(['dealership_id'], 'idx_users_dealership');
    
    // Role-based queries
    table.index(['role'], 'idx_users_role');
    
    // Composite index for common query patterns
    table.index(['dealership_id', 'role', 'is_active'], 'idx_users_dealership_role_active');
    
    // Created date for reporting
    table.index(['created_at'], 'idx_users_created');
  });

  // Dealerships table indexes
  await knex.schema.alterTable('dealerships', (table) => {
    // Status lookup
    table.index(['status'], 'idx_dealerships_status');
    
    // Subscription tier for feature access
    table.index(['subscription_tier'], 'idx_dealerships_subscription');
    
    // Location-based queries
    table.index(['state', 'city'], 'idx_dealerships_location');
    
    // Active dealerships
    table.index(['status', 'subscription_tier'], 'idx_dealerships_active_subscription');
  });

  // Vehicles table indexes
  await knex.schema.alterTable('vehicles', (table) => {
    // VIN lookup (unique identifier)
    table.index(['vin'], 'idx_vehicles_vin');
    
    // Dealership inventory
    table.index(['dealership_id'], 'idx_vehicles_dealership');
    
    // Status for availability
    table.index(['status'], 'idx_vehicles_status');
    
    // Make and model for search
    table.index(['make'], 'idx_vehicles_make');
    table.index(['model'], 'idx_vehicles_model');
    table.index(['make', 'model'], 'idx_vehicles_make_model');
    
    // Year for filtering
    table.index(['year'], 'idx_vehicles_year');
    
    // Price range queries
    table.index(['price'], 'idx_vehicles_price');
    
    // Mileage filtering
    table.index(['mileage'], 'idx_vehicles_mileage');
    
    // Composite indexes for common search patterns
    table.index(['dealership_id', 'status'], 'idx_vehicles_dealership_status');
    table.index(['make', 'model', 'year'], 'idx_vehicles_make_model_year');
    table.index(['dealership_id', 'make', 'model'], 'idx_vehicles_dealership_make_model');
    table.index(['price', 'mileage', 'year'], 'idx_vehicles_price_mileage_year');
    
    // Date indexes for reporting
    table.index(['created_at'], 'idx_vehicles_created');
    table.index(['updated_at'], 'idx_vehicles_updated');
  });

  // Leads table indexes
  await knex.schema.alterTable('leads', (table) => {
    // Dealership leads
    table.index(['dealership_id'], 'idx_leads_dealership');
    
    // Status tracking
    table.index(['status'], 'idx_leads_status');
    
    // Source tracking
    table.index(['source'], 'idx_leads_source');
    
    // Assigned salesperson
    table.index(['assigned_to'], 'idx_leads_assigned');
    
    // Email for duplicate detection
    table.index(['email'], 'idx_leads_email');
    
    // Phone for duplicate detection
    table.index(['phone'], 'idx_leads_phone');
    
    // Priority for sorting
    table.index(['priority'], 'idx_leads_priority');
    
    // Composite indexes for dashboard queries
    table.index(['dealership_id', 'status'], 'idx_leads_dealership_status');
    table.index(['assigned_to', 'status'], 'idx_leads_assigned_status');
    table.index(['dealership_id', 'created_at'], 'idx_leads_dealership_created');
    
    // Date indexes
    table.index(['created_at'], 'idx_leads_created');
    table.index(['updated_at'], 'idx_leads_updated');
  });

  // Customers table indexes
  await knex.schema.alterTable('customers', (table) => {
    // Dealership customers
    table.index(['dealership_id'], 'idx_customers_dealership');
    
    // Email lookup
    table.index(['email'], 'idx_customers_email');
    
    // Phone lookup
    table.index(['phone'], 'idx_customers_phone');
    
    // Name search
    table.index(['first_name'], 'idx_customers_first_name');
    table.index(['last_name'], 'idx_customers_last_name');
    table.index(['first_name', 'last_name'], 'idx_customers_full_name');
    
    // Location for targeting
    table.index(['state'], 'idx_customers_state');
    table.index(['city', 'state'], 'idx_customers_location');
    
    // Date indexes
    table.index(['created_at'], 'idx_customers_created');
  });

  // Messages table indexes
  await knex.schema.alterTable('messages', (table) => {
    // Conversation lookup
    table.index(['conversation_id'], 'idx_messages_conversation');
    
    // Sender lookup
    table.index(['sender_id'], 'idx_messages_sender');
    
    // Recipient lookup
    table.index(['recipient_id'], 'idx_messages_recipient');
    
    // Read status for unread counts
    table.index(['is_read'], 'idx_messages_read');
    
    // Message type
    table.index(['message_type'], 'idx_messages_type');
    
    // Composite indexes for common queries
    table.index(['conversation_id', 'created_at'], 'idx_messages_conversation_created');
    table.index(['recipient_id', 'is_read'], 'idx_messages_recipient_unread');
    
    // Date index for chronological ordering
    table.index(['created_at'], 'idx_messages_created');
  });

  // Documents table indexes
  await knex.schema.alterTable('documents', (table) => {
    // Entity relationship
    table.index(['entity_type', 'entity_id'], 'idx_documents_entity');
    
    // Document type
    table.index(['document_type'], 'idx_documents_type');
    
    // Status
    table.index(['status'], 'idx_documents_status');
    
    // Uploaded by
    table.index(['uploaded_by'], 'idx_documents_uploaded_by');
    
    // Date indexes
    table.index(['created_at'], 'idx_documents_created');
    table.index(['updated_at'], 'idx_documents_updated');
    
    // Composite for common queries
    table.index(['entity_type', 'entity_id', 'document_type'], 'idx_documents_entity_type');
  });

  // Tasks table indexes
  await knex.schema.alterTable('tasks', (table) => {
    // Dealership tasks
    table.index(['dealership_id'], 'idx_tasks_dealership');
    
    // Assigned user
    table.index(['assigned_to'], 'idx_tasks_assigned');
    
    // Status tracking
    table.index(['status'], 'idx_tasks_status');
    
    // Priority
    table.index(['priority'], 'idx_tasks_priority');
    
    // Due date for scheduling
    table.index(['due_date'], 'idx_tasks_due_date');
    
    // Related entity
    table.index(['related_type', 'related_id'], 'idx_tasks_related');
    
    // Composite indexes for dashboard
    table.index(['assigned_to', 'status'], 'idx_tasks_assigned_status');
    table.index(['dealership_id', 'due_date'], 'idx_tasks_dealership_due');
    table.index(['status', 'due_date'], 'idx_tasks_status_due');
    
    // Date indexes
    table.index(['created_at'], 'idx_tasks_created');
  });

  // Transactions table indexes
  await knex.schema.alterTable('transactions', (table) => {
    // Dealership transactions
    table.index(['dealership_id'], 'idx_transactions_dealership');
    
    // Transaction type
    table.index(['transaction_type'], 'idx_transactions_type');
    
    // Status
    table.index(['status'], 'idx_transactions_status');
    
    // Amount for reporting
    table.index(['amount'], 'idx_transactions_amount');
    
    // Customer reference
    table.index(['customer_id'], 'idx_transactions_customer');
    
    // Vehicle reference
    table.index(['vehicle_id'], 'idx_transactions_vehicle');
    
    // Date indexes for reporting
    table.index(['transaction_date'], 'idx_transactions_date');
    table.index(['created_at'], 'idx_transactions_created');
    
    // Composite indexes for reporting queries
    table.index(['dealership_id', 'transaction_date'], 'idx_transactions_dealership_date');
    table.index(['dealership_id', 'transaction_type', 'status'], 'idx_transactions_dealership_type_status');
    table.index(['transaction_date', 'amount'], 'idx_transactions_date_amount');
  });

  console.log('Performance indexes created successfully');
}

export async function down(knex: Knex): Promise<void> {
  console.log('Dropping performance indexes...');

  // Drop indexes in reverse order
  await knex.schema.alterTable('transactions', (table) => {
    table.dropIndex(['dealership_id'], 'idx_transactions_dealership');
    table.dropIndex(['transaction_type'], 'idx_transactions_type');
    table.dropIndex(['status'], 'idx_transactions_status');
    table.dropIndex(['amount'], 'idx_transactions_amount');
    table.dropIndex(['customer_id'], 'idx_transactions_customer');
    table.dropIndex(['vehicle_id'], 'idx_transactions_vehicle');
    table.dropIndex(['transaction_date'], 'idx_transactions_date');
    table.dropIndex(['created_at'], 'idx_transactions_created');
    table.dropIndex(['dealership_id', 'transaction_date'], 'idx_transactions_dealership_date');
    table.dropIndex(['dealership_id', 'transaction_type', 'status'], 'idx_transactions_dealership_type_status');
    table.dropIndex(['transaction_date', 'amount'], 'idx_transactions_date_amount');
  });

  await knex.schema.alterTable('tasks', (table) => {
    table.dropIndex(['dealership_id'], 'idx_tasks_dealership');
    table.dropIndex(['assigned_to'], 'idx_tasks_assigned');
    table.dropIndex(['status'], 'idx_tasks_status');
    table.dropIndex(['priority'], 'idx_tasks_priority');
    table.dropIndex(['due_date'], 'idx_tasks_due_date');
    table.dropIndex(['related_type', 'related_id'], 'idx_tasks_related');
    table.dropIndex(['assigned_to', 'status'], 'idx_tasks_assigned_status');
    table.dropIndex(['dealership_id', 'due_date'], 'idx_tasks_dealership_due');
    table.dropIndex(['status', 'due_date'], 'idx_tasks_status_due');
    table.dropIndex(['created_at'], 'idx_tasks_created');
  });

  await knex.schema.alterTable('documents', (table) => {
    table.dropIndex(['entity_type', 'entity_id'], 'idx_documents_entity');
    table.dropIndex(['document_type'], 'idx_documents_type');
    table.dropIndex(['status'], 'idx_documents_status');
    table.dropIndex(['uploaded_by'], 'idx_documents_uploaded_by');
    table.dropIndex(['created_at'], 'idx_documents_created');
    table.dropIndex(['updated_at'], 'idx_documents_updated');
    table.dropIndex(['entity_type', 'entity_id', 'document_type'], 'idx_documents_entity_type');
  });

  await knex.schema.alterTable('messages', (table) => {
    table.dropIndex(['conversation_id'], 'idx_messages_conversation');
    table.dropIndex(['sender_id'], 'idx_messages_sender');
    table.dropIndex(['recipient_id'], 'idx_messages_recipient');
    table.dropIndex(['is_read'], 'idx_messages_read');
    table.dropIndex(['message_type'], 'idx_messages_type');
    table.dropIndex(['conversation_id', 'created_at'], 'idx_messages_conversation_created');
    table.dropIndex(['recipient_id', 'is_read'], 'idx_messages_recipient_unread');
    table.dropIndex(['created_at'], 'idx_messages_created');
  });

  await knex.schema.alterTable('customers', (table) => {
    table.dropIndex(['dealership_id'], 'idx_customers_dealership');
    table.dropIndex(['email'], 'idx_customers_email');
    table.dropIndex(['phone'], 'idx_customers_phone');
    table.dropIndex(['first_name'], 'idx_customers_first_name');
    table.dropIndex(['last_name'], 'idx_customers_last_name');
    table.dropIndex(['first_name', 'last_name'], 'idx_customers_full_name');
    table.dropIndex(['state'], 'idx_customers_state');
    table.dropIndex(['city', 'state'], 'idx_customers_location');
    table.dropIndex(['created_at'], 'idx_customers_created');
  });

  await knex.schema.alterTable('leads', (table) => {
    table.dropIndex(['dealership_id'], 'idx_leads_dealership');
    table.dropIndex(['status'], 'idx_leads_status');
    table.dropIndex(['source'], 'idx_leads_source');
    table.dropIndex(['assigned_to'], 'idx_leads_assigned');
    table.dropIndex(['email'], 'idx_leads_email');
    table.dropIndex(['phone'], 'idx_leads_phone');
    table.dropIndex(['priority'], 'idx_leads_priority');
    table.dropIndex(['dealership_id', 'status'], 'idx_leads_dealership_status');
    table.dropIndex(['assigned_to', 'status'], 'idx_leads_assigned_status');
    table.dropIndex(['dealership_id', 'created_at'], 'idx_leads_dealership_created');
    table.dropIndex(['created_at'], 'idx_leads_created');
    table.dropIndex(['updated_at'], 'idx_leads_updated');
  });

  await knex.schema.alterTable('vehicles', (table) => {
    table.dropIndex(['vin'], 'idx_vehicles_vin');
    table.dropIndex(['dealership_id'], 'idx_vehicles_dealership');
    table.dropIndex(['status'], 'idx_vehicles_status');
    table.dropIndex(['make'], 'idx_vehicles_make');
    table.dropIndex(['model'], 'idx_vehicles_model');
    table.dropIndex(['make', 'model'], 'idx_vehicles_make_model');
    table.dropIndex(['year'], 'idx_vehicles_year');
    table.dropIndex(['price'], 'idx_vehicles_price');
    table.dropIndex(['mileage'], 'idx_vehicles_mileage');
    table.dropIndex(['dealership_id', 'status'], 'idx_vehicles_dealership_status');
    table.dropIndex(['make', 'model', 'year'], 'idx_vehicles_make_model_year');
    table.dropIndex(['dealership_id', 'make', 'model'], 'idx_vehicles_dealership_make_model');
    table.dropIndex(['price', 'mileage', 'year'], 'idx_vehicles_price_mileage_year');
    table.dropIndex(['created_at'], 'idx_vehicles_created');
    table.dropIndex(['updated_at'], 'idx_vehicles_updated');
  });

  await knex.schema.alterTable('dealerships', (table) => {
    table.dropIndex(['status'], 'idx_dealerships_status');
    table.dropIndex(['subscription_tier'], 'idx_dealerships_subscription');
    table.dropIndex(['state', 'city'], 'idx_dealerships_location');
    table.dropIndex(['status', 'subscription_tier'], 'idx_dealerships_active_subscription');
  });

  await knex.schema.alterTable('users', (table) => {
    table.dropIndex(['email'], 'idx_users_email');
    table.dropIndex(['is_active'], 'idx_users_active');
    table.dropIndex(['dealership_id'], 'idx_users_dealership');
    table.dropIndex(['role'], 'idx_users_role');
    table.dropIndex(['dealership_id', 'role', 'is_active'], 'idx_users_dealership_role_active');
    table.dropIndex(['created_at'], 'idx_users_created');
  });

  console.log('Performance indexes dropped successfully');
}