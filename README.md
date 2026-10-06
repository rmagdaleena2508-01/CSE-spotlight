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

## Docs

- [Product plan (PRD)](docs/PRD.pdf)
