import type { Metadata } from "next";
import { requireFaculty } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { RosterUpload } from "./roster-upload";
import { ResetButton } from "./reset-button";

export const metadata: Metadata = { title: "Class list · CSE Spotlight" };

export default async function RosterPage() {
  await requireFaculty();
  const supabase = await createClient();
  const { data: students } = await supabase
    .from("students")
    .select("roll_no, name, claimed_at, active")
    .order("roll_no");

  const claimed = students?.filter((s) => s.claimed_at).length ?? 0;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-4xl sm:text-5xl">Class list</h1>
      <p className="mt-2 text-muted-foreground">
        Upload the Excel sheet with &quot;Reg no&quot; and &quot;Student name&quot; columns. Only students on this list can log in.
      </p>

      <RosterUpload />

      <div className="mt-10 flex items-baseline justify-between">
        <h2 className="text-2xl">Students</h2>
        <p className="text-sm text-muted-foreground">
          {students?.length ?? 0} on the list · {claimed} have logged in
        </p>
      </div>
      {!students?.length ? (
        <p className="mt-3 text-muted-foreground">No students yet. Upload the class Excel above.</p>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Reg no</th>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Login</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map((s) => (
                <tr key={s.roll_no}>
                  <td className="px-4 py-2 font-mono text-xs">{s.roll_no}</td>
                  <td className="px-4 py-2">{s.name}</td>
                  <td className="px-4 py-2 text-muted-foreground">{s.claimed_at ? "Has password" : "Not yet"}</td>
                  <td className="px-4 py-2 text-right">
                    {s.claimed_at && <ResetButton rollNo={s.roll_no} name={s.name} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
