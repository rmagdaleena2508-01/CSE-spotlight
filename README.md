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

- **Frontend:** Next.js, TypeScript, Tailwind CSS and shadcn/ui, with React Hook Form and Zod for forms, and Motion for animation.
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

<details>
<summary>Phase 3 (Day 3): plan</summary>

Day 3 adds the newsletter PDF report, a final polish pass, and puts the site online. By the end, faculty get the monthly report in one click and the site has a real link people can open.

1. **Newsletter PDF report (faculty only):**
   - A new Report page where faculty pick a date range (e.g. September) and, optionally, a category.
   - It uses verified posts only.
   - The layout is copied from your sample newsletters: college heading, month, a highlights section, then one section per category with photos, names, events and results, and page numbers.
   - No AI. The PDF follows the newsletter template and is filled with the verified posts. Faculty can type a short intro before downloading.
   - Faculty preview it, then download the PDF.
   - The PDF is built with a JavaScript PDF library (`@react-pdf/renderer`), which runs on Vercel without the heavy headless browser that HTML-to-PDF tools need.
   - CSV export of the same posts for Excel (it's in the PRD). It's small, so I'll add it.
2. **Polish:**
   - Loading placeholders while pages load, and a check of empty states.
   - Keyboard and screen-reader checks.
   - Students can edit their own post while it's still waiting for verification. That isn't built yet; it's a small addition.
   - The app icon and page titles.
3. **Going online:**
   - Deploy to Vercel and add the keys there (the secret key stays server-only).
   - Point Supabase's login settings at the live address.
   - Run a full test on the live link.
4. **Faculty guide:** a short `docs/FACULTY_GUIDE.md` covering how to upload the class list, review posts, and get the report.
5. **Test:** the full flow with fake posts, generating a PDF, then deleting the test data.

**Progress so far**

- **Newsletter report (done):** faculty pick a semester and download three files: a PDF list with the SRM logo top-left on page 1, a spreadsheet (CSV), and a ZIP of photos. Only verified posts go in, and entry numbers match across all three. The design team does the final layout in Canva.
- **Submit form (done):**
  - Name and roll number stay compulsory.
  - New fields for the newsletter: year and section, kind of win, venue, end date, cash prize, paper or project title, faculty guide, and a proof link (faculty only).
  - Exactly one certificate is required. Photos are optional, up to 5, and students pick a main photo.
  - Every box shows light example text that disappears when you type.
- **Look and feel (done):**
  - The site follows HackerRank Campus Crew (notes in `docs/DESIGN_NOTES.md`): a black page, one lime colour for buttons, Satoshi for text, and pixel-style headings.
  - The header is a dark bar with a white pill button.
  - Achievement cards look like stickers, with a thick white frame.
  - Each category row shows its own sticker.
- **Hero (done):**
  - A white grid background, a separate white card on top, and a warm sunshine glow around it.
  - The card is wider than it is tall: up to 1392 px wide on laptops.
  - On laptops the whole top section fits on one screen. The stickers shrink to fit the space under the buttons, so nobody has to scroll to see them.
  - Black text, always centred, like the CSI site: a two-line headline, a short subtitle, and two small round buttons.
  - It says "Wins and events from the Dept. Of Computer Science & Engineering, SRMIST VDP".
  - There is no date label: students add wins as they happen, so the top section is not tied to a term.
  - The headline font is Young Serif and the word "CSE" is Fraunces. These stand in for RL Madena and Buche until those font files are added.
- **Stickers (done):**
  - Five stickers sit on a curved path, like planets on an orbit, in this order: certificate, cap, trophy, palette, football.
  - On laptops each one is a link. On hover it tilts toward the mouse, lifts off the page, and casts a soft shadow, following Motion's tilt card.
  - The links go to Non-Technical, Technical, wins and awards, Arts, and Sports.
  - On phones and tablets they are only decoration.
  - The stickers on the left sit 1 cm higher than at first, so the curve rises gently.
- **Top bar (done):**
  - The same liquid glass as the CSI site: three floating glass pills that get thicker once you scroll.
  - On phones the menu unfolds like folded paper.
  - The whole "CSE Spotlight" pill at the top left is one button. It opens the same college card as the CSI site, linking to srmistvdp.edu.in.
  - The card grows out of the small seal like a Mac window, at the same pace as the CSI site.
  - Closing it breaks the card into pixels, starting from the top-left corner.
  - A soft blur fades in at the top of the page while you scroll, and is off at the very top.
- **Opening animation (done):**
  - The page fades in piece by piece, the same way as the CSI site: the card, the top bar, the headline words, the text, the buttons, then the stickers.
  - It plays once per visit, and every visit opens at the top of the home page.
- **Still to do:** students editing a post while it waits, going online on Vercel, the faculty guide, and the final test.

</details>

## Docs

- [Product plan (PRD)](docs/PRD.pdf)
