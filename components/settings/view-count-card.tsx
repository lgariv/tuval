'use client';

import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function ViewCountCard() {
    const [viewCount, setViewCount] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/stats')
            .then(res => res.json())
            .then(data => {
                setViewCount(data.viewCount);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch view count:', err);
                setIsLoading(false);
            });
    }, []);

    return (
        <div className="flex items-center justify-between rounded-3xl bg-white/60 p-5 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-500">
                    <Eye size={24} />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-tuval-label">Total Site Views</span>
                    {isLoading ? (
                        <Skeleton className="mt-1 h-7 w-16 rounded-md" />
                    ) : (
                        <span className="text-xl font-bold text-tuval-navy">
                            {viewCount?.toLocaleString() || '0'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
