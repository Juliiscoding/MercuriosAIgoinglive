# ProHandel API Customer Endpoint Investigation Report
Date: February 24, 2025

## Executive Summary
This document details our investigation into accessing customer data through the ProHandel API v2. We have identified that while the API provides robust access to operational data (sales, inventory, staff), we are unable to locate the customer data endpoints. This investigation was conducted using the production API endpoint at `https://linde.prohandel.de/api/v2`.

## Authentication Details
- **Auth URL**: https://auth.prohandel.cloud/api/v4
- **API URL**: https://linde.prohandel.de/api/v2
- **Authentication Method**: Bearer Token
- **API Status**: Functional (successfully authenticating and accessing other endpoints)

## Investigation Steps

### 1. Standard Endpoint Testing
We systematically tested the following endpoint variations:

#### Common REST Patterns
- ✘ `/customers`
- ✘ `/customer`
- ✘ `/clients`
- ✘ `/client`

#### German Variations
- ✘ `/kunde`
- ✘ `/kunden`
- ✘ `/einzelkunde`
- ✘ `/privatkunde`

#### Business-Specific Endpoints
- ✘ `/retail-customer`
- ✘ `/b2c-customer`
- ✘ `/shop-customer`
- ✘ `/end-customer`

#### Related Systems
- ✘ `/loyalty-customer`
- ✘ `/bonus-card`
- ✘ `/customer-card`
- ✘ `/membership`

#### Nested Endpoints
- ✘ `/customer/retail`
- ✘ `/customer/private`
- ✘ `/customer/card`
- ✘ `/customer/loyalty`
- ✘ `/customer/bonus`

All tested endpoints returned either 404 (Not Found) or 400 (Bad Request) responses.

### 2. Sales Data Analysis
We analyzed the sales data to understand customer data representation:

#### Current Data Structure in Sales:
```json
{
    "customerNumber": "2005517",
    "salePrice": 17.28,
    "date": "2020-03-16T00:00:00",
    "receiptNumber": "16061488",
    "articleNumber": "110601244"
}
```

#### Customer Number Patterns:
1. Short format (likely staff): 130, 199
2. Long format (possible customers): 2005517, 2008746, 2000147

### 3. API Version Analysis
Headers from API responses indicate:
```
api-supported-versions: 2.0, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13, 2.14, 2.15, 2.16, 2.17, 2.18, 2.19, 2.20, 2.21, 2.22, 2.23, 2.24, 2.25, 2.26, 2.27, 2.28, 2.29
```

## Current Limitations

1. **No Customer Data Access**
   - Unable to retrieve customer profiles
   - No access to customer history
   - No loyalty program data available

2. **Sales Data Limitations**
   - Customer numbers present but no additional details
   - No way to link transactions to customer profiles
   - No receipt details available via `/receipt` endpoint

3. **Missing Functionality**
   - No customer search capability
   - No customer loyalty/bonus system access
   - No customer card management

## Questions for API Provider

1. **Customer Data Access**
   - Is customer data available through a different API endpoint or system?
   - Are there specific endpoints for accessing customer profiles?
   - What is the correct endpoint structure for customer data?

2. **Integration Questions**
   - How should we link sales data to customer profiles?
   - Is there a separate authentication required for customer data?
   - Are there different API versions with customer functionality?

3. **System Architecture**
   - Is customer data intentionally separated from the main API?
   - Should we be using a different base URL for customer data?
   - Are there additional API documentation resources available?

## Technical Details

### Current Working Endpoints:
```
✓ /sale
✓ /article
✓ /staff
✓ /branch
✓ /supplier
✓ /category
```

### Authentication Request:
```javascript
POST https://auth.prohandel.cloud/api/v4/token
Content-Type: application/json
{
    "apiKey": "API_KEY",
    "secret": "API_SECRET"
}
```

### Sample API Call:
```javascript
GET https://linde.prohandel.de/api/v2/sale
Authorization: Bearer <token>
Content-Type: application/json
```

## Next Steps Request

We request:
1. Confirmation of the correct endpoints for customer data access
2. Additional documentation for customer-related functionality
3. Sample requests for customer data retrieval
4. Clarification on the system architecture regarding customer data

## Contact Information
For follow-up questions or clarification, please contact:
[Your contact information here]
