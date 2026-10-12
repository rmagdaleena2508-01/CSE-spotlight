# CSE Spotlight

A website to show what our students win and do.

## Why

- Teachers asked kids for certificates by hand.
- It took a long time to make the newsletter.

## Students

- Sign up once with your roll number and name, then make a password.
- After that, log in with your roll number and password.
- Add your event, date, prize, and photos.
- Pick a group: Technical or Non-Technical.
- Edit your own post from My posts while faculty have not checked it yet, for up to 2 months after posting.
- Delete your own post from My posts if you want to. It asks first.
- Change your password any time. You type your current one first.
- Tap the bell at the top to see your notifications. The green number shows how many you have not read yet.

## Everyone

- See all the wins, sorted by group.
- Swipe through the Student Spotlight cards.
- Tap Celebrate or Heart, and see who else cheered.

## Teachers

- Check each post and mark it as true.
- Take down posts that are wrong.
- Fix mistakes in a post with the Edit button. The student gets a notification saying what changed.
- Delete any post for good, at any time, even after the student's 2 months are over. The student gets a notification with the reason.
- Make a newsletter PDF in one click.
- Get an email with the class list each time a student signs up.

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

Example: your professor wants to show the HOD all the national-level Technical wins from September.

1. She opens the achievements page and picks Technical, Won, National and September.
2. The address bar changes to something like: `cse-spotlight.app/achievements?category=technical&result=award&level=national&month=2026-09`
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
   - Students can edit their own post while it's still waiting for verification. (Done, see the build log.)
   - The app icon and page titles.
3. **Going online:**
   - Deploy to Vercel and add the keys there (the secret key stays server-only).
   - Point Supabase's login settings at the live address.
   - Run a full test on the live link.
4. **Faculty guide:** a short `docs/FACULTY_GUIDE.md` covering how to upload the class list, review posts, and get the report.
5. **Test:** the full flow with fake posts, generating a PDF, then deleting the test data.

**Progress so far**

- **Newsletter report (done):** faculty pick a semester and download three files: a PDF list with the new SRM Vadapalani logo (the same one as the website) top-left on page 1, a spreadsheet (CSV), and a ZIP of photos. Only verified posts go in, and entry numbers match across all three. The design team does the final layout in Canva.
- **Submit form (done):**
  - Name and roll number stay compulsory.
  - New fields for the newsletter: year and section, kind of win, venue, end date, cash prize, paper or project title, faculty guide, and a proof link (faculty only).
  - Exactly one certificate is required. Photos are optional, up to 5, and students pick a main photo.
  - Every box shows light example text that disappears when you type.
- **Look and feel (done):**
  - Every page now uses the home page's look: white with a faint grid, like graph paper, and black text. (It started out black, like HackerRank Campus Crew; notes in `docs/DESIGN_NOTES.md`.)
  - One lime colour for the main buttons, Satoshi for text, and pixel-style headings.
  - The top bar is liquid glass pills (see Top bar below).
  - Achievement cards look like stickers, with a white frame and a soft shadow so they stand out on the white page.
  - Every button and tab lifts toward you with a soft shadow when the mouse is on it, and settles back when the mouse leaves. On phones there is no hover, so buttons just press.
  - Each category row shows its own sticker.
- **Hero (done):**
  - A white grid background, a separate white card on top, and a warm sunshine glow around it.
  - The card is wider than it is tall: up to 1392 px wide on laptops.
  - On laptops the whole top section fits on one screen. The stickers shrink to fit the space under the buttons, so nobody has to scroll to see them.
  - Black text, always centred, like the CSI site: a two-line headline, a short subtitle, and two small round buttons.
  - The headline reads "What *our* students did this semester." The word "our" is in the soft italic.
  - It says "Wins and events from the Dept. Of Computer Science & Engineering, SRMIST VDP".
  - There is no date label: students add wins as they happen, so the top section is not tied to a term.
  - The headline font is Young Serif and the word "our" is Fraunces. These stand in for RL Madena and Buche until those font files are added.
