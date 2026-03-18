document.addEventListener("DOMContentLoaded", function () {
  ensureUserKey();
  restoreUnlockedPlan();
  initCharts();

  const predictBtn = document.getElementById("btnRankPredictor");
  if (predictBtn) {
    predictBtn.addEventListener("click", predictRank);
  }

  bindUnlockButtons();
});

let rankChartInstance = null;
let sectionChartInstance = null;

function bindUnlockButtons() {
  const unlockButtons = document.querySelectorAll(".js-unlock-plan");
  unlockButtons.forEach((button) => {
    if (button.dataset.bound === "true") return;

    button.dataset.bound = "true";
    button.addEventListener("click", async function () {
      const plan = Number(button.dataset.plan || 0);
      if (!plan) return;
      await startRazorpayUnlock(plan, button);
    });
  });
}

function ensureUserKey() {
  try {
    let userKey = localStorage.getItem("sscranklab_user_key");

    if (!userKey) {
      userKey = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem("sscranklab_user_key", userKey);
    }

    return userKey;
  } catch (err) {
    console.error("ensureUserKey error:", err);
    return `guest_fallback_${Date.now()}`;
  }
}

function getUserKey() {
  try {
    return localStorage.getItem("sscranklab_user_key") || ensureUserKey();
  } catch (err) {
    console.error("getUserKey error:", err);
    return ensureUserKey();
  }
}

function saveUnlockedPlan(plan) {
  try {
    localStorage.setItem("sscranklab_unlocked_plan", String(plan));
  } catch (err) {
    console.error("saveUnlockedPlan error:", err);
  }
}

function getUnlockedPlan() {
  try {
    return Number(localStorage.getItem("sscranklab_unlocked_plan") || 0);
  } catch (err) {
    console.error("getUnlockedPlan error:", err);
    return 0;
  }
}

function savePaymentMeta({ paymentId = "", orderId = "" } = {}) {
  try {
    if (paymentId) {
      localStorage.setItem("sscranklab_payment_id", paymentId);
    }
    if (orderId) {
      localStorage.setItem("sscranklab_order_id", orderId);
    }
  } catch (err) {
    console.error("savePaymentMeta error:", err);
  }
}

function updatePremiumOptions(unlockedPlan = 0) {
  const premiumInput = document.getElementById("premiumInput");
  if (!premiumInput) return;

  const previousValue = Number(premiumInput.value || 0);

  premiumInput.innerHTML = `<option value="0">Free</option>`;

  if (unlockedPlan >= 49) {
    premiumInput.insertAdjacentHTML(
      "beforeend",
      `<option value="49">Premium ₹49 (Unlocked)</option>`
    );
  }

  if (unlockedPlan >= 99) {
    premiumInput.insertAdjacentHTML(
      "beforeend",
      `<option value="99">Premium ₹99 (Unlocked)</option>`
    );
  }

  if (previousValue > 0 && previousValue <= unlockedPlan) {
    premiumInput.value = String(previousValue);
  } else if (unlockedPlan >= 49) {
    premiumInput.value = String(unlockedPlan >= 99 ? 99 : 49);
  } else {
    premiumInput.value = "0";
  }
}

function restoreUnlockedPlan() {
  const savedPlan = getUnlockedPlan();
  updatePremiumOptions(savedPlan);

  if (savedPlan === 49 || savedPlan === 99) {
    showPaymentStatus(`Premium ₹${savedPlan} already unlocked.`, "success");
    hideUnlockedPlanButtons(savedPlan);
  }
}

function getPlanName(plan) {
  if (Number(plan) === 99) return "Premium ₹99";
  if (Number(plan) === 49) return "Premium ₹49";
  return `Plan ₹${plan}`;
}

function hideUnlockedPlanButtons(unlockedPlan) {
  const unlockButtons = document.querySelectorAll(".js-unlock-plan");
  unlockButtons.forEach((button) => {
    const buttonPlan = Number(button.dataset.plan || 0);
    if (buttonPlan > 0 && buttonPlan <= Number(unlockedPlan || 0)) {
      button.classList.add("hidden");
      button.disabled = true;
    }
  });
}

