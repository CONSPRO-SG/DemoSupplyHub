import { NextResponse } from "next/server";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { createConsumableSchema } from "@/lib/validation";
import { convexCreateConsumable, convexListConsumables } from "@/lib/convex";

export async function GET() {
  try {
    const token = await convexAuthNextjsToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const consumables = await convexListConsumables(token);
    return NextResponse.json(consumables);
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to fetch consumables", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createConsumableSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const token = await convexAuthNextjsToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const consumable = await convexCreateConsumable({
      ...parsed.data,
      location: parsed.data.location || undefined
    }, token);
    return NextResponse.json(consumable, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to create consumable", details: String(error) },
      { status: 500 }
    );
  }
}
