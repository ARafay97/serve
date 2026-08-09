"use client";

import { ReactNode } from "react";
import { DoneFlag, Station, groupOrderItems } from "@/data/categories";
import { Order } from "@/types/order";

interface Props {
  order: Order;
  /** Limit the ticket to one station's sections. Omit to show the whole order. */
  station?: Station;
  showTotal?: boolean;
  /** Rendered inside each section — used by Kitchen/Bar for their Mark Done buttons. */
  renderSectionAction?: (section: { title: string; doneFlag: DoneFlag }) => ReactNode;
  /** Rendered at the foot of the ticket — used for Done / Finish Order buttons. */
  children?: ReactNode;
}

export function orderTotal(order: Order) {
  return order.items.reduce((sum, item) => sum + item.price, 0);
}

export function ticketLabel(order: Order) {
  return order.isKitchenOrder ? `Order #${order.orderNumber ?? "-"}` : `Table ${order.table}`;
}

export default function OrderTicket({
  order,
  station,
  showTotal = true,
  renderSectionAction,
  children,
}: Props) {
  const sections = groupOrderItems(order.items, station);

  return (
    <div className="ticket" style={{ maxWidth: 560 }}>
      <div className="ticket__header">
        <span className="ticket__badge">{ticketLabel(order)}</span>
        <span className="ticket__time">
          {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      <div className="ticket-grid">
        {sections.map((section) => (
          <div key={section.title} className="ticket-section">
            <div className="ticket-section__title">{section.title}</div>
            {section.items.map((item, i) => (
              <p key={i} className="ticket-section__item">
                {item.name}
              </p>
            ))}
            {renderSectionAction?.(section)}
          </div>
        ))}
      </div>

      {showTotal && <p className="ticket__total">Total: £{orderTotal(order).toFixed(2)}</p>}

      {children}
    </div>
  );
}
