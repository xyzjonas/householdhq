import { expect, test, type Page } from "@playwright/test";
import { login } from "./helpers";

// Requires a migrated database seeded with `npm run db:seed` and
// `npm run db:seed:long` (very long names/descriptions, see `just e2e`).
//
// Loads every page at 375px and fails when the page scrolls horizontally,
// naming the elements that stick out. `isMobile` stays off on purpose: mobile
// emulation widens the layout viewport to fit overflowing content, which would
// hide the very bug this test looks for.

const WIDTH = 375;

test.use({ viewport: { width: WIDTH, height: 812 } });

type PageSpec =
  | { name: string; url: string }
  // A detail page: the first link on the list page that matches `href`.
  | { name: string; list: string; href: RegExp };

const PAGES: PageSpec[] = [
  { name: "/", url: "/" },
  { name: "/accounts", url: "/accounts" },
  { name: "/categories", url: "/categories" },
  { name: "/energy", url: "/energy" },
  { name: "/vehicles", url: "/vehicles" },
  { name: "/transactions", url: "/transactions" },
  { name: "/transactions/new", url: "/transactions/new" },
  { name: "/settings", url: "/settings" },
  { name: "/accounts/[id]", list: "/accounts", href: /^\/accounts\/\d+$/ },
  {
    name: "/categories/[id]",
    list: "/categories",
    href: /^\/categories\/\d+$/,
  },
  { name: "/energy/[id]", list: "/energy", href: /^\/energy\/\d+$/ },
  { name: "/vehicles/[id]", list: "/vehicles", href: /^\/vehicles\/\d+$/ },
  {
    name: "/transactions/[id]/edit",
    list: "/transactions",
    href: /^\/transactions\/\d+\/edit$/,
  },
];

/**
 * Pages that still overflow. Fixing a page means deleting its entry here, so
 * the check starts guarding it.
 */
const KNOWN_OVERFLOW = new Set<string>([
  "/transactions/new",
  "/accounts/[id]",
  "/categories/[id]",
  "/energy/[id]",
  "/vehicles/[id]",
  "/transactions/[id]/edit",
]);

async function findOverflow(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const limit = window.innerWidth;
    const clips = (el: Element) =>
      ["auto", "scroll", "hidden", "clip"].includes(
        getComputedStyle(el).overflowX,
      );
    // Content inside a clipping ancestor that fits the viewport is contained
    // (intentional scrollers such as tables and carousels).
    const contained = (el: Element) => {
      // An absolutely positioned element is only clipped by ancestors at or
      // above its containing block (e.g. an `sr-only` cell inside a scroller
      // that is not `relative` escapes the scroller and widens the page).
      const positioned = ["absolute", "fixed"].includes(
        getComputedStyle(el).position,
      );
      let containingBlock: Element | null = null;
      if (positioned) {
        containingBlock = el.parentElement;
        while (
          containingBlock &&
          getComputedStyle(containingBlock).position === "static"
        ) {
          containingBlock = containingBlock.parentElement;
        }
      }
      let reached = !positioned;
      for (let p = el.parentElement; p; p = p.parentElement) {
        if (p === document.documentElement || p === document.body) break;
        if (!reached) {
          if (p !== containingBlock) continue;
          reached = true;
        }
        if (clips(p) && p.getBoundingClientRect().right <= limit + 1)
          return true;
      }
      return false;
    };
    // Where the element's content ends: text that does not wrap overflows
    // the element's box without enlarging it, so use scrollWidth as well.
    const rightOf = (el: Element) => {
      const r = el.getBoundingClientRect();
      return clips(el) ? r.right : Math.max(r.right, r.left + el.scrollWidth);
    };
    const sticksOut = (el: Element) =>
      el.getBoundingClientRect().width > 0 &&
      rightOf(el) > limit + 1 &&
      !contained(el);
    const path = (el: Element) => {
      const parts: string[] = [];
      for (let n: Element | null = el; n && n !== document.body;) {
        const cls = [...n.classList].slice(0, 3).join(".");
        parts.unshift(n.tagName.toLowerCase() + (cls ? `.${cls}` : ""));
        n = n.parentElement;
      }
      return parts.slice(-4).join(" > ");
    };
    // Only the innermost offenders: their ancestors overflow as a consequence.
    return [...document.body.querySelectorAll("*")]
      .filter(
        (el) => sticksOut(el) && ![...el.children].some((c) => sticksOut(c)),
      )
      .map((el) => `${path(el)} (right=${Math.round(rightOf(el))})`)
      .slice(0, 15);
  });
}

async function expectNoHorizontalScroll(page: Page, url: string) {
  await page.goto(url);
  await page.waitForLoadState("networkidle");
  const scrollWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  );
  const offenders = scrollWidth > WIDTH ? await findOverflow(page) : [];
  expect(
    scrollWidth,
    `${url} scrolls horizontally (${scrollWidth}px > ${WIDTH}px). Offenders:\n${offenders.join("\n")}`,
  ).toBeLessThanOrEqual(WIDTH);
}

test.describe(`no horizontal overflow at ${WIDTH}px`, () => {
  test("/login", async ({ page }) => {
    await expectNoHorizontalScroll(page, "/login");
  });

  for (const spec of PAGES) {
    test(spec.name, async ({ page }) => {
      test.fixme(KNOWN_OVERFLOW.has(spec.name), "still overflows at 375px");
      await login(page);

      let url: string;
      if ("url" in spec) {
        url = spec.url;
      } else {
        await page.goto(spec.list);
        await page.waitForLoadState("networkidle");
        const hrefs = await page
          .locator("main a[href]")
          .evaluateAll((links) =>
            links.map((a) => a.getAttribute("href") ?? ""),
          );
        const detail = hrefs.find((h) => spec.href.test(h));
        expect(
          detail,
          `no link matching ${spec.href} on ${spec.list}`,
        ).toBeTruthy();
        url = detail!;
      }
      await expectNoHorizontalScroll(page, url);
    });
  }
});
