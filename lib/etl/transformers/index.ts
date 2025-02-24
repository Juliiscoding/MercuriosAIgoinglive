import { Branch, Sale, Article, Customer } from '../models/types';
import logger from '../utils/logger';

export class DataTransformer {
    transformBranch(branch: any): Branch {
        try {
            return {
                id: branch.id || `br_${branch.branchNumber}`,
                branchNumber: branch.branchNumber,
                name: branch.name || `Branch ${branch.branchNumber}`,
                address: branch.address || '',
                phone: branch.phone,
                email: branch.email,
                isActive: branch.isActive ?? true,
                type: branch.type || 'physical',
                lastUpdated: new Date(branch.lastChange || Date.now())
            };
        } catch (error) {
            logger.error('Error transforming branch:', error);
            throw error;
        }
    }

    transformSale(sale: any): Sale {
        try {
            return {
                id: sale.id,
                branchNumber: sale.branchNumber,
                articleNumber: sale.articleNumber,
                articleSizeNumber: sale.articleSizeNumber,
                customerNumber: sale.customerNumber,
                staffNumber: sale.staffNumber,
                receiptNumber: sale.receiptNumber,
                date: new Date(sale.date),
                purchasePrice: parseFloat(sale.purchasePrice || 0),
                salePrice: parseFloat(sale.salePrice || 0),
                labelPrice: parseFloat(sale.labelPrice || 0),
                discount: parseFloat(sale.discount || 0),
                quantity: parseInt(sale.quantity || 1),
                type: sale.type || 0,
                isDeleted: sale.isDeleted || false,
                lastChange: new Date(sale.lastChange || Date.now())
            };
        } catch (error) {
            logger.error('Error transforming sale:', error);
            throw error;
        }
    }

    transformArticle(article: any): Article {
        try {
            return {
                articleNumber: article.articleNumber,
                name: article.name || `Article ${article.articleNumber}`,
                description: article.description,
                category: article.category,
                price: parseFloat(article.price || 0),
                lastUpdated: new Date(article.lastChange || Date.now())
            };
        } catch (error) {
            logger.error('Error transforming article:', error);
            throw error;
        }
    }

    transformCustomer(customer: any): Customer {
        try {
            return {
                customerNumber: customer.customerNumber,
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phone,
                lastPurchaseDate: customer.lastPurchaseDate ? new Date(customer.lastPurchaseDate) : undefined,
                isActive: customer.isActive ?? true,
                lastUpdated: new Date(customer.lastChange || Date.now())
            };
        } catch (error) {
            logger.error('Error transforming customer:', error);
            throw error;
        }
    }

    async transformBranches(branches: any[]): Promise<Branch[]> {
        logger.info(`Transforming ${branches.length} branches`);
        return branches.map(branch => this.transformBranch(branch));
    }

    async transformSales(sales: any[]): Promise<Sale[]> {
        logger.info(`Transforming ${sales.length} sales`);
        return sales.map(sale => this.transformSale(sale));
    }

    async transformArticles(articles: any[]): Promise<Article[]> {
        logger.info(`Transforming ${articles.length} articles`);
        return articles.map(article => this.transformArticle(article));
    }

    async transformCustomers(customers: any[]): Promise<Customer[]> {
        logger.info(`Transforming ${customers.length} customers`);
        return customers.map(customer => this.transformCustomer(customer));
    }
}

export default new DataTransformer();
