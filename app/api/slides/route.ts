import { LIMITS, parseDeck } from "@/lib/slides";
import { authError, checkPassword, editingEnabled, loadDeck, saveDeck } from "@/lib/slides-server";

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

export async function GET() {
  const { deck, stored } = await loadDeck();
  return Response.json({ deck, stored, editingEnabled: editingEnabled() }, { headers: noStore });
}

// Body: { deck: Deck, baseUpdatedAt: number }. baseUpdatedAt is the version the editor
// started from; if someone saved in between, respond 409 with their deck instead of overwriting.
export async function PUT(req: Request) {
  const auth = await checkPassword(req);
  if (auth !== "ok") return authError(auth);

  const text = await req.text();
  if (text.length > LIMITS.bodyBytes) return Response.json({ error: "Deck too large" }, { status: 413 });

  let body: { deck?: unknown; baseUpdatedAt?: unknown; force?: unknown };
  try {
    body = JSON.parse(text);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseDeck(body.deck);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  const current = await loadDeck();
  if (body.force !== true && current.deck.updatedAt !== body.baseUpdatedAt) {
    return Response.json({ error: "conflict", deck: current.deck }, { status: 409, headers: noStore });
  }

  const deck = { ...parsed.deck, updatedAt: Date.now() };
  await saveDeck(deck, current.stored ? current.deck : null);
  return Response.json({ deck }, { headers: noStore });
}
