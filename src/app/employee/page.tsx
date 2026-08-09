"use client";

import { useMemo, useState } from "react";
import menu from "@/data/menu.json";
import { MENU_SECTIONS } from "@/data/categories";
import TableGrid from "@/components/TableGrid";
import MenuSection from "@/components/MenuSection";
import { MenuItem } from "@/types/order";
import { createOrder } from "@/lib/api";

type CartLine = { item: MenuItem; qty: number; indices: number[] };

type SentOrder = {
  id: string;
  isKitchenOrder: boolean;
  table: number;
  orderNumber: number | null;
  items: MenuItem[];
};

function groupCart(cart: MenuItem[]): CartLine[] {
  const lines: CartLine[] = [];
  const lineIndexByKey = new Map<string, number>();

  cart.forEach((item, idx) => {
    const key = `${item.name}__${item.price}`;
    const existing = lineIndexByKey.get(key);
    if (existing !== undefined) {
      lines[existing].qty += 1;
      lines[existing].indices.push(idx);
    } else {
      lineIndexByKey.set(key, lines.length);
      lines.push({ item, qty: 1, indices: [idx] });
    }
  });

  return lines;
}

export default function EmployeePage() {
  const [table, setTable] = useState(1);
  const [isKitchenOrder, setIsKitchenOrder] = useState(false);
  const [cart, setCart] = useState<MenuItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sentOrders, setSentOrders] = useState<SentOrder[]>([]);

  const cartLines = useMemo(() => groupCart(cart), [cart]);
  const orderTotal = cart.reduce((sum, item) => sum + item.price, 0);

  const addItem = (item: MenuItem) => setCart((prev) => [...prev, item]);

  // Removes a single instance of a cart line, so tapping an item four times and
  // then removing once leaves three.
  const removeOneOf = (line: CartLine) => {
    const lastIndex = line.indices[line.indices.length - 1];
    setCart((prev) => prev.filter((_, i) => i !== lastIndex));
  };

  const sendOrder = async () => {
    if (busy || cart.length === 0) return;

    setBusy(true);
    try {
      const created = await createOrder({
        // A client-generated id makes the POST idempotent: if the till loses
        // signal and the waiter taps Send again, the retry collides on the
        // primary key instead of writing the order twice.
        id: crypto.randomUUID(),
        table: isKitchenOrder ? 0 : table,
        items: cart,
        isKitchenOrder,
      });

      setCart([]);
      setError(null);
      setSentOrders((prev) => [
        {
          id: created.id,
          isKitchenOrder: created.isKitchenOrder,
          table: created.table,
          orderNumber: created.orderNumber,
          items: created.items,
        },
        ...prev,
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send order");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Employee Screen</h1>

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={isKitchenOrder}
          onChange={(e) => setIsKitchenOrder(e.target.checked)}
        />
        Takeout Order
      </label>

      {!isKitchenOrder && <TableGrid selected={table} setSelected={setTable} />}

      {MENU_SECTIONS.map((section) => (
        <MenuSection
          key={section.menuKey}
          title={section.label}
          items={menu[section.menuKey] as MenuItem[]}
          addItem={addItem}
        />
      ))}

      <div className="card cart" style={{ padding: 18, marginTop: 30 }}>
        <h2 style={{ fontSize: 16, color: "var(--gold)" }}>Current Order</h2>

        {cartLines.length === 0 && (
          <p className="empty-state">No items yet — tap a menu item to add it.</p>
        )}

        {cartLines.map((line) => (
          <div className="cart-line" key={`${line.item.name}__${line.item.price}`}>
            <span className="cart-line__qty">{line.qty}×</span>
            <span className="cart-line__name">{line.item.name}</span>
            <span className="cart-line__price">£{(line.item.price * line.qty).toFixed(2)}</span>
            <button
              type="button"
              className="btn btn-danger btn-icon"
              onClick={() => removeOneOf(line)}
              aria-label={`Remove one ${line.item.name}`}
              title="Remove one"
            >
              ×
            </button>
          </div>
        ))}

        {cart.length > 0 && <p className="cart-total">Total: £{orderTotal.toFixed(2)}</p>}

        {error && <p className="error-text">{error}</p>}

        <button
          type="button"
          className="btn btn-gold btn-block"
          onClick={sendOrder}
          disabled={cart.length === 0 || busy}
          style={{ marginTop: 14 }}
        >
          {busy ? "Sending..." : "Send Order"}
        </button>
      </div>

      {sentOrders.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h3 style={{ color: "var(--gold)", fontSize: 15 }}>Recently Sent Orders</h3>
          {sentOrders.slice(0, 5).map((order) => (
            <div key={order.id} className="ticket">
              <div className="ticket__header">
                <span className="ticket__badge">
                  {order.isKitchenOrder
                    ? `Kitchen Order #${order.orderNumber ?? "-"}`
                    : `Table ${order.table}`}
                </span>
              </div>
              <div>
                {order.items.map((item, idx) => (
                  <span
                    key={idx}
                    className="ticket-section__item"
                    style={{ marginRight: 10, display: "inline-block" }}
                  >
                    • {item.name}
                  </span>
                ))}
              </div>
              <div className="ticket__total">
                Total: £{order.items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
