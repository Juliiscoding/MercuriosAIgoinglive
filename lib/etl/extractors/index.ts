import apiClient from './api-client';
import logger from '../utils/logger';
import { Branch, Sale, Article, Customer } from '../models/types';

export class DataExtractor {
    private readonly batchSize: number;
    private readonly maxRetries: number;
    private readonly retryDelay: number;

    constructor() {
        this.batchSize = parseInt(process.env.ETL_BATCH_SIZE || '1000');
        this.maxRetries = parseInt(process.env.ETL_MAX_RETRIES || '3');
        this.retryDelay = parseInt(process.env.ETL_RETRY_DELAY || '5000');
    }

    private async retry<T>(operation: () => Promise<T>): Promise<T> {
        let lastError: Error | null = null;
        
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error as Error;
                logger.warn(`Attempt ${attempt} failed:`, error);
                
                if (attempt < this.maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                }
            }
        }
        
        throw lastError;
    }

    async extractBranches(): Promise<Branch[]> {
        logger.info('Starting branch extraction');
        const branches = await this.retry(() => apiClient.fetchBranches());
        logger.info(`Extracted ${branches.length} branches`);
        return branches;
    }

    async extractSales(fromDate?: Date): Promise<Sale[]> {
        logger.info('Starting sales extraction', { fromDate });
        const params: Record<string, any> = {
            pagesize: this.batchSize
        };

        if (fromDate) {
            params.fromDate = fromDate.toISOString();
        }

        const sales = await this.retry(() => apiClient.fetchSales(params));
        logger.info(`Extracted ${sales.length} sales records`);
        return sales;
    }

    async extractArticles(): Promise<Article[]> {
        logger.info('Starting article extraction');
        const articles = await this.retry(() => apiClient.fetchArticles());
        logger.info(`Extracted ${articles.length} articles`);
        return articles;
    }

    async extractCustomers(): Promise<Customer[]> {
        logger.info('Starting customer extraction');
        const customers = await this.retry(() => apiClient.fetchCustomers());
        logger.info(`Extracted ${customers.length} customers`);
        return customers;
    }

    async extractIncrementalSales(lastSyncDate: Date): Promise<Sale[]> {
        logger.info('Starting incremental sales extraction', { lastSyncDate });
        return this.extractSales(lastSyncDate);
    }
}

export default new DataExtractor();
