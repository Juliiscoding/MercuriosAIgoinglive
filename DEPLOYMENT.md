# ProHandel Dashboard Deployment Guide

## Pre-deployment Checklist

1. **Environment Variables**
   Set these in your Vercel project settings:
   ```
   NEXT_PUBLIC_API_URL=https://api.prohandel.de/v1
   NEXT_PUBLIC_API_KEY=your-api-key
   NEXT_PUBLIC_WS_URL=wss://api.prohandel.de/v1/ws
   ```

2. **Required Files**
   Ensure these files are present in your repository:
   ```
   services/
   ├── api.ts
   ├── realtimeService.ts
   └── mockData.ts
   types/
   └── api.ts
   ```

3. **Dependencies**
   Add to your package.json:
   ```json
   {
     "dependencies": {
       "axios": "latest",
       "next-themes": "latest",
       "lucide-react": "latest"
     }
   }
   ```

## Deployment Steps

1. **Initial Setup**
   ```bash
   # Install dependencies
   npm install

   # Build the project
   npm run build
   ```

2. **Vercel Deployment**
   ```bash
   # Install Vercel CLI if not already installed
   npm i -g vercel

   # Deploy to Vercel
   vercel
   ```

## Post-deployment Checks

1. **API Connection**
   - Verify API endpoints are accessible
   - Check WebSocket connection
   - Confirm real-time updates

2. **Performance Monitoring**
   - Monitor API response times
   - Check WebSocket latency
   - Verify data aggregation performance

3. **Error Handling**
   - Verify fallback to mock data works
   - Check error logging
   - Monitor API rate limits

## Optimization Settings

The `vercel.json` configuration includes:
- European region deployment (fra1)
- CORS headers for API routes
- Health check endpoints
- Production environment variables

## Troubleshooting

1. **API Connection Issues**
   - Check API key validity
   - Verify network access
   - Check rate limits

2. **WebSocket Problems**
   - Verify WebSocket URL
   - Check connection timeout settings
   - Monitor reconnection attempts

3. **Performance Issues**
   - Check data caching
   - Monitor memory usage
   - Verify API response times

## Maintenance

1. **Regular Updates**
   - Keep dependencies updated
   - Monitor API version changes
   - Update security patches

2. **Monitoring**
   - Set up error tracking
   - Monitor performance metrics
   - Track API usage

## Security Notes

1. **API Key Protection**
   - Store API key in Vercel secrets
   - Rotate keys regularly
   - Monitor API usage

2. **Data Protection**
   - Enable HTTPS only
   - Set up CORS properly
   - Monitor access logs
