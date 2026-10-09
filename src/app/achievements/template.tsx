import type { ReactNode } from "react";
import { PageTransition } from "@/components/page-transition";

// Opening a single achievement from the list (and going back) gets the same soft hand-off.
export default function Template({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
