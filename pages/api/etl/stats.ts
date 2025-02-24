import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../lib/etl/utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const stats = await db('etl_stats')
            .orderBy('start_time', 'desc')
            .limit(20);
        
        res.status(200).json(stats);
    } catch (error) {
        console.error('Error fetching ETL stats:', error);
        res.status(500).json({ message: 'Error fetching ETL stats', error: error.message });
    }
}
