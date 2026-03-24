document.addEventListener("DOMContentLoaded", function () {
  ensureUserKey();
  restoreUnlockedPlan();
  initCharts();

  const testDateInput = document.getElementById("testDate");
  if (testDateInput && !testDateInput.value) {
    testDateInput.value = new Date().toISOString().split("T")[0];
  }

  const predictBtn = document.getElementById("btnRankPredictor");
  if (predictBtn) {
    predictBtn.addEventListener("click", predictRank);
  }

  const saveMarksBtn = document.getElementById("saveMarksBtn");
  if (saveMarksBtn) {
    saveMarksBtn.addEventListener("click", saveMarks);
  }

  const benchmarkModeEl = document.getElementById("benchmarkMode");
  if (benchmarkModeEl) {
    benchmarkModeEl.addEventListener("change", handleBenchmarkModeChange);
  }

  const prevCutoffEl = document.getElementById("previousCutoffInput");
  if (prevCutoffEl) {
    prevCutoffEl.addEventListener("input", handleBenchmarkModeChange);
  }

  const saveBenchmarkBtn = document.getElementById("saveBenchmarkBtn");
  if (saveBenchmarkBtn) {
    saveBenchmarkBtn.addEventListener("click", saveBenchmarkProfile);
  }

  const loadQuestionsBtn = document.getElementById("btnLoadQuestions");
  if (loadQuestionsBtn) {
    loadQuestionsBtn.addEventListener("click", loadQuestionLabItems);
  }

  const generateMockBtn = document.getElementById("btnGenerateMock");
  if (generateMockBtn) {
    generateMockBtn.addEventListener("click", generateMockFromLab);
  }

  const startTrialBtn = document.getElementById("startTrialBtn");
  if (startTrialBtn) {
    startTrialBtn.addEventListener("click", function () {
      startFreeTrial(startTrialBtn);
    });
  }

  bindUnlockButtons();
  loadBenchmarkProfile();
  loadMarksHistory();
  loadQuestionLabItems();
  syncPaymentStatus();
  setInterval(syncPaymentStatus, 60000);

  const navOpenGoalBtn = document.getElementById("navOpenGoal");
  if (navOpenGoalBtn) {
    navOpenGoalBtn.addEventListener("click", function (e) {
      e.preventDefault();
      showGoalModal();
    });
  }

  const closeGoalModalBtn = document.getElementById("closeGoalModal");
  if (closeGoalModalBtn) {
    closeGoalModalBtn.addEventListener("click", closeGoalModal);
  }

  const saveGoalBtnEl = document.getElementById("saveGoalBtn");
  if (saveGoalBtnEl) {
    saveGoalBtnEl.addEventListener("click", saveGoalProfile);
  }

  const goalTargetPostEl = document.getElementById("goalTargetPost");
  if (goalTargetPostEl) {
    goalTargetPostEl.addEventListener("change", applyGoalAutoCutoff);
  }

  const goalCategoryEl = document.getElementById("goalCategory");
  if (goalCategoryEl) {
    goalCategoryEl.addEventListener("change", applyGoalAutoCutoff);
  }

  const goalExamFamilyEl = document.getElementById("goalExamFamily");
  if (goalExamFamilyEl) {
    goalExamFamilyEl.addEventListener("change", async function () {
      await loadGoalCutoffCatalog();
      applyGoalAutoCutoff();
    });
  }

  const goalTierEl = document.getElementById("goalTier");
  if (goalTierEl) {
    goalTierEl.addEventListener("change", async function () {
      await loadGoalCutoffCatalog();
      applyGoalAutoCutoff();
    });
  }

  const skipGoalBtnEl = document.getElementById("skipGoalBtn");
  if (skipGoalBtnEl) {
    skipGoalBtnEl.addEventListener("click", closeGoalModal);
  }

  const goalModalEl = document.getElementById("goalModal");
  if (goalModalEl) {
    goalModalEl.addEventListener("click", function (e) {
      if (e.target === goalModalEl) closeGoalModal();
    });
  }

  loadGoalCutoffCatalog();
  setTimeout(checkGoalOnboarding, 900);
});

let rankChartInstance = null;
let sectionChartInstance = null;
let progressChartInstance = null;
let subjectChartInstance = null;
let benchmarkProfile = null;
let questionLabCache = [];
let goalProfile = null;
let goalCutoffCatalog = null;
let paymentAccessState = {
  unlockedPlan: 0,
  effectivePlan: 0,
  trial: null
};

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
    const currentPlan = Number(localStorage.getItem("sscranklab_unlocked_plan") || 0);
    const finalPlan = Math.max(currentPlan, Number(plan || 0));
    localStorage.setItem("sscranklab_unlocked_plan", String(finalPlan));
  } catch (err) {
    console.error("saveUnlockedPlan error:", err);
  }
}

function setCurrentAccessPlan(plan) {
  try {
    localStorage.setItem("sscranklab_current_access_plan", String(Number(plan || 0)));
  } catch (err) {
    console.error("setCurrentAccessPlan error:", err);
  }
}

function getUnlockedPlan() {
  try {
    const current = Number(localStorage.getItem("sscranklab_current_access_plan") || 0);
    const paid = Number(localStorage.getItem("sscranklab_unlocked_plan") || 0);
    return Math.max(current, paid);
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
  const trialActive = Boolean(paymentAccessState?.trial?.active);

  premiumInput.innerHTML = `<option value="0">Free</option>`;

  if (unlockedPlan >= 49) {
    premiumInput.insertAdjacentHTML(
      "beforeend",
      `<option value="49">Premium ₹49 (${trialActive ? "Trial Access" : "Unlocked"})</option>`
    );
  }

  if (unlockedPlan >= 99) {
    premiumInput.insertAdjacentHTML(
      "beforeend",
      `<option value="99">Premium ₹99 (${trialActive ? "Trial Access" : "Unlocked"})</option>`
    );
  }

  if (previousValue > 0 && previousValue <= unlockedPlan) {
    premiumInput.value = String(previousValue);
  } else if (unlockedPlan >= 49) {
    premiumInput.value = String(unlockedPlan >= 99 ? 99 : 49);
  } else {
    premiumInput.value = "0";
  }

  updatePlanStatusText(unlockedPlan);
}

function restoreUnlockedPlan() {
  const paidPlan = Number(localStorage.getItem("sscranklab_unlocked_plan") || 0);
  setCurrentAccessPlan(paidPlan);
  paymentAccessState.unlockedPlan = paidPlan;
  paymentAccessState.effectivePlan = paidPlan;
  paymentAccessState.trial = null;
  updatePremiumOptions(paidPlan);
  hideUnlockedPlanButtons(paidPlan);
}

function updatePlanStatusText(unlockedPlan = 0) {
  const planStatusText = document.getElementById("planStatusText");
  if (!planStatusText) return;

  const trial = paymentAccessState.trial;
  if (trial && trial.active) {
    const hours = Math.ceil(Number(trial.remainingMs || 0) / (60 * 60 * 1000));
    planStatusText.textContent = `2-day premium trial active (${Math.max(0, hours)}h left). Upgrade to continue exclusive features.`;
    return;
  }

  if (unlockedPlan >= 99) {
    planStatusText.textContent = "₹49 and ₹99 premium unlocked.";
  } else if (unlockedPlan >= 49) {
    planStatusText.textContent = "₹49 premium unlocked.";
  } else {
    planStatusText.textContent = "Free is default. Premium appears only after payment.";
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
    } else {
      button.classList.remove("hidden");
      button.disabled = false;
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

          paymentAccessState = {
            unlockedPlan: newUnlockedPlan,
            effectivePlan: newUnlockedPlan,
            trial: null
          };

          saveUnlockedPlan(newUnlockedPlan);
          setCurrentAccessPlan(newUnlockedPlan);
          savePaymentMeta({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id
          });

          updatePremiumOptions(newUnlockedPlan);
          hideUnlockedPlanButtons(newUnlockedPlan);

          const premiumInput = document.getElementById("premiumInput");
          if (premiumInput && newUnlockedPlan >= plan) {
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
  await syncPaymentStatus();
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

    const localUnlockedPlan = getUnlockedPlan();
    const finalUnlocked = Math.max(
      localUnlockedPlan,
      Number(data.unlockedPlan || 0),
      Number(data.plan || 0)
    );

    saveUnlockedPlan(finalUnlocked);

    setTimeout(() => {
      updatePremiumOptions(finalUnlocked);
    }, 0);

    hideUnlockedPlanButtons(finalUnlocked);

    renderResult({
      ...data,
      unlockedPlan: finalUnlocked
    });
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

function showProgressStatus(message, type = "info") {
  const el = document.getElementById("progressStatus");
  if (!el) return;

  const toneMap = {
    info: "#1e40af",
    success: "#047857",
    error: "#b91c1c"
  };

  el.style.color = toneMap[type] || toneMap.info;
  el.textContent = message || "";
}

function updateProgressSummary(entries) {
  const latestEl = document.getElementById("latestTotalStat");
  const avg7El = document.getElementById("avg7Stat");
  if (!latestEl || !avg7El) return;

  if (!Array.isArray(entries) || entries.length === 0) {
    latestEl.textContent = "--";
    avg7El.textContent = "--";
    return;
  }

  const sorted = [...entries].sort((a, b) => new Date(b.test_date) - new Date(a.test_date));
  const latest = Number(sorted[0]?.total_marks || 0);
  const recent = sorted.slice(0, 7);
  const avg7 = recent.reduce((acc, item) => acc + Number(item.total_marks || 0), 0) / recent.length;

  latestEl.textContent = Number.isFinite(latest) ? latest.toFixed(1) : "--";
  avg7El.textContent = Number.isFinite(avg7) ? avg7.toFixed(1) : "--";
}

function setBenchmarkStatus(message, type = "info") {
  const el = document.getElementById("benchmarkStatusText");
  if (!el) return;

  const toneMap = {
    info: "#0f766e",
    success: "#047857",
    error: "#b91c1c"
  };

  el.style.color = toneMap[type] || toneMap.info;
  el.textContent = message || "";
}

function updateReviewCards({ status = "--", overallGap = "--", prioritySubject = "--" } = {}) {
  const statusEl = document.getElementById("todayStatusValue");
  const gapEl = document.getElementById("overallGapValue");
  const priorityEl = document.getElementById("prioritySubjectValue");

  if (statusEl) statusEl.textContent = status;
  if (gapEl) gapEl.textContent = overallGap;
  if (priorityEl) priorityEl.textContent = prioritySubject;
}

function numFromInput(id, fallback = 0) {
  const n = Number(document.getElementById(id)?.value ?? fallback);
  return Number.isFinite(n) ? n : fallback;
}

function handleBenchmarkModeChange() {
  const mode = String(document.getElementById("benchmarkMode")?.value || "manual_overall");
  const subjectBox = document.getElementById("subjectTargetsBox");
  const prevCutoff = document.getElementById("previousCutoffInput");
  const overallInput = document.getElementById("overallTargetInput");

  if (subjectBox) {
    subjectBox.style.display = mode === "manual_subject" ? "grid" : "none";
  }

  if (prevCutoff) {
    prevCutoff.disabled = !(mode === "cutoff_plus_5" || mode === "cutoff_plus_7");
  }

  if (overallInput) {
    overallInput.disabled = mode === "cutoff_plus_5" || mode === "cutoff_plus_7";
  }

  if ((mode === "cutoff_plus_5" || mode === "cutoff_plus_7") && prevCutoff && overallInput) {
    const cutoff = Number(prevCutoff.value || 0);
    const plus = mode === "cutoff_plus_7" ? 7 : 5;
    if (Number.isFinite(cutoff) && cutoff > 0) {
      overallInput.value = String(Math.min(250, cutoff + plus));
    }
  }
}

function buildBenchmarkPayload() {
  const mode = String(document.getElementById("benchmarkMode")?.value || "manual_overall");
  const previousCutoff = numFromInput("previousCutoffInput", 0);

  let overallTarget = numFromInput("overallTargetInput", 0);
  if (mode === "cutoff_plus_5") overallTarget = Math.min(250, previousCutoff + 5);
  if (mode === "cutoff_plus_7") overallTarget = Math.min(250, previousCutoff + 7);

  const subjectTargets = {
    quant: Math.min(50, numFromInput("quantTargetInput", 0)),
    english: Math.min(50, numFromInput("englishTargetInput", 0)),
    reasoning: Math.min(50, numFromInput("reasoningTargetInput", 0)),
    gk: Math.min(50, numFromInput("gkTargetInput", 0)),
    computer: Math.min(50, numFromInput("computerTargetInput", 0))
  };

  if (mode !== "manual_subject") {
    const per = overallTarget > 0 ? Number((overallTarget / 5).toFixed(1)) : 0;
    subjectTargets.quant = per;
    subjectTargets.english = per;
    subjectTargets.reasoning = per;
    subjectTargets.gk = per;
    subjectTargets.computer = per;
  }

  if (!Number.isFinite(overallTarget) || overallTarget <= 0 || overallTarget > 250) {
    return { error: "Overall target must be between 1 and 250" };
  }

  return {
    benchmark: {
      mode,
      previousCutoff,
      overallTarget: Number(overallTarget.toFixed(1)),
      subjectTargets,
      updatedAt: new Date().toISOString()
    }
  };
}

function applyBenchmarkToUI(benchmark) {
  if (!benchmark) {
    handleBenchmarkModeChange();
    return;
  }

  const modeEl = document.getElementById("benchmarkMode");
  const prevEl = document.getElementById("previousCutoffInput");
  const overallEl = document.getElementById("overallTargetInput");

  if (modeEl) modeEl.value = benchmark.mode || "manual_overall";
  if (prevEl) prevEl.value = Number(benchmark.previousCutoff || 0) || "";
  if (overallEl) overallEl.value = Number(benchmark.overallTarget || 0) || "";

  const sub = benchmark.subjectTargets || {};
  const setIf = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.value = Number(value || 0) || "";
  };

  setIf("quantTargetInput", sub.quant);
  setIf("englishTargetInput", sub.english);
  setIf("reasoningTargetInput", sub.reasoning);
  setIf("gkTargetInput", sub.gk);
  setIf("computerTargetInput", sub.computer);

  handleBenchmarkModeChange();
}

async function loadBenchmarkProfile() {
  const userKey = getUserKey();
  setBenchmarkStatus("Loading benchmark...", "info");

  try {
    const response = await fetch(`/api/user/${encodeURIComponent(userKey)}`);

    if (response.status === 404) {
      benchmarkProfile = null;
      applyBenchmarkToUI(null);
      setBenchmarkStatus("Set your first benchmark target.", "info");
      return;
    }

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Could not load profile");
    }

    benchmarkProfile = data.profile?.benchmark || null;
    goalProfile = data.profile?.goal || null;
    applyBenchmarkToUI(benchmarkProfile);
    setBenchmarkStatus("Benchmark loaded.", "success");
  } catch (err) {
    console.error("loadBenchmarkProfile error:", err);
    applyBenchmarkToUI(null);
    setBenchmarkStatus("Could not load benchmark profile.", "error");
  }
}

async function saveBenchmarkProfile() {
  const userKey = getUserKey();
  const payload = buildBenchmarkPayload();

  if (payload.error) {
    setBenchmarkStatus(payload.error, "error");
    return;
  }

  setBenchmarkStatus("Saving benchmark...", "info");

  try {
    const response = await fetch(`/api/user/${encodeURIComponent(userKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Save failed");
    }

    benchmarkProfile = data.profile?.benchmark || payload.benchmark;
    applyBenchmarkToUI(benchmarkProfile);
    setBenchmarkStatus("Benchmark saved successfully.", "success");
  } catch (err) {
    console.error("saveBenchmarkProfile error:", err);
    setBenchmarkStatus("Failed to save benchmark profile.", "error");
  }
}

function updateBenchmarkReview(entries) {
  if (!benchmarkProfile || !Array.isArray(entries) || entries.length === 0) {
    updateReviewCards();
    return;
  }

  const latest = [...entries].sort((a, b) => new Date(b.test_date) - new Date(a.test_date))[0];
  const targetOverall = Number(benchmarkProfile.overallTarget || 0);
  const currentOverall = Number(latest.total_marks || 0);
  const gap = Number((targetOverall - currentOverall).toFixed(1));

  let status = "On Track";
  if (gap > 15) status = "High Attention";
  else if (gap > 5) status = "Slightly Behind";

  const subjectTargets = benchmarkProfile.subjectTargets || {};
  const subjectScores = {
    quant: Number(latest.quant_marks || 0),
    english: Number(latest.english_marks || 0),
    reasoning: Number(latest.reasoning_marks || 0),
    gk: Number(latest.gk_marks || 0),
    computer: Number(latest.computer_marks || 0)
  };

  let prioritySubject = "--";
  let maxGap = -Infinity;
  Object.keys(subjectScores).forEach((key) => {
    const target = Number(subjectTargets[key] || 0);
    const g = target - subjectScores[key];
    if (g > maxGap) {
      maxGap = g;
      prioritySubject = key;
    }
  });

  const priorityMap = {
    quant: "Quant",
    english: "English",
    reasoning: "Reasoning",
    gk: "GK",
    computer: "Computer"
  };

  updateReviewCards({
    status,
    overallGap: `${gap > 0 ? "-" : "+"}${Math.abs(gap).toFixed(1)}`,
    prioritySubject: priorityMap[prioritySubject] || "--"
  });
}

function setQuestionLabStatus(message, type = "info") {
  const el = document.getElementById("questionLabStatus");
  if (!el) return;

  const toneMap = {
    info: "#4338ca",
    success: "#047857",
    error: "#b91c1c"
  };

  el.style.color = toneMap[type] || toneMap.info;
  el.textContent = message || "";
}

function getQuestionLabFilters() {
  const subject = String(document.getElementById("qlabSubject")?.value || "").trim();
  const difficulty = String(document.getElementById("qlabDifficulty")?.value || "").trim();
  const topic = String(document.getElementById("qlabTopic")?.value || "").trim();
  const count = Math.max(5, Math.min(50, Number(document.getElementById("qlabCount")?.value || 10)));

  return { subject, difficulty, topic, count };
}

function renderQuestionLabItems(items = []) {
  const container = document.getElementById("questionLabList");
  if (!container) return;

  if (!Array.isArray(items) || items.length === 0) {
    container.innerHTML = "<div class='qlab-item'>No items found for selected filters.</div>";
    return;
  }

  container.innerHTML = items.map((item, idx) => {
    const options = Array.isArray(item.options) ? item.options : [];
    const optionRows = options.map((opt, i) => {
      const isAnswer = Number(item.answerIndex) === i;
      return `<div class=\"text-sm ${isAnswer ? "font-semibold text-emerald-700" : "text-slate-700"}\">${String.fromCharCode(65 + i)}. ${escapeHtml(opt)}</div>`;
    }).join("");

    return `
      <div class="qlab-item">
        <div>
          <span class="qlab-chip">${escapeHtml(item.subject || "subject")}</span>
          <span class="qlab-chip">${escapeHtml(item.difficulty || "level")}</span>
          <span class="qlab-chip">${escapeHtml(item.topic || "topic")}</span>
        </div>
        <div class="text-sm text-slate-500 mt-1">Q${idx + 1}</div>
        <div class="font-semibold text-slate-900 mt-2 leading-relaxed">${escapeHtml(item.question || "")}</div>
        <div class="mt-3 space-y-1">${optionRows}</div>
        <div class="text-xs text-slate-500 mt-3">${escapeHtml(item.explanation || "")}</div>
      </div>
    `;
  }).join("");
}

