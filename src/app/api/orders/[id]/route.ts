import { NextResponse } from "next/server";
import { getSupabase, SupabaseNotConfiguredError } from "@/lib/supabase";
import { OrderRow, rowToOrder } from "@/types/order";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

function configError(err: unknown) {
  if (err instanceof SupabaseNotConfiguredError) {
    return NextResponse.json({ error: err.message }, { status: 503 });
  }
  return null;
}

// GET /api/orders/:id
export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;

  try {
    const { data, error } = await getSupabase()
      .from("orders")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(rowToOrder(data as OrderRow));
  } catch (err) {
    return configError(err) ?? NextResponse.json({ error: "Failed to load order" }, { status: 500 });
  }
}

// PATCH /api/orders/:id
//   { action: "complete" }              -> archive the order
//   { startersDone?, mainsDone?, ... }  -> flip station done-flags
export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};

  // Only the three station flags are writable here, and only as booleans, so a
  // stray field in the request body cannot overwrite items or the total.
  if (typeof body.startersDone === "boolean") patch.starters_done = body.startersDone;
  if (typeof body.mainsDone === "boolean") patch.mains_done = body.mainsDone;
  if (typeof body.drinksDone === "boolean") patch.drinks_done = body.drinksDone;

  // Flags and completion combine in one statement. The bar screen needs exactly
  // this when it closes a drinks-only order: the old build sent "drinks done"
  // and "complete" as two requests, and a failure between them left the order
  // marked done but still sitting in the active list.
  if (body.action === "complete") patch.completed = true;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { error: 'Nothing to update: send { action: "complete" } and/or at least one done-flag' },
      { status: 400 },
    );
  }

  try {
    const { data, error } = await getSupabase()
      .from("orders")
      .update(patch)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(rowToOrder(data as OrderRow));
  } catch (err) {
    return configError(err) ?? NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