- **Stickers (done):**
  - Stickers sit on a curved path, like planets on an orbit, in this order: certificate, cap, trophy, palette, football, medal.
  - On laptops each one is a link. On hover it tilts toward the mouse, lifts off the page, and casts a soft shadow, following Motion's tilt card.
  - The links go to Non-Technical, Technical, wins and awards, Student Spotlight (palette), and all achievements (football and medal).
  - On phones and tablets they are only decoration.
  - The stickers on the left sit 1 cm higher than at first, so the curve rises gently.
  - The stickers now drift along the curve in an endless loop, left to right. When the page opens they stay still for 1 second after the opening animation, then glide off smoothly.
  - Soft edges on the left and right, the way logo loops on other sites do it: a sticker dissolves bit by bit as it slides out on the right and comes back the same way on the left, so there is no hard cut. The grid behind stays sharp.
  - The stickers glide on the GPU at sub-pixel steps, so they move smoothly instead of shaking.
  - A sixth sticker, a medal, follows the football. All six are spaced evenly round the loop, so there is no big gap.
  - On laptops, putting the mouse on any sticker stops the loop. Moving the mouse away starts it again in the same direction.
  - People who turn on "reduce motion" see the stickers standing still.
- **Top bar (done):**
  - The same liquid glass as the CSI site: three floating glass pills that get thicker once you scroll.
  - On phones the menu unfolds like folded paper.
  - The top left shows the full SRM Vadapalani logo (seal, "SRM" and "Vadapalani") on a small white chip, on laptops and phones.
  - The college card shows the same full logo. Its white background is removed, so it sits cleanly on the cream card.
  - The whole "CSE Spotlight" pill at the top left is one button. It opens the same college card as the CSI site, linking to srmistvdp.edu.in.
  - The card grows out of the small logo chip like a Mac window, at the same pace as the CSI site.
  - Closing it breaks the card into pixels, starting from the top-left corner.
  - A soft blur fades in at the top of the page while you scroll, and is off at the very top.
- **Opening animation (done):**
  - The page fades in piece by piece, the same way as the CSI site: the card, the top bar, the headline words, the text, the buttons, then the stickers.
  - It plays once per visit, and every visit opens at the top of the home page.
- **Sign-up (done):**
  - The login page has two tabs: Student and Faculty. Under the student log in there is a "Sign up" button that lifts smoothly on hover.
  - Only students on the class list can sign up: roll number and name, then a password.
  - Faculty accounts are made only by the developer, from the terminal.
  - Each sign-up emails the developer and faculty the full class list as an Excel file, with the new student's row highlighted in yellow, so they can check the student is in the CSE department. Emails go through Gmail with an app password.
- **Phones (done):**
  - Every page fits iPhone and Android screens with no sideways scrolling.
  - Form boxes use 16px text, so iPhones do not zoom in when you tap them.
  - Boxes, buttons and tabs are at least 44px tall, easy to tap with a finger.
  - The site stays clear of the iPhone notch and home bar.
  - Pages show grey loading blocks while they load, so a slow phone never looks frozen.
  - The phone menu shows Home, Achievements and one "Log in" button that opens the login page.
  - If the menu is longer than the screen, it scrolls on its own.
  - Tested on a phone-sized screen: home, achievements, login, sign up, My posts and Add a win.
  - Fixed during testing: the Add a win page slid sideways on phones because of a hidden upload box.
  - To try it on your own phone before it goes online: connect the phone to the same Wi-Fi as the Mac running the site, and open the Mac's Wi-Fi address with port 8801 (for example `http://192.168.0.5:8801`). The Mac must stay on.
  - GitHub Pages can't host this site, because login, forms and reports need a server. The site will go online on Vercel instead.
- **Page changes (done):**
  - Going from home to Achievements (and back) no longer jumps. The old page fades out fast and the new one rises in softly.
  - The top bar stays still while the page under it changes.
  - Loading blocks fade away when the real page arrives.
  - Changing filters or typing in search does not fade the page.
