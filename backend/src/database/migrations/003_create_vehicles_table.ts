import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create vehicles table (inventory)
  await knex.schema.createTable('vehicles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('NEWID()'));
    table.uuid('dealership_id').notNullable().references('id').inTable('dealerships').onDelete('CASCADE');
    
    // Vehicle identification
    table.string('vin', 17).unique().notNullable();
    table.string('stock_number', 50).notNullable();
    table.enum('status', ['available', 'pending', 'sold', 'wholesale', 'service', 'transit']).defaultTo('available');
    table.enum('type', ['new', 'used', 'certified']).notNullable();
    
    // Vehicle details
    table.integer('year').notNullable();
    table.string('make', 50).notNullable();
    table.string('model', 100).notNullable();
    table.string('trim', 100);
    table.string('body_style', 50);
    table.string('exterior_color', 50);
    table.string('interior_color', 50);
    table.string('engine', 100);
    table.string('transmission', 50);
    table.string('drivetrain', 50);
    table.string('fuel_type', 50);
    table.integer('cylinders');
    table.decimal('engine_size', 3, 1);
    table.integer('doors');
    table.integer('passengers');
    
    // Mileage & Condition
    table.integer('mileage');
    table.enum('condition', ['excellent', 'good', 'fair', 'poor']);
    table.decimal('condition_score', 3, 1);
    table.json('damage_notes');
    
    // Pricing
    table.decimal('cost', 12, 2);
    table.decimal('list_price', 12, 2);
    table.decimal('sale_price', 12, 2);
    table.decimal('internet_price', 12, 2);
    table.decimal('wholesale_price', 12, 2);
    table.decimal('invoice_price', 12, 2);
    table.decimal('msrp', 12, 2);
    table.decimal('discount_amount', 10, 2);
    table.string('discount_description', 255);
    
    // Location & Source
    table.string('location', 100);
    table.string('lot_number', 50);
    table.enum('source', ['trade_in', 'auction', 'wholesale', 'consignment', 'lease_return']);
    table.date('purchase_date');
    table.uuid('purchased_from_id');
    
    // Features & Options
    table.json('features'); // Array of features
    table.json('packages'); // Installed packages
    table.text('description');
    table.text('dealer_notes');
    
    // Media
    table.json('images'); // Array of image URLs
    table.string('main_image_url', 500);
    table.json('videos'); // Array of video URLs
    table.json('documents'); // Related documents
    
    // History & Certification
    table.boolean('one_owner').defaultTo(false);
    table.boolean('accident_free').defaultTo(false);
    table.boolean('service_records').defaultTo(false);
    table.string('carfax_url', 500);
    table.string('autocheck_url', 500);
    table.date('warranty_expires');
    table.boolean('certified').defaultTo(false);
    table.date('certified_date');
    
    // Marketing
    table.boolean('featured').defaultTo(false);
    table.boolean('published').defaultTo(true);
    table.datetime('published_at');
    table.json('marketing_comments');
    table.integer('views').defaultTo(0);
    table.integer('inquiries').defaultTo(0);
    table.integer('test_drives').defaultTo(0);
    
    // Days in inventory
    table.integer('days_in_stock').defaultTo(0);
    table.date('added_to_inventory');
    table.date('sold_date');
    
    table.timestamps(true, true);
    
    // Indexes
    table.index('dealership_id');
    table.index('vin');
    table.index('stock_number');
    table.index('status');
    table.index('type');
    table.index(['dealership_id', 'stock_number']);
    table.index(['make', 'model', 'year']);
    table.index('featured');
    table.index('published');
  });

  // Create vehicle_history table
  await knex.schema.createTable('vehicle_history', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('NEWID()'));
    table.uuid('vehicle_id').notNullable().references('id').inTable('vehicles').onDelete('CASCADE');
    table.enum('event_type', [
      'created', 'price_change', 'status_change', 'location_change',
      'test_drive', 'inspection', 'service', 'sold', 'returned'
    ]).notNullable();
    table.string('description', 500);
    table.json('old_value');
    table.json('new_value');
    table.uuid('user_id').references('id').inTable('users');
    table.timestamps(true, true);
    
    // Indexes
    table.index('vehicle_id');
    table.index('event_type');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('vehicle_history');
  await knex.schema.dropTableIfExists('vehicles');
}