/** @type {import('next').NextConfig} */
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    // This header controls how much information the browser includes when navigating from the current website (origin) to another.
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data:;
      font-src 'self';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      block-all-mixed-content;
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim()
  }
]

module.exports = {
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
  // Ensure API keys and secrets are not exposed
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL,
    // Never expose the actual API key in the client
    API_KEY_HASH: process.env.NEXT_PUBLIC_API_KEY ? 
      require('crypto').createHash('sha256').update(process.env.NEXT_PUBLIC_API_KEY).digest('hex') : 
      null
  },
  // Disable potentially dangerous features
  poweredByHeader: false,
  // Enable strict mode for better error catching
  reactStrictMode: true,
  // Restrict potentially dangerous API features
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb' // Limit payload size
    }
  }
}
