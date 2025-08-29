import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create conversations table
  await knex.schema.createTable('conversations', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('NEWID()'));
    table.uuid('dealership_id').notNullable().references('id').inTable('dealerships').onDelete('CASCADE');
    table.enum('type', ['direct', 'group', 'broadcast']).defaultTo('direct');
    table.string('title', 255);
    table.json('participants'); // Array of user IDs
    table.uuid('lead_id').references('id').inTable('leads');
    table.uuid('customer_id').references('id').inTable('customers');
    table.boolean('is_archived').defaultTo(false);
    table.datetime('last_message_at');
    table.integer('unread_count').defaultTo(0);
    table.timestamps(true, true);
    
    // Indexes
    table.index('dealership_id');
    table.index('type');
    table.index('lead_id');
    table.index('customer_id');
    table.index('is_archived');
    table.index('last_message_at');
  });

  // Create messages table
  await knex.schema.createTable('messages', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('NEWID()'));
    table.uuid('conversation_id').notNullable().references('id').inTable('conversations').onDelete('CASCADE');
    table.uuid('sender_id').notNullable().references('id').inTable('users');
    table.enum('type', ['text', 'image', 'file', 'voice', 'system']).defaultTo('text');
    table.text('content');
    table.json('attachments'); // Array of attachment URLs
    table.json('metadata');
    table.boolean('is_edited').defaultTo(false);
    table.datetime('edited_at');
    table.boolean('is_deleted').defaultTo(false);
    table.datetime('deleted_at');
    table.json('read_by'); // Array of {user_id, read_at}
    table.json('delivered_to'); // Array of {user_id, delivered_at}
    table.timestamps(true, true);
    
    // Indexes
    table.index('conversation_id');
    table.index('sender_id');
    table.index('type');
    table.index('created_at');
  });

  // Create documents table
  await knex.schema.createTable('documents', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('NEWID()'));
    table.uuid('dealership_id').notNullable().references('id').inTable('dealerships').onDelete('CASCADE');
    table.uuid('uploaded_by').notNullable().references('id').inTable('users');
    
    // Document details
    table.string('name', 255).notNullable();
    table.string('original_name', 255);
    table.enum('type', [
      'contract', 'invoice', 'report', 'image', 'video',
      'license', 'insurance', 'registration', 'credit_app', 'other'
    ]).notNullable();
    table.string('mime_type', 100);
    table.bigInteger('size'); // File size in bytes
    table.string('storage_path', 500);
    table.string('url', 500);
    table.string('thumbnail_url', 500);
    
    // Relations
    table.uuid('customer_id').references('id').inTable('customers');
    table.uuid('lead_id').references('id').inTable('leads');
    table.uuid('vehicle_id').references('id').inTable('vehicles');
    table.uuid('transaction_id');
    
    // Document metadata
    table.json('metadata');
    table.json('tags');
    table.text('description');
    table.boolean('is_public').defaultTo(false);
    table.boolean('requires_signature').defaultTo(false);
    table.json('signatures'); // Array of signature data
    
    // OCR and processing
    table.boolean('is_processed').defaultTo(false);
    table.json('ocr_data');
    table.json('extracted_data');
    
    // Security
    table.datetime('expires_at');
    table.string('access_code', 20);
    table.json('permissions'); // Who can access
    
    table.timestamps(true, true);
    
    // Indexes
    table.index('dealership_id');
    table.index('uploaded_by');
    table.index('type');
    table.index('customer_id');
    table.index('lead_id');
    table.index('vehicle_id');
    table.index('created_at');
  });

  // Create document_shares table
  await knex.schema.createTable('document_shares', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('NEWID()'));
    table.uuid('document_id').notNullable().references('id').inTable('documents').onDelete('CASCADE');
    table.uuid('shared_by').notNullable().references('id').inTable('users');
    table.uuid('shared_with'); // User ID or null for public links
    table.string('share_link', 500).unique();
    table.string('access_code', 20);
    table.enum('permission', ['view', 'download', 'edit']).defaultTo('view');
    table.datetime('expires_at');
    table.integer('access_count').defaultTo(0);
    table.datetime('last_accessed');
    table.timestamps(true, true);
    
    // Indexes
    table.index('document_id');
    table.index('shared_by');
    table.index('shared_with');
    table.index('share_link');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('document_shares');
  await knex.schema.dropTableIfExists('documents');
  await knex.schema.dropTableIfExists('messages');
  await knex.schema.dropTableIfExists('conversations');
}