# V0 Analytics Dashboard with ProHandel Integration

## CI/CD Setup Instructions

1. **Vercel Setup**
   First, get your Vercel deployment tokens:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Link your project
   vercel link
   ```

2. **GitHub Secrets**
   Add these secrets to your GitHub repository (Settings > Secrets > Actions):

   ```
   VERCEL_TOKEN=<your-vercel-token>
   VERCEL_ORG_ID=<your-org-id>
   VERCEL_PROJECT_ID=<your-project-id>
   NEXT_PUBLIC_API_URL=https://linde.prohandel.de/v1
   NEXT_PUBLIC_API_KEY=7e7c639358434c4fa215d4e3978739d0
   NEXT_PUBLIC_WS_URL=wss://linde.prohandel.de/v1/ws
   ```

3. **Branch Protection**
   Set up branch protection rules:
   - Go to Settings > Branches
   - Add rule for `main` branch
   - Require pull request reviews
   - Require status checks to pass

## Pipeline Features

1. **Automated Builds**
   - Runs on every push and pull request
   - Installs dependencies
   - Installs shadcn components
   - Type checks
   - Lints code
   - Builds the project

2. **Preview Deployments**
   - Creates preview deployment for pull requests
   - Provides preview URL in PR comments
   - Allows testing before merging

3. **Production Deployments**
   - Automatic deployment on merge to main
   - Zero-downtime deployments
   - Environment variable validation

4. **Quality Checks**
   - TypeScript type checking
   - ESLint code linting
   - Build verification

## Development Workflow

1. Create feature branch:
   ```bash
   git checkout -b feature/your-feature
   ```

2. Make changes and commit:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

3. Push and create PR:
   ```bash
   git push origin feature/your-feature
   ```

4. Wait for CI checks and review
5. Merge when approved

## Environment Variables

Required environment variables:
```bash
NEXT_PUBLIC_API_URL=https://linde.prohandel.de/v1
NEXT_PUBLIC_API_KEY=7e7c639358434c4fa215d4e3978739d0
NEXT_PUBLIC_WS_URL=wss://linde.prohandel.de/v1/ws
```

## ProHandel API Integration

The pipeline automatically:
1. Validates API credentials
2. Tests WebSocket connection
3. Verifies data fetching
4. Checks real-time updates

## Monitoring & Logs

- Vercel Analytics Dashboard
- GitHub Actions logs
- API request logging
- WebSocket connection monitoring

## Analytics Scripts

The project includes several analytics scripts for analyzing customer behavior and sales patterns:

### Customer Analysis Scripts
- `analyze-customer-spending.js`: Analyzes customer spending patterns
- `analyze-high-spender-patterns.js`: Focuses on high-value customer behavior
- `analyze-price-frequency-correlation.js`: Studies correlations between prices and purchase frequency
- `analyze-sales-details.js`: Comprehensive sales data analysis
- `fetch-top-customer-names.js`: Retrieves information about top customers
- `explore-customer-endpoints.js`: API endpoint exploration for customer data

### Key Findings

1. **Sales Overview**:
   - Total Revenue: €18,224.00
   - Total Transactions: 1,000
   - Average Transaction: €18.22

2. **Customer Segments**:
   - One-time Customers: 24.1%
   - Occasional (2-5 visits): 48.3%
   - Regular (6-10 visits): 20.7%
   - Frequent (11+ visits): 6.9%

3. **Top Products**:
   - Article #110500617: €385.53 revenue (30 units)
   - Article #110917399: €355.39 revenue (27 units)
   - Article #110601244: €335.00 revenue (9 units)

4. **Transaction Distribution**:
   - Small (€0-10): 32.9%
   - Medium (€10-50): 64.9%
   - Large (€50-100): 2.2%

### Running Analytics

To run the analytics scripts:

```bash
# Install dependencies
npm install axios

# Run individual analysis
node scripts/analyze-sales-details.js
node scripts/analyze-high-spender-patterns.js
node scripts/analyze-price-frequency-correlation.js
```
