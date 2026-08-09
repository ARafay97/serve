import { NextResponse } from "next/server";
import { getSupabase, SupabaseNotConfiguredError } from "@/lib/supabase";
import { MenuItem, OrderRow, rowToOrder } from "@/types/order";

export const dynamic = "force-dynamic";

function configError(err: unknown) {
  if (err instanceof SupabaseNotConfiguredError) {
    return NextResponse.json({ error: err.message }, { status: 503 });
  }
  return null;
}

function isValidItem(value: unknown): value is MenuItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    typeof item.category === "string"
  );
}

// GET /api/orders?completed=true|false
export async function GET(request: Request) {
  const url = new URL(request.url);
  const completedParam = (url.searchParams.get("completed") ?? "").toLowerCase();
  const completed = completedParam === "1" || completedParam === "true";

  try {
    const { data, error } = await getSupabase()
      .from("orders")
      .select("*")
      .eq("completed", completed)
      // Active orders read oldest-first (kitchen works the queue in order);
      // completed history reads newest-first.
      .order("created_at", { ascending: !completed });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json((data as OrderRow[]).map(rowToOrder));
  } catch (err) {
    return configError(err) ?? NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}

// POST /api/orders
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const items = body?.items;
  if (!Array.isArray(items) || items.length === 0 || !items.every(isValidItem)) {
    return NextResponse.json(
      { error: "Invalid order payload: items must be a non-empty array of { name, price, category }" },
      { status: 400 },
    );
  }

  const isKitchenOrder = body.isKitchenOrder === true;
  const tableNumber = isKitchenOrder ? 0 : Number(body.table ?? 0);

  if (!isKitchenOrder && (!Number.isInteger(tableNumber) || tableNumber < 1)) {
    return NextResponse.json(
      { error: "Invalid order payload: a dine-in order needs a table number" },
      { status: 400 },
    );
  }

  const insert: Record<string, unknown> = {
    table_number: tableNumber,
    items,
    is_kitchen_order: isKitchenOrder,
    starters_done: body.startersDone === true,
    mains_done: body.mainsDone === true,
    drinks_done: body.drinksDone === true,
    mocktail_done_items: Array.isArray(body.mocktailDoneItems) ? body.mocktailDoneItems : [],
  };

  // The till may supply its own UUID so a retried request cannot double-post
  // the same order; otherwise Postgres generates one.
  if (typeof body.id === "string" && body.id) {
    insert.id = body.id;
  }

  try {
    const { data, error } = await getSupabase()
      .from("orders")
      .insert(insert)
      .select("*")
      .single();

    if (error) {
      // 23505 = unique_violation: this id was already posted, so the original
      // order stands and the retry is a no-op rather than an error.
      if (error.code === "23505") {
        return NextResponse.json({ error: "That order has already been sent" }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(rowToOrder(data as OrderRow), { status: 201 });
  } catch (err) {
    return configError(err) ?? NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