async function loadQuestionLabItems() {
  const { subject, difficulty, topic, count } = getQuestionLabFilters();
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (difficulty) params.set("difficulty", difficulty);
  if (topic) params.set("topic", topic);
  params.set("limit", String(count));

  setQuestionLabStatus("Loading updated questions...", "info");

  try {
    const response = await fetch(`/api/questions?${params.toString()}`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Could not load questions");
    }

    questionLabCache = Array.isArray(data.items) ? data.items : [];
    renderQuestionLabItems(questionLabCache);
    setQuestionLabStatus(`Loaded ${questionLabCache.length} questions.`, "success");
  } catch (err) {
    console.error("loadQuestionLabItems error:", err);
    setQuestionLabStatus("Failed to load questions.", "error");
  }
}

async function generateMockFromLab() {
  const { subject, difficulty, count } = getQuestionLabFilters();
  setQuestionLabStatus("Generating mock set...", "info");

  try {
    const response = await fetch("/api/questions/mocks/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, difficulty, count })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Could not generate mock");
    }

    questionLabCache = Array.isArray(data.items) ? data.items : [];
    renderQuestionLabItems(questionLabCache);
    setQuestionLabStatus(`Mock generated with ${questionLabCache.length} questions.`, "success");
  } catch (err) {
    console.error("generateMockFromLab error:", err);
    setQuestionLabStatus("Failed to generate mock set.", "error");
  }
}

