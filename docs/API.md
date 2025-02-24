# ProHandel API Documentation

## API Endpoints

Base URL: `https://linde.prohandel.de/api/v2`
Authentication URL: `https://auth.prohandel.cloud/api/v4`

### Authentication

```bash
POST /token
Content-Type: application/json

{
    "apiKey": "your-api-key",
    "secret": "your-secret"
}
```

Returns a JWT token valid for 30 minutes and a refresh token valid for 24 hours.

### Available Endpoints

1. **Sales** `/sale`
   - Query Parameters:
     - `pagesize`: Number of items per page
     - `fromDate`: ISO date string for filtering sales
     - `page`: Page number for pagination
   - Returns: List of sales transactions with details

2. **Articles** `/article`
   - Query Parameters:
     - `pagesize`: Number of items per page
     - `page`: Page number
   - Returns: List of articles with stock and price information

3. **Customers** `/customer`
   - Query Parameters:
     - `pagesize`: Number of items per page
     - `page`: Page number
   - Returns: List of customers with contact information

4. **Branches** `/branch`
   - Query Parameters:
     - `pagesize`: Number of items per page
     - `page`: Page number
   - Returns: List of branches with location information

5. **Categories** `/category`
   - Query Parameters:
     - `pagesize`: Number of items per page
     - `page`: Page number
   - Returns: List of product categories

6. **Staff** `/staff`
   - Query Parameters:
     - `pagesize`: Number of items per page
     - `page`: Page number
   - Returns: List of staff members

7. **Suppliers** `/supplier`
   - Query Parameters:
     - `pagesize`: Number of items per page
     - `page`: Page number
   - Returns: List of suppliers with contact information

## API Versions

The API currently supports versions 2.0 through 2.29. The version is automatically negotiated based on the Accept header.

### Version Features

- **2.0-2.9**: Basic CRUD operations
- **2.10-2.19**: Enhanced filtering and sorting
- **2.20-2.29**: Advanced features and real-time capabilities

### Response Headers

- `x-pagesize`: Number of items per page
- `x-page`: Current page number
- `x-more-pages-available`: Boolean indicating if more pages exist
- `api-supported-versions`: List of supported API versions
- `x-correlation-id`: Request tracking ID

## Real-time Updates

WebSocket URL: `wss://linde.prohandel.de/api/v2/ws`

Connect with a valid JWT token as a query parameter:
```
wss://linde.prohandel.de/api/v2/ws?token=your-jwt-token
```

### Available Channels

- `sale`: Real-time sales updates
- `customer`: Customer-related events
- `article`: Stock and price updates
- `branch`: Branch status updates

### WebSocket Messages

1. Subscribe to channels:
```json
{
    "type": "subscribe",
    "channels": ["sale", "article"]
}
```

2. Heartbeat (every 30 seconds):
```json
{
    "type": "ping"
}
```

## Error Handling

Common HTTP status codes:
- 200: Success
- 401: Unauthorized (invalid or expired token)
- 404: Resource not found
- 429: Too many requests
- 500: Server error

Error responses include:
```json
{
    "error": "error_code",
    "message": "Human readable message",
    "correlationId": "request-tracking-id"
}
```
