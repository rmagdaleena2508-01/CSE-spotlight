import { ViewTransition, type ReactNode } from "react";

// Smooth hand-off between pages (React's <ViewTransition> on top of the browser's View
// Transitions API). Used by the route templates, which remount on every navigation, so
// the old page plays its exit and the new one its enter:
// - the old page fades out quickly, so it never competes with the new one;
// - the new page fades up a few pixels from a soft blur, a moment later.
// The header and the top blur are named elsewhere and stay still, so only the content moves.
// default="none": filter and search changes on the same page do not animate the whole page.
// Browsers without the API simply swap pages as before.
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
