const { FIXED_TIMESTAMP, roles, dataFixtures } = require("../fixtures/roles");

function ok(data, msg = "ok") {
  return {
    success: true,
    code: 200,
    msg,
    data,
  };
}

function failed(code, msg) {
  return {
    success: false,
    code,
    msg,
    data: null,
  };
}

async function freezeClock(page) {
  await page.addInitScript((timestamp) => {
    const FixedDate = class extends Date {
      constructor(...args) {
        if (args.length > 0) {
          super(...args);
          return;
        }
        super(timestamp);
      }

      static now() {
        return timestamp;
      }
    };

    window.Date = FixedDate;
  }, FIXED_TIMESTAMP);
}

async function mockApi(page, options = {}) {
  const roleKey = options.role || "guest";
  const roleFixture = roles[roleKey];
  const overrides = options.overrides || {};
  if (!roleFixture) {
    throw new Error(`Unknown fixture role: ${roleKey}`);
  }

  await freezeClock(page);

  await page.route("http://127.0.0.1:16666/**", async (route) => {
    const request = route.request();
    const method = request.method();
    const url = new URL(request.url());
    const pathname = url.pathname;

    const json = (payload, status = 200) =>
      route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(payload),
      });

    if (method === "POST" && pathname === "/login") {
      return json(ok({ token: `${roleKey}-token` }));
    }

    if (method === "POST" && pathname === "/logout") {
      return json(ok(true));
    }

    if (method === "POST" && pathname === "/register") {
      return json(ok({ requestId: "register-001" }, "注册成功"));
    }

    if (method === "GET" && pathname === "/usr/getUserInfo/") {
      if (options.expiredToken) {
        return json(failed(401, "登录已过期，请重新登录"));
      }
      return json(ok({ role: roleFixture.role, user: roleFixture.user }));
    }

    if (method === "GET" && pathname.startsWith("/usr/getBusInfo/")) {
      return json(ok(overrides.businessInfo || dataFixtures.businessInfo));
    }

    if (method === "GET" && pathname.startsWith("/usr/getBusMonthProfit/")) {
      return json(ok(overrides.businessMonthProfit ?? 456));
    }

    if (method === "GET" && pathname.startsWith("/usr/getCusInfo/")) {
      return json(ok(overrides.customerInfo || dataFixtures.customerInfo));
    }

    if (method === "GET" && pathname.startsWith("/usr/getCusMonthSpent/")) {
      return json(ok(overrides.customerMonthSpent ?? 120));
    }

    if (method === "GET" && pathname.startsWith("/usr/getUserAccountList/")) {
      return json(ok(overrides.accountList || []));
    }

    if (method === "GET" && pathname.startsWith("/commodity/getOnSaleGoodInfo/")) {
      return json(ok(overrides.onSaleGoods || dataFixtures.onSaleGoods));
    }

    if (method === "GET" && pathname === "/commodity/getAllOnSaleGoodInfo") {
      return json(ok(overrides.onSaleGoods || dataFixtures.onSaleGoods));
    }

    if (method === "POST" && pathname === "/commodity/sale") {
      return json(ok(true, "商品上架成功"));
    }

    if (method === "GET" && pathname.startsWith("/commodity/getGoodBeBaught/")) {
      return json(ok(overrides.purchasedGoods || dataFixtures.purchasedGoods));
    }

    if (method === "GET" && pathname.startsWith("/commodity/getGoodSaled/")) {
      return json(ok(overrides.soldGoods || dataFixtures.soldGoods));
    }

    if (method === "POST" && pathname === "/trade/buy") {
      return json(ok({ tradeId: 6001 }, "购买成功"));
    }

    if (method === "GET" && pathname === "/usr/getAllBusInfo") {
      return json(ok(dataFixtures.allBusiness));
    }

    if (method === "GET" && pathname === "/usr/getAllCusInfo") {
      return json(ok(dataFixtures.allCustomers));
    }

    if (method === "GET" && pathname === "/commodity/getAllCommodity") {
      return json(ok(dataFixtures.allCommodity));
    }

    if (method === "GET" && pathname === "/trade/getAllTrade") {
      return json(ok(dataFixtures.allTrades));
    }

    return json(failed(404, `Unhandled mocked route: ${method} ${pathname}`), 404);
  });

  return roleFixture;
}

async function loginFromUi(page, account, password = "password123") {
  await page.goto("/#/login");
  await page.waitForLoadState("networkidle");
  const form = page.getByTestId("auth-form");
  const inputs = form.locator("input");
  await inputs.nth(0).fill(account);
  await inputs.nth(1).fill(password);
  await page.getByTestId("auth-primary-cta").click();
}

module.exports = {
  mockApi,
  loginFromUi,
};
