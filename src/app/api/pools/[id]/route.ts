import type { NextRequest } from "next/server";
import { getPoolDetail, isPoolId } from "@/lib/server/yields";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/pools/[id]">) {
  const { id } = await ctx.params;
  if (!isPoolId(id)) return Response.json({ error: "Invalid pool id" }, { status: 400 });
  try {
    const detail = await getPoolDetail(id);
    return Response.json(detail, {
      headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400" },
    });
  } catch {
    return Response.json({ error: "Pool data is temporarily unavailable" }, { status: 502 });
  }
}
