import { Knex } from 'knex';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const config: { [key: string]: Knex.Config } = {
    development: {
        client: 'pg',
        connection: {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        },
        migrations: {
            directory: join(__dirname, 'lib/etl/models/migrations'),
            extension: 'ts',
        },
        seeds: {
            directory: join(__dirname, 'lib/etl/models/seeds'),
            extension: 'ts',
        },
    },

    production: {
        client: 'pg',
        connection: {
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '5432'),
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        },
        migrations: {
            directory: join(__dirname, 'lib/etl/models/migrations'),
            extension: 'ts',
        },
        pool: {
            min: 2,
            max: 10
        }
    }
};

export default config;
