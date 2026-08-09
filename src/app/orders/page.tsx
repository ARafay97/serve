"use client";

import { useOrders } from "@/lib/useOrders";
import { patchOrder } from "@/lib/api";
import OrderTicket from "@/components/OrderTicket";
import RefreshBar from "@/components/RefreshBar";
import { Order } from "@/types/order";

export default function OrdersPage() {
  const { orders, setOrders, error, setError, loading, lastUpdated, refresh } = useOrders(false);

  const completeOrder = async (order: Order) => {
    // Drop it from the list straight away so the button cannot be pressed
    // twice, and put it back if the write fails.
    setOrders((prev) => prev.filter((o) => o.id !== order.id));
    try {
      await patchOrder(order.id, { action: "complete" });
      setError(null);
    } catch (err) {
      setOrders((prev) => [...prev, order]);
      setError(err instanceof Error ? err.message : "Failed to complete order");
    }
  };

  return (
    <div>
      <h1 className="page-title">Active Orders</h1>
      <RefreshBar
        onRefresh={refresh}
        loading={loading}
        lastUpdated={lastUpdated}
        count={orders.length}
      />

      {error && <p className="error-text">{error}</p>}
      {!loading && orders.length === 0 && <p className="empty-state">No active orders.</p>}

      {orders.map((order) => (
        <OrderTicket key={order.id} order={order}>
          <button
            type="button"
            className="btn btn-success btn-block"
            style={{ marginTop: 12 }}
            onClick={() => completeOrder(order)}
          >
            Done
          </button>
        </OrderTicket>
      ))}
    </div>
  );
}
