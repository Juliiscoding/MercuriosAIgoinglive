import db from '../utils/db';
import logger from '../utils/logger';
import { Branch, Sale, Article, Customer, ETLStats } from '../models/types';

export class DataLoader {
    private async createEtlStats(jobName: string): Promise<number> {
        const [stats] = await db('etl_stats')
            .insert({
                job_name: jobName,
                start_time: new Date(),
                status: 'running',
                records_processed: 0
            })
            .returning('id');
        
        return stats.id;
    }

    private async updateEtlStats(
        statsId: number,
        recordsProcessed: number,
        status: 'completed' | 'failed',
        error?: string
    ): Promise<void> {
        await db('etl_stats')
            .where({ id: statsId })
            .update({
                end_time: new Date(),
                records_processed: recordsProcessed,
                status,
                error,
                last_updated: new Date()
            });
    }

    async loadBranches(branches: Branch[]): Promise<void> {
        const statsId = await this.createEtlStats('load_branches');
        try {
            logger.info(`Starting to load ${branches.length} branches`);
            
            await db.transaction(async (trx) => {
                for (const branch of branches) {
                    await trx('branches')
                        .insert(branch)
                        .onConflict('branch_number')
                        .merge();
                }
            });

            await this.updateEtlStats(statsId, branches.length, 'completed');
            logger.info('Successfully loaded branches');
        } catch (error) {
            await this.updateEtlStats(statsId, 0, 'failed', error.message);
            logger.error('Error loading branches:', error);
            throw error;
        }
    }

    async loadSales(sales: Sale[]): Promise<void> {
        const statsId = await this.createEtlStats('load_sales');
        try {
            logger.info(`Starting to load ${sales.length} sales`);
            
            await db.transaction(async (trx) => {
                // Process in batches of 100
                const batchSize = 100;
                for (let i = 0; i < sales.length; i += batchSize) {
                    const batch = sales.slice(i, i + batchSize);
                    await trx('sales')
                        .insert(batch)
                        .onConflict('id')
                        .merge();
                }
            });

            await this.updateEtlStats(statsId, sales.length, 'completed');
            logger.info('Successfully loaded sales');
        } catch (error) {
            await this.updateEtlStats(statsId, 0, 'failed', error.message);
            logger.error('Error loading sales:', error);
            throw error;
        }
    }

    async loadArticles(articles: Article[]): Promise<void> {
        const statsId = await this.createEtlStats('load_articles');
        try {
            logger.info(`Starting to load ${articles.length} articles`);
            
            await db.transaction(async (trx) => {
                for (const article of articles) {
                    await trx('articles')
                        .insert(article)
                        .onConflict('article_number')
                        .merge();
                }
            });

            await this.updateEtlStats(statsId, articles.length, 'completed');
            logger.info('Successfully loaded articles');
        } catch (error) {
            await this.updateEtlStats(statsId, 0, 'failed', error.message);
            logger.error('Error loading articles:', error);
            throw error;
        }
    }

    async loadCustomers(customers: Customer[]): Promise<void> {
        const statsId = await this.createEtlStats('load_customers');
        try {
            logger.info(`Starting to load ${customers.length} customers`);
            
            await db.transaction(async (trx) => {
                for (const customer of customers) {
                    await trx('customers')
                        .insert(customer)
                        .onConflict('customer_number')
                        .merge();
                }
            });

            await this.updateEtlStats(statsId, customers.length, 'completed');
            logger.info('Successfully loaded customers');
        } catch (error) {
            await this.updateEtlStats(statsId, 0, 'failed', error.message);
            logger.error('Error loading customers:', error);
            throw error;
        }
    }

    async getLastSyncDate(): Promise<Date | null> {
        const lastSync = await db('etl_stats')
            .where({
                job_name: 'load_sales',
                status: 'completed'
            })
            .orderBy('end_time', 'desc')
            .first();

        return lastSync ? new Date(lastSync.end_time) : null;
    }
}

export default new DataLoader();
