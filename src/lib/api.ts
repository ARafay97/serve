import { Order } from "@/types/order";

/**
 * Browser-side wrapper around the route handlers in src/app/api.
 *
 * Paths are relative, so requests always go to the same Vercel deployment that
 * served the page. There is no API base URL to configure and no way for a
 * misconfigured environment variable to point the till at the wrong backend.
 */
async function readError(res: Response, fallback: string) {
  const body = await res.json().catch(() => null);
  return new Error(body?.error || fallback);
}

export async function fetchOrders(completed: boolean): Promise<Order[]> {
  const res = await fetch(`/api/orders?completed=${completed}`, { cache: "no-store" });
  if (!res.ok) throw await readError(res, "Failed to load orders");
  return res.json();
}

export async function createOrder(body: unknown): Promise<Order> {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await readError(res, "Failed to create order");
  return res.json();
}

export async function patchOrder(id: string, data: unknown): Promise<Order> {
  const res = await fetch(`/api/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await readError(res, "Failed to update order");
  return res.json();
}
