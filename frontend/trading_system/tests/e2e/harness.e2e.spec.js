const { test, expect } = require("@playwright/test");
const { mockApi, loginFromUi } = require("./helpers/mock-api");
const { ROLE_ROUTE_MATRIX } = require("./fixtures/route-inventory");

async function waitForStableRoute(page) {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(200);
}

async function assertNavVisibility(page, visibleNav, hiddenNav) {
  for (const label of visibleNav) {
    await expect(page.getByRole("link", { name: label })).toBeVisible();
  }
  for (const label of hiddenNav) {
    await expect(page.getByRole("link", { name: label })).toHaveCount(0);
  }
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

test.describe("Route inventory matrix", () => {
  test("guest keeps auth-only route inventory @route-matrix @auth", async ({ page }) => {
    const guestMatrix = ROLE_ROUTE_MATRIX.guest;
    await mockApi(page, { role: "guest" });

    for (const authRoute of guestMatrix.allowedRoutes) {
      await page.goto(`/#${authRoute}`);
      await waitForStableRoute(page);
      await expect(page).toHaveURL(new RegExp(`#${authRoute}$`));
    }

    await expect(page.locator("#navbar")).toHaveCount(0);
  });

  ["business", "customer", "superviser"].forEach((roleKey) => {
    const superviserTag = roleKey === "superviser" ? " @superviser" : "";

    test(`${roleKey} fixture exposes only permitted nav and routes @route-matrix${superviserTag}`, async ({ page }) => {
      const routeMatrix = ROLE_ROUTE_MATRIX[roleKey];
      const roleFixture = await mockApi(page, { role: roleKey });
      await loginFromUi(page, roleFixture.account);
      await waitForStableRoute(page);
      await expect(page).toHaveURL(/#\/$/);

      await assertNavVisibility(page, routeMatrix.visibleNav, routeMatrix.hiddenNav);

      for (const allowedRoute of routeMatrix.allowedRoutes) {
        await page.goto(`/#${allowedRoute}`);
        await waitForStableRoute(page);
        await expect(page).toHaveURL(new RegExp(`#${allowedRoute}$`));
        await expect(page.getByText("这里是 404 页面，您走丢了哈~")).toHaveCount(0);
      }
    });
  });
});

test.describe("Route guard behavior", () => {
  test("guest cannot access protected routes @route-guard @auth", async ({ page }) => {
    const guestMatrix = ROLE_ROUTE_MATRIX.guest;
    await mockApi(page, { role: "guest" });

    for (const protectedRoute of guestMatrix.protectedRoutes) {
      await page.goto(`/#${protectedRoute}`);
      await waitForStableRoute(page);
      await expect(page).toHaveURL(/#\/login$/);
      await expect(page.getByText("使用您的账户名和密码来登录系统")).toBeVisible();
    }
  });

  ["business", "customer", "superviser"].forEach((roleKey) => {
    const superviserTag = roleKey === "superviser" ? " @superviser" : "";

    test(`${roleKey} is redirected to 404 for denied routes @route-guard${superviserTag}`, async ({ page }) => {
      const routeMatrix = ROLE_ROUTE_MATRIX[roleKey];
      const roleFixture = await mockApi(page, { role: roleKey });
      await loginFromUi(page, roleFixture.account);
      await waitForStableRoute(page);
      await expect(page).toHaveURL(/#\/$/);

      await assertNavVisibility(page, routeMatrix.visibleNav, routeMatrix.hiddenNav);

      for (const deniedRoute of routeMatrix.deniedRoutes) {
        await page.goto(`/#${deniedRoute}`);
        await waitForStableRoute(page);
        await expect(page).toHaveURL(/#\/404$/);
        await expect(page.getByText("这里是 404 页面，您走丢了哈~")).toBeVisible();
      }
    });
  });

  test("expired token returns to login through 401 path @401-expiry @route-guard", async ({ page }) => {
    await mockApi(page, { role: "business", expiredToken: true });
    await page.goto("/#/login");
    await page.evaluate(() => {
      window.localStorage.setItem("token", "expired-token");
    });
    await page.goto("/#/BusHome");
    await expect(page).toHaveURL(/#\/login$/);
    await expect(page.getByText("使用您的账户名和密码来登录系统")).toBeVisible();
    const token = await page.evaluate(() => window.localStorage.getItem("token"));
    expect(token).toBeNull();
  });
});

test.describe("Auth surfaces", () => {
  test("login and register expose stable auth selectors and route handoff @auth", async ({ page }) => {
    await mockApi(page, { role: "guest" });
    await page.goto("/#/login");
    await waitForStableRoute(page);

    await expect(page.getByTestId("auth-card")).toBeVisible();
    await expect(page.getByTestId("auth-title")).toHaveText("登录");
    await expect(page.getByTestId("auth-form")).toBeVisible();
    await expect(page.getByTestId("auth-primary-cta")).toBeVisible();
    await expect(page.getByTestId("auth-secondary-cta")).toBeVisible();

    await page.getByTestId("auth-secondary-cta").click();
    await waitForStableRoute(page);

    await expect(page).toHaveURL(/#\/register$/);
    await expect(page.getByTestId("auth-title")).toHaveText("注册");
    await expect(page.getByTestId("auth-role-select")).toBeVisible();
  });

  test("register returns to login with shared secondary action @auth", async ({ page }) => {
    await mockApi(page, { role: "guest" });
    await page.goto("/#/register");
    await waitForStableRoute(page);

    await expect(page.getByTestId("auth-card")).toBeVisible();
    await expect(page.getByTestId("auth-title")).toHaveText("注册");
    await expect(page.getByTestId("auth-primary-cta")).toHaveText(/注册/);
    await expect(page.getByTestId("auth-secondary-cta")).toHaveText(/登录/);

    await page.getByTestId("auth-secondary-cta").click();
    await waitForStableRoute(page);

    await expect(page).toHaveURL(/#\/login$/);
    await expect(page.getByTestId("auth-title")).toHaveText("登录");
  });
});

test.describe("Navigation shell", () => {
  ["business", "customer", "superviser"].forEach((roleKey) => {
    const superviserTag = roleKey === "superviser" ? " @superviser" : "";

    test(`${roleKey} sees sticky shell chrome with role-filtered nav @nav-shell${superviserTag}`, async ({ page }) => {
      const routeMatrix = ROLE_ROUTE_MATRIX[roleKey];
      const roleFixture = await mockApi(page, { role: roleKey });
      await loginFromUi(page, roleFixture.account);
      await waitForStableRoute(page);

      await expect(page).toHaveURL(/#\/$/);
      await expect(page.getByTestId("top-nav")).toBeVisible();
      await expect(page.getByTestId("page-shell")).toBeVisible();
      await expect(page.locator('[data-nav-active="true"]')).toHaveCount(0);
      await assertNavVisibility(page, routeMatrix.visibleNav, routeMatrix.hiddenNav);

      const topNavPosition = await page.getByTestId("top-nav").evaluate((element) => {
        return window.getComputedStyle(element).position;
      });
      expect(topNavPosition).toBe("sticky");

      const primaryRoute = routeMatrix.allowedRoutes[0];
      await page.goto(`/#${primaryRoute}`);
      await waitForStableRoute(page);
      await expect(page.getByTestId(navItemTestId(primaryRoute))).toHaveAttribute(
        "data-nav-active",
        "true",
      );
    });
  });

  test("logout preserves shell behavior and returns to login @nav-shell", async ({ page }) => {
    const roleFixture = await mockApi(page, { role: "business" });
    await loginFromUi(page, roleFixture.account);
    await waitForStableRoute(page);

    await expect(page.getByTestId("top-nav")).toBeVisible();
    await page.getByTestId("nav-logout").click();
    await waitForStableRoute(page);

    await expect(page).toHaveURL(/#\/login$/);
    await expect(page.getByTestId("top-nav")).toHaveCount(0);

    const token = await page.evaluate(() => window.localStorage.getItem("token"));
    expect(token).toBeNull();
  });

  test("superviser routes expose audit selectors across all review views @superviser", async ({ page }) => {
    const roleFixture = await mockApi(page, { role: "superviser" });
    await loginFromUi(page, roleFixture.account);
    await waitForStableRoute(page);

    for (const [routePath, selectors] of Object.entries(SUPERVISER_AUDIT_SELECTORS)) {
      await page.goto(`/#${routePath}`);
      await waitForStableRoute(page);
      await expect(page).toHaveURL(new RegExp(`#${routePath}$`));
      await expect(page.getByTestId(selectors.row)).toHaveCount(1);
      await expect(page.getByTestId(selectors.card).first()).toBeVisible();
      await expect(page.getByTestId(selectors.status).first()).toBeVisible();
      await expect(page.getByTestId(selectors.timestamp).first()).toBeVisible();
      await expect(page.getByTestId(selectors.danger).first()).toBeVisible();
    }
  });
});

test.describe("Customer ledger views", () => {
  test("customer home exposes ledger summaries and timeline selectors @customer", async ({ page }) => {
    const roleFixture = await mockApi(page, {
      role: "customer",
      overrides: {
        accountList: [{ month: 11, outcome: 300, total: 3500 }],
      },
    });
    await loginFromUi(page, roleFixture.account);
    await waitForStableRoute(page);

    await page.goto("/#/CusHome");
    await waitForStableRoute(page);

    await expect(page.getByTestId("customer-home-page")).toBeVisible();
    await expect(page.getByTestId("customer-home-status-chip")).toContainText("Live ledger");
    await expect(page.getByTestId("customer-home-summary-purchases")).toHaveText("4");
    await expect(page.getByTestId("customer-home-summary-balance")).toHaveText("3,200");
    await expect(page.getByTestId("customer-home-summary-month-spent")).toHaveText("120");
    await expect(page.getByTestId("customer-home-record-list")).toBeVisible();
    await expect(page.getByTestId("customer-home-record-card")).toHaveCount(2);
    await expect(page.getByTestId("customer-home-record-status-chip").first()).toContainText("Current");
  });

  test("customer can review offer cards and submit a purchase from the ledger layout @customer", async ({ page }) => {
    const roleFixture = await mockApi(page, { role: "customer" });
    await loginFromUi(page, roleFixture.account);
    await waitForStableRoute(page);

    await page.goto("/#/CusBuyGoods");
    await waitForStableRoute(page);

    await expect(page.getByTestId("customer-buy-page")).toBeVisible();
    await expect(page.getByTestId("customer-buy-summary-count")).toHaveText("2");
    await expect(page.getByTestId("customer-buy-summary-value")).toHaveText("698");
    await expect(page.getByTestId("customer-buy-summary-issuers")).toHaveText("1");
    await expect(page.getByTestId("customer-buy-record-card")).toHaveCount(2);
    await expect(page.locator("[data-timestamp]").first()).toBeVisible();

    await page.getByTestId("customer-buy-action").first().click();
    await expect(page.getByTestId("customer-buy-dialog")).toBeVisible();
    await page.getByTestId("customer-buy-confirm").click();
    await waitForStableRoute(page);

    await expect(page).toHaveURL(/#\/CusGoodsBeBaught$/);
    await expect(page.getByTestId("customer-purchased-page")).toBeVisible();
  });

  test("customer empty states stay addressable for offer and holding lists @customer", async ({ page }) => {
    const roleFixture = await mockApi(page, {
      role: "customer",
      overrides: {
        onSaleGoods: [],
        purchasedGoods: [],
      },
    });
    await loginFromUi(page, roleFixture.account);
    await waitForStableRoute(page);

    await page.goto("/#/CusBuyGoods");
    await waitForStableRoute(page);
    await expect(page.getByTestId("customer-buy-empty-state")).toBeVisible();

    await page.goto("/#/CusGoodsBeBaught");
    await waitForStableRoute(page);
    await expect(page.getByTestId("customer-purchased-empty-state")).toBeVisible();
  });
});

test.describe("Business workspace", () => {
  test("business pages expose operator hierarchy and selectors @business", async ({ page }) => {
    const roleFixture = await mockApi(page, { role: "business" });
    await loginFromUi(page, roleFixture.account);
    await waitForStableRoute(page);

    await page.goto("/#/BusHome");
    await waitForStableRoute(page);
    await expect(page.getByTestId("business-home-summary-sales-count")).toBeVisible();
    await expect(page.getByTestId("business-home-summary-profit-total")).toBeVisible();
    await expect(page.getByTestId("business-home-summary-profit-month")).toBeVisible();
    await expect(page.getByTestId("business-home-primary-action")).toBeVisible();
    await expect(page.getByTestId("business-home-income-list")).toBeVisible();

    await page.goto("/#/goodsOnSale");
    await waitForStableRoute(page);
    await expect(page.getByTestId("goods-on-sale-summary")).toBeVisible();
    await expect(page.getByTestId("goods-on-sale-primary-action")).toBeVisible();
    await expect(page.getByTestId("goods-on-sale-card-cold-wallet")).toBeVisible();
    await expect(page.getByTestId("goods-on-sale-card-ledger-backup")).toBeVisible();

    await page.goto("/#/GoodsSaled");
    await waitForStableRoute(page);
    await expect(page.getByTestId("goods-saled-summary")).toBeVisible();
    await expect(page.getByTestId("goods-saled-primary-action")).toBeVisible();
    await expect(page.getByTestId("goods-saled-card-audit-badge")).toBeVisible();

    await page.goto("/#/SaleGoods");
    await waitForStableRoute(page);
    await expect(page.getByTestId("sale-goods-primary-action")).toBeVisible();
    await expect(page.getByTestId("sale-goods-preview-card")).toBeVisible();
    await expect(page.getByTestId("sale-goods-guidance-card")).toBeVisible();
  });

  test("business empty states remain actionable @business", async ({ page }) => {
    const roleFixture = await mockApi(page, { role: "business" });

    await page.route(/http:\/\/127\.0\.0\.1:16666\/commodity\/getOnSaleGoodInfo\/.+$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, code: 200, msg: "ok", data: [] }),
      });
    });

    await page.route(/http:\/\/127\.0\.0\.1:16666\/commodity\/getGoodSaled\/.+$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, code: 200, msg: "ok", data: [] }),
      });
    });

    await loginFromUi(page, roleFixture.account);
    await waitForStableRoute(page);

    await page.goto("/#/goodsOnSale");
    await waitForStableRoute(page);
    await expect(page.getByTestId("goods-on-sale-empty-state")).toBeVisible();
    await expect(page.getByTestId("goods-on-sale-primary-action")).toBeVisible();

    await page.goto("/#/GoodsSaled");
    await waitForStableRoute(page);
    await expect(page.getByTestId("goods-saled-empty-state")).toBeVisible();
    await expect(page.getByTestId("goods-saled-primary-action")).toBeVisible();
  });

  test("business sale payload stays unchanged @business", async ({ page }) => {
    const roleFixture = await mockApi(page, { role: "business" });
    let capturedPayload = null;

    await page.route("http://127.0.0.1:16666/commodity/sale", async (route) => {
      capturedPayload = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, code: 200, msg: "商品上架成功", data: true }),
      });
    });

    await loginFromUi(page, roleFixture.account);
    await waitForStableRoute(page);
    await page.goto("/#/SaleGoods");
    await waitForStableRoute(page);

    await page.getByLabel("请输入商品名称").fill("Desk Clock");
    await page.getByLabel("请输入商品价格").fill("299");
    await page.getByTestId("sale-goods-primary-action").click();

    await expect(page).toHaveURL(/#\/goodsOnSale$/);
    expect(capturedPayload).toEqual({
      name: "Desk Clock",
      price: "299",
      issuerId: roleFixture.account,
      issuerName: roleFixture.user.name,
    });
  });
});

test.describe("Feedback and upload surfaces", () => {
  test("feedback harness exposes stable snackbar and upload selectors @feedback", async ({ page }) => {
    await mockApi(page, { role: "guest" });
    await page.goto("/#/feedback-harness");
    await expect(page.getByTestId("upload-dropzone")).toBeVisible();

    await page.getByTestId("feedback-trigger-success").click();
    await expect(page.getByTestId("global-message")).toBeVisible();
    await expect(page.getByTestId("global-message")).toContainText("反馈提示已触发");

    await expect(page.getByTestId("upload-dropzone")).toBeVisible();
    await expect(page.getByTestId("upload-primary-cta")).toBeVisible();

    await page.getByTestId("upload-dialog-trigger").click();
    await expect(page.getByTestId("upload-dialog")).toBeVisible();
  });

  test("feedback harness keeps invalid upload behavior backend-free @feedback", async ({ page }) => {
    await mockApi(page, { role: "guest" });
    await page.goto("/#/feedback-harness");
    await expect(page.getByTestId("upload-dropzone")).toBeVisible();

    await page.getByTestId("upload-dropzone").locator('input[type="file"]').setInputFiles({
      name: "notes.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("invalid upload"),
    });
    await page.getByTestId("upload-primary-cta").click();
    await expect(page.getByTestId("global-message")).toContainText("请上传zip/rar/tar/7z格式的文件");

    await page.getByTestId("upload-dialog-trigger").click();
    await expect(page.getByTestId("upload-dialog")).toBeVisible();
    await page.getByTestId("upload-dialog").locator('input[type="file"]').setInputFiles({
      name: "avatar.gif",
      mimeType: "image/gif",
      buffer: Buffer.from("gif"),
    });
    await expect(page.getByTestId("global-message")).toContainText("You can only upload JPG or PNG file!");
  });
});
