import { Explorer } from "@/components/Explorer";
import { Footer, Header } from "@/components/Chrome";
import { Backdrop } from "@/components/Backdrop";
import { getOpportunityFeed } from "@/lib/server/yields";
import type { Appetite, Asset } from "@/lib/types";

const APPETITES: Appetite[] = ["conservative", "balanced", "adventurous"];

export default async function Home({ searchParams }: PageProps<"/">) {
  const q = await searchParams;
  const { opportunities, updatedAt } = await getOpportunityFeed();

  const amount = Number(q.amount);
  const init = {
    amount: Number.isFinite(amount) && amount > 0 ? Math.min(amount, 1e9) : 10_000,
    asset: (q.asset === "USDT" ? "USDT" : "USDC") as Asset,
    appetite: (APPETITES.includes(q.risk as Appetite) ? q.risk : "balanced") as Appetite,
    // Only open a pool sheet for ids we actually have.
    pool: typeof q.pool === "string" && opportunities.some((o) => o.id === q.pool) ? q.pool : null,
  };

  return (
    // isolate: the backdrop sits behind content without escaping this page.
    <div className="relative isolate flex flex-1 flex-col">
      <Backdrop />
      <Header />
      <main className="flex-1">
        <Explorer opportunities={opportunities} updatedAt={updatedAt} init={init} />
      </main>
      <Footer />
    </div>
  );
}
