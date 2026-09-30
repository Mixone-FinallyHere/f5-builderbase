import type { Metadata } from "next";
import DemoApp from "./DemoApp";

export const metadata: Metadata = {
  title: "Live demo · Heads-Up",
  description: "Heads-Up by Kate: five customers, ten moments, before they become problems.",
};

export default function DemoPage() {
  return <DemoApp />;
}
