const axios = require('axios');
const WebSocket = require('ws');

const AUTH_URL = 'https://auth.prohandel.cloud/api/v4';
const API_URL = 'https://linde.prohandel.de/v1';
const WS_URL = 'wss://linde.prohandel.de/v1/ws';
const API_KEY = '7e7c639358434c4fa215d4e3978739d0';
const API_SECRET = '1cjnuux79d';

async function authenticate() {
    try {
        const response = await axios.post(`${AUTH_URL}/token`, {
            apiKey: API_KEY,
            secret: API_SECRET
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data.token.token.value;
    } catch (error) {
        console.error('Authentication failed:', error.message);
        throw error;
    }
}

async function fetchInitialData(token) {
    try {
        const fromDate = new Date();
        fromDate.setHours(fromDate.getHours() - 1);
        
        const response = await axios.get(
            `${API_URL}/sale?pagesize=100&fromDate=${encodeURIComponent(fromDate.toISOString())}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        return response.data;
    } catch (error) {
        console.error('Error fetching initial data:', error.message);
        return null;
    }
}

function setupWebSocket(token) {
    const ws = new WebSocket(`${WS_URL}?token=${token}`);

    ws.on('open', () => {
        console.log('\n🟢 Connected to real-time sales feed');
        
        // Subscribe to sales channel
        ws.send(JSON.stringify({
            type: 'subscribe',
            channels: ['sale']
        }));
    });

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            if (message.type === 'sale') {
                const sale = message.data;
                console.log('\n🔔 New Sale:');
                console.log(`Time: ${new Date(sale.date).toLocaleTimeString()}`);
                console.log(`Amount: €${sale.salePrice.toFixed(2)}`);
                console.log(`Branch: ${sale.branchNumber}`);
                console.log('-------------------');
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('\n🔴 Disconnected from real-time feed');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    // Setup heartbeat
    const heartbeat = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
        }
    }, 30000);

    return { ws, heartbeat };
}

async function startMonitoring() {
    try {
        console.log('🔑 Authenticating...');
        const token = await authenticate();
        
        console.log('📊 Fetching recent sales...');
        const initialData = await fetchInitialData(token);
        
        if (initialData?.items?.length > 0) {
            console.log(`\nFound ${initialData.items.length} recent sales:`);
            initialData.items
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .forEach(sale => {
                    console.log(`\nTime: ${new Date(sale.date).toLocaleTimeString()}`);
                    console.log(`Amount: €${sale.salePrice.toFixed(2)}`);
                    console.log(`Branch: ${sale.branchNumber}`);
                    console.log('-------------------');
                });
        } else {
            console.log('No recent sales found');
        }

        console.log('\n⏳ Setting up real-time monitoring...');
        const { ws, heartbeat } = setupWebSocket(token);

        // Handle program termination
        process.on('SIGINT', () => {
            clearInterval(heartbeat);
            ws.close();
            console.log('\n👋 Monitoring stopped');
            process.exit();
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

startMonitoring();