function showButtonLoading(triggerButton, loadingText = "Processing...") {
  if (!triggerButton) return "";

  const originalText = triggerButton.innerHTML;
  triggerButton.disabled = true;
  triggerButton.innerHTML = loadingText;
  triggerButton.classList.add("opacity-80", "cursor-not-allowed");
  return originalText;
}

function resetButtonLoading(triggerButton, originalText = "") {
  if (!triggerButton) return;

  triggerButton.disabled = false;
  triggerButton.innerHTML = originalText;
  triggerButton.classList.remove("opacity-80", "cursor-not-allowed");
}

async function startRazorpayUnlock(plan, triggerButton = null) {
  const originalText = showButtonLoading(triggerButton, "Starting payment...");

  try {
    const userKey = getUserKey();
    const currentUnlocked = getUnlockedPlan();

    if (currentUnlocked >= plan) {
      showPaymentStatus(`${getPlanName(plan)} already unlocked.`, "success");
      hideUnlockedPlanButtons(currentUnlocked);
      updatePremiumOptions(currentUnlocked);
      return;
    }

    if (typeof window.Razorpay === "undefined") {
      throw new Error("Razorpay SDK not loaded. Check index.html script tag.");
    }

    const createOrderResponse = await fetch("/api/payment/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        plan,
        userKey
      })
    });

    let orderData = {};
    try {
      orderData = await createOrderResponse.json();
    } catch (err) {
      throw new Error("Invalid order response from server");
    }

    if (!createOrderResponse.ok || !orderData.success) {
      throw new Error(orderData.error || "Unable to create payment order");
    }

    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency || "INR",
      name: orderData.brandName || "SSCRankLab",
      description: orderData.description || `${getPlanName(plan)} Unlock`,
      order_id: orderData.orderId,
      prefill: orderData.prefill || {},
      notes: orderData.notes || {},
      theme: {
        color: orderData.themeColor || "#7c3aed"
      },
      handler: async function (response) {
        try {
          showPaymentStatus("Verifying payment...", "info");

          const verifyResponse = await fetch("/api/payment/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              plan,
              userKey,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          let verifyData = {};
          try {
            verifyData = await verifyResponse.json();
          } catch (err) {
            throw new Error("Invalid verification response from server");
          }

          if (!verifyResponse.ok || !verifyData.success || !verifyData.verified) {
            throw new Error(verifyData.error || "Payment verification failed");
          }

          const newUnlockedPlan = Math.max(
            Number(verifyData.unlockedPlan || 0),
            Number(plan || 0),
            Number(getUnlockedPlan() || 0)
          );

          saveUnlockedPlan(newUnlockedPlan);
          savePaymentMeta({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id
          });

          updatePremiumOptions(newUnlockedPlan);
          hideUnlockedPlanButtons(newUnlockedPlan);

          const premiumInput = document.getElementById("premiumInput");
          if (premiumInput) {
            premiumInput.value = String(plan);
          }

          showPaymentStatus(
            `${getPlanName(plan)} unlocked successfully.`,
            "success"
          );

          const marksInput = document.getElementById("marksInput");
          const categoryInput = document.getElementById("categoryInput");
          const marks = Number(marksInput?.value);
          const category = categoryInput?.value || "";

          if (Number.isFinite(marks) && marks >= 0 && category) {
            await predictRank();
          } else {
            const predictorSection = document.getElementById("predictor");
            if (predictorSection) {
              predictorSection.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          showPaymentStatus(error.message || "Payment verification failed", "error");
        }
      },
      modal: {
        ondismiss: function () {
          showPaymentStatus("Payment cancelled.", "info");
        }
      }
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", function (response) {
      const description =
        response?.error?.description ||
        response?.error?.reason ||
        "Payment failed. Please try again.";
      showPaymentStatus(description, "error");
    });

    resetButtonLoading(triggerButton, originalText);
    rzp.open();
  } catch (error) {
    console.error("startRazorpayUnlock error:", error);
    showPaymentStatus(error.message || "Unable to start payment", "error");
    resetButtonLoading(triggerButton, originalText);
  }
}

