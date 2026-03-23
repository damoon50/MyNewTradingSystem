const { test, expect } = require("@playwright/test");
const { mockApi, loginFromUi } = require("./helpers/mock-api");
const { IN_SCOPE_ROUTES, ROLE_ROUTE_MATRIX } = require("./fixtures/route-inventory");

function normalizeColor(value) {
  return value.replace(/\s+/g, "").toLowerCase();
}

async function waitForStableFrame(page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });
  await page.waitForTimeout(300);
}

async function assertNavVisibility(page, visibleNav, hiddenNav) {
  for (const label of visibleNav) {
    await expect(page.getByRole("link", { name: label })).toBeVisible();
  }
  for (const label of hiddenNav) {
    await expect(page.getByRole("link", { name: label })).toHaveCount(0);
  }
}

function snapshotNameForRoute(path) {
  if (path === "/login") {
    return "route-login.png";
  }
  if (path === "/register") {
    return "route-register.png";
  }
  return `route-${path.slice(1)}.png`;
}

function navItemTestId(routePath) {
  return `nav-item-${routePath.replace(/^\//, "").toLowerCase()}`;
}

const SUPERVISER_AUDIT_SELECTORS = {
  "/BusinessInfo": {
    row: "business-audit-row",
    card: "business-audit-card",
    status: "business-status-chip",
    timestamp: "business-timestamp",
    danger: "business-danger-action",
  },
  "/CustomerInfo": {
    row: "customer-audit-row",
    card: "customer-audit-card",
    status: "customer-status-chip",
    timestamp: "customer-timestamp",
    danger: "customer-danger-action",
  },
  "/CommodityInfo": {
    row: "commodity-audit-row",
    card: "commodity-audit-card",
    status: "commodity-status-chip",
    timestamp: "commodity-timestamp",
    danger: "commodity-danger-action",
  },
  "/TradeInfo": {
    row: "trade-audit-row",
    card: "trade-audit-card",
    status: "trade-status-chip",
    timestamp: "trade-timestamp",
    danger: "trade-danger-action",
  },
};

async function assertSuperviserAuditSelectors(page, routePath) {
  const selectors = SUPERVISER_AUDIT_SELECTORS[routePath];
  if (!selectors) {
    return;
  }

  await expect(page.getByTestId(selectors.row)).toHaveCount(1);
  await expect(page.getByTestId(selectors.card).first()).toBeVisible();
  await expect(page.getByTestId(selectors.status).first()).toBeVisible();
  await expect(page.getByTestId(selectors.timestamp).first()).toBeVisible();
  await expect(page.getByTestId(selectors.danger).first()).toBeVisible();
}

function screenshotOptionsFor(routePath) {
  const options = {
    fullPage: true,
    animations: "disabled",
    maxDiffPixels: 700,
  };
  if (["/BusinessInfo", "/CustomerInfo", "/CommodityInfo", "/TradeInfo"].includes(routePath)) {
    options.maxDiffPixels = 25000;
  }
  if (routePath === "/CusHome") {
    options.maxDiffPixels = 45000;
  }
  if (routePath === "/nav-shell") {
    options.maxDiffPixels = 35000;
  }
  return options;
}

const routeRoleMap = {
  "/login": "guest",
  "/register": "guest",
  "/BusHome": "business",
  "/goodsOnSale": "business",
  "/SaleGoods": "business",
  "/GoodsSaled": "business",
  "/CusHome": "customer",
  "/CusBuyGoods": "customer",
  "/CusGoodsBeBaught": "customer",
  "/BusinessInfo": "superviser",
  "/CustomerInfo": "superviser",
  "/CommodityInfo": "superviser",
  "/TradeInfo": "superviser",
};

