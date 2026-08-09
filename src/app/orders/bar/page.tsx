"use client";

import { useOrders } from "@/lib/useOrders";
import { hasBarItems } from "@/data/categories";
import OrderTicket from "@/components/OrderTicket";
import RefreshBar from "@/components/RefreshBar";

export default function CompletedBarOrdersPage() {
  const { orders, error, loading, lastUpdated, refresh } = useOrders(true);

  const barOrders = orders.filter((order) => hasBarItems(order.items));

  return (
    <div>
      <h1 className="page-title">Completed Bar Orders</h1>
      <RefreshBar
        onRefresh={refresh}
        loading={loading}
        lastUpdated={lastUpdated}
        count={barOrders.length}
      />

      {error && <p className="error-text">{error}</p>}
      {!loading && barOrders.length === 0 && <p className="empty-state">No completed bar orders.</p>}

      {barOrders.map((order) => (
        <OrderTicket key={order.id} order={order} station="bar" showTotal={false} />
      ))}
    </div>
  );
}