function showPaymentStatus(message, type = "info") {
  const statusDiv = document.getElementById("paymentStatus");
  if (!statusDiv) return;

  const styleMap = {
    info: "border-blue-200 bg-blue-50 text-blue-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    error: "border-red-200 bg-red-50 text-red-700"
  };

  statusDiv.className = `fixed top-24 right-4 z-[60] max-w-sm border shadow-2xl rounded-2xl px-4 py-3 ${styleMap[type] || styleMap.info}`;
  statusDiv.innerHTML = `
    <div class="font-semibold">${escapeHtml(message)}</div>
  `;
  statusDiv.classList.remove("hidden");

  clearTimeout(showPaymentStatus._timer);
  showPaymentStatus._timer = setTimeout(() => {
    statusDiv.classList.add("hidden");
  }, 3200);
}

async function predictRank() {
  const marks = Number(document.getElementById("marksInput")?.value);
  const category = document.getElementById("categoryInput")?.value;
  const selectedPlan = Number(document.getElementById("premiumInput")?.value || 0);
  const unlockedPlan = getUnlockedPlan();
  const userKey = getUserKey();
  const plan = selectedPlan > 0 ? Math.min(selectedPlan, unlockedPlan) : 0;

  const resultDiv = document.getElementById("rankResult");
  if (!resultDiv) return;

  if (!Number.isFinite(marks) || marks < 0) {
    resultDiv.innerHTML = `
      <div class="bg-red-50 border border-red-200 text-red-700 font-semibold p-4 rounded-2xl shadow-sm">
        Enter valid marks first.
      </div>
    `;
    return;
  }

  if (!category) {
    resultDiv.innerHTML = `
      <div class="bg-red-50 border border-red-200 text-red-700 font-semibold p-4 rounded-2xl shadow-sm">
        Select category.
      </div>
    `;
    return;
  }

  if (selectedPlan > unlockedPlan) {
    updatePremiumOptions(unlockedPlan);
    resultDiv.innerHTML = `
      <div class="bg-red-50 border border-red-200 text-red-700 font-semibold p-4 rounded-2xl shadow-sm">
        Premium plan not unlocked yet.
      </div>
    `;
    return;
  }

  resultDiv.innerHTML = `
    <div class="bg-white border border-gray-200 p-5 rounded-3xl shadow-lg">
      <div class="flex items-center gap-3">
        <div class="w-5 h-5 rounded-full border-2 border-gray-300 border-t-blue-600 animate-spin"></div>
        <div>
          <div class="font-semibold text-gray-800">Calculating from real data…</div>
          <div class="text-sm text-gray-500">Analyzing score, category pool, and prediction model.</div>
        </div>
      </div>
    </div>
  `;

  try {
    const apiUrl = "/api/predict-v2";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        examKey: "ssc_cgl",
        score: marks,
        category,
        plan,
        userKey
      })
    });

    let data = {};
    try {
      data = await response.json();
    } catch (jsonErr) {
      throw new Error("Invalid JSON response from server");
    }

    console.log("PREDICT-V2 RESPONSE:", data);

    if (!response.ok || !data.success) {
      resultDiv.innerHTML = `
        <div class="bg-white border border-red-100 p-6 rounded-3xl shadow-lg">
          <div class="text-red-600 font-bold mb-2 text-lg">Prediction failed</div>
          <div class="text-gray-600 text-sm">${escapeHtml(data?.error || "Unknown error")}</div>
        </div>
      `;
      return;
    }

    saveUnlockedPlan(Number(data.unlockedPlan || data.plan || 0));
    updatePremiumOptions(Number(data.unlockedPlan || data.plan || 0));
    hideUnlockedPlanButtons(Number(data.unlockedPlan || data.plan || 0));

    renderResult(data);
  } catch (e) {
    console.error("predictRank error:", e);
    resultDiv.innerHTML = `
      <div class="bg-white border border-red-100 p-6 rounded-3xl shadow-lg">
        <div class="text-red-600 font-bold mb-2 text-lg">Server connection error</div>
        <div class="text-gray-600 text-sm">
          Make sure backend is running on <span class="font-semibold">http://localhost:3000</span>
        </div>
        <div class="text-xs text-gray-500 mt-2">${escapeHtml(e.message || "Unknown connection error")}</div>
      </div>
    `;
  }
}

