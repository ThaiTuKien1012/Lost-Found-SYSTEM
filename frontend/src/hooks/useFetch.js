import { useState, useEffect, useCallback } from 'react';

export const useFetch = (fetchFn, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    let isMounted = true;
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      if (isMounted) {
        // Check if result has success property
        if (result && typeof result === 'object') {
          if (result.success === true) {
            // API returned {success: true, data: [...], pagination: {...}}
            setData(result);
          } else if (result.success === false) {
            // API returned error
            setError(result.error || 'Failed to fetch data');
            setData(null);
          } else {
            // Direct data response (no success property)
            setData({ data: result });
          }
        } else {
          setData({ data: result });
        }
      }
    } catch (err) {
      if (isMounted) {
        setError(err.message || 'An error occurred');
        setData(null);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, [fetchFn]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

