import { explainAll, explainerStatus } from "@/lib/engine/explain";
import { gate } from "@/lib/engine/gate";
import { buildPersonas } from "@/lib/engine/personas";
import { CONSENT_LABELS, type ConsentLevel } from "@/lib/engine/types";
import { runWatchers } from "@/lib/engine/watchers";
import { readSession, writeSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store, private" };

// The signed-in persona's moments. The persona comes from the session cookie only.
export async function GET() {
  const session = await readSession();
  const customer = session ? buildPersonas()[session.persona] : undefined;
  if (!session || !customer) return Response.json({ signedIn: false }, { headers: noStore });

  const all = runWatchers(customer);
  const { visible, hiddenByConsent, overflow } = gate(customer, all, session.consent);
  const moments = await explainAll(customer, visible);

  return Response.json(
    {
      signedIn: true,
      customer: { id: customer.id, name: customer.name, age: customer.age, channel: customer.channel, digitalConfidence: customer.digitalConfidence },
      consent: session.consent,
      consentLabel: CONSENT_LABELS[session.consent],
      moments,
      hiddenByConsent,
      overflow,
      explainer: explainerStatus(),
    },
    { headers: noStore },
  );
}

// Move the consent dial.
export async function PATCH(req: Request) {
  const session = await readSession();
  if (!session) return Response.json({ error: "Pick a persona first" }, { status: 401, headers: noStore });
  let body: { consent?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const level = body.consent;
  if (level !== 0 && level !== 1 && level !== 2 && level !== 3) return Response.json({ error: "consent must be 0-3" }, { status: 400 });
  await writeSession({ ...session, consent: level as ConsentLevel });
  return Response.json({ ok: true, consent: level }, { headers: noStore });
}
