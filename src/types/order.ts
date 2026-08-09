export interface MenuItem {
  name: string;
  price: number;
  category: string;
}

export interface Order {
  id: string;
  table: number;
  orderNumber: number | null;
  items: MenuItem[];
  isKitchenOrder: boolean;
  startersDone: boolean;
  mainsDone: boolean;
  drinksDone: boolean;
  mocktailDoneItems: string[];
  completed: boolean;
  createdAt: string;
}

/** Shape of a row in the Supabase `orders` table (snake_case, as Postgres stores it). */
export interface OrderRow {
  id: string;
  table_number: number;
  order_number: number | null;
  items: MenuItem[];
  is_kitchen_order: boolean;
  starters_done: boolean;
  mains_done: boolean;
  drinks_done: boolean;
  mocktail_done_items: string[];
  completed: boolean;
  created_at: string;
}

export function rowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
    table: row.table_number,
    orderNumber: row.order_number,
    items: Array.isArray(row.items) ? row.items : [],
    isKitchenOrder: row.is_kitchen_order,
    startersDone: row.starters_done,
    mainsDone: row.mains_done,
    drinksDone: row.drinks_done,
    mocktailDoneItems: row.mocktail_done_items ?? [],
    completed: row.completed,
    createdAt: row.created_at,
  };
}