function renderResult(data) {
  const resultDiv = document.getElementById("rankResult");
  if (!resultDiv) return;

  const plan = Number(data.plan || 0);

  const modeLabel =
    data.mode === "computer_qualified_raw"
      ? "Computer-Qualified Pool"
      : "All Candidates Pool";

  const estRank = firstDefined(
    data.estimatedRank,
    data.rank,
    data.predictedRank,
    "—"
  );

  const total = firstDefined(
    data.totalStudents,
    data.poolSize,
    data.total,
    null
  );

  const category = String(firstDefined(data.category, "")).toUpperCase();

  const categoryRankValue = firstDefined(data.categoryRank, data.category_rank, "—");

  const percentileRaw =
    data.percentile != null
      ? `${data.percentile}%`
      : data.percentileValue != null
        ? `${data.percentileValue}%`
        : "—";

  const percentileHelp =
    data.insights?.percentileExplanation ||
    "Percentile means the percentage of candidates you scored higher than.";

  resultDiv.innerHTML = `
    <div class="bg-white/95 border border-gray-200 p-6 md:p-8 rounded-3xl shadow-2xl">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <h3 class="text-3xl font-black text-gray-900">Your Result</h3>
        <span class="text-sm px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-semibold">
          ${escapeHtml(modeLabel)} • Plan ₹${escapeHtml(String(plan))}
        </span>
      </div>

      <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        ${renderMetricCard({
          title: "Estimated Rank",
          value: estRank,
          subtitle: total ? `Out of ${total}` : "",
          locked: false,
          tone: "blue"
        })}

        ${
          plan >= 49
            ? renderMetricCard({
                title: `Category Rank (${category})`,
                value: categoryRankValue,
                subtitle: plan >= 99 ? "Included in Premium" : "Unlocked in ₹49",
                locked: false,
                tone: "emerald"
              })
            : renderLockedMetricCard({
                title: `Category Rank (${category})`,
                previewValue: categoryRankValue,
                subtitle: "Unlock exact category position",
                lockText: "Unlock ₹49",
                plan: 49
              })
        }

        ${
          plan >= 49
            ? renderMetricCard({
                title: "Percentile",
                value: percentileRaw,
                subtitle: plan >= 99 ? `Included in Premium • ${percentileHelp}` : percentileHelp,
                locked: false,
                tone: "indigo"
              })
            : renderLockedMetricCard({
                title: "Percentile",
                previewValue: percentileRaw,
                subtitle: "Unlock percentile insight",
                lockText: "Unlock ₹49",
                plan: 49
              })
        }
      </div>

      ${plan < 49 ? renderUpgradePanel49() : ""}

      ${plan >= 49 && plan < 99 ? renderPartialAdvancedPreview(data) : ""}

      ${plan >= 99 ? renderInsightsBlock(data.insights || {}, data.postChances || {}) : ""}
    </div>
  `;

  bindUnlockButtons();
  hideUnlockedPlanButtons(getUnlockedPlan());
}

function renderMetricCard({
  title = "",
  value = "—",
  subtitle = "",
  locked = false,
  tone = "blue"
}) {
  const toneClasses = getToneClasses(tone);

  return `
    <div class="p-5 rounded-3xl border ${toneClasses.card} shadow-sm">
      <div class="text-sm ${toneClasses.label}">${escapeHtml(String(title))}</div>
      <div class="text-2xl md:text-3xl font-black ${toneClasses.value} mt-2">
        ${escapeHtml(String(value))}
      </div>
      <div class="text-sm ${toneClasses.sub} mt-2 leading-relaxed">
        ${escapeHtml(String(subtitle || ""))}
      </div>
    </div>
  `;
}

