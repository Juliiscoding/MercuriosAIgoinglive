import { NextApiRequest, NextApiResponse } from 'next';
import orchestrator from '../../../lib/etl/orchestrator';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await orchestrator.runIncrementalSync();
        res.status(200).json({ message: 'Incremental sync completed successfully' });
    } catch (error) {
        console.error('Error in incremental sync:', error);
        res.status(500).json({ message: 'Error running incremental sync', error: error.message });
    }
}
