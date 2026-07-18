import { NextResponse } from "next/server";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { createMovementSchema } from "@/lib/validation";
import { convexRecordMovement } from "@/lib/convex";

type Params = {
  params: {
    id: string;
  };
};

export async function POST(request: Request, { params }: Params) {
  const body = await request.json();
  const parsed = createMovementSchema.safeParse(body);
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
    const result = await convexRecordMovement({
      consumableId: params.id,
      ...parsed.data,
      note: parsed.data.note || undefined
    }, token);
    return NextResponse.json(result);
  } catch (error) {
    const details = String(error);
    const status =
      details.includes("Insufficient stock") || details.includes("not found") ? 400 : 500;
    return NextResponse.json(
      { error: "Failed to register movement", details },
      { status }
    );
  }
}
