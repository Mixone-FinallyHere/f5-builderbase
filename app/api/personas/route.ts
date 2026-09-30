import { PERSONA_META } from "@/lib/engine/personas";

export const dynamic = "force-static";

// Public: the five demo personas (invented people, no account data).
export function GET() {
  return Response.json({ personas: PERSONA_META });
}