// Progress Tracker Functions
async function saveMarks() {
  const userKey = getUserKey();
  const testDate = document.getElementById("testDate")?.value;
  const quant = Number(document.getElementById("quantMarks")?.value || 0);
  const english = Number(document.getElementById("englishMarks")?.value || 0);
  const reasoning = Number(document.getElementById("reasoningMarks")?.value || 0);
  const gk = Number(document.getElementById("gkMarks")?.value || 0);
  const computer = Number(document.getElementById("computerMarks")?.value || 0);

  if (!testDate) {
    showProgressStatus("Please select a date first.", "error");
    return;
  }

  const marks = [quant, english, reasoning, gk, computer];
  const hasInvalid = marks.some((m) => !Number.isFinite(m) || m < 0 || m > 50);
  if (hasInvalid) {
    showProgressStatus("Each subject mark must be between 0 and 50.", "error");
    return;
  }

  showProgressStatus("Saving your marks...", "info");

  try {
    const response = await fetch("/api/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userKey,
        testDate,
        quant,
        english,
        reasoning,
        gk,
        computer
      })
    });

    const data = await response.json();
    if (data.success) {
      showProgressStatus("Saved successfully. Great consistency.", "success");
      await loadMarksHistory();
      // Clear form
      document.getElementById("quantMarks").value = "";
      document.getElementById("englishMarks").value = "";
      document.getElementById("reasoningMarks").value = "";
      document.getElementById("gkMarks").value = "";
      document.getElementById("computerMarks").value = "";
    } else {
      showProgressStatus("Unable to save: " + (data.error || "Unknown error"), "error");
    }
  } catch (error) {
    console.error("Save marks error:", error);
    showProgressStatus("Server error while saving marks.", "error");
  }
}

