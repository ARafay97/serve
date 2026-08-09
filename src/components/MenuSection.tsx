"use client";

import { MenuItem } from "@/types/order";

interface Props {
  title: string;
  items: MenuItem[];
  addItem: (item: MenuItem) => void;
}

export default function MenuSection({ title, items, addItem }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="section-block">
      <div className="menu-section-title">{title}</div>

      <div className="menu-grid">
        {items.map((item) => (
          <button
            key={item.name}
            type="button"
            className="menu-tile"
            onClick={() => addItem(item)}
          >
            <div className="menu-tile__name">{item.name}</div>
            <div className="menu-tile__price">£{item.price.toFixed(2)}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
