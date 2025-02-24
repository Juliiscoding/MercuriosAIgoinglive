import { NextApiRequest, NextApiResponse } from 'next';
import orchestrator from '../../../lib/etl/orchestrator';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await orchestrator.runFullSync();
        res.status(200).json({ message: 'Full sync completed successfully' });
    } catch (error) {
        console.error('Error in full sync:', error);
        res.status(500).json({ message: 'Error running full sync', error: error.message });
    }
}
