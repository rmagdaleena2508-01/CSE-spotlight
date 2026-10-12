import { Navbar } from "@/components/navbar";
import { unreadCount } from "@/lib/notifications";
import { getViewer } from "@/lib/session";

// Reads who is signed in (and, for students, how many notifications are
// unread) on the server, then hands off to the glass navbar.
export async function SiteHeader() {
  const viewer = await getViewer();
  const unread = viewer?.kind === "student" ? await unreadCount() : 0;
  return <Navbar viewer={viewer ? { kind: viewer.kind, name: viewer.name, unread } : null} />;
}
