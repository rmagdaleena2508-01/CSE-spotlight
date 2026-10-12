import { expect, test, type Page } from "@playwright/test";

// What these guard against (all were real problems on phones):
// - the hero not filling the first screen, so the next section peeked in early;
// - a hard line where the hero's light ended;
// - spotlight cards showing up empty and filling in late (lazy pictures);
// - the moving cards and stickers stopping while the page was scrolled by touch;
// - the footer picture showing up blank before it loaded;
// - pages wider than the phone, which lets them wobble sideways;
// - heavy blur effects that made phones stutter while scrolling;
// - a long opening animation that made the page look like it was still loading.

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function openHome(page: Page) {
  await page.goto("/");
  await page.waitForLoadState("load");
}

test("the hero fills exactly the first screen", async ({ page }) => {
  await openHome(page);
  const { bottom, screen } = await page.evaluate(() => ({
    bottom: document.querySelector("[data-hero]")!.getBoundingClientRect().bottom,
    screen: window.innerHeight,
  }));
  expect(Math.abs(bottom - screen)).toBeLessThanOrEqual(2);
});

test("the spotlight section fills a whole screen on phones", async ({ page }) => {
  await openHome(page);
  const { height, screen } = await page.evaluate(() => ({
    height: document.querySelector("#spotlight")!.getBoundingClientRect().height,
    screen: window.innerHeight,
  }));
  expect(height).toBeGreaterThanOrEqual(screen - 2);
});

test("the hero light is not cut off by the hero box", async ({ page }) => {
  await openHome(page);
  const overflowY = await page.evaluate(() => getComputedStyle(document.querySelector("[data-hero]")!).overflowY);
  expect(overflowY).toBe("visible");
});

test("spotlight card pictures load straight away, not on scroll", async ({ page }) => {
  await openHome(page);
  const lazy = await page.locator(".marquee img[loading=lazy]").count();
  expect(lazy).toBe(0);
  // Without scrolling at all, every card picture is ready within a few seconds.
  await expect
    .poll(
      () =>
        page.evaluate(() =>
          [...document.querySelectorAll<HTMLImageElement>(".marquee img")].every((i) => i.complete && i.naturalWidth > 0),
        ),
      { timeout: 8_000 },
    )
    .toBe(true);
});

test("hero stickers load straight away", async ({ page }) => {
  await openHome(page);
  expect(await page.locator("[data-hero] img").count()).toBeGreaterThan(0);
  expect(await page.locator("[data-hero] img[loading=lazy]").count()).toBe(0);
});

test("the moving cards and stickers keep moving while the page is scrolled by touch", async ({ page }) => {
  await openHome(page);
  await wait(4_000); // the stickers hold still while the page opens

  const read = () =>
    page.evaluate(() => ({
      rows: [...document.querySelectorAll(".marquee-track")].map((t) => new DOMMatrix(getComputedStyle(t).transform).m41),
      states: [...document.querySelectorAll(".marquee-track")].map((t) => getComputedStyle(t).animationPlayState),
      sticker: new DOMMatrix(getComputedStyle(document.querySelector(".intro-float")!.parentElement!).transform).m41,
    }));

  const before = await read();
  // A finger lands on a row and drags the page up, the way people scroll on phones.
  const row = page.locator(".marquee").first();
  const box = (await row.boundingBox())!;
  await page.evaluate(
    ({ x, y }) => {
      const target = document.elementFromPoint(x, y) ?? document.body;
      target.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerType: "touch", clientX: x, clientY: y }));
      target.dispatchEvent(new PointerEvent("pointerenter", { bubbles: false, pointerType: "touch", clientX: x, clientY: y }));
    },
    { x: box.x + 40, y: box.y + box.height / 2 },
  );
  for (let i = 0; i < 10; i++) {
    await page.mouse.wheel(0, 60);
    await wait(80);
  }
  const during = await read();
  await page.evaluate(() => document.body.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerType: "touch" })));

  expect(during.states.every((s) => s === "running")).toBe(true);
  during.rows.forEach((x, i) => expect(x).not.toBe(before.rows[i]));
  expect(during.sticker).not.toBe(before.sticker);
});

test("the footer has its colours before the picture arrives, and the picture is not lazy", async ({ page }) => {
  await openHome(page);
  const footer = await page.evaluate(() => {
    const layer = document.querySelector("footer > div")!;
    return {
      background: getComputedStyle(layer).backgroundImage,
      loading: layer.querySelector("img")?.getAttribute("loading"),
    };
  });
  expect(footer.background).toContain("gradient");
  expect(footer.loading).toBe("eager");
});

for (const path of ["/", "/achievements", "/spotlight", "/login"]) {
  test(`no sideways scrolling on ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("load");
    const { scroll, screen } = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      screen: window.innerWidth,
    }));
    expect(scroll).toBeLessThanOrEqual(screen);
    // Phones widen the page to fit anything too wide, so check against the real screen too.
    expect(await page.evaluate(() => window.innerWidth)).toBe(page.viewportSize()!.width);
  });
}

test("phones draw no heavy blur while scrolling", async ({ page }) => {
  await openHome(page);
  const heavy = await page.evaluate(() => {
    const px = (v: string) => Math.max(0, ...[...v.matchAll(/blur\(([\d.]+)px\)/g)].map((m) => Number(m[1])));
    return [...document.querySelectorAll<HTMLElement>("body *")]
      .filter((e) => e.offsetWidth > 0 || e.offsetHeight > 0)
      .map((e) => {
        const cs = getComputedStyle(e);
        return { el: e.tagName + "." + String(e.className).slice(0, 60), blur: Math.max(px(cs.filter), px(cs.backdropFilter)) };
      })
      .filter((x) => x.blur > 12);
  });
  expect(heavy).toEqual([]);
});

test("the opening is quick: headline, text and buttons are up within a second", async ({ page }) => {
  await page.goto("/");
  await wait(1_000);
  const faded = await page.evaluate(() =>
    [...document.querySelectorAll("[data-hero] h1, [data-hero] p, [data-hero] a")]
      .filter((e) => (e as HTMLElement).offsetWidth > 0)
      .filter((e) => {
        let n: Element | null = e;
        while (n) {
          if (Number(getComputedStyle(n).opacity) < 0.95) return true;
          n = n.parentElement;
        }
        return false;
      }).length,
  );
  expect(faded).toBe(0);
});

test("the footer picture is a small file straight from the CDN", async ({ page }) => {
  await openHome(page);
  const src = await page.evaluate(() => (document.querySelector("footer img") as HTMLImageElement).currentSrc);
  expect(src).toMatch(/\/footer\/park-(828|1600)\.webp$/);
});

test("the hero text is never fully invisible, so phones count the page as shown at once", async ({ page }) => {
  await page.goto("/", { waitUntil: "commit" });
  await page.waitForSelector("[data-hero] p");
  const hidden = await page.evaluate(() =>
    [...document.querySelectorAll("[data-hero] h1 span, [data-hero] p")].filter((e) => {
      let n: Element | null = e;
      while (n) {
        if (Number(getComputedStyle(n).opacity) === 0) return true;
        n = n.parentElement;
      }
      return false;
    }).length,
  );
  expect(hidden).toBe(0);
});
