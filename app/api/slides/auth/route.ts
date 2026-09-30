import { authError, checkPassword } from "@/lib/slides-server";

export const dynamic = "force-dynamic";

// Lets the editor verify the password before entering edit mode.
export async function POST(req: Request) {
  const auth = await checkPassword(req);
  return auth === "ok" ? Response.json({ ok: true }) : authError(auth);
}
