"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchOrders } from "@/lib/api";
import { Order } from "@/types/order";

/**
 * Loads orders once and then only when someone asks.
 *
 * The old build pushed changes over Socket.IO. This app is a record that staff
 * refresh when they want to see what has come in, so there is no socket server
 * to host — which is also what lets the whole thing run as plain serverless
 * functions rather than an always-on process.
 */
export function useOrders(completed: boolean) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchOrders(completed);
      setOrders(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load orders");
    } finally {
      setLoading(false);
    }
  }, [completed]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { orders, setOrders, error, setError, loading, lastUpdated, refresh };
}
