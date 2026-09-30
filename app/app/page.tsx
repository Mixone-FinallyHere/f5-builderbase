import type { Metadata } from "next";
import { Suspense } from "react";
import AppShell from "./AppShell";

export const metadata: Metadata = {
  title: "KBC Mobile · concept",
  description: "Heads-Up by Kate, full screen: pick a customer and use the app as they would.",
};

// The phone app on its own, full screen on a phone: for recording the demo on a real device.
// /app?persona=lien opens straight into that customer.
export default function AppPage() {
  return (
    <Suspense>
      <AppShell />
    </Suspense>
  );
}
