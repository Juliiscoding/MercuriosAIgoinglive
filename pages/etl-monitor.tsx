import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ETLStats {
    id: number;
    job_name: string;
    start_time: string;
    end_time: string;
    records_processed: number;
    status: string;
    error?: string;
}

export default function ETLMonitor() {
    const [stats, setStats] = useState<ETLStats[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/etl/stats');
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching ETL stats:', error);
        }
    };

    const runSync = async (type: 'full' | 'incremental') => {
        setLoading(true);
        try {
            await fetch(`/api/etl/sync-${type}`, { method: 'POST' });
            await fetchStats();
        } catch (error) {
            console.error(`Error running ${type} sync:`, error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">ETL Monitor</h1>
            
            <div className="flex gap-4 mb-6">
                <Button 
                    onClick={() => runSync('incremental')} 
                    disabled={loading}
                >
                    Run Incremental Sync
                </Button>
                <Button 
                    onClick={() => runSync('full')} 
                    disabled={loading}
                    variant="secondary"
                >
                    Run Full Sync
                </Button>
            </div>

            <Card className="p-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Job</TableHead>
                            <TableHead>Start Time</TableHead>
                            <TableHead>End Time</TableHead>
                            <TableHead>Records Processed</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Error</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {stats.map((stat) => (
                            <TableRow key={stat.id}>
                                <TableCell>{stat.job_name}</TableCell>
                                <TableCell>{new Date(stat.start_time).toLocaleString()}</TableCell>
                                <TableCell>
                                    {stat.end_time ? new Date(stat.end_time).toLocaleString() : '-'}
                                </TableCell>
                                <TableCell>{stat.records_processed}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-sm ${
                                        stat.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        stat.status === 'failed' ? 'bg-red-100 text-red-800' :
                                        'bg-blue-100 text-blue-800'
                                    }`}>
                                        {stat.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-red-600">{stat.error || '-'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
