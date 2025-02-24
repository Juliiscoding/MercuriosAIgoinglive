// ProHandel API Types

export interface Sale {
  id: string
  date: string
  branchNumber: string
  customerNumber: string
  salePrice: number
  isDeleted: boolean
}

export interface TransformedSalesData {
  totalSales: number
  totalItems: number
  averageOrderValue: number
  grossMargin: number
  returnRate: number
  salesByDate: {
    date: string
    total: number
    items: number
  }[]
  salesByHour: {
    hour: number
    total: number
    items: number
  }[]
  topProducts: {
    articleNumber: number
    total: number
    quantity: number
    revenue: number
  }[]
  salesByBranch: {
    branchNumber: number
    total: number
    items: number
  }[]
  salesByStaff: {
    staffNumber: number
    total: number
    items: number
  }[]
  paymentMethods: {
    paymentOptionNumber: number
    total: number
    count: number
  }[]
}

// Generic API response type for paginated data
export interface ApiListResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  moreAvailable: boolean
}

export interface Article {
  id: string
  number: string
  name: string
  stock: number
  price: number
  isDeleted: boolean
}

export interface Category {
  id: string
  number: string
  name: string
  description: string
  parentId?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Supplier {
  id: string
  number: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    postalCode: string
    country: string
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: string
  number: string
  name: string
  creationDate: string
  inactiveFlag: boolean
  isDeleted: boolean
}

export interface Branch {
  id: string
  number: string
  name: string
  isDeleted: boolean
}

export interface Staff {
  id: string
  number: string
  firstName: string
  lastName: string
  email: string
  phone: string
  position: string
  branchId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface DashboardMetrics {
  revenue: {
    total: number
    averageOrder: number
    dailyTrend: number[]
    monthlyTrend: number[]
  }
  products: {
    total: number
    inStock: number
    lowStock: number
    outOfStock: number
  }
  customers: {
    total: number
    active: number
    new: number
    churnRate: number
  }
  branches: {
    total: number
    active: number
    performance: Array<{
      id: string
      name: string
      revenue: number
      orders: number
      satisfaction: number
    }>
  }
}

export interface SaleApiResponse {
  id: string
  salePrice: number
  createdAt: string
  customerId: string
  articleId: string
  branchId: string
}

export interface CustomerApiResponse {
  id: string
  name: string
  email: string
  active: boolean
  createdAt: string
}

export interface ArticleApiResponse {
  id: string
  name: string
  price: number
  stock: number
  categoryId: string
}

export interface BranchApiResponse {
  id: string
  name: string
  location: string
  active: boolean
}
