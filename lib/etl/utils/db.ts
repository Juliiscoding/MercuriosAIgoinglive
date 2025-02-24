import knex from 'knex';
import logger from './logger';

const db = knex({
    client: 'pg',
    connection: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    },
    pool: {
        min: 2,
        max: 10
    },
    debug: process.env.NODE_ENV === 'development'
});

// Test database connection
db.raw('SELECT 1')
    .then(() => {
        logger.info('Database connection established successfully');
    })
    .catch((error) => {
        logger.error('Database connection failed:', error);
    });

export default db;
