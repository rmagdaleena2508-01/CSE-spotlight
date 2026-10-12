import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

// The main reason pages were slow: the site's server ran in the USA while the
// database is in Mumbai, so every page crossed the world several times before
// it could show anything. vercel.json pins the server next to the database.

test("the server runs in Mumbai, next to the database", () => {
  const config = JSON.parse(readFileSync("vercel.json", "utf8"));
  expect(config.regions).toEqual(["bom1"]);
});

test("the live site answers from Mumbai, and fast", async ({ request, baseURL }) => {
  test.skip(!baseURL?.includes("vercel.app"), "only for the live site (set BASE_URL)");
  await request.get("/"); // wake the server first
  const started = Date.now();
  const res = await request.get("/");
  const took = Date.now() - started;
  expect(res.ok()).toBe(true);
  // x-vercel-id looks like "bom1::bom1::...": the edge, then where the page was built.
  expect(res.headers()["x-vercel-id"]?.split("::")[1]).toBe("bom1");
  expect(took).toBeLessThan(1_500);
});
