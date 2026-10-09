import { PageTransition } from "@/components/page-transition";

// Remounts on every top-level navigation (home, achievements, login, ...), so each
// change of page cross-fades instead of cutting.
export default function Template({ children }: LayoutProps<"/">) {
  return <PageTransition>{children}</PageTransition>;
}