- **Student Spotlight (done):**
  - Right after the top section, the home page has a "Student Spotlight" row: tall photo cards you swipe sideways, in the style of Apple's product cards (Aceternity's "Apple Cards Carousel"). It replaces the four category rows.
  - Tabs above the row sort the cards: All, Technical, Non-Technical. Arrows move the row on laptops; on phones you swipe.
  - Tap a card and it grows into the full story: photo, result, date, level, organizer and the student's own words.
  - Spotlight has its own page too (`/spotlight`, "Spotlight" in the top bar), with its own category bar that stays at the top while you scroll, and one row per category.
- **Celebrate and Heart (done):**
  - Two reactions replace Like / Heart / Fire, like LinkedIn. One per person per post: pick one, switch, or tap again to take it back.
  - Under every card it says who cheered: "You and 12 others" or "R Priya and 12 others". Tap that line to see everyone's names. Faculty can react too, and get a "Faculty" tag.
  - Only names are shown, never roll numbers.
  - Not logged in? Pressing Celebrate or Heart opens a friendly prompt: "Join the celebration for R Priya" (or "Send R Priya some love"), with "Log in and celebrate", "New here? Sign up with your roll number" and "Maybe later".
  - The site remembers which cheer they wanted. After logging in or signing up, they land back on the same card and the cheer is added for them, with a "You celebrated R Priya's win!" message.
- **Spotlight rows on the home page (done):**
  - Right after the top section, Student Spotlight now runs as two endless rows of small cards, like the "Trusted by" logo strips on big tech websites: the top row moves left to right, the bottom row right to left.
  - Pointing at a row pauses it, so a card can be read and clicked. The edges fade softly. People who turn on "reduce motion" get rows they can scroll by hand instead.
  - Each card shows the photo (or category sticker), category, event, student, result, a verified tick and the cheer counts.
  - Not logged in? Under the rows: "Log in to see every post" and "New here? Sign up". Tapping a card also asks them to log in first ("Log in to read more"), then opens that post.
  - Logged in: the button becomes "Open Student Spotlight", and cards open the full post straight away.
  - The swipeable photo cards with Celebrate and Heart now live on the Spotlight page.
- **Footer (done):**
  - Every page ends with an illustrated park and city skyline under a blue sky. The top of the picture fades into the grid, so the page flows into the sky.
  - The links are written straight onto the sky (no panel): Explore (Home, Student Spotlight, All achievements), Students (Add your win, My posts, Log in or sign up) and College (SRMIST Vadapalani site, Faculty log in).
  - Pointing at a link draws a line under it from left to right; it slides away when the mouse leaves. On phones the line shows when you tap a link.
  - At the bottom, under a thin line: "© Dept. Of Computer Science & Engineering, SRMIST VDP" and "Made by students, for students."
- **Two categories (done):**
  - Arts and Sports are gone everywhere: the Add a win form, filters, Spotlight, faculty review and the newsletter report. Only Technical and Non-Technical are left.
  - A sports event can still be posted as Non-Technical (the "Sports" kind of win stays).
  - The palette and football stickers stay in the hero loop as decoration. The palette now opens Student Spotlight and the football opens all achievements.