test.describe("Playwright visual harness", () => {
  IN_SCOPE_ROUTES.forEach((routePath) => {
    const authTag = routePath === "/login" || routePath === "/register" ? " @auth" : "";
    const superviserTag = routeRoleMap[routePath] === "superviser" ? " @superviser" : "";

    test(`baseline for ${routePath} @baseline${authTag}${superviserTag}`, async ({ page }) => {
      const roleKey = routeRoleMap[routePath];
      const roleLoginFixture = await mockApi(page, { role: roleKey });

      if (roleKey === "guest") {
        await page.goto(`/#${routePath}`);
      } else {
        const roleFixture = ROLE_ROUTE_MATRIX[roleKey];
        await loginFromUi(page, roleLoginFixture.account);
        await waitForStableFrame(page);
        await expect(page).toHaveURL(/#\/$/);
        await assertNavVisibility(page, roleFixture.visibleNav, roleFixture.hiddenNav);
        await page.goto(`/#${routePath}`);
      }

      await waitForStableFrame(page);
      await expect(page).toHaveURL(new RegExp(`#${routePath}$`));
      await assertSuperviserAuditSelectors(page, routePath);
      await expect(page).toHaveScreenshot(
        snapshotNameForRoute(routePath),
        screenshotOptionsFor(routePath),
      );
    });
  });

  test("guest login consumes shared theme tokens @theme-tokens @auth", async ({ page }) => {
    await mockApi(page, { role: "guest" });
    await page.goto("/#/login");
    await waitForStableFrame(page);

    const bodyStyles = await page.locator("body").evaluate((element) => {
      const styles = window.getComputedStyle(element);
      return {
        backgroundColor: styles.backgroundColor,
        fontFamily: styles.fontFamily,
      };
    });

    const subtitleColor = await page.locator("p.grey--text").evaluate((element) => {
      return window.getComputedStyle(element).color;
    });

    const loginButtonColor = await page.getByRole("button", { name: "登录" }).first().evaluate((element) => {
      return window.getComputedStyle(element).backgroundColor;
    });

    await expect(page.getByTestId("auth-card")).toBeVisible();
    await expect(page.getByTestId("auth-title")).toHaveText("登录");
    await expect(page.getByTestId("auth-primary-cta")).toBeVisible();

    expect(bodyStyles.fontFamily).toContain("IBM Plex Sans");
    expect(normalizeColor(bodyStyles.backgroundColor)).toBe("rgb(245,247,250)");
    expect(normalizeColor(subtitleColor)).toBe("rgb(102,112,133)");
    expect(normalizeColor(loginButtonColor)).toBe("rgb(22,93,255)");
  });

  test("authenticated shell consumes token palette and mono utility @theme-tokens", async ({ page }) => {
    const roleFixture = await mockApi(page, { role: "business" });
    await loginFromUi(page, roleFixture.account);
    await waitForStableFrame(page);
    await page.goto("/#/BusHome");
    await waitForStableFrame(page);

    const navStyles = await page.locator("#navbar").evaluate((element) => {
      const styles = window.getComputedStyle(element);
      return {
        backgroundColor: styles.backgroundColor,
        borderBottomColor: styles.borderBottomColor,
      };
    });

    const activeNavColor = await page.locator("#navbar .customNavBtn").first().evaluate((element) => {
      return window.getComputedStyle(element).color;
    });

    const monoStyles = await page.locator('[data-ledger="amount"]').first().evaluate((element) => {
      return window.getComputedStyle(element).fontFamily;
    });

    expect(normalizeColor(navStyles.backgroundColor)).toBe("rgba(255,255,255,0.94)");
    expect(normalizeColor(navStyles.borderBottomColor)).toBe("rgb(217,225,236)");
    expect(normalizeColor(activeNavColor)).toBe("rgb(22,93,255)");
    expect(monoStyles).toContain("IBM Plex Mono");
  });

  test("authenticated shell stays compact across breakpoints @nav-shell", async ({ page }) => {
    const roleFixture = await mockApi(page, { role: "business" });
    await loginFromUi(page, roleFixture.account);
    await waitForStableFrame(page);

    await expect(page).toHaveURL(/#\/$/);
    await expect(page.getByTestId("top-nav")).toBeVisible();
    await expect(page.locator('[data-nav-active="true"]')).toHaveCount(0);

    await page.goto("/#/BusHome");
    await waitForStableFrame(page);

    await expect(page.getByTestId(navItemTestId("/BusHome"))).toHaveAttribute(
      "data-nav-active",
      "true",
    );

      await expect(page.getByTestId("page-shell")).toHaveScreenshot(
        "nav-shell-business-home.png",
        screenshotOptionsFor("/nav-shell"),
      );
  });

  test("feedback harness keeps themed snackbar and upload surfaces stable @feedback", async ({ page }) => {
    await mockApi(page, { role: "guest" });
    await page.goto("/#/feedback-harness");
    await waitForStableFrame(page);

    await page.getByTestId("feedback-trigger-success").click();
    await page.getByTestId("upload-dialog-trigger").click();
    await waitForStableFrame(page);

    const snackbarStyles = await page.getByTestId("global-message").evaluate((element) => {
      const styles = window.getComputedStyle(element);
      return {
        fontFamily: styles.fontFamily,
        color: styles.color,
      };
    });

    const dropzoneBorderColor = await page.getByTestId("upload-dropzone").locator(".ant-upload-drag").evaluate((element) => {
      return window.getComputedStyle(element).borderColor;
    });

    expect(snackbarStyles.fontFamily).toContain("IBM Plex Sans");
    expect(normalizeColor(snackbarStyles.color)).toBe("rgba(255,255,255,0.87)");
    expect(normalizeColor(dropzoneBorderColor)).toBe("rgb(217,225,236)");

    await expect(page.locator("body")).toHaveScreenshot(
      "feedback-harness.png",
      screenshotOptionsFor("/feedback-harness"),
    );
  });
});

test.describe("Customer ledger visuals", () => {
  test("customer home and catalog inherit ledger tokens cleanly @customer", async ({ page }) => {
    const roleFixture = await mockApi(page, { role: "customer" });
    await loginFromUi(page, roleFixture.account);
    await waitForStableFrame(page);

    await page.goto("/#/CusHome");
    await waitForStableFrame(page);

    const homeChipColor = await page.getByTestId("customer-home-status-chip").evaluate((element) => {
      return window.getComputedStyle(element).color;
    });
    const homeMonoFont = await page.getByTestId("customer-home-summary-balance").evaluate((element) => {
      return window.getComputedStyle(element).fontFamily;
    });

    expect(normalizeColor(homeChipColor)).toBe("rgb(22,93,255)");
    expect(homeMonoFont).toContain("IBM Plex Mono");

    await expect(page.getByTestId("customer-home-page")).toHaveScreenshot(
      "customer-home-ledger.png",
      screenshotOptionsFor("/CusHome"),
    );

    await page.goto("/#/CusBuyGoods");
    await waitForStableFrame(page);

    await expect(page.getByTestId("customer-buy-page")).toHaveScreenshot(
      "customer-buy-ledger.png",
      screenshotOptionsFor("/CusBuyGoods"),
    );
  });

  test("customer empty states stay polished in ledger mode @customer", async ({ page }) => {
    const roleFixture = await mockApi(page, {
      role: "customer",
      overrides: {
        onSaleGoods: [],
        purchasedGoods: [],
      },
    });
    await loginFromUi(page, roleFixture.account);
    await waitForStableFrame(page);

    await page.goto("/#/CusBuyGoods");
    await waitForStableFrame(page);
    await expect(page.getByTestId("customer-buy-empty-state")).toBeVisible();
    await expect(page.getByTestId("customer-buy-page")).toHaveScreenshot(
      "customer-buy-empty-ledger.png",
      screenshotOptionsFor("/CusBuyGoods"),
    );

    await page.goto("/#/CusGoodsBeBaught");
    await waitForStableFrame(page);
    await expect(page.getByTestId("customer-purchased-empty-state")).toBeVisible();
    await expect(page.getByTestId("customer-purchased-page")).toHaveScreenshot(
      "customer-purchased-empty-ledger.png",
      screenshotOptionsFor("/CusGoodsBeBaught"),
    );
  });
});

test.describe("Business visual workspace", () => {
  ["/BusHome", "/goodsOnSale", "/SaleGoods", "/GoodsSaled"].forEach((routePath) => {
    test(`business baseline for ${routePath} @business`, async ({ page }) => {
      const roleFixture = await mockApi(page, { role: "business" });
      await loginFromUi(page, roleFixture.account);
      await waitForStableFrame(page);
      await page.goto(`/#${routePath}`);
      await waitForStableFrame(page);

      await expect(page).toHaveURL(new RegExp(`#${routePath}$`));
      await expect(page).toHaveScreenshot(
        snapshotNameForRoute(routePath),
        screenshotOptionsFor(routePath),
      );
    });
  });
});
