'use client';

import { useState, useCallback, useEffect } from 'react';

interface HistoryEntry {
    date: string;
    count: number;
    id: string;
}

interface PaginatedHistory {
    items: HistoryEntry[];
    totalPages: number;
    totalItems: number;
    page: number;
    perPage: number;
}

export function useInfiniteHistory(perPage: number = 10) {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = useCallback(async (pageNum: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/spf/history?page=${pageNum}&perPage=${perPage}`);
            if (!res.ok) throw new Error('Failed to fetch history');
            const data: PaginatedHistory = await res.json();

            setHistory(prev => {
                // Deduplicate items just in case
                const combined = [...prev, ...data.items];
                const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
                return unique;
            });

            setHasMore(data.page < data.totalPages);
            setPage(data.page);
        } catch (err: any) {
            setError(err.message || 'Error loading history');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [perPage]);

    // Initial load
    useEffect(() => {
        fetchHistory(1);
    }, [fetchHistory]);

    const loadMore = useCallback(() => {
        if (!isLoading && hasMore) {
            fetchHistory(page + 1);
        }
    }, [isLoading, hasMore, page, fetchHistory]);

    const refresh = useCallback(() => {
        setHistory([]);
        setPage(1);
        setHasMore(true);
        fetchHistory(1);
    }, [fetchHistory]);

    return {
        history,
        isLoading,
        hasMore,
        error,
        loadMore,
        refresh
    };
}
