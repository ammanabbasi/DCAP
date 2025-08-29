import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create users table
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('NEWID()'));
    table.string('email', 255).notNullable().unique();
    table.string('username', 100).unique();
    table.string('password_hash', 255).notNullable();
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('phone', 20);
    table.string('avatar_url', 500);
    table.enum('role', ['super_admin', 'dealer_admin', 'sales_manager', 'sales_rep', 'finance_manager', 'service_advisor', 'customer'])
      .notNullable().defaultTo('sales_rep');
    table.uuid('dealership_id');
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_verified').defaultTo(false);
    table.string('verification_token', 255);
    table.datetime('verification_expires');
    table.string('reset_token', 255);
    table.datetime('reset_token_expires');
    table.integer('failed_login_attempts').defaultTo(0);
    table.datetime('locked_until');
    table.datetime('last_login');
    table.json('preferences');
    table.json('permissions');
    table.timestamps(true, true);
    
    // Indexes
    table.index('email');
    table.index('dealership_id');
    table.index('role');
    table.index('is_active');
  });

  // Create refresh_tokens table
  await knex.schema.createTable('refresh_tokens', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('NEWID()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('token', 500).notNullable().unique();
    table.string('device_id', 255);
    table.string('device_type', 50);
    table.string('ip_address', 45);
    table.string('user_agent', 500);
    table.datetime('expires_at').notNullable();
    table.boolean('is_revoked').defaultTo(false);
    table.datetime('revoked_at');
    table.string('revoked_reason', 255);
    table.timestamps(true, true);
    
    // Indexes
    table.index('user_id');
    table.index('token');
    table.index('expires_at');
    table.index('is_revoked');
  });

  // Create login_history table
  await knex.schema.createTable('login_history', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('NEWID()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('ip_address', 45);
    table.string('user_agent', 500);
    table.string('device_type', 50);
    table.string('location', 255);
    table.boolean('success').notNullable();
    table.string('failure_reason', 255);
    table.datetime('logged_in_at');
    table.datetime('logged_out_at');
    table.timestamps(true, true);
    
    // Indexes
    table.index('user_id');
    table.index('success');
    table.index('logged_in_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('login_history');
  await knex.schema.dropTableIfExists('refresh_tokens');
  await knex.schema.dropTableIfExists('users');
}