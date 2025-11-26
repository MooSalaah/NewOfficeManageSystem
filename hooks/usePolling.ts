import { useState, useEffect, useRef } from 'react';

export function usePolling<T>(
    url: string,
    interval: number = 5000
): { data: T | null; loading: boolean; error: any } {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const savedCallback = useRef<() => void>(null);

    const fetchData = async () => {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch');
            const json = await res.json();
            setData(json);
            setError(null);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        savedCallback.current = fetchData;
    });

    useEffect(() => {
        // Initial fetch
        fetchData();

        // Set up interval
        const id = setInterval(() => {
            if (savedCallback.current) savedCallback.current();
        }, interval);

        return () => clearInterval(id);
    }, [url, interval]);

    return { data, loading, error };
}