async function loadMarksHistory() {
  const userKey = getUserKey();

  try {
    const response = await fetch(`/api/test/${encodeURIComponent(userKey)}`);
    const data = await response.json();

    if (data.success) {
      displayMarksHistory(data.entries);
      drawProgressChart(data.entries);
      drawSubjectChart(data.entries);
      updateProgressSummary(data.entries);
      updateBenchmarkReview(data.entries);
      updateStreakDisplay(data.entries);
      renderWeeklyReport(buildWeeklyReport(data.entries));
      if (!Array.isArray(data.entries) || data.entries.length === 0) {
        showProgressStatus("Start by adding today's marks.", "info");
      }
    }
  } catch (error) {
    console.error("Load marks error:", error);
    showProgressStatus("Could not load progress history.", "error");
  }
}

function displayMarksHistory(entries) {
  const historyDiv = document.getElementById("marksHistory");
  if (!historyDiv) return;

  if (!entries || entries.length === 0) {
    historyDiv.innerHTML = "<p class='text-gray-500'>No marks recorded yet. Start by adding your daily practice marks!</p>";
    return;
  }

  historyDiv.innerHTML = entries.map(entry => `
    <div class="bg-gray-50 p-4 rounded-xl">
      <div class="font-semibold">${new Date(entry.test_date).toLocaleDateString()}</div>
      <div class="grid grid-cols-3 md:grid-cols-6 gap-2 mt-2 text-sm">
        <div>Quant: ${entry.quant_marks}</div>
        <div>English: ${entry.english_marks}</div>
        <div>Reasoning: ${entry.reasoning_marks}</div>
        <div>GK: ${entry.gk_marks}</div>
        <div>Computer: ${entry.computer_marks}</div>
        <div class="font-semibold">Total: ${entry.total_marks}</div>
      </div>
    </div>
  `).join("");
}

function drawProgressChart(entries) {
  const ctx = document.getElementById("progressChart");
  if (!ctx) return;

  if (progressChartInstance) {
    progressChartInstance.destroy();
  }

  if (!entries || entries.length === 0) {
    ctx.style.display = "none";
    return;
  }

  ctx.style.display = "block";

  const sortedEntries = [...entries].sort((a, b) => new Date(a.test_date) - new Date(b.test_date));
  const labels = sortedEntries.map(e => new Date(e.test_date).toLocaleDateString());
  const totals = sortedEntries.map(e => e.total_marks);

  const progressDatasets = [{
    label: "Total Marks",
    data: totals,
    borderColor: "rgb(59, 130, 246)",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    tension: 0.1
  }];

  // Benchmark target line — visible only for ₹99 premium users
  if (getUnlockedPlan() >= 99 && benchmarkProfile && Number(benchmarkProfile.overallTarget) > 0) {
    progressDatasets.push({
      label: "Benchmark Target",
      data: labels.map(() => benchmarkProfile.overallTarget),
      borderColor: "rgb(239, 68, 68)",
      backgroundColor: "transparent",
      borderDash: [6, 4],
      borderWidth: 2,
      pointRadius: 0,
      tension: 0
    });
  }

  progressChartInstance = new Chart(ctx, {
    type: "line",
    data: { labels, datasets: progressDatasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true, max: 250 } }
    }
  });
}

function drawSubjectChart(entries) {
  const ctx = document.getElementById("subjectChart");
  if (!ctx) return;

  if (subjectChartInstance) {
    subjectChartInstance.destroy();
  }

  if (!entries || entries.length === 0) {
    ctx.style.display = "none";
    return;
  }

  ctx.style.display = "block";

  const sortedEntries = [...entries].sort((a, b) => new Date(a.test_date) - new Date(b.test_date));
  const labels = sortedEntries.map(e => new Date(e.test_date).toLocaleDateString());

  subjectChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Quant",
          data: sortedEntries.map(e => e.quant_marks),
          borderColor: "rgb(239, 68, 68)",
          backgroundColor: "rgba(239, 68, 68, 0.1)"
        },
        {
          label: "English",
          data: sortedEntries.map(e => e.english_marks),
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.1)"
        },
        {
          label: "Reasoning",
          data: sortedEntries.map(e => e.reasoning_marks),
          borderColor: "rgb(168, 85, 247)",
          backgroundColor: "rgba(168, 85, 247, 0.1)"
        },
        {
          label: "GK",
          data: sortedEntries.map(e => e.gk_marks),
          borderColor: "rgb(251, 191, 36)",
          backgroundColor: "rgba(251, 191, 36, 0.1)"
        },
        {
          label: "Computer",
          data: sortedEntries.map(e => e.computer_marks),
          borderColor: "rgb(6, 182, 212)",
          backgroundColor: "rgba(6, 182, 212, 0.1)"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 50
        }
      }
    }
  });
}

