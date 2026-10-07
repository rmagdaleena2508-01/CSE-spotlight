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

**Why this stack:** One TypeScript codebase runs pages and server logic together. Supabase gives login, database, file storage and access rules in one free service, so no separate backend. Vercel hosts Next.js natively, keeping setup small for a solo build.

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

<details>
<summary>Phase 2 (Day 2): plan</summary>

Day 2 builds what everyone sees, plus the faculty review page. By the end, the site looks like your professor's sketch and faculty can verify or remove posts.

1. **Home: four category rows.**
   - One row each for Technical, Non-Technical, Arts and Sports, showing up to 6 recent posts.
   - Arrows on desktop and swipe on phones, with no auto-scroll.
   - A "View all" link on each row.
   - Each card shows a photo (or a category placeholder), name, event, date, result and the "Faculty verified" badge.
2. **All achievements page:**
   - Filters for category, result, level and month, plus search.
   - 12 posts per page, and the filters stay in the URL so a link can be shared.
3. **Past achievements:**
   - Home shows the current term.
   - A "Past achievements" link opens older posts, as in the sketch.
4. **Detail page:** the full story, a photo gallery, event, organizer, level, result and team member names. No roll numbers or certificates.
5. **Reactions:**
   - Like (thumbs up), Heart or Fire, for logged-in students only, one reaction each.
   - Clicking the same one again removes it.
   - Everyone can see the counts.
6. **Faculty review page:**
   - A list of every post with filters (waiting, verified, removed).
   - Faculty open the certificate in a preview.
   - Verify adds the badge. Remove asks for a reason, hides the post, and the student sees the reason.
7. **Test:** the full flow in the browser with fake students, then delete them.

**One question first:** when should a post move from "current" to "past"?

- **By semester (recommended):** July–December and January–June. Home shows this semester.
- **By month:** home shows the last 30 days.
- **By academic year:** June to May.

**Why filters stay in the URL**

When someone picks filters, the page address in the browser changes to match them. Copying that address copies the filtered view.

Example: your professor wants to show the HOD all the national-level Sports wins from September.

1. She opens the achievements page and picks Sports, Won, National and September.
2. The address bar changes to something like: `cse-spotlight.app/achievements?category=sports&result=award&level=national&month=2026-09`
3. She copies that link and sends it on WhatsApp.
4. The HOD opens it and sees the same filtered list straight away, without picking anything.

Without this, the address stays as plain `/achievements`. The HOD would see every post and have to pick the four filters again.

It also helps in two other ways:

- **Back button:** after opening a post and pressing back, the filters are still set.
- **Refresh:** reloading the page keeps the filters.

**Result: done**

- **Current vs past:** by semester (July–December, January–June).
- **Built:** the home page with four category rows, the all-achievements page with filters and search, past achievements, the detail page, Like / Heart / Fire reactions, and the faculty review page with certificate preview, verify and remove.
- **Tested in the browser with fake students:**
  - The rows show this semester only, and past posts move to Past achievements.
  - Filters and search update the link. A shared link, Back and refresh all keep the filters.
  - Reactions can be picked, switched and taken back, and the counts stay after a refresh.
  - Verify adds the badge. Remove needs a reason, the post disappears from the site, and the student sees the reason.
- **Privacy:** the public pages never show roll numbers or certificate links. Visitors can't read or add reactions, or call verify. A student can't react as someone else.
- **Fixed during testing:** the header ran off the screen on phones.
- **Cleaned up:** all test data was deleted. The site has the 52 real students and no posts yet.

</details>

## Docs

- [Product plan (PRD)](docs/PRD.pdf)