- **Faster uploads (done):**
  - Uploading was slow because phone photos are often 3 to 12 MB, and the files went up one after another.
  - Now each picture is made smaller in the browser the moment it is picked, using the free [browser-image-compression](https://www.npmjs.com/package/browser-image-compression) library. Photos become WebP, at most 1920 pixels wide. Certificates stay bigger (2400 pixels, JPG), so small print stays readable. PDFs are not changed.
  - It runs in a background worker, so the page does not freeze. The worker file is kept in `public/vendor`, so nothing loads from another website.
  - All files upload at the same time, and the button shows how many are done.
  - In a test, a 4000 by 3000 picture became 1920 by 1440 and 86% smaller, in under a second.
- **Delete your own post (done):** in My posts, each post has a Delete button. It asks first. The server checks the post is really yours before deleting it, then removes its certificate, photos, and cheers too.
- **Change password (done):** a Change password page for students (from My posts) and faculty (from Review). Safety:
  - You must type your current password first. Wrong tries count towards the same 5 tries in 15 minutes as the login page.
  - The current password is checked on a separate connection, so your login is not touched.
  - Passwords are only sent inside the form, never in the web address, never written to logs, and never sent back to the page. Supabase keeps only a scrambled copy (a hash).
  - After a change, every other device that was logged in gets logged out.
- **Spotlight cards (done):** each card is about 1 cm taller and no longer shows cheers. The picture is bigger and as tall as the text. The text sits in three rows spread evenly from top to bottom: the group, then the title and name, then the result. Every side has the same padding, so nothing is crowded in the middle.
- **Faculty can fix posts (done):** on a post's review page, faculty tap Edit, fix any field, and can add a short note. The server checks the person is faculty, checks the new details with the same rules as the submit form, and saves only if something really changed.
- **Notifications (done):**
  - When faculty edit a post, the student who posted it gets a notification. It names the faculty member, lists the fields that changed, and shows the note.
  - A bell sits at the top for students, with a green number for unread ones.
  - On the notifications page, unread ones are bright green and bold. Read ones are soft green. Tapping one marks it read and opens the post. There is a "Mark all as read" button too.
  - Only the server can make a notification. A student can see and mark only their own.
- **Students can edit their own post (done):** in My posts, a post has an Edit button between its status and Delete. It shows only while both of these are true:
  - Faculty have not checked the post yet (it says "Live, waiting for faculty").
  - The post is less than 2 months old.
  - **Why this rule:** I chose the 2 month limit so nobody can change their data later on. Once a post is old, or faculty have checked it, it stays the way it is. If something is still wrong, a faculty member can fix it, and the student is told.
  - The edit page uses the same form and the same checks as the faculty Edit page. Photos and the certificate are not changed there.
  - The database checks the same rules again, so a student cannot get around them by skipping the page. A student can only ever edit their own posts.
- **Faculty can delete any post for good (done):** the 2 month limit is only for students. Faculty can still delete a post at any time, however old it is and whether it is live, verified or removed.
  - On a post's review page, faculty tap **Delete for good** and write a short reason. It asks first, because a deleted post cannot be brought back.
  - The post, its certificate, its photos and its cheers are all deleted.
  - The student gets a notification under the bell that says which post was deleted, who deleted it, and why.
  - **Remove** is still there too. It hides a post but keeps it, so the student can see the reason on their page. **Delete for good** wipes it completely.
- **Phone polish for Android and iPhone (done):**
  - The warm light around the hero used to stop in a hard straight line. Now it fades softly into the Student Spotlight section, so scrolling down the page has no sharp cut.
  - On iPhones with a notch or a home bar, there was a white strip at the very top and bottom. Now the hero runs under the status bar and the footer picture runs under the home bar, while the header, buttons and text stay clear of them.
  - On phones, the moving spotlight cards and the hero stickers never stop, not even while you scroll the page with your finger on them. Before, a finger on a row or a sticker counted as "pointing at it", which paused it. Now only a real mouse on a laptop pauses them. On phones the hint under the heading says "Tap a card to open it".
  - iPhones zoom in when you tap a text box with small writing. All text boxes and dropdowns now use 16 pixel writing on phones, so the page no longer jumps or zooms, and they are 40 pixels tall so they are easy to tap.
  - Every page was checked at phone width (375 pixels). Nothing is wider than the screen, so there is no sideways scrolling.
  - Moving from one page to another still uses the soft fade from before.
- **Still to do:** going online on Vercel, the faculty guide, and the final test.

</details>

## Sign-up emails

<details>
<summary>How to turn them on</summary>

1. Turn on 2-Step Verification for the Gmail account that sends the emails.
2. In Google Account, go to Security, then App passwords, and make one called "CSE Spotlight".
3. Put these in `.env.local` (and later in Vercel):
   - `GMAIL_USER`: the sending Gmail address.
   - `GMAIL_APP_PASSWORD`: the 16-letter app password.
   - `SIGNUP_NOTIFY_TO`: the developer's and the faculty's emails, split by a comma.
4. Restart the site.

If these are empty, sign-up still works and no email is sent. The email holds the whole class list, so only send it to people you trust.

</details>

## Docs

- [Product plan (PRD)](docs/PRD.pdf)
- [Design decisions, and why](docs/DESIGN_DECISIONS.md)