function renderLockedMetricCard({
  title = "",
  previewValue = "—",
  subtitle = "",
  lockText = "Unlock",
  plan = 49
}) {
  return `
    <div class="relative p-5 rounded-3xl border bg-slate-50 shadow-sm overflow-hidden min-h-[150px]">
      <div class="absolute inset-0 bg-white/78 backdrop-blur-[3px] flex items-center justify-center z-10 pointer-events-none">
        <div class="text-center px-4">
          <button
            type="button"
            class="js-unlock-plan pointer-events-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold shadow hover:opacity-90 transition"
            data-plan="${plan}"
          >
            <span>🔒</span>
            <span>${escapeHtml(lockText)}</span>
          </button>
        </div>
      </div>

      <div class="text-sm text-gray-500">${escapeHtml(String(title))}</div>
      <div class="text-2xl md:text-3xl font-black text-gray-400 mt-2">
        ${escapeHtml(String(previewValue))}
      </div>
      <div class="text-sm text-gray-400 mt-2 leading-relaxed">
        ${escapeHtml(String(subtitle))}
      </div>
    </div>
  `;
}

function renderUpgradePanel49() {
  return `
    <div class="mt-6 rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-6 shadow-sm">
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div class="text-xl font-bold text-gray-900">Unlock deeper rank clarity in ₹49</div>
          <div class="text-gray-600 mt-2 max-w-2xl">
            Get exact category rank, percentile, and a sharper position view based on the qualified candidate pool.
          </div>

          <div class="grid sm:grid-cols-3 gap-3 mt-5">
            <div class="rounded-2xl border bg-white p-4 text-sm text-gray-700">✅ Exact category rank</div>
            <div class="rounded-2xl border bg-white p-4 text-sm text-gray-700">✅ Percentile insight</div>
            <div class="rounded-2xl border bg-white p-4 text-sm text-gray-700">✅ Better rank-position clarity</div>
          </div>
        </div>

        <div class="shrink-0">
          <button
            type="button"
            class="js-unlock-plan px-5 py-3 rounded-2xl bg-emerald-600 text-white font-semibold shadow hover:bg-emerald-700 transition"
            data-plan="49"
          >
            Premium ₹49
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderPartialAdvancedPreview(data) {
  const insights = data.insights || {};
  const postChances = data.postChances || {};

  const selectionChance = postChances?.selectionChance || null;

  const seatPosition =
    selectionChance &&
    Number(selectionChance.categoryRank) <= Number(selectionChance.categorySeats)
      ? "Within Seat Range"
      : "Advanced Insight";

  const scoreZone = insights?.scoreZone || "Competitive Zone";

  const whatIfPreview =
    insights?.whatIf
      ? `+2 → ~${insights.whatIf.plus2Rank ?? "—"}, +5 → ~${insights.whatIf.plus5Rank ?? "—"}`
      : "What-if rank jump analysis";

  return `
    <div class="mt-6">
      <div class="rounded-3xl border border-purple-200 bg-gradient-to-r from-purple-50 to-white p-6 shadow-sm">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div class="text-xl font-bold text-gray-900">₹99 Advanced Insights 🔒</div>
            <div class="text-gray-600 mt-2 max-w-3xl">
              Unlock overall seat position, score zone, what-if rank jumps, competition density, and post chances.
            </div>
          </div>
          <button
            type="button"
            class="js-unlock-plan px-5 py-3 rounded-2xl bg-purple-600 text-white font-semibold shadow hover:bg-purple-700 transition"
            data-plan="99"
          >
            Unlock ₹99
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          ${renderLockedPreviewCard("Overall Seat Position", seatPosition, "Based on category rank vs total category vacancies", 99)}
          ${renderLockedPreviewCard("Score Zone", scoreZone, "Advanced decision insight", 99)}
          ${renderLockedPreviewCard("What-if Rank Jump", whatIfPreview, "See how rank may improve with higher marks", 99)}
        </div>
      </div>
    </div>
  `;
}

function renderLockedPreviewCard(title, value, note, plan = 99) {
  return `
    <div class="relative rounded-2xl border bg-white p-5 overflow-hidden">
      <div class="absolute inset-0 bg-white/75 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
        <button
          type="button"
          class="js-unlock-plan pointer-events-auto px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold shadow hover:opacity-90 transition"
          data-plan="${plan}"
        >
          Unlock ₹${escapeHtml(String(plan))}
        </button>
      </div>
      <div class="text-sm text-gray-500">${escapeHtml(String(title))}</div>
      <div class="text-2xl font-black text-gray-400 mt-2">${escapeHtml(String(value || "—"))}</div>
      <div class="text-sm text-gray-400 mt-2">${escapeHtml(String(note || ""))}</div>
    </div>
  `;
}

function renderInsightsBlock(insights = {}, postChances = {}) {
  const selectionChance = postChances?.selectionChance || null;
  const ladder = Array.isArray(postChances?.ladder) ? postChances.ladder : [];
  const items = Array.isArray(postChances?.items) ? postChances.items : [];

  const selectionChanceCard = `
    <div class="p-5 rounded-3xl border bg-white shadow-sm">
      <div class="text-sm text-gray-500">Overall Seat Position</div>
      ${
        selectionChance
          ? `
            <div class="text-2xl font-black text-gray-900 mt-2">
              ${
                Number(selectionChance.categoryRank) <= Number(selectionChance.categorySeats)
                  ? "Within Seat Range"
                  : "Outside Seat Range"
              }
            </div>
            <div class="text-sm text-gray-700 mt-2">
              Based on category rank vs total category vacancies
            </div>
            <div class="text-xs text-gray-500 mt-2 leading-relaxed">
              Category Seats: ${escapeHtml(String(selectionChance.categorySeats ?? "—"))} |
              Category Rank: ${escapeHtml(String(selectionChance.categoryRank ?? "—"))}
            </div>
            <div class="text-xs text-gray-500 mt-2 leading-relaxed">
              Post-wise chances are shown below.
            </div>
          `
          : `
            <div class="text-sm text-red-600 mt-3">Not available</div>
          `
      }
    </div>
  `;

  const scoreZoneCard =
    insights?.scoreZone
      ? `
        <div class="p-5 rounded-3xl border bg-white shadow-sm">
          <div class="text-sm text-gray-500">Score Zone</div>
          <div class="text-2xl font-black text-gray-900 mt-2">${escapeHtml(insights.scoreZone)}</div>
          <div class="text-sm text-gray-500 mt-2 leading-relaxed">${escapeHtml(insights.note || "")}</div>
        </div>
      `
      : "";

  const whatIfCard =
    insights?.whatIf
      ? `
        <div class="p-5 rounded-3xl border bg-white shadow-sm">
          <div class="text-sm text-gray-500">What-if Rank Jump</div>
          <div class="text-gray-800 mt-3 text-sm leading-7">
            +2 marks → ~${escapeHtml(String(insights.whatIf.plus2Rank ?? "—"))} rank<br/>
            +5 marks → ~${escapeHtml(String(insights.whatIf.plus5Rank ?? "—"))} rank
          </div>
        </div>
      `
      : "";

  const densityCard =
    insights?.density
      ? `
        <div class="p-5 rounded-3xl border bg-white shadow-sm">
          <div class="text-sm text-gray-500">Competition Density</div>
          <div class="text-gray-800 mt-3 text-sm leading-relaxed">
            In your range (±5 marks): ~${escapeHtml(String(insights.density.candidatesInBand ?? "—"))} candidates
          </div>
        </div>
      `
      : "";

  const ladderSourceItems = items.length > 0 ? items : ladder;

  const ladderBlock =
    ladderSourceItems.length > 0
      ? `
        <div class="mt-6 p-5 rounded-3xl border bg-white shadow-sm">
          <div class="font-bold text-xl text-gray-900 mb-4">Post Probability Ladder</div>
          <div class="space-y-3">
            ${ladderSourceItems.map((p) => `
              <div class="flex justify-between items-center gap-4 border rounded-2xl p-4">
                <div>
                  <div class="font-semibold text-gray-900">${escapeHtml(p.post || "—")}</div>
                  ${
                    p.department
                      ? `<div class="text-xs text-gray-500 mt-1">${escapeHtml(p.department)}</div>`
                      : ""
                  }
                  <div class="text-xs text-gray-500 mt-1">
                    Score Gap: ${escapeHtml(String(p.scoreGap ?? "—"))}
                  </div>
                </div>
                <div class="font-semibold text-indigo-700 whitespace-nowrap">
                  ${escapeHtml(p.ladderLevel || p.level || p.likelihoodBand || "—")}
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      `
      : "";

  const postBlock =
    items.length > 0
      ? `
        <div class="mt-6 p-5 rounded-3xl border bg-white shadow-sm">
          <div class="font-bold text-xl text-gray-900 mb-4">Best Possible Posts</div>
          <div class="space-y-4">
            ${items.map((p) => `
              <div class="border rounded-2xl p-4">
                <div class="flex justify-between gap-4">
                  <div>
                    <div class="font-semibold text-gray-900">${escapeHtml(p.post || "—")}</div>
                    ${p.department ? `<div class="text-xs text-gray-500 mt-1">${escapeHtml(p.department)}</div>` : ""}
                  </div>
                  <div class="font-semibold text-indigo-700 whitespace-nowrap">${escapeHtml(p.likelihoodBand || "—")}</div>
                </div>
                <div class="text-sm text-gray-600 mt-3">
                  Cutoff: ${escapeHtml(String(p.cutoff ?? "—"))} | Score Gap: ${escapeHtml(String(p.scoreGap ?? "—"))}
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      `
      : `
        <div class="mt-6 p-5 rounded-3xl border bg-white shadow-sm">
          <div class="font-bold text-xl text-gray-900">Post Chances</div>
          <div class="text-red-500 text-sm mt-3">Not available yet.</div>
        </div>
      `;

  return `
    <div class="mt-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${selectionChanceCard}
        ${scoreZoneCard}
        ${whatIfCard}
        ${densityCard}
      </div>
      ${ladderBlock}
      ${postBlock}
    </div>
  `;
}

function getToneClasses(tone) {
  const map = {
    blue: {
      card: "bg-blue-50 border-blue-100",
      label: "text-blue-700",
      value: "text-gray-900",
      sub: "text-gray-600"
    },
    emerald: {
      card: "bg-emerald-50 border-emerald-100",
      label: "text-emerald-700",
      value: "text-gray-900",
      sub: "text-gray-600"
    },
    indigo: {
      card: "bg-indigo-50 border-indigo-100",
      label: "text-indigo-700",
      value: "text-gray-900",
      sub: "text-gray-600"
    }
  };

  return map[tone] || map.blue;
}

function initCharts() {
  const rankCtx = document.getElementById("rankChart");
  if (rankCtx && typeof Chart !== "undefined") {
    if (rankChartInstance) {
      rankChartInstance.destroy();
    }

    rankChartInstance = new Chart(rankCtx, {
      type: "line",
      data: {
        labels: ["Mock1", "Mock2", "Mock3", "Mock4", "Mock5"],
        datasets: [{
          label: "Rank Trend",
          data: [8000, 6200, 5200, 4300, 3800],
          borderWidth: 3,
          tension: 0.35
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  const sectionCtx = document.getElementById("sectionChart");
  if (sectionCtx && typeof Chart !== "undefined") {
    if (sectionChartInstance) {
      sectionChartInstance.destroy();
    }

    sectionChartInstance = new Chart(sectionCtx, {
      type: "bar",
      data: {
        labels: ["Quant", "Reasoning", "English", "GA"],
        datasets: [{
          label: "Score",
          data: [42, 45, 38, 33],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
}

function firstDefined(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null) return value;
  }
  return null;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}