import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    // Create branches table
    await knex.schema.createTable('branches', (table) => {
        table.string('id').primary();
        table.integer('branch_number').unique().notNullable();
        table.string('name').notNullable();
        table.string('address');
        table.string('phone');
        table.string('email');
        table.boolean('is_active').defaultTo(true);
        table.string('type');
        table.timestamp('last_updated').defaultTo(knex.fn.now());
    });

    // Create sales table
    await knex.schema.createTable('sales', (table) => {
        table.string('id').primary();
        table.integer('branch_number').notNullable();
        table.bigint('article_number').notNullable();
        table.bigint('article_size_number');
        table.integer('customer_number');
        table.integer('staff_number');
        table.bigint('receipt_number');
        table.timestamp('date').notNullable();
        table.decimal('purchase_price', 10, 2);
        table.decimal('sale_price', 10, 2).notNullable();
        table.decimal('label_price', 10, 2);
        table.decimal('discount', 10, 2);
        table.integer('quantity').defaultTo(1);
        table.integer('type').defaultTo(0);
        table.boolean('is_deleted').defaultTo(false);
        table.timestamp('last_change').defaultTo(knex.fn.now());

        table.foreign('branch_number').references('branch_number').inTable('branches');
        table.index(['branch_number', 'date']);
        table.index(['customer_number']);
        table.index(['article_number']);
    });

    // Create articles table
    await knex.schema.createTable('articles', (table) => {
        table.bigint('article_number').primary();
        table.string('name').notNullable();
        table.text('description');
        table.string('category');
        table.decimal('price', 10, 2);
        table.timestamp('last_updated').defaultTo(knex.fn.now());

        table.index(['category']);
    });

    // Create customers table
    await knex.schema.createTable('customers', (table) => {
        table.integer('customer_number').primary();
        table.string('first_name');
        table.string('last_name');
        table.string('email');
        table.string('phone');
        table.timestamp('last_purchase_date');
        table.boolean('is_active').defaultTo(true);
        table.timestamp('last_updated').defaultTo(knex.fn.now());

        table.index(['last_purchase_date']);
        table.index(['email']);
    });

    // Create ETL stats table
    await knex.schema.createTable('etl_stats', (table) => {
        table.increments('id');
        table.string('job_name').notNullable();
        table.timestamp('start_time').notNullable();
        table.timestamp('end_time');
        table.integer('records_processed').defaultTo(0);
        table.string('status').notNullable();
        table.text('error');
        table.timestamp('last_updated').defaultTo(knex.fn.now());

        table.index(['job_name', 'start_time']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('sales');
    await knex.schema.dropTable('customers');
    await knex.schema.dropTable('articles');
    await knex.schema.dropTable('branches');
    await knex.schema.dropTable('etl_stats');
}
