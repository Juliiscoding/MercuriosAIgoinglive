import cron from 'node-cron';
import logger from './utils/logger';
import extractor from './extractors';
import transformer from './transformers';
import loader from './loaders';

export class ETLOrchestrator {
    private isRunning: boolean = false;

    async runFullSync(): Promise<void> {
        if (this.isRunning) {
            logger.warn('ETL process is already running');
            return;
        }

        this.isRunning = true;
        logger.info('Starting full sync ETL process');

        try {
            // Sync branches
            const branches = await extractor.extractBranches();
            const transformedBranches = await transformer.transformBranches(branches);
            await loader.loadBranches(transformedBranches);

            // Sync articles
            const articles = await extractor.extractArticles();
            const transformedArticles = await transformer.transformArticles(articles);
            await loader.loadArticles(transformedArticles);

            // Sync customers
            const customers = await extractor.extractCustomers();
            const transformedCustomers = await transformer.transformCustomers(customers);
            await loader.loadCustomers(transformedCustomers);

            // Sync all sales
            const sales = await extractor.extractSales();
            const transformedSales = await transformer.transformSales(sales);
            await loader.loadSales(transformedSales);

            logger.info('Full sync completed successfully');
        } catch (error) {
            logger.error('Error during full sync:', error);
            throw error;
        } finally {
            this.isRunning = false;
        }
    }

    async runIncrementalSync(): Promise<void> {
        if (this.isRunning) {
            logger.warn('ETL process is already running');
            return;
        }

        this.isRunning = true;
        logger.info('Starting incremental sync ETL process');

        try {
            // Get last sync date
            const lastSyncDate = await loader.getLastSyncDate();
            if (!lastSyncDate) {
                logger.info('No previous sync found, running full sync');
                return this.runFullSync();
            }

            // Sync only new sales since last sync
            const sales = await extractor.extractIncrementalSales(lastSyncDate);
            if (sales.length > 0) {
                const transformedSales = await transformer.transformSales(sales);
                await loader.loadSales(transformedSales);
            }

            // Always sync branches, articles, and customers as they're small datasets
            const [branches, articles, customers] = await Promise.all([
                extractor.extractBranches(),
                extractor.extractArticles(),
                extractor.extractCustomers()
            ]);

            await Promise.all([
                loader.loadBranches(await transformer.transformBranches(branches)),
                loader.loadArticles(await transformer.transformArticles(articles)),
                loader.loadCustomers(await transformer.transformCustomers(customers))
            ]);

            logger.info('Incremental sync completed successfully');
        } catch (error) {
            logger.error('Error during incremental sync:', error);
            throw error;
        } finally {
            this.isRunning = false;
        }
    }

    startScheduledSync(): void {
        // Run incremental sync every hour
        cron.schedule('0 * * * *', async () => {
            logger.info('Starting scheduled incremental sync');
            try {
                await this.runIncrementalSync();
            } catch (error) {
                logger.error('Scheduled sync failed:', error);
            }
        });

        // Run full sync every day at midnight
        cron.schedule('0 0 * * *', async () => {
            logger.info('Starting scheduled full sync');
            try {
                await this.runFullSync();
            } catch (error) {
                logger.error('Scheduled sync failed:', error);
            }
        });

        logger.info('Scheduled sync jobs have been set up');
    }
}

export default new ETLOrchestrator();
