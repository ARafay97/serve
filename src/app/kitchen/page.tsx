"use client";

import { useOrders } from "@/lib/useOrders";
import { patchOrder } from "@/lib/api";
import { DoneFlag, hasKitchenItems, isStationDone } from "@/data/categories";
import OrderTicket from "@/components/OrderTicket";
import RefreshBar from "@/components/RefreshBar";
import { Order } from "@/types/order";

export default function KitchenPage() {
  const { orders, setOrders, error, setError, loading, lastUpdated, refresh } = useOrders(false);

  const kitchenOrders = orders.filter((order) => hasKitchenItems(order.items));

  const markDone = async (order: Order, flag: DoneFlag) => {
    const optimistic = { ...order, [flag]: true };
    setOrders((prev) => prev.map((o) => (o.id === order.id ? optimistic : o)));

    try {
      const updated = await patchOrder(order.id, { [flag]: true });
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      setError(null);
    } catch (err) {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
      setError(err instanceof Error ? err.message : "Failed to update order status");
    }
  };

  const finishOrder = async (order: Order) => {
    setOrders((prev) => prev.filter((o) => o.id !== order.id));
    try {
      await patchOrder(order.id, { action: "complete" });
      setError(null);
    } catch (err) {
      setOrders((prev) => [...prev, order]);
      setError(err instanceof Error ? err.message : "Could not complete order");
    }
  };

  return (
    <div>
      <h1 className="page-title">Kitchen Display</h1>
      <RefreshBar
        onRefresh={refresh}
        loading={loading}
        lastUpdated={lastUpdated}
        count={kitchenOrders.length}
      />

      {error && <p className="error-text">{error}</p>}
      {!loading && kitchenOrders.length === 0 && (
        <p className="empty-state">No active kitchen orders.</p>
      )}

      {kitchenOrders.map((order) => {
        // An order only leaves the kitchen once the bar side is done too, so a
        // table never gets its food cleared away while a drink is outstanding.
        const canComplete = isStationDone(order, "kitchen") && isStationDone(order, "bar");

        return (
          <OrderTicket
            key={order.id}
            order={order}
            station="kitchen"
            showTotal={false}
            renderSectionAction={(section) => (
              <button
                type="button"
                className={`status-btn${order[section.doneFlag] ? " is-done" : ""}`}
                onClick={() => markDone(order, section.doneFlag)}
                disabled={order[section.doneFlag]}
              >
                {order[section.doneFlag] ? "Done" : "Mark Done"}
              </button>
            )}
          >
            {canComplete && (
              <button
                type="button"
                className="btn btn-gold btn-block"
                style={{ marginTop: 16 }}
                onClick={() => finishOrder(order)}
              >
                Finish Order
              </button>
            )}
          </OrderTicket>
        );
      })}
    </div>
  );
}
