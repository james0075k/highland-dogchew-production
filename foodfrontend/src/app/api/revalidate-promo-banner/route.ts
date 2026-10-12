import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { PROMO_BANNER_TAG } from "@/utils/promo";

// Called by Dashboard → Homepage Banner right after a save, so the homepage and
// /discount-code show the new text now instead of within 5 minutes.
// Not a public cache-buster: the admin's token is checked by the backend first.
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  try {
    const check = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/promo-banner/admin`, {
      headers: { Authorization: auth },
      cache: "no-store",
    });
    if (!check.ok) return NextResponse.json({ success: false }, { status: check.status === 403 ? 403 : 401 });
  } catch {
    return NextResponse.json({ success: false }, { status: 502 });
  }

  revalidateTag(PROMO_BANNER_TAG);
  revalidatePath("/");
  revalidatePath("/discount-code");
  return NextResponse.json({ success: true });
}
