'use client';

import { useEffect, useRef, useState } from 'react';

interface UsePollingOptions {
  interval?: number;
  enabled?: boolean;
  onPoll?: () => void | Promise<void>;
}

export function usePolling({ interval = 5000, enabled = true, onPoll }: UsePollingOptions = {}) {
  const [isPolling, setIsPolling] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onPollRef = useRef(onPoll);

  useEffect(() => {
    onPollRef.current = onPoll;
  }, [onPoll]);

  useEffect(() => {
    if (!enabled || !onPollRef.current) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPolling(false);
      return;
    }

    const poll = async () => {
      setIsPolling(true);
      try {
        await onPollRef.current?.();
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Polling error:', error);
      } finally {
        setIsPolling(false);
      }
    };

    poll();
    intervalRef.current = setInterval(poll, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval]);

  return { isPolling, lastUpdated };
}
