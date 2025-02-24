import axios, { AxiosInstance } from 'axios';
import logger from '../utils/logger';

export class ProHandelApiClient {
    private authToken: string | null = null;
    private tokenExpiry: Date | null = null;
    private readonly apiKey: string;
    private readonly apiSecret: string;
    private readonly authUrl: string;
    private readonly apiUrl: string;
    private client: AxiosInstance;

    constructor() {
        this.apiKey = process.env.PROHANDEL_API_KEY || '';
        this.apiSecret = process.env.PROHANDEL_API_SECRET || '';
        this.authUrl = process.env.PROHANDEL_AUTH_URL || 'https://auth.prohandel.cloud/api/v4';
        this.apiUrl = process.env.PROHANDEL_API_URL || 'https://linde.prohandel.de/api/v2';

        this.client = axios.create({
            baseURL: this.apiUrl,
            timeout: 30000,
        });

        // Add response interceptor for token refresh
        this.client.interceptors.response.use(
            response => response,
            async error => {
                if (error.response?.status === 401) {
                    await this.authenticate();
                    error.config.headers['Authorization'] = `Bearer ${this.authToken}`;
                    return this.client(error.config);
                }
                return Promise.reject(error);
            }
        );
    }

    private async authenticate(): Promise<void> {
        try {
            const response = await axios.post(`${this.authUrl}/token`, {
                apiKey: this.apiKey,
                secret: this.apiSecret
            });

            this.authToken = response.data.token.token.value;
            // Set token expiry to 5 minutes before actual expiry
            this.tokenExpiry = new Date(Date.now() + (response.data.token.token.expires_in - 300) * 1000);
            
            this.client.defaults.headers.common['Authorization'] = `Bearer ${this.authToken}`;
            logger.info('Successfully authenticated with ProHandel API');
        } catch (error) {
            logger.error('Authentication failed:', error);
            throw error;
        }
    }

    private async ensureAuthenticated(): Promise<void> {
        if (!this.authToken || !this.tokenExpiry || this.tokenExpiry < new Date()) {
            await this.authenticate();
        }
    }

    async fetchPaginatedData<T>(
        endpoint: string,
        params: Record<string, any> = {},
        maxPages: number = Infinity
    ): Promise<T[]> {
        await this.ensureAuthenticated();

        const allData: T[] = [];
        let page = 1;
        const pageSize = params.pagesize || 1000;

        while (page <= maxPages) {
            try {
                const response = await this.client.get(endpoint, {
                    params: {
                        ...params,
                        page,
                        pagesize: pageSize
                    }
                });

                const data = response.data;
                if (!Array.isArray(data) || data.length === 0) {
                    break;
                }

                allData.push(...data);
                logger.info(`Fetched page ${page} from ${endpoint}, got ${data.length} records`);

                if (data.length < pageSize) {
                    break;
                }

                page++;
            } catch (error) {
                logger.error(`Error fetching page ${page} from ${endpoint}:`, error);
                throw error;
            }
        }

        return allData;
    }

    async fetchBranches() {
        return this.fetchPaginatedData('/branch');
    }

    async fetchSales(params: Record<string, any> = {}) {
        return this.fetchPaginatedData('/sale', params);
    }

    async fetchArticles(params: Record<string, any> = {}) {
        return this.fetchPaginatedData('/article', params);
    }

    async fetchCustomers(params: Record<string, any> = {}) {
        return this.fetchPaginatedData('/customer', params);
    }
}

export default new ProHandelApiClient();