async function loadGoalCutoffCatalog() {
  const examFamily = String(document.getElementById("goalExamFamily")?.value || "ssc_cgl");
  const tier = String(document.getElementById("goalTier")?.value || "tier1");
  try {
    const response = await fetch(`/api/goals/cutoffs?examFamily=${encodeURIComponent(examFamily)}&tier=${encodeURIComponent(tier)}`);
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Could not load cutoff catalog");
    }
    goalCutoffCatalog = data;
  } catch (err) {
    console.error("loadGoalCutoffCatalog error:", err);
    goalCutoffCatalog = null;
  }
}

function applyGoalAutoCutoff() {
  const post = String(document.getElementById("goalTargetPost")?.value || "").trim();
  const category = String(document.getElementById("goalCategory")?.value || "UR").trim().toUpperCase();
  const selectedTier = String(document.getElementById("goalTier")?.value || "tier1").toLowerCase();
  const autoEl = document.getElementById("goalAutoCutoff");
  const statusEl = document.getElementById("goalModalStatus");

  if (!autoEl) return;
  if (!post || !goalCutoffCatalog || !Array.isArray(goalCutoffCatalog.posts)) {
    autoEl.value = "";
    return;
  }

  const found = goalCutoffCatalog.posts.find((item) => String(item.name || "") === post);
  if (!found || !found.cutoffByCategory) {
    autoEl.value = "";
    if (statusEl) {
      statusEl.textContent = "No mapped cutoff for selected post yet.";
      statusEl.style.color = "#b45309";
    }
    return;
  }

  const cutoff = Number(
    found.cutoffByCategory[category] ?? found.cutoffByCategory.UR ?? 0
  );

  if (!Number.isFinite(cutoff) || cutoff <= 0) {
    autoEl.value = "";
    return;
  }

  autoEl.value = String(Math.round(cutoff));

  const targetScoreEl = document.getElementById("goalTargetScore");
  if (targetScoreEl) {
    targetScoreEl.max = selectedTier === "tier2" ? "600" : "250";
    targetScoreEl.placeholder = selectedTier === "tier2" ? "e.g. 360" : "e.g. 150";
  }

  if (targetScoreEl && !targetScoreEl.value) {
    const cap = selectedTier === "tier2" ? 600 : 250;
    targetScoreEl.value = String(Math.min(cap, Math.round(cutoff + (selectedTier === "tier2" ? 10 : 5))));
  }

  const previousCutoffInput = document.getElementById("previousCutoffInput");
  if (selectedTier !== "tier2" && previousCutoffInput && !previousCutoffInput.value) {
    previousCutoffInput.value = String(Math.round(cutoff));
  }

  if (statusEl) {
    const baseYear = goalCutoffCatalog.baseYear ? String(goalCutoffCatalog.baseYear) : "latest";
    const tierLabel = String(goalCutoffCatalog.tier || "tier1").toUpperCase();
    statusEl.textContent = `Auto cutoff loaded (${tierLabel}, ${baseYear} baseline): ${Math.round(cutoff)}`;
    statusEl.style.color = "#047857";
  }
}

// ============================================================
// GOAL ONBOARDING
// ============================================================
function checkGoalOnboarding() {
  if (!goalProfile) {
    const dismissed = localStorage.getItem("sscranklab_goal_dismissed");
    if (!dismissed) {
      showGoalModal();
    }
  }
}

