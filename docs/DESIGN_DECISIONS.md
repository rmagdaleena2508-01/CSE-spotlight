# Design decisions, and why they hold up

Every choice below came from a request, an answer or a piece of feedback in our build chats. For each one: what we chose, why you asked for it, why it is the right call, and what it costs. Where I still see a weak spot, I say so.

---

## 1. How the product works

### Posts go live first, faculty verify later
- **Your reason:** You said entries should go live right away, and the faculty member checks them afterwards.
- **Why it holds up:** There is one CSE faculty reviewer. If every post waited for her, the site would sit empty and students would stop posting. Going live straight away rewards the student at the moment they are proudest. Trust still comes from three places: the "Faculty verified" badge, the Remove button (with a reason the student sees), and the fact that **only verified posts go into the newsletter report**.
- **Cost:** A wrong post can be public for a few hours. That is acceptable for a class showcase, and Remove hides it everywhere at once.

### Roll number and name from the class Excel, not college email
- **Your reason:** You shared your real class sheet and said to follow the PRD and use that list.
- **Why it holds up:** Faculty already have the Excel. Students always know their roll number. Nobody has to wait for an email code, and nobody outside the class can get in, because the roll number has to be on the list and the name has to match it. Names are matched ignoring case, dots and word order, so "PRIYA R" and "R. Priya" both work.
- **Cost:** A student who mistypes their name gets stuck, so the sign-up form tells them exactly how to write it: in CAPS, with the initial.

### Sign up only for students on the list, plus an email with the new name in yellow
- **Your reason:** You wanted a "Sign up" option instead of "First time", and an Excel emailed to you and the faculty on every sign-up so you can confirm the student is really in the CSE department.
- **Why it holds up:** The list check stops strangers. The email adds a human check on top, for the case where someone signs up with a classmate's roll number and name. Sending the whole class list with only the new row in yellow means the reader sees the context and the new person in one glance, with no searching. The email is sent after the student is already logged in, so a slow Gmail never slows down the sign-up.
- **Cost:** The email carries the full class list, so it should only go to trusted addresses. The README says this too.

### Faculty accounts are made only by the developer
- **Your reason:** "The faculty is created by the developer, myself, right?"
- **Why it holds up:** A public faculty sign-up would let anyone call themselves faculty and verify their own posts. Faculty accounts are rare (there is one now), so making them from the terminal costs you almost nothing and closes the biggest hole.

### Supabase, not Java
- **Your reason:** You asked whether to use Java or Supabase, and said this is a simple 2 to 3 day project.
- **Why it holds up:** Supabase gives login, database, file storage and access rules in one free service. A Java backend would mean a second codebase, a second server to host and pay for, and writing login and file storage by hand. That doesn't fit in 3 days for one person.

### No AI in the newsletter. A data pack the design team lays out in Canva
- **Your reason:** You said no AI for the PDF, shared the DCSE Newsletter Vol. 27, and chose option b (the data pack). The SRM logo goes top-left on page 1, under the heading "Dept. Of Computer Science & Engineering, SRMIST VDP".
- **Why it holds up:** The newsletter is an official department document, so the facts must be exactly what the student and faculty entered, never reworded by a model. The design team already designs in Canva, so we give them clean inputs (a PDF list, a CSV and a ZIP of photos, all with matching entry numbers) instead of a layout they would have to fight.

### One certificate, up to 5 photos, and a main photo
- **Your reason:** You asked for one certificate and up to five photos.
- **Why it holds up:** One certificate is enough proof and keeps faculty review quick. Certificates are private (only the student and faculty can open them), because they often show personal details. Photos are public because they are for the showcase. Letting the student pick the main photo means the newsletter and the card use the shot the student likes, not a random one.

### Form fields copied from the newsletter, with light example text
- **Your reason:** You asked to keep name and roll number compulsory, keep the newsletter fields as listed, and show example text that disappears when you type.
- **Why it holds up:** If the form asks for exactly what the newsletter prints (year and section, venue, dates, cash prize, guide), faculty never have to chase students for missing details. That was the original problem in the PRD. Example text shows students the expected format, such as "e.g. Smart India Hackathon 2026", without a long instructions box.

### Grouped by semester, but no date label on the hero
- **Your reason:** First you chose semesters (July to December, January to June). Later your ma'am said students add wins as they happen, so you removed the "July to December 2026" label.
- **Why it holds up:** Semesters match how the college thinks about time, so "past achievements" makes sense to faculty. Dropping the label keeps the front page from looking out of date the day a term ends.
- **Weak spot:** The headline still says "this semester". That is still an open question for you: keep it, or change it to something timeless.

### Filters live in the page address
- **Your reason:** You asked me to explain this and agreed.
- **Why it holds up:** Your professor can copy a filtered view and send it to the HOD on WhatsApp, and the HOD sees the same list. Back and refresh also keep the filters.

---

## 2. How it looks

