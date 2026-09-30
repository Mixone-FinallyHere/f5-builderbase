import type { Metadata } from "next";
import SlideDeck from "./SlideDeck";

export const metadata: Metadata = {
  title: "Slides · F5 - Builderbase",
  description: "F5 - Builderbase pitch deck.",
};

export default function SlidesPage() {
  return <SlideDeck />;
}
