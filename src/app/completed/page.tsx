"use client";

import { useOrders } from "@/lib/useOrders";
import OrderTicket, { orderTotal } from "@/components/OrderTicket";
import RefreshBar from "@/components/RefreshBar";

export default function CompletedPage() {
  const { orders, error, loading, lastUpdated, refresh } = useOrders(true);

  const takings = orders.reduce((sum, order) => sum + orderTotal(order), 0);

  return (
    <div>
      <h1 className="page-title">Completed Orders</h1>
      <RefreshBar
        onRefresh={refresh}
        loading={loading}
        lastUpdated={lastUpdated}
        count={orders.length}
      />

      {orders.length > 0 && <p className="page-subtitle">Total takings: £{takings.toFixed(2)}</p>}

      {error && <p className="error-text">{error}</p>}
      {!loading && orders.length === 0 && <p className="empty-state">No completed orders.</p>}

      {orders.map((order) => (
        <OrderTicket key={order.id} order={order} />
      ))}
    </div>
  );
}
