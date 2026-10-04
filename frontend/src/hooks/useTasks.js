import { useState, useEffect } from 'react';
import { fetchTasks } from '../api';

export function useTasks(query, status, page, pageSize) {
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce search query to prevent request flooding
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let isCurrent = true;
    setLoading(true);
    setError(null);

    fetchTasks({ query: debouncedQuery, status, page, pageSize })
      .then((data) => {
        if (isCurrent) {
          setTasks(data.items || []);
          setTotal(data.total || 0);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isCurrent) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [debouncedQuery, status, page, pageSize]);

  return { tasks, total, loading, error };
}
