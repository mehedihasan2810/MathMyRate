import { expect, test, type Page } from "@playwright/test";

const HOURLY_PATH = "/freelance/hourly-rate-calculator/";
const PROJECT_PATH = "/freelance/project-rate-calculator/";

const hourlyFixture = {
  takeHome: "60000",
  expenses: "12000",
  tax: "25",
  weeks: "48",
  hoursWeek: "40",
  billable: "60",
  hoursDay: "8",
};

async function fillHourlyFixture(page: Page) {
  for (const [id, value] of Object.entries(hourlyFixture)) {
    await page.locator(`#${id}`).fill(value);
  }
  await page.getByRole("button", { name: "Update rate" }).click();
}

async function fillProjectFixture(page: Page) {
  await page.locator("#projectHourly").fill("83.34");
  await page.locator("#deliveryHours").fill("10");
  await page.locator("#adminHours").fill("0");
  await page.locator("#contingency").fill("10");
  await page.locator("#directExpenses").fill("50");
  await page.getByRole("button", { name: "Update quote" }).click();
}

test.describe("freelance calculators", () => {
  test("calculates the independently derived hourly and project fixtures", async ({
    page,
  }, testInfo) => {
    await page.goto(HOURLY_PATH);
    await fillHourlyFixture(page);

    await expect(page.locator("#hourly-result")).toHaveText("$79.87");
    await expect(page.locator("#day-result")).toHaveText("$638.96");
    await expect(page.locator("#revenue-result")).toHaveText("$92,000.00");
    await expect(page.locator("#capacity-result")).toHaveText("1,152 hours");
    await page.screenshot({ path: testInfo.outputPath("hourly-fixture.png"), fullPage: true });

    await page.goto(PROJECT_PATH);
    await fillProjectFixture(page);

    await expect(page.locator("#quote-result")).toHaveText("$966.74");
    await expect(page.locator("#labor-result")).toHaveText("$833.40");
    await expect(page.locator("#contingency-result")).toHaveText("$83.34");
    await expect(page.locator("#expense-result")).toHaveText("$50.00");
    await expect(page.locator("#time-result")).toHaveText("10 hours");
    await page.screenshot({ path: testInfo.outputPath("project-fixture.png"), fullPage: true });
  });

  test("accepts zero take-home and zero expenses as a valid zero result", async ({ page }) => {
    await page.goto(HOURLY_PATH);
    await page.locator("#takeHome").fill("0");
    await page.locator("#expenses").fill("0");
    await page.getByRole("button", { name: "Update rate" }).click();

    await expect(page.locator("#hourly-result")).toHaveText("$0.00");
    await expect(page.locator("#day-result")).toHaveText("$0.00");
    await expect(page.locator("#revenue-result")).toHaveText("$0.00");
    await expect(page.locator("#capacity-result")).toHaveText("1,196 hours");
    await expect(page.locator("#hourly-message")).toHaveText("");
    await expect(page.locator("#takeHome")).toHaveAttribute("aria-invalid", "false");
  });

  test("accepts a zero hourly rate for a project with expense-only receipts", async ({ page }) => {
    await page.goto(PROJECT_PATH);
    await page.locator("#projectHourly").fill("0");
    await page.locator("#deliveryHours").fill("10");
    await page.locator("#adminHours").fill("0");
    await page.locator("#contingency").fill("10");
    await page.locator("#directExpenses").fill("50");
    await page.getByRole("button", { name: "Update quote" }).click();

    await expect(page.locator("#quote-result")).toHaveText("$50.00");
    await expect(page.locator("#labor-result")).toHaveText("$0.00");
    await expect(page.locator("#contingency-result")).toHaveText("$0.00");
    await expect(page.locator("#project-message")).toHaveText("");
    await expect(page.locator("#projectHourly")).toHaveAttribute("aria-invalid", "false");
  });

  test("rejects blank, negative, and over-precise hourly inputs without stale results", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const invalidInputs = [
      ["takeHome", ""],
      ["takeHome", "-1"],
      ["takeHome", "60000.001"],
      ["expenses", "-1"],
      ["tax", ""],
      ["tax", "25.001"],
      ["weeks", "0"],
      ["weeks", ""],
      ["hoursWeek", "-1"],
      ["hoursWeek", "40.001"],
      ["billable", "0"],
      ["billable", ""],
      ["billable", "60.001"],
      ["hoursDay", "0"],
    ];

    await page.goto(HOURLY_PATH);
    for (const [id, value] of invalidInputs) {
      await page.reload();
      await fillHourlyFixture(page);
      await page.locator(`#${id}`).fill(value);
      await page.getByRole("button", { name: "Update rate" }).click();

      await expect(page.locator("[data-error-summary]")).toHaveText(/\S+/);
      await expect(page.locator("#hourly-result")).toHaveText("—");
      await expect(page.locator(`#${id}`)).toHaveAttribute("aria-invalid", "true");
      await expect(page.locator(`#${id}-error`)).toBeVisible();
      await expect(page.locator("[data-error-summary]")).toBeVisible();
      await expect(page.locator("#hourly-result")).not.toContainText(/NaN|Infinity/);
    }
  });

  test("rejects blank, negative, and over-precise project inputs without stale results", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const invalidInputs = [
      ["projectHourly", ""],
      ["projectHourly", "-1"],
      ["projectHourly", "83.341"],
      ["deliveryHours", ""],
      ["deliveryHours", "-1"],
      ["deliveryHours", "10.001"],
      ["adminHours", "0.001"],
      ["contingency", ""],
      ["contingency", "10.001"],
      ["directExpenses", "-1"],
      ["directExpenses", "50.001"],
    ];

    await page.goto(PROJECT_PATH);
    for (const [id, value] of invalidInputs) {
      await page.reload();
      await fillProjectFixture(page);
      await page.locator(`#${id}`).fill(value);
      await page.getByRole("button", { name: "Update quote" }).click();

      await expect(page.locator("[data-error-summary]")).toHaveText(/\S+/);
      await expect(page.locator("#quote-result")).toHaveText("—");
      await expect(page.locator(`#${id}`)).toHaveAttribute("aria-invalid", "true");
      await expect(page.locator(`#${id}-error`)).toBeVisible();
      await expect(page.locator("[data-error-summary]")).toBeVisible();
      await expect(page.locator("#quote-result")).not.toContainText(/NaN|Infinity/);
    }

    await page.reload();
    await page.locator("#deliveryHours").fill("0");
    await page.locator("#adminHours").fill("0");
    await page.getByRole("button", { name: "Update quote" }).click();
    await expect(page.locator("[data-error-summary]")).toHaveText(/\S+/);
    await expect(page.locator("#quote-result")).toHaveText("—");
    await expect(page.locator("#deliveryHours")).toHaveAttribute("aria-invalid", "true");
  });

  test("keeps exact basis-point precision and rejects blank percentage values", async ({
    page,
  }) => {
    await page.goto(HOURLY_PATH);
    for (const [id, value] of Object.entries({
      ...hourlyFixture,
      tax: "25.01",
      billable: "60.01",
    })) {
      await page.locator(`#${id}`).fill(value);
    }
    await page.getByRole("button", { name: "Update rate" }).click();

    await expect(page.locator("#revenue-result")).toHaveText("$92,010.67");
    await expect(page.locator("#hourly-result")).toHaveText("$79.86");
    await expect(page.locator("#day-result")).toHaveText("$638.88");
    await expect(page.locator("#capacity-result")).toHaveText("1,152.192 hours");
    await expect(page.locator("#tax")).toHaveAttribute("aria-invalid", "false");
    await expect(page.locator("#billable")).toHaveAttribute("aria-invalid", "false");

    await page.locator("#tax").fill("");
    await page.getByRole("button", { name: "Update rate" }).click();
    await expect(page.locator("#tax")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#tax-error")).toContainText("Enter a percentage");
    await expect(page.locator("#hourly-result")).toHaveText("—");

    await page.goto(PROJECT_PATH);
    await page.locator("#projectHourly").fill("83.34");
    await page.locator("#deliveryHours").fill("10");
    await page.locator("#adminHours").fill("0");
    await page.locator("#contingency").fill("10.01");
    await page.locator("#directExpenses").fill("50");
    await page.getByRole("button", { name: "Update quote" }).click();
    await expect(page.locator("#quote-result")).toHaveText("$966.83");
    await expect(page.locator("#contingency-result")).toHaveText("$83.43");

    await page.locator("#contingency").fill("");
    await page.getByRole("button", { name: "Update quote" }).click();
    await expect(page.locator("#contingency")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#contingency-error")).toContainText("Enter a percentage");
    await expect(page.locator("#quote-result")).toHaveText("—");
  });

  test("accepts the 100% billable-capacity boundary", async ({ page }) => {
    await page.goto(HOURLY_PATH);
    for (const [id, value] of Object.entries({ ...hourlyFixture, billable: "100.00" })) {
      await page.locator(`#${id}`).fill(value);
    }
    await page.getByRole("button", { name: "Update rate" }).click();

    await expect(page.locator("#billable")).toHaveAttribute("aria-invalid", "false");
    await expect(page.locator("#capacity-result")).toHaveText("1,920 hours");
    await expect(page.locator("#hourly-result")).toHaveText("$47.92");
    await expect(page.locator("#day-result")).toHaveText("$383.36");
  });

  test("resets each calculator to its labeled example defaults", async ({ page }) => {
    await page.goto(HOURLY_PATH);
    await fillHourlyFixture(page);
    await page.getByRole("button", { name: "Reset example" }).click();

    await expect(page.locator("#takeHome")).toHaveValue("85000.00");
    await expect(page.locator("#expenses")).toHaveValue("7500.00");
    await expect(page.locator("#tax")).toHaveValue("27.00");
    await expect(page.locator("#hourly-result")).toHaveText("$103.63");
    await expect(page.locator("#revenue-result")).toHaveText("$123,938.36");
    await expect(page.locator("#hourly-message")).toHaveText("");

    await page.goto(PROJECT_PATH);
    await fillProjectFixture(page);
    await page.getByRole("button", { name: "Reset example" }).click();

    await expect(page.locator("#projectHourly")).toHaveValue("112.50");
    await expect(page.locator("#deliveryHours")).toHaveValue("18");
    await expect(page.locator("#quote-result")).toHaveText("$3,026.25");
    await expect(page.locator("#project-message")).toHaveText("");
  });

  test("transfers the hourly result through local storage, not a query string", async ({
    page,
  }) => {
    await page.goto(HOURLY_PATH);
    await fillHourlyFixture(page);
    await page.getByRole("button", { name: "Use in project quote" }).click();

    await expect(page).toHaveURL(/\/freelance\/project-rate-calculator\/$/);
    expect(new URL(page.url()).search).toBe("");
    expect(new URL(page.url()).hash).toBe("");
    await expect(page.locator("#projectHourly")).toHaveValue("79.87");
    await expect(page.locator("#transfer-notice")).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("mathmyrate:hourly-cents")))
      .toBeNull();
  });

  test("rejects tampered saved rates and clears the saved value", async ({ page }) => {
    await page.goto(PROJECT_PATH);
    await page.evaluate(() => localStorage.setItem("mathmyrate:hourly-cents", "not-a-cents-value"));
    await page.reload();

    await expect(page.locator("#project-message")).toHaveText(
      "The saved hourly rate was invalid and was not used.",
    );
    await expect(page.locator("#projectHourly")).toHaveValue("112.50");
    await expect(page.locator("#transfer-notice")).toBeHidden();
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("mathmyrate:hourly-cents")))
      .toBeNull();
  });

  test("[regression] transfers an input-derived $1,234.56 hourly rate", async ({ page }) => {
    await page.goto(HOURLY_PATH);
    const values = {
      takeHome: "0",
      expenses: "1234.56",
      tax: "0",
      weeks: "1",
      hoursWeek: "1",
      billable: "100",
      hoursDay: "1",
    };
    for (const [id, value] of Object.entries(values)) {
      await page.locator(`#${id}`).fill(value);
    }
    await page.getByRole("button", { name: "Update rate" }).click();
    await expect(page.locator("#hourly-result")).toHaveText("$1,234.56");
    await page.getByRole("button", { name: "Use in project quote" }).click();

    await expect(page).toHaveURL(/\/freelance\/project-rate-calculator\/$/);
    expect(new URL(page.url()).search).toBe("");
    await expect(page.locator("#projectHourly")).toHaveValue("1234.56");
    await expect(page.locator("#transfer-notice")).toBeVisible();
  });

  test("[regression] accepts the maximum valid saved rate as an ungrouped decimal", async ({
    page,
  }) => {
    await page.goto(PROJECT_PATH);
    await page.evaluate(() => localStorage.setItem("mathmyrate:hourly-cents", "100000000000000"));
    await page.reload();

    await expect(page.locator("#projectHourly")).toHaveValue("1000000000000.00");
    await expect(page.locator("#transfer-notice")).toBeVisible();
    await expect(page.locator("#project-message")).toHaveText("");
    await expect(page.locator("#projectHourly")).toHaveAttribute("aria-invalid", "false");
    await expect(page.locator("[data-error-summary]")).toBeHidden();
  });

  test("[regression] rejects an oversized saved rate without replacing the valid result", async ({
    page,
  }) => {
    await page.goto(PROJECT_PATH);
    await page.evaluate(() => localStorage.setItem("mathmyrate:hourly-cents", "100000000000001"));
    await page.reload();

    await expect(page.locator("#projectHourly")).toHaveValue("112.50");
    await expect(page.locator("#transfer-notice")).toBeHidden();
    await expect(page.locator("#project-message")).toHaveText(
      "The saved hourly rate was invalid and was not used.",
    );
    await expect(page.locator("#quote-result")).toHaveText("$3,026.25");
    await expect(page.locator("[data-error-summary]")).toBeHidden();
    await expect(page.locator("#projectHourly-error")).toBeHidden();
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("mathmyrate:hourly-cents")))
      .toBeNull();
  });

  test("reports denied local storage on transfer and project load", async ({ browser }) => {
    const writeDeniedContext = await browser.newContext({ baseURL: "http://127.0.0.1:4174" });
    await writeDeniedContext.addInitScript(() => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function (...args) {
        if (args[0] === "mathmyrate:hourly-cents") throw new Error("local storage denied");
        return originalSetItem.apply(this, args);
      };
    });
    const writeDeniedPage = await writeDeniedContext.newPage();
    await writeDeniedPage.goto(HOURLY_PATH);
    await fillHourlyFixture(writeDeniedPage);
    await writeDeniedPage.getByRole("button", { name: "Use in project quote" }).click();
    await expect(writeDeniedPage).toHaveURL(/\/freelance\/hourly-rate-calculator\/$/);
    await expect(writeDeniedPage.locator("#hourly-message")).toHaveText(/could not save/i);
    await writeDeniedContext.close();

    const readDeniedContext = await browser.newContext({ baseURL: "http://127.0.0.1:4174" });
    await readDeniedContext.addInitScript(() => {
      Storage.prototype.getItem = function () {
        throw new Error("local storage denied");
      };
    });
    const readDeniedPage = await readDeniedContext.newPage();
    await readDeniedPage.goto(PROJECT_PATH);
    await expect(readDeniedPage.locator("#project-message")).toHaveText(
      /transfer was unavailable/i,
    );
    await expect(readDeniedPage.locator("#projectHourly")).toHaveValue("112.50");
    await readDeniedContext.close();
  });

  test("supports keyboard-only submission", async ({ page }) => {
    await page.goto(HOURLY_PATH);
    const labels = [
      ["takeHome", "Desired annual take-home"],
      ["expenses", "Annual business expenses"],
      ["tax", "Effective tax reserve (%)"],
      ["weeks", "Working weeks / year"],
      ["hoursWeek", "Working hours / week"],
      ["billable", "Billable time (%)"],
      ["hoursDay", "Hours in your day"],
    ] as const;
    for (const [id, label] of labels) {
      await expect(page.getByLabel(label)).toHaveAttribute("id", id);
      await expect(page.getByLabel(label)).toHaveAttribute(
        "aria-describedby",
        `${id}-help ${id}-error`,
      );
    }

    await page.locator("#takeHome").focus();
    await page.keyboard.press("Tab");
    await expect(page.locator("#expenses")).toBeFocused();
    await page.locator("#takeHome").fill("");
    await page.locator("#takeHome").focus();
    await page.keyboard.press("Enter");

    await expect(page.locator("#takeHome")).toBeFocused();
    await expect(page.locator("#takeHome")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#takeHome-error")).toBeVisible();
    await expect(page.locator("[data-error-summary]")).toBeVisible();

    await page.locator("#takeHome").fill(hourlyFixture.takeHome);
    await page.getByRole("button", { name: "Update rate" }).press("Enter");
    await expect(page.locator("#hourly-result")).toHaveText("$75.00");
    await expect(page.locator("#takeHome")).toHaveAttribute("aria-invalid", "false");
    await expect(page.locator("[data-error-summary]")).toBeHidden();
  });

  test("keeps calculator pages usable at a 320px viewport", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    for (const path of [HOURLY_PATH, PROJECT_PATH]) {
      await page.goto(path);
      await expect
        .poll(() =>
          page.evaluate(() =>
            Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
          ),
        )
        .toBeLessThanOrEqual(320);
    }
  });

  test("does not make fetch, XHR, or beacon calls while editing and transferring", async ({
    page,
  }) => {
    const networkStorageKey = "mathmyrate:e2e-network-calls";
    await page.addInitScript(() => {
      const key = "mathmyrate:e2e-network-calls";
      const record = (kind: string) => {
        const calls = JSON.parse(sessionStorage.getItem(key) ?? "[]") as string[];
        calls.push(kind);
        sessionStorage.setItem(key, JSON.stringify(calls));
      };
      const originalFetch = window.fetch.bind(window);
      window.fetch = (...args) => {
        record("fetch");
        return originalFetch(...args);
      };
      const originalOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function (
        method: string,
        url: string | URL,
        async: boolean = true,
        username?: string | null,
        password?: string | null,
      ) {
        record("xhr");
        return originalOpen.call(this, method, url, async, username, password);
      };
      if (typeof navigator.sendBeacon === "function") {
        const originalBeacon = navigator.sendBeacon.bind(navigator);
        navigator.sendBeacon = (...args) => {
          record("beacon");
          return originalBeacon(...args);
        };
      }
    });

    await page.goto(HOURLY_PATH);
    await page.locator("#takeHome").fill(hourlyFixture.takeHome);
    await page.locator("#expenses").fill(hourlyFixture.expenses);
    await page.getByRole("button", { name: "Update rate" }).click();
    await page.getByRole("button", { name: "Use in project quote" }).click();
    await expect(page).toHaveURL(/\/freelance\/project-rate-calculator\/$/);
    await page.locator("#projectHourly").fill("84");
    await page.getByRole("button", { name: "Update quote" }).click();
    await expect(page.locator("#project-message")).toHaveText("");
    await expect
      .poll(() =>
        page.evaluate(
          (storageKey) => JSON.parse(sessionStorage.getItem(storageKey) ?? "[]"),
          networkStorageKey,
        ),
      )
      .toEqual([]);
  });

  test("[regression] disables motion under a reduced-motion preference", async ({ browser }) => {
    const context = await browser.newContext({
      baseURL: "http://127.0.0.1:4174",
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.goto("/");

    await expect
      .poll(() =>
        page.evaluate(() => {
          const animated = document.querySelector(".page-enter");
          return {
            animationDuration: animated ? getComputedStyle(animated).animationDuration : "",
            animationIterationCount: animated
              ? getComputedStyle(animated).animationIterationCount
              : "",
            scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
          };
        }),
      )
      .toEqual({
        animationDuration: "1e-05s",
        animationIterationCount: "1",
        scrollBehavior: "auto",
      });
    await context.close();
  });

  test("keeps meaningful defaults and explanatory content without JavaScript", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      baseURL: "http://127.0.0.1:4174",
      javaScriptEnabled: false,
    });
    const page = await context.newPage();

    for (const [path, input, value, content] of [
      [HOURLY_PATH, "#takeHome", "85000.00", "How this number is built"],
      [PROJECT_PATH, "#projectHourly", "112.50", "A quote, not a tax calculation"],
    ] as const) {
      await page.goto(path);
      await expect(page.locator(input)).toHaveValue(value);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("main")).toContainText(content);
    }
    await page.goto(HOURLY_PATH);
    await expect(page.locator("#hourly-result")).toHaveText("$103.63");
    await expect(page.locator("#day-result")).toHaveText("$725.41");
    await expect(page.locator("#revenue-result")).toHaveText("$123,938.36");
    await expect(page.locator("#capacity-result")).toHaveText("1,196 hours");
    await expect(page.getByLabel("Desired annual take-home")).toHaveAttribute(
      "aria-describedby",
      "takeHome-help takeHome-error",
    );

    await page.goto(PROJECT_PATH);
    await expect(page.locator("#quote-result")).toHaveText("$3,026.25");
    await expect(page.locator("#labor-result")).toHaveText("$2,475.00");
    await expect(page.locator("#contingency-result")).toHaveText("$371.25");
    await expect(page.locator("#expense-result")).toHaveText("$180.00");
    await expect(page.locator("#time-result")).toHaveText("22 hours");
    await expect(page.getByLabel("Hourly rate")).toHaveAttribute(
      "aria-describedby",
      "projectHourly-error",
    );
    await context.close();
  });

  test("shows successful copy feedback in both calculators", async ({ browser }) => {
    const successContext = await browser.newContext({ baseURL: "http://127.0.0.1:4174" });
    await successContext.grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: "http://127.0.0.1:4174",
    });
    const successPage = await successContext.newPage();
    await successPage.goto(HOURLY_PATH);
    await successPage.getByRole("button", { name: "Copy result" }).click();
    await expect(successPage.locator("#hourly-message")).toHaveText("Result copied.");
    await expect
      .poll(() => successPage.evaluate(() => navigator.clipboard.readText()))
      .toContain("Minimum hourly rate:");
    await successPage.goto(PROJECT_PATH);
    await successPage.getByRole("button", { name: "Copy quote" }).click();
    await expect(successPage.locator("#project-message")).toHaveText("Quote copied.");
    await expect
      .poll(() => successPage.evaluate(() => navigator.clipboard.readText()))
      .toContain("Target project receipts:");
    await successContext.close();
  });

  test("shows blocked-copy feedback in both calculators", async ({ browser }) => {
    const failureContext = await browser.newContext({ baseURL: "http://127.0.0.1:4174" });
    await failureContext.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async () => {
            throw new Error("clipboard unavailable");
          },
        },
      });
    });
    const failurePage = await failureContext.newPage();
    await failurePage.goto(HOURLY_PATH);
    await failurePage.getByRole("button", { name: "Copy result" }).click();
    await expect(failurePage.locator("#hourly-message")).toHaveText(
      /copy|clipboard|failed|unavailable/i,
    );
    await failurePage.goto(PROJECT_PATH);
    await failurePage.getByRole("button", { name: "Copy quote" }).click();
    await expect(failurePage.locator("#project-message")).toHaveText(
      /copy|clipboard|failed|unavailable/i,
    );
    await failureContext.close();
  });

  test("invokes print and applies print styling on both pages", async ({ page }) => {
    await page.addInitScript(() => {
      window.print = () => {
        document.documentElement.setAttribute("data-print-called", "true");
      };
    });
    for (const path of [HOURLY_PATH, PROJECT_PATH]) {
      await page.emulateMedia({ media: "screen" });
      await page.goto(path);
      await page.getByRole("button", { name: "Print" }).click();
      await expect.poll(() => page.locator("html").getAttribute("data-print-called")).toBe("true");
      await page.emulateMedia({ media: "print" });
      await expect(page.locator("header")).toHaveCSS("display", "none");
      await expect(page.locator(".calculator-actions").first()).toHaveCSS("display", "none");
      await expect(page.locator(".print-card").first()).toHaveCSS("box-shadow", "none");
      await expect(page.locator("body")).toHaveCSS("background-color", "rgb(255, 255, 255)");
    }
  });
});
