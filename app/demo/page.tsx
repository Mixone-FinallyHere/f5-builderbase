import type { Metadata } from "next";
import DemoApp from "./DemoApp";

export const metadata: Metadata = {
  title: "Demo · Kate Ahead",
  description: "Kate Ahead: the bank acts before things go wrong, and explains why. Five customers, ten moments.",
};

export default function DemoPage() {
  return <DemoApp />;
}
