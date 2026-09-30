import { getOpportunityFeed } from "@/lib/server/yields";

export async function GET() {
  const feed = await getOpportunityFeed();
  return Response.json(feed, {
    headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" },
  });
}
