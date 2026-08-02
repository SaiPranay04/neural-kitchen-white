import { redirect } from "next/navigation";
import { startTableSession } from "@/lib/actions/orders";

export default async function QrEntryPage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { slug, token } = await params;
  const result = await startTableSession(token);
  if (!result.ok) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 text-center bg-nk-cream">
        <h1 className="font-display text-2xl text-nk-navy">Can&apos;t open table</h1>
        <p className="mt-3 text-slate-500">{result.message}</p>
      </main>
    );
  }

  redirect(`/r/${result.data.slug}/menu?token=${token}&table=${result.data.tableNumber}`);
}
