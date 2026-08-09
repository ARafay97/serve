"use client";

import { useOrders } from "@/lib/useOrders";
import { patchOrder } from "@/lib/api";
import { hasBarItems, hasKitchenItems } from "@/data/categories";
import OrderTicket from "@/components/OrderTicket";
import RefreshBar from "@/components/RefreshBar";
import { Order } from "@/types/order";

export default function BarPage() {
  const { orders, setOrders, error, setError, loading, lastUpdated, refresh } = useOrders(false);

  const barOrders = orders.filter((order) => hasBarItems(order.items));

  const markBarItemsDone = async (order: Order) => {
    // A drinks-only order is finished the moment the bar is done with it, so it
    // is marked done and archived in one request. An order with food still to
    // come only gets the flag; the kitchen closes it out.
    const alsoComplete = !hasKitchenItems(order.items);

    setOrders((prev) =>
      alsoComplete
        ? prev.filter((o) => o.id !== order.id)
        : prev.map((o) => (o.id === order.id ? { ...o, drinksDone: true } : o)),
    );

    try {
      await patchOrder(order.id, {
        drinksDone: true,
        ...(alsoComplete ? { action: "complete" } : {}),
      });
      setError(null);
    } catch (err) {
      setOrders((prev) =>
        alsoComplete ? [...prev, order] : prev.map((o) => (o.id === order.id ? order : o)),
      );
      setError(err instanceof Error ? err.message : "Could not mark bar items done");
    }
  };

  return (
    <div>
      <h1 className="page-title">Drinks / Mocktails</h1>
      <RefreshBar
        onRefresh={refresh}
        loading={loading}
        lastUpdated={lastUpdated}
        count={barOrders.length}
      />

      {error && <p className="error-text">{error}</p>}
      {!loading && barOrders.length === 0 && <p className="empty-state">No active bar orders.</p>}

      {barOrders.map((order) => (
        <OrderTicket
          key={order.id}
          order={order}
          station="bar"
          showTotal={false}
          renderSectionAction={() => (
            <button
              type="button"
              className={`status-btn${order.drinksDone ? " is-done" : ""}`}
              onClick={() => markBarItemsDone(order)}
              disabled={order.drinksDone}
            >
              {order.drinksDone ? "Done" : "Mark Done"}
            </button>
          )}
        />
      ))}
    </div>
  );
}