### Campus Crew style: black page, one lime colour, Satoshi, pixel headings
- **Your reason:** You studied HackerRank Campus Crew and asked for that style exactly, with a black background and a pixel font.
- **Why it holds up:** The audience is students, and Campus Crew already speaks their language: hackathons, stickers, retro computers. One loud accent colour (lime) means the eye always lands on the action, such as Log in or Add a win. The pixel font is only used for headings, never body text, so the site still reads easily.
- **Cost:** The pixel font is a free stand-in for the paid PP Mondwest.

### A white hero card with a grid and a sunshine glow
- **Your reason:** You shared a screenshot and asked for the white grid hero with black text and a sunshine glow.
- **Why it holds up:** The site is called *Spotlight*, so warm light pooling around the card is the name made visible. The grid reads as engineering graph paper, which suits CSE. And a bright card on top of a black site makes the front page feel like a stage, with the rest of the site as the audience.

### Serif headline, with "CSE" in a soft italic
- **Your reason:** You asked for RL Madena and Buche, with black text.
- **Why it holds up:** A serif headline feels like a magazine cover, which suits a newsletter-driven site. Setting only "CSE" in a different italic makes the department name the hero of the sentence.
- **Cost:** Young Serif and Fraunces are stand-ins until you add the real font files.

### Five stickers on a rising orbit
- **Your reason:** You set the order (certificate, cap, trophy, palette, football), asked for an orbit-like curve, and asked to raise the left stickers by 1 cm.
- **Why it holds up:** Each sticker is one category, so the hero doubles as a menu. The curve rises from left to right, which reads as growth and progress. On laptops each sticker is a link that lifts toward the mouse. On phones they are only decoration, because a small sticker is easy to tap by accident while scrolling.

### Compact and centred, like the CSI site, with the same glass navbar, college card and entrance
- **Your reason:** You asked for it to be compact and centred like csi-srmistvdp.vercel.app, and for the CSI navbar, entrance animation and logo-click card.
- **Why it holds up:** Both sites belong to the same department. Sharing the navbar, the motion and the college card makes them feel like one family, and a visitor who knows one already knows how to use the other. Clicking the whole "CSE Spotlight" pill opens the college card, which grows from the seal like a Mac window. That gives the college link a home without adding clutter to the menu.

### Slow, soft motion everywhere
- **Your reason:** You asked for a smoother hover rise and shadow, said the pill click felt too harsh, and set the pixel dissolve to 1.2 seconds.
- **Why it holds up:** The site is a showcase, not a tool you rush through. Half-second eases make it feel calm and premium, and every animation is switched off for people who turn on "reduce motion" on their phone or laptop.

### The opening animation plays once, and every visit starts at the top
- **Your reason:** You asked for the CSI entrance and for the site to always start at the home page.
- **Why it holds up:** The entrance is a first impression. Replaying it every time you come back to the home page would get in the way. Starting at the top means a refresh always shows the hero.
- **Cost:** A refresh resets your scroll to the top. A forced redirect to home on every visit was not built, and you can still ask for it.

### Blur at the top only after you scroll
- **Your reason:** You asked for a progressive blur, but only while scrolling.
- **Why it holds up:** At the top of the page there is nothing behind the header to hide, so a blur would only dull the hero. Once content slides under the header, the blur keeps the header readable.

---

## 3. Phones and moving between pages

### Built for iPhone and Android
- **Your reason:** You asked for every page, the loading and the refreshing to work well on phones.
- **Why it holds up:** Most students will open this on a phone.
  - Form boxes use 16px text, because iPhones zoom into anything smaller and break the layout.
  - Buttons and boxes are at least 44px tall, which is Apple and Google's size for a finger.
  - The site stays clear of the notch and the home bar.
  - Grey placeholder blocks show while a page loads, so a slow campus connection never looks frozen.

### One "Log in" in the phone menu
- **Your reason:** The menu showed "Faculty log in" only. You wanted plain "Log in" that opens the login page.
- **Why it holds up:** Students and faculty share one login page with two tabs, so a faculty-only button sent students to the wrong place. One button for everyone is simpler.

### Smooth hand-off between pages
- **Your reason:** Going from the home page to Achievements felt abrupt.
- **Why it holds up:** The jump was harsh because the home page is a bright white card and Achievements is black. Now the old page fades out quickly (0.18s) and the new one rises gently out of a soft blur (0.42s), while the header stays still so your eye has one steady point. Placeholder blocks fade away when the real page arrives, instead of vanishing. The fade does not play when you only change filters or search, so typing never flickers. Older browsers simply switch pages as before.

---

## 4. Privacy, behind every screen

- The real class Excel and secret keys never go to GitHub.
- Public pages never show roll numbers or certificates.
- Students can only edit their own posts and can never verify themselves.
- Only faculty can verify, remove, upload the class list or reset a login.
- Five wrong passwords block that roll number for 15 minutes.

These rules mean the site can be public without exposing your classmates.

---

## Open questions

- Should the headline keep "this semester"?
- The heading says "Dept. Of": capital O, or "Dept. of"?
- Real RL Madena and Buche font files, to replace the stand-ins.
