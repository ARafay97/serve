"use client";

import { useOrders } from "@/lib/useOrders";
import { hasKitchenItems } from "@/data/categories";
import OrderTicket from "@/components/OrderTicket";
import RefreshBar from "@/components/RefreshBar";

export default function CompletedKitchenOrdersPage() {
  const { orders, error, loading, lastUpdated, refresh } = useOrders(true);

  const kitchenOrders = orders.filter((order) => hasKitchenItems(order.items));

  return (
    <div>
      <h1 className="page-title">Completed Kitchen Orders</h1>
      <RefreshBar
        onRefresh={refresh}
        loading={loading}
        lastUpdated={lastUpdated}
        count={kitchenOrders.length}
      />

      {error && <p className="error-text">{error}</p>}
      {!loading && kitchenOrders.length === 0 && (
        <p className="empty-state">No completed kitchen orders.</p>
      )}

      {kitchenOrders.map((order) => (
        <OrderTicket key={order.id} order={order} station="kitchen" showTotal={false} />
      ))}
    </div>
  );
}
