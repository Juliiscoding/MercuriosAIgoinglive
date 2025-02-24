export interface Branch {
    id: string;
    branchNumber: number;
    name: string;
    address: string;
    phone?: string;
    email?: string;
    isActive: boolean;
    type: string;
    lastUpdated: Date;
}

export interface Sale {
    id: string;
    branchNumber: number;
    articleNumber: number;
    articleSizeNumber: number;
    customerNumber: number;
    staffNumber: number;
    receiptNumber: number;
    date: Date;
    purchasePrice: number;
    salePrice: number;
    labelPrice: number;
    discount: number;
    quantity: number;
    type: number;
    isDeleted: boolean;
    lastChange: Date;
}

export interface Article {
    articleNumber: number;
    name: string;
    description?: string;
    category?: string;
    price: number;
    lastUpdated: Date;
}

export interface Customer {
    customerNumber: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    lastPurchaseDate?: Date;
    isActive: boolean;
    lastUpdated: Date;
}

export interface ETLStats {
    id?: number;
    jobName: string;
    startTime: Date;
    endTime?: Date;
    recordsProcessed: number;
    status: 'running' | 'completed' | 'failed';
    error?: string;
    lastUpdated: Date;
}