function showGoalModal() {
  const modal = document.getElementById("goalModal");
  if (!modal) return;
  if (goalProfile) {
    const setVal = (id, val) => { const el = document.getElementById(id); if (el && val != null) el.value = val; };
    setVal("goalExamFamily", goalProfile.examFamily);
    setVal("goalTier", goalProfile.tier || "tier1");
    setVal("goalCategory", goalProfile.category);
    setVal("goalTargetPost", goalProfile.targetPost);
    setVal("goalExamDate", goalProfile.examDate);
    setVal("goalStudyHours", goalProfile.studyHours);
    setVal("goalTargetScore", goalProfile.targetScore);
  }
  applyGoalAutoCutoff();
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeGoalModal() {
  const modal = document.getElementById("goalModal");
  if (modal) modal.classList.add("hidden");
  document.body.style.overflow = "";
  localStorage.setItem("sscranklab_goal_dismissed", "true");
}

async function saveGoalProfile() {
  const userKey = getUserKey();
  const statusEl = document.getElementById("goalModalStatus");
  const examFamily = document.getElementById("goalExamFamily")?.value || "ssc_cgl";
  const tier = document.getElementById("goalTier")?.value || "tier1";
  const category = document.getElementById("goalCategory")?.value || "UR";
  const targetPost = document.getElementById("goalTargetPost")?.value || "";
  const examDate = document.getElementById("goalExamDate")?.value || "";
  const studyHours = Number(document.getElementById("goalStudyHours")?.value || 0);
  const targetScore = Number(document.getElementById("goalTargetScore")?.value || 0);
  const autoCutoff = Number(document.getElementById("goalAutoCutoff")?.value || 0);

  const examAllowed = ["ssc_cgl", "ssc_chsl", "ssc_mts", "ssc_cpo"];
  const tierAllowed = ["tier1", "tier2", "smart"];
  const categoryAllowed = ["UR", "OBC", "SC", "ST", "EWS"];

  if (!examAllowed.includes(examFamily)) {
    if (statusEl) {
      statusEl.textContent = "Invalid exam selection.";
      statusEl.style.color = "#b91c1c";
    }
    return;
  }

  if (!categoryAllowed.includes(category)) {
    if (statusEl) {
      statusEl.textContent = "Invalid category selection.";
      statusEl.style.color = "#b91c1c";
    }
    return;
  }

  if (!tierAllowed.includes(tier)) {
    if (statusEl) {
      statusEl.textContent = "Invalid tier selection.";
      statusEl.style.color = "#b91c1c";
    }
    return;
  }

  if (!targetPost || String(targetPost).length > 80) {
    if (statusEl) {
      statusEl.textContent = "Please select a valid target post.";
      statusEl.style.color = "#b91c1c";
    }
    return;
  }

  if (!Number.isFinite(studyHours) || studyHours < 1 || studyHours > 16) {
    if (statusEl) {
      statusEl.textContent = "Study hours must be between 1 and 16.";
      statusEl.style.color = "#b91c1c";
    }
    return;
  }

  const targetMaxByTier = tier === "tier2" ? 600 : 250;
  if (!Number.isFinite(targetScore) || targetScore < 60 || targetScore > targetMaxByTier) {
    if (statusEl) {
      statusEl.textContent = `Target score must be between 60 and ${targetMaxByTier}.`;
      statusEl.style.color = "#b91c1c";
    }
    return;
  }

  if (statusEl) { statusEl.textContent = "Saving..."; statusEl.style.color = "#1e40af"; }

  try {
    const response = await fetch(`/api/user/${encodeURIComponent(userKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goal: {
          examFamily,
          tier,
          category,
          targetPost,
          examDate,
          studyHours,
          targetScore,
          autoCutoff: Number.isFinite(autoCutoff) && autoCutoff > 0 ? Math.round(autoCutoff) : null,
          updatedAt: new Date().toISOString()
        }
      })
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || "Save failed");
    goalProfile = data.profile?.goal || { examFamily, category, targetPost, examDate, studyHours, targetScore };
    if (statusEl) { statusEl.textContent = "Goal saved!"; statusEl.style.color = "#047857"; }
    setTimeout(() => closeGoalModal(), 800);
  } catch (err) {
    console.error("saveGoalProfile error:", err);
    if (statusEl) { statusEl.textContent = "Could not save. Try again."; statusEl.style.color = "#b91c1c"; }
  }
}

// ============================================================
// STREAK SYSTEM
// ============================================================
function computeStreak(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return { streak: 0, daysSinceLastSave: null };
  }
  const dateSet = new Set(
    entries.map(e => (e.test_date || "").split("T")[0]).filter(Boolean)
  );
  const today = new Date().toISOString().split("T")[0];
  const todayMs = new Date(today).getTime();
  const dates = [...dateSet].sort().reverse();
  const latestDate = dates[0];
  const latestMs = new Date(latestDate).getTime();
  const daysSinceLastSave = Math.round((todayMs - latestMs) / 86400000);

  let streak = 0;
  let checkMs = latestMs;
  while (streak < dates.length) {
    const checkDate = new Date(checkMs).toISOString().split("T")[0];
    if (dateSet.has(checkDate)) {
      streak++;
      checkMs -= 86400000;
    } else {
      break;
    }
  }
  return { streak, daysSinceLastSave };
}

function updateStreakDisplay(entries) {
  const el = document.getElementById("streakDisplay");
  if (!el) return;
  if (!Array.isArray(entries) || entries.length === 0) {
    el.innerHTML = "";
    return;
  }
  const { streak, daysSinceLastSave } = computeStreak(entries);
  if (daysSinceLastSave !== null && daysSinceLastSave >= 3) {
    el.innerHTML = `<span class="comeback-pill">💪 Welcome back! Start fresh today</span>`;
    return;
  }
  if (streak >= 1) {
    el.innerHTML = `<span class="streak-pill">🔥 ${streak} day${streak !== 1 ? "s" : ""} streak</span>`;
  } else {
    el.innerHTML = "";
  }
}

// ============================================================
// WEEKLY REPORT CARD
// ============================================================
function buildWeeklyReport(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return null;
  const sorted = [...entries].sort((a, b) => new Date(b.test_date) - new Date(a.test_date));
  const last7 = sorted.slice(0, 7);
  const subjectKeys = ["quant", "english", "reasoning", "gk", "computer"];
  const subjectLabels = { quant: "Quant", english: "English", reasoning: "Reasoning", gk: "GK", computer: "Computer" };
  const subjectAvgs = {};
  subjectKeys.forEach(key => {
    const vals = last7.map(e => Number(e[`${key}_marks`] || 0));
    subjectAvgs[key] = vals.reduce((a, b) => a + b, 0) / vals.length;
  });
  const overallAvg = last7.reduce((acc, e) => acc + Number(e.total_marks || 0), 0) / last7.length;
  const bestDay = last7.reduce((a, b) => Number(a.total_marks) >= Number(b.total_marks) ? a : b);
  const worstDay = last7.reduce((a, b) => Number(a.total_marks) <= Number(b.total_marks) ? a : b);
  let benchmarkGap = null;
  if (benchmarkProfile && Number(benchmarkProfile.overallTarget) > 0) {
    benchmarkGap = Number((benchmarkProfile.overallTarget - overallAvg).toFixed(1));
  }
  return { subjectAvgs, subjectLabels, overallAvg, bestDay, worstDay, benchmarkGap, count: last7.length };
}

function renderWeeklyReport(report) {
  const container = document.getElementById("weeklyReportCard");
  if (!container) return;
  if (!report) {
    container.classList.add("hidden");
    container.innerHTML = "";
    return;
  }
  const unlockedPlan = getUnlockedPlan();
  const { subjectAvgs, subjectLabels, overallAvg, bestDay, worstDay, benchmarkGap, count } = report;

  const gapHtml = benchmarkGap !== null
    ? `<div class="report-stat">
        <div class="k">Benchmark Gap</div>
        <div class="v" style="color:${benchmarkGap > 0 ? "#b91c1c" : "#047857"}">${benchmarkGap > 0 ? "-" : "+"}${Math.abs(benchmarkGap).toFixed(1)}</div>
       </div>`
    : `<div class="report-stat"><div class="k">Benchmark Gap</div><div class="v">—</div></div>`;

  const fmt = d => { try { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" }); } catch { return d; } };

  const subjectStatsHtml = Object.entries(subjectAvgs).map(([key, avg]) =>
    `<div class="report-stat">
      <div class="k">${escapeHtml(subjectLabels[key] || key)}</div>
      <div class="v">${avg.toFixed(1)}</div>
     </div>`
  ).join("");

  const subjectSection = unlockedPlan >= 99
    ? `<div class="mt-4">
        <div class="text-sm font-bold text-slate-600 mb-2">Per-Subject Averages (Last ${count} days)</div>
        <div class="report-grid">${subjectStatsHtml}</div>
       </div>`
    : `<div class="mt-4 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-4" style="min-height:90px">
        <div class="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center z-10">
          <button type="button" class="js-unlock-plan px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold shadow hover:opacity-90 transition" data-plan="99">🔒 Unlock ₹99 for Subject Breakdown</button>
        </div>
        <div class="report-grid opacity-30 pointer-events-none">${subjectStatsHtml}</div>
       </div>`;

  container.innerHTML = `
    <div class="report-shell">
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 class="text-lg font-extrabold text-slate-900">📊 Weekly Report Card</h3>
          <p class="text-slate-500 text-sm mt-0.5">Last ${count} session${count !== 1 ? "s" : ""} summary</p>
        </div>
        <span class="text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full bg-blue-100 text-blue-700">Auto-generated</span>
      </div>
      <div class="report-grid">
        <div class="report-stat"><div class="k">Avg Score</div><div class="v">${overallAvg.toFixed(1)}</div></div>
        <div class="report-stat">
          <div class="k">Best Day</div>
          <div class="v">${escapeHtml(String(bestDay.total_marks))}<span style="font-size:11px;font-weight:600;color:#64748b;margin-left:4px">${fmt(bestDay.test_date)}</span></div>
        </div>
        <div class="report-stat">
          <div class="k">Worst Day</div>
          <div class="v">${escapeHtml(String(worstDay.total_marks))}<span style="font-size:11px;font-weight:600;color:#64748b;margin-left:4px">${fmt(worstDay.test_date)}</span></div>
        </div>
        ${gapHtml}
      </div>
      ${subjectSection}
    </div>
  `;
  container.classList.remove("hidden");
  bindUnlockButtons();
}

async function syncPaymentStatus() {
  try {
    const userKey = getUserKey();
    const response = await fetch(`/api/payment/status?userKey=${encodeURIComponent(userKey)}`);
    const data = await response.json();
    if (!response.ok || !data.success) return;

    const unlockedPlan = Number(data.unlockedPlan || 0);
    const effectivePlan = Number(data.effectivePlan || unlockedPlan || 0);
    paymentAccessState = {
      unlockedPlan,
      effectivePlan,
      trial: data.trial || null
    };

    saveUnlockedPlan(unlockedPlan);
    setCurrentAccessPlan(effectivePlan);
    updatePremiumOptions(effectivePlan);
    hideUnlockedPlanButtons(effectivePlan);
  } catch (err) {
    console.error("syncPaymentStatus error:", err);
  }
}

async function startFreeTrial(triggerButton = null) {
  const originalText = showButtonLoading(triggerButton, "Activating...");
  try {
    const response = await fetch("/api/payment/start-trial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userKey: getUserKey(), plan: 99 })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Unable to start trial");
    }

    paymentAccessState = {
      unlockedPlan: Number(data.unlockedPlan || 0),
      effectivePlan: Number(data.effectivePlan || 0),
      trial: data.trial || null
    };

    saveUnlockedPlan(paymentAccessState.unlockedPlan);
    setCurrentAccessPlan(paymentAccessState.effectivePlan);
    updatePremiumOptions(paymentAccessState.effectivePlan);
    hideUnlockedPlanButtons(paymentAccessState.effectivePlan);
    showPaymentStatus("2-day premium trial activated. Explore all exclusive insights now.", "success");
  } catch (err) {
    console.error("startFreeTrial error:", err);
    showPaymentStatus(err.message || "Could not start trial", "error");
  } finally {
    resetButtonLoading(triggerButton, originalText);
  }
}