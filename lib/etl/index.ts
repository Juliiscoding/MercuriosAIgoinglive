import dotenv from 'dotenv';
import logger from './utils/logger';
import orchestrator from './orchestrator';

// Load environment variables
dotenv.config();

async function main() {
    try {
        // Run initial full sync
        logger.info('Starting initial full sync');
        await orchestrator.runFullSync();

        // Start scheduled syncs
        orchestrator.startScheduledSync();
        logger.info('ETL process initialized successfully');
    } catch (error) {
        logger.error('Failed to initialize ETL process:', error);
        process.exit(1);
    }
}

// Run if this file is executed directly
if (require.main === module) {
    main();
}
