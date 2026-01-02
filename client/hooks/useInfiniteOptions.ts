import { useState, useCallback, useEffect, useMemo } from 'react';
import { Option } from '@/components/ui/searchable-select';

export function useInfiniteOptions<T>(
  data: T[],
  mapToOption: (item: T) => Option,
  batchSize = 10
) {
  const [displayed, setDisplayed] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const options = useMemo(() => displayed.map(mapToOption), [displayed, mapToOption]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const nextBatch = data.slice(displayed.length, displayed.length + batchSize);
    setDisplayed(prev => [...prev, ...nextBatch]);
    
    if (displayed.length + nextBatch.length >= data.length) {
      setHasMore(false);
    }
    
    setLoading(false);
  }, [data, displayed.length, loading, hasMore, batchSize]);

  useEffect(() => {
    if (data.length > 0) {
      setDisplayed(data.slice(0, batchSize));
      setHasMore(data.length > batchSize);
    }
  }, [data, batchSize]);

  return { options, loadMore, loading, hasMore };
}