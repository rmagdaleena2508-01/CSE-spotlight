import { Navbar } from "@/components/navbar";
import { getViewer } from "@/lib/session";

// Reads who is signed in on the server, then hands off to the glass navbar.
export async function SiteHeader() {
  const viewer = await getViewer();
  return <Navbar viewer={viewer ? { kind: viewer.kind, name: viewer.name } : null} />;
}
