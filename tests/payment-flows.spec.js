const { test, expect } = require("@playwright/test");

const chartStub = `
  window.Chart = function Chart() {
    return {
      destroy() {}
    };
  };
`;

const razorpayStub = `
  window.__razorpayOpenCount = 0;
  window.__lastRazorpayOptions = null;
  window.__autoRazorpayMode = "success";
  window.Razorpay = function Razorpay(options) {
    this.options = options;
    this.handlers = {};
    window.__lastRazorpayOptions = options;
    this.on = (eventName, handler) => {
      this.handlers[eventName] = handler;
    };
    this.open = () => {
      window.__razorpayOpenCount += 1;
      if (window.__autoRazorpayMode === "dismiss") {
        if (options.modal && typeof options.modal.ondismiss === "function") {
          options.modal.ondismiss();
        }
        return;
      }
      if (window.__autoRazorpayMode === "failed") {
        if (typeof this.handlers["payment.failed"] === "function") {
          this.handlers["payment.failed"]({ error: { description: "Synthetic payment failure" } });
        }
        return;
      }
      Promise.resolve().then(() => options.handler({
        razorpay_order_id: options.order_id || "order_test_123",
        razorpay_payment_id: "pay_test_123",
        razorpay_signature: "sig_test_123"
      }));
    };
  };
`;

async function stubThirdPartyAssets(page) {
  await page.route("https://cdn.jsdelivr.net/npm/chart.js", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: chartStub
    });
  });

  await page.route("https://checkout.razorpay.com/v1/checkout.js", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: razorpayStub
    });
  });

  await page.route("https://www.googletagmanager.com/**", async (route) => {
    await route.fulfill({
      status: 204,
      body: ""
    });
  });

  await page.route("https://fonts.googleapis.com/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/css",
      body: ""
    });
  });

  await page.route("https://fonts.gstatic.com/**", async (route) => {
    await route.fulfill({
      status: 204,
      body: ""
    });
  });
}

async function gotoApp(page) {
  await stubThirdPartyAssets(page);
  await page.addInitScript(() => {
    localStorage.setItem("sscranklab_goal_dismissed", "1");
  });
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Individual + Group Dashboard");
}

async function openPlansPanel(page) {
  await page.locator(".nav button[data-panel='plans']").click();
}

async function openToolsPanel(page) {
  await page.locator(".nav button[data-panel='tools']").click();
}

async function switchToTier2(page) {
  await page.locator("#tierModeBtnTier2").click();
  await expect(page.locator("#predictorTier2Box")).toBeVisible();
}

async function mockPaidCheckout(page, expectedPlan) {
  let createOrderPayload = null;
  let verifyPayload = null;

  await page.route("**/api/payment/create-order", async (route) => {
    createOrderPayload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        keyId: "rzp_test_key",
        orderId: `order_${expectedPlan}`,
        amount: expectedPlan * 100,
        currency: "INR",
        description: `Plan ${expectedPlan}`,
        brandName: "SSCRankLab",
        themeColor: "#7c3aed",
        notes: {
          plan: String(expectedPlan)
        }
      })
    });
  });

  await page.route("**/api/payment/verify", async (route) => {
    verifyPayload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        verified: true,
        unlockedPlan: expectedPlan,
        plan: expectedPlan
      })
    });
  });

  return {
    getCreateOrderPayload: () => createOrderPayload,
    getVerifyPayload: () => verifyPayload
  };
}

test("annual plan is accepted by payment API contract", async ({ request }) => {
  const response = await request.post("/api/payment/create-order", {
    data: {
      plan: 899,
      userKey: "payment_api_contract_user"
    }
  });

  const body = await response.json();
  expect(body.error).not.toBe("Invalid plan");
});

test("unlock CTA opens the upgrade modal", async ({ page }) => {
  await gotoApp(page);
  await openToolsPanel(page);
  await switchToTier2(page);

  await page.locator("#predictorOfferCta").click();

  await expect(page.locator("#upgradeModal")).toBeVisible();
  await expect(page.locator("#upgradeModalPayBtn")).toBeVisible();
  await expect(page.locator("#upgradeModalTrialBtn")).toBeVisible();
});

test("plans trial button starts the trial flow", async ({ page }) => {
  await gotoApp(page);
  await openPlansPanel(page);

  await page.locator("#startTrialBtn").click();

  await expect(page.locator("#paymentStatus")).toContainText("trial activated");
  await expect(page.locator("#premiumInput option[value='99']")).toHaveCount(1);
});

test("upgrade modal trial button starts the trial flow", async ({ page }) => {
  await gotoApp(page);
  await openToolsPanel(page);
  await switchToTier2(page);

  await page.locator("#predictorOfferCta").click();
  await page.locator("#upgradeModalTrialBtn").click();

  await expect(page.locator("#paymentStatus")).toContainText("trial activated");
  await expect(page.locator("#topPlanBadge")).toBeVisible();
});

test("monthly plan button opens and completes synthetic Razorpay checkout", async ({ page }) => {
  await gotoApp(page);
  await openPlansPanel(page);
  const paymentMock = await mockPaidCheckout(page, 99);

  await page.locator("#pricingBuyBtn").click();

  await expect.poll(() => paymentMock.getCreateOrderPayload()).not.toBeNull();
  await expect.poll(() => paymentMock.getVerifyPayload()).not.toBeNull();
  expect(paymentMock.getCreateOrderPayload().plan).toBe(99);
  expect(paymentMock.getVerifyPayload().plan).toBe(99);
  await expect(page.locator("#paymentStatus")).toContainText("Monthly Premium ₹99 unlocked successfully");
  await expect(page.locator("#pricingBuyBtn")).toBeDisabled();
});

test("upgrade modal pay button opens and completes synthetic monthly checkout", async ({ page }) => {
  await gotoApp(page);
  await openToolsPanel(page);
  await switchToTier2(page);
  const paymentMock = await mockPaidCheckout(page, 99);

  await page.locator("#predictorOfferCta").click();
  await page.locator("#upgradeModalPayBtn").click();

  await expect.poll(() => paymentMock.getCreateOrderPayload()).not.toBeNull();
  await expect.poll(() => paymentMock.getVerifyPayload()).not.toBeNull();
  expect(paymentMock.getCreateOrderPayload().plan).toBe(99);
  await expect(page.locator("#paymentStatus")).toContainText("Monthly Premium ₹99 unlocked successfully");
});

test("annual plan button opens and completes synthetic yearly checkout", async ({ page }) => {
  await gotoApp(page);
  await openPlansPanel(page);
  const paymentMock = await mockPaidCheckout(page, 899);

  await page.locator("#pricingBuy899Btn").click();

  await expect.poll(() => paymentMock.getCreateOrderPayload()).not.toBeNull();
  await expect.poll(() => paymentMock.getVerifyPayload()).not.toBeNull();
  expect(paymentMock.getCreateOrderPayload().plan).toBe(899);
  expect(paymentMock.getVerifyPayload().plan).toBe(899);
  await expect(page.locator("#paymentStatus")).toContainText("Premium Plus ₹899/year unlocked successfully");
  await expect(page.locator("#pricingBuy899Btn")).toBeDisabled();
});