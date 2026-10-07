# CSE Spotlight

A website to show what our students win and do.

## Why

- Teachers asked kids for certificates by hand.
- It took a long time to make the newsletter.

## Students

- Log in with your roll number and name.
- Add your event, date, prize, and photos.
- Pick a group: Technical, Non-Technical, Arts, or Sports.

## Everyone

- See all the wins, sorted by group.
- Tap Like, Heart, or Fire.

## Teachers

- Check each post and mark it as true.
- Take down posts that are wrong.
- Make a newsletter PDF in one click.

## Built With

<details>
<summary>Tech stack</summary>

- **Frontend:** Next.js, TypeScript, Tailwind CSS and shadcn/ui, with React Hook Form and Zod for forms.
- **Backend:** Supabase PostgreSQL, Auth, Storage and Next.js server actions; PDF reports from HTML templates.
- **Security:** roll-number roster check, hashed passwords, Row Level Security, private certificate storage, rate limits.
- **Hosting:** Vercel.

</details>

## Plan

<details>
<summary>Day 1: the base</summary>

- **Set up:** Next.js app and a Supabase project.
- **Tables:** `students`, `faculty`, `achievements` with rules so kids only touch their own posts.
- **Files:** private box for certificates, open box for photos.
- **Class list:** teacher uploads the Excel. We check each roll number, skip repeats, and show a preview first.
- **Log in:** first time, roll number and name. Then you make a password. Too many wrong tries get blocked.
- **Add a win:** event, date, group, prize, team, story, certificate, and up to 5 photos.
- **Test:** fake kids log in and post.

</details>

## Build Log

<details>
<summary>Phase 1 (Day 1): done</summary>

**Setup**
- The site is built with Next.js 16, TypeScript, Tailwind and shadcn/ui, with the colours from the PRD.
- The Supabase project `cse-spotlight` is on the free plan in the Mumbai region.
- The README has the plan, the tech stack and the PRD. The real Excel file and the secret keys are kept off GitHub.

**Database**
- **`students`:** the class list, with a flag showing who has set a password.
- **`faculty`:** only `csefaculty` (Dr.T.Anusha).
- **`achievements`:** every post, with a status of live, verified or removed.
- **`published_achievements`:** the public copy. It has no roll numbers, no certificates and no removed posts.
- **`login_attempts`:** used to block repeated wrong logins.

**Safety rules (14 checks, all passed)**
- A student can only post as themselves and can't verify their own post.
- Visitors can't read roll numbers, the student list or certificates.
- Event dates in the future, and posts with no certificate or photo, are rejected.
- Only faculty can verify, remove, import the class list or reset a login.

**File storage**
- Certificates are private: only the owner and faculty can open them.
- Photos are public, for the showcase.

**Login**
- **First time:** roll number + name, matched while ignoring case, dots and word order. The student then sets a password.
- **After that:** roll number + password.
- **Faculty:** username + password.
- 5 wrong tries block that roll number for 15 minutes.

**Pages**
- **Add a win:** all the PRD fields, team members, up to 3 certificates and 5 photos, and a "details are true" checkbox. The post goes live right away.
- **My posts:** the student's own posts with a status badge, plus the reason if a post was removed.
- **Class list (faculty):** upload the Excel, preview it (repeated and bad rows are flagged), save, see who has logged in, and reset a login.
- **Home:** a simple list of the latest posts. Day 2 replaces it with the four category rows.

**Testing**
- I tested the full flow in the browser with fake students and a test faculty account: login, posting with files, privacy, Excel upload, reset and the rate limit. All of it worked.
- Testing found three small bugs, now fixed: the form cleared after a wrong try, bad Excel rows showed the wrong row number, and the preview said "1 rows".
- All test data was deleted afterwards. The real class list of 52 students is now loaded.

**Not done yet:** the category rows with arrows, past achievements, the detail page, reactions, the faculty verify/remove page, the newsletter PDF and deployment. Those are Days 2 and 3.

</details>

## Docs

- [Product plan (PRD)](docs/PRD.pdf)
