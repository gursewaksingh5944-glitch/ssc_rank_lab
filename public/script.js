document.addEventListener("DOMContentLoaded", function () {
  ensureUserKey();
  captureReferralCodeFromUrl();
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
    loadQuestionsBtn.addEventListener("click", function () {
      loadQuestionLabItems({ interactive: true });
    });
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

  const hookSetupGoalBtn = document.getElementById("hookSetupGoalBtn");
  if (hookSetupGoalBtn) {
    hookSetupGoalBtn.addEventListener("click", function () { showGoalModal(); });
  }

  const hzWhatifBtn = document.getElementById("hzWhatifBtn");
  if (hzWhatifBtn) {
    hzWhatifBtn.addEventListener("click", runWhatIfSimulator);
  }

  const hzWhatifInput = document.getElementById("hzWhatifInput");
  if (hzWhatifInput) {
    hzWhatifInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") runWhatIfSimulator();
    });
  }

  const hzNotifClose = document.getElementById("hzNotifClose");
  if (hzNotifClose) {
    hzNotifClose.addEventListener("click", function () {
      const toast = document.getElementById("hzNotifToast");
      if (toast) toast.style.display = "none";
    });
  }
  loadQuestionLabItems({ interactive: false });
  syncPaymentStatus();
  setInterval(syncPaymentStatus, 60000);

  const navOpenGoalBtn = document.getElementById("navOpenGoal");
  if (navOpenGoalBtn) {
    navOpenGoalBtn.addEventListener("click", function (e) {
      e.preventDefault();
      showGoalModal();
    });
  }

  const topOpenGoalBtn = document.getElementById("topOpenGoalBtn");
  if (topOpenGoalBtn) {
    topOpenGoalBtn.addEventListener("click", function () {
      showGoalModal();
    });
  }

  const goalReminderBtn = document.getElementById("goalReminderBtn");
  if (goalReminderBtn) {
    goalReminderBtn.addEventListener("click", function () {
      showGoalModal();
    });
  }

  // Upgrade modal wiring
  const closeUpgradeModalBtn = document.getElementById("closeUpgradeModal");
  if (closeUpgradeModalBtn) closeUpgradeModalBtn.addEventListener("click", closeUpgradeModal);

  const upgradeModalPayBtn = document.getElementById("upgradeModalPayBtn");
  if (upgradeModalPayBtn) {
    upgradeModalPayBtn.addEventListener("click", async function () {
      closeUpgradeModal();
      await startRazorpayUnlock(99, upgradeModalPayBtn);
    });
  }

  const upgradeModalTrialBtn = document.getElementById("upgradeModalTrialBtn");
  if (upgradeModalTrialBtn) {
    upgradeModalTrialBtn.addEventListener("click", function () {
      closeUpgradeModal();
      const startTrialBtn = document.getElementById("startTrialBtn");
      startFreeTrial(startTrialBtn);
    });
  }

  // Close upgrade modal on backdrop click
  document.getElementById("upgradeModal")?.addEventListener("click", function (e) {
    if (e.target === this) closeUpgradeModal();
  });

  // Pricing section trial button
  const pricingTrialBtn = document.getElementById("pricingTrialBtn");
  if (pricingTrialBtn) {
    pricingTrialBtn.addEventListener("click", function () {
      startFreeTrial(pricingTrialBtn);
    });
  }

  bindDirectBuyButtons();

  const openTrialBuyButtons = document.querySelectorAll(".js-open-trial-buy");
  openTrialBuyButtons.forEach((button) => {
    if (button.dataset.bound === "true") return;

    button.dataset.bound = "true";
    button.addEventListener("click", function () {
      openTrialBuyWindow();
    });
  });

  initLiveAdminGrowthPanel();

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

  initSocialFeatures();

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
let lastMarksEntries = [];
let paymentAccessState = {
  unlockedPlan: 0,
  effectivePlan: 0,
  trial: null
};
let referralState = {
  code: ""
};

const REFERRAL_STORAGE_KEY = "sscranklab_referral_code";
const ADMIN_MODE_STORAGE_KEY = "sscranklab_admin_mode";
const SOCIAL_POLL_MS = 7000;

let socialState = {
  activeGroupId: "",
  myGroups: [],
  discoverGroups: [],
  challenges: []
};
let socialChatPollTimer = null;
let socialNotifPollTimer = null;

function bindUnlockButtons() {
  const unlockButtons = document.querySelectorAll(".js-unlock-plan");
  unlockButtons.forEach((button) => {
    if (button.dataset.unlockBound === "true") return;

    button.dataset.unlockBound = "true";
    button.addEventListener("click", function () {
      // Open the upgrade modal so user sees trial + pay options first.
      openUpgradeModal();
    });
  });
}

function bindSingleDirectBuyButton(button) {
  if (!button) return;
  if (button.dataset.buyBound === "true") return;

  button.dataset.buyBound = "true";
  button.addEventListener("click", async function () {
    await startRazorpayUnlock(99, button);
  });
}

function bindDirectBuyButtons() {
  // Keep explicit IDs for reliability and class selector as a fallback.
  bindSingleDirectBuyButton(document.getElementById("heroBuyBtn"));
  bindSingleDirectBuyButton(document.getElementById("pricingBuyBtn"));
  bindSingleDirectBuyButton(document.getElementById("instantBuyBtn"));

  const directBuyButtons = document.querySelectorAll(".js-direct-buy-now");
  directBuyButtons.forEach((button) => {
    bindSingleDirectBuyButton(button);
  });
}

function openUpgradeModal() {
  const modal = document.getElementById("upgradeModal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.style.display = "flex";
  }
}

function closeUpgradeModal() {
  const modal = document.getElementById("upgradeModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.style.display = "none";
  }
}

function openTrialBuyWindow() {
  openUpgradeModal();
  showPaymentStatus("Choose Start 2-Day Free Trial or Buy Premium ₹99.", "info");
}

async function ensurePremiumAccess(actionLabel = "This action") {
  try {
    await syncPaymentStatus();
  } catch (err) {
    console.error("ensurePremiumAccess sync error:", err);
  }

  const hasPremium = Number(paymentAccessState.effectivePlan || 0) >= 99;
  if (hasPremium) return true;

  openTrialBuyWindow();
  showPaymentStatus(`${actionLabel} is available in trial/premium. Start trial or buy ₹99 to continue.`, "info");
  return false;
}

function normalizeReferralCode(code) {
  return String(code || "").trim().toUpperCase();
}

function setStoredReferralCode(code) {
  try {
    const normalized = normalizeReferralCode(code);
    if (!normalized) return;
    localStorage.setItem(REFERRAL_STORAGE_KEY, normalized);
  } catch (err) {
    console.error("setStoredReferralCode error:", err);
  }
}

function getStoredReferralCode() {
  try {
    return normalizeReferralCode(localStorage.getItem(REFERRAL_STORAGE_KEY) || "");
  } catch (err) {
    console.error("getStoredReferralCode error:", err);
    return "";
  }
}

function captureReferralCodeFromUrl() {
  try {
    const url = new URL(window.location.href);
    const referralCode = normalizeReferralCode(url.searchParams.get("ref"));
    if (!referralCode) return;

    setStoredReferralCode(referralCode);
    url.searchParams.delete("ref");
    window.history.replaceState({}, "", url.toString());
  } catch (err) {
    console.error("captureReferralCodeFromUrl error:", err);
  }
}

function getReferralLinkForCurrentUser() {
  const code = normalizeReferralCode(referralState.code || getStoredReferralCode());
  if (!code) return "https://sscranklab.com/";
  return `https://sscranklab.com/?ref=${encodeURIComponent(code)}`;
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

  if (unlockedPlan >= 99) {
    premiumInput.insertAdjacentHTML(
      "beforeend",
      `<option value="99">Monthly Premium ₹99 (${trialActive ? "Trial Access" : "Unlocked"})</option>`
    );
  }

  if (previousValue > 0 && previousValue <= unlockedPlan) {
    premiumInput.value = String(previousValue);
  } else if (unlockedPlan >= 99) {
    premiumInput.value = "99";
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
  if (!planStatusText) {
    updateSidePredictorBox(unlockedPlan);
    updatePremiumLockedCtas(unlockedPlan);
    return;
  }

  const trial = paymentAccessState.trial;
  if (trial && trial.active) {
    const hours = Math.ceil(Number(trial.remainingMs || 0) / (60 * 60 * 1000));
    planStatusText.textContent = `2-day trial active (${Math.max(0, hours)}h left). Monthly ₹99 service is fully unlocked right now.`;
    updateSidePredictorBox(unlockedPlan);
    updatePremiumLockedCtas(unlockedPlan);
    return;
  }

  if (unlockedPlan >= 99) {
    planStatusText.textContent = "Monthly ₹99 premium service unlocked.";
  } else {
    planStatusText.textContent = "Start 2-day trial, then continue with ₹99/month for full service.";
  }

  updateSidePredictorBox(unlockedPlan);
  updatePremiumLockedCtas(unlockedPlan);
}

function updatePremiumLockedCtas(unlockedPlan = 0) {
  const hasPremium = Number(unlockedPlan || 0) >= 99;

  const saveMarksBtn = document.getElementById("saveMarksBtn");
  if (saveMarksBtn) {
    saveMarksBtn.textContent = hasPremium ? "Save Today's Marks" : "Unlock Trial/Premium To Add Marks";
    saveMarksBtn.classList.toggle("ring-2", !hasPremium);
    saveMarksBtn.classList.toggle("ring-amber-300", !hasPremium);
  }

  const saveBenchmarkBtn = document.getElementById("saveBenchmarkBtn");
  if (saveBenchmarkBtn) {
    saveBenchmarkBtn.textContent = hasPremium ? "Save Benchmark" : "Unlock Trial/Premium To Save Benchmark";
  }

  const loadQuestionsBtn = document.getElementById("btnLoadQuestions");
  if (loadQuestionsBtn) {
    loadQuestionsBtn.textContent = hasPremium ? "Load Questions" : "Unlock Trial/Premium To Load Questions";
  }

  const generateMockBtn = document.getElementById("btnGenerateMock");
  if (generateMockBtn) {
    generateMockBtn.textContent = hasPremium ? "Generate Mock" : "Unlock Trial/Premium To Generate Mock";
  }
}

function updateSidePredictorBox(unlockedPlan = 0) {
  const badge = document.getElementById("sidePlanBadge");
  const locked = document.getElementById("sidePremiumLocked");
  const unlocked = document.getElementById("sidePremiumUnlocked");
  if (!badge || !locked || !unlocked) return;

  if (Number(unlockedPlan || 0) >= 99) {
    badge.textContent = "Premium Active";
    badge.style.background = "#dcfce7";
    badge.style.color = "#166534";
    locked.classList.add("hidden");
    unlocked.classList.remove("hidden");
  } else {
    badge.textContent = "Free";
    badge.style.background = "#e0e7ff";
    badge.style.color = "#3730a3";
    locked.classList.remove("hidden");
    unlocked.classList.add("hidden");
  }
}

function updateTopGoalFrame() {
  const postEl = document.getElementById("topGoalPost");
  const cutoffEl = document.getElementById("topGoalAutoCutoff");
  const targetEl = document.getElementById("topGoalTargetScore");
  const reminderWrap = document.getElementById("goalReminderWrap");
  const reminderMain = document.getElementById("goalReminderMain");
  const reminderSub = document.getElementById("goalReminderSub");
  if (!postEl || !cutoffEl || !targetEl) return;

  if (!goalProfile) {
    postEl.textContent = "Not set";
    cutoffEl.textContent = "--";
    targetEl.textContent = "--";
    if (reminderWrap) reminderWrap.classList.add("hidden");
    return;
  }

  const post = String(goalProfile.targetPost || "Not set");
  const cutoff = goalProfile.autoCutoff ? String(Math.round(Number(goalProfile.autoCutoff || 0))) : "--";
  const target = goalProfile.targetScore ? String(Math.round(Number(goalProfile.targetScore || 0))) : "--";
  const category = String(goalProfile.category || "UR");
  const examDate = String(goalProfile.examDate || "").trim();
  let examText = "Upcoming exam";

  if (examDate) {
    const dateObj = new Date(`${examDate}-01T00:00:00`);
    if (!Number.isNaN(dateObj.getTime())) {
      examText = dateObj.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    }
  }

  postEl.textContent = post;
  cutoffEl.textContent = cutoff;
  targetEl.textContent = target;

  if (reminderWrap && reminderMain && reminderSub) {
    reminderWrap.classList.remove("hidden");
    reminderMain.textContent = `${post} • ${category} • Target ${target}`;
    reminderSub.textContent = `Auto cutoff ${cutoff} • ${examText}`;
  }
}

function computeOverallAverageScore(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return 0;
  const total = entries.reduce((acc, item) => acc + Number(item.total_marks || 0), 0);
  return total / entries.length;
}

// Goal gap banner removed — info is now in the hook zone
function updateGoalGapBanner(_entries) { /* no-op: hook zone shows this */ }

function updateTodayActionPlan(entries = []) {
  const titleEl = document.getElementById("todayActionTitle");
  const gainEl = document.getElementById("todayActionGain");
  const listEl = document.getElementById("todayActionList");
  if (!titleEl || !gainEl || !listEl) return;

  if (!Array.isArray(entries) || entries.length === 0) {
    titleEl.textContent = "Today's Focus Plan";
    gainEl.textContent = "Expected gain: --";
    listEl.innerHTML = "<li>Add today's marks to generate your action plan.</li>";
    return;
  }

  const latest = [...entries].sort((a, b) => new Date(b.test_date) - new Date(a.test_date))[0] || {};
  const subjects = [
    { label: "Quant", value: Number(latest.quant_marks || 0) },
    { label: "English", value: Number(latest.english_marks || 0) },
    { label: "Reasoning", value: Number(latest.reasoning_marks || 0) },
    { label: "GK", value: Number(latest.gk_marks || 0) },
    { label: "Computer", value: Number(latest.computer_marks || 0) }
  ];

  const weakest = [...subjects].sort((a, b) => a.value - b.value).slice(0, 2);
  const overallAvg = computeOverallAverageScore(entries);
  const goalScore = Number(goalProfile?.autoCutoff || 0) > 0 ? Math.min(250, Number(goalProfile.autoCutoff || 0) + 5) : 0;
  const marksAway = goalScore > 0 ? Math.max(0, Number((goalScore - overallAvg).toFixed(1))) : 0;

  let expectedGain = 1.0;
  if (marksAway > 15) expectedGain = 2.0;
  else if (marksAway > 8) expectedGain = 1.6;
  else if (marksAway > 3) expectedGain = 1.2;

  if (goalScore > 0) {
    titleEl.textContent = `Today's Focus: close ${marksAway.toFixed(1)} marks to safe zone`;
  } else {
    titleEl.textContent = "Today's Focus: boost your weakest subjects";
  }

  gainEl.textContent = `Expected gain: +${expectedGain.toFixed(1)} marks`;

  const first = weakest[0]?.label || "Quant";
  const second = weakest[1]?.label || "GK";
  listEl.innerHTML = [
    `Solve 20 targeted ${escapeHtml(first)} questions and analyze mistakes.`,
    `Run 2 timed mini-mocks focused on ${escapeHtml(second)} accuracy and speed.`,
    goalScore > 0
      ? `Maintain revision so your overall average moves from ${overallAvg.toFixed(1)} toward goal ${Math.round(goalScore)}.`
      : "Set target post to activate cutoff + 5 safe-zone planning."
  ].map((item) => `<li>${item}</li>`).join("");
}

function getPlanName(plan) {
  if (Number(plan) === 99) return "Monthly Premium ₹99";
  return `Plan ₹${plan}`;
}

/* ============================================================
   OUTCOME HOOK ZONE — real API-driven selection intelligence
   ============================================================ */

/**
 * Animate a numeric counter from 0 → target using ease-out cubic.
 */
function animateNumber(el, target, decimalPlaces = 0, durationMs = 1100, suffix = "") {
  if (!el) return;
  const startTime = performance.now();
  function step(now) {
    const progress = Math.min((now - startTime) / durationMs, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = (target * eased).toFixed(decimalPlaces) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/**
 * Fetch /api/user/:userKey/outcome and push results to the hook zone.
 */
async function loadUserOutcome() {
  const userKey = getUserKey();
  if (!userKey) return;
  try {
    const res = await fetch(`/api/user/${encodeURIComponent(userKey)}/outcome`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.success) updateHookZone(data);
    // Also wire API daily plan into today-action shell
    if (data.success && Array.isArray(data.dailyPlan) && data.dailyPlan.length) {
      const listEl = document.getElementById("todayActionList");
      if (listEl) listEl.innerHTML = data.dailyPlan.map(t => `<li>${escapeHtml(t)}</li>`).join("");
    }
  } catch (_) { /* keep hook zone in its current state on network failure */ }
}

/* ==============================================================
   HOOK ZONE ENGINE
   ============================================================== */

// Last known outcome for what-if comparisons
let _lastOutcome = null;

/**
 * Populate the dark hook zone from outcome API data.
 */
function updateHookZone(outcome) {
  _lastOutcome = outcome;

  const headlineIcon   = document.getElementById("hookHeadlineIcon");
  const headlineText   = document.getElementById("hookHeadlineText");
  const setupBtn       = document.getElementById("hookSetupGoalBtn");
  const marksAwayEl    = document.getElementById("hzMarksAway");
  const marksUnitEl    = document.getElementById("hzMarksUnit");
  const safeScoreEl    = document.getElementById("hzSafeScore");
  const cutoffValEl    = document.getElementById("hzCutoffVal");
  const yourAvgEl      = document.getElementById("hzYourAvg");
  const selChanceEl    = document.getElementById("hzSelChance");
  const zoneLabelEl    = document.getElementById("hzZoneLabel");
  const confidenceEl   = document.getElementById("hzConfidenceChip");
  const daysLabelEl    = document.getElementById("hzDaysLabel");
  const dailyGainEl    = document.getElementById("hzDailyGain");
  const daysToGoalEl   = document.getElementById("hzDaysToGoal");
  const urgencyIconEl  = document.getElementById("hzUrgencyIcon");
  const urgencyTextEl  = document.getElementById("hzUrgencyText");
  const subjectGridEl  = document.getElementById("hzSubjectGrid");

  if (!headlineText) return;

  const post        = outcome.goalProfile?.targetPost || null;
  const cutoff      = outcome.goalProfile?.autoCutoff || null;
  const marksAway   = outcome.scores?.marksAway;
  const safeScore   = outcome.scores?.safeScore;
  const overallAvg  = outcome.scores?.overallAvg;
  const avg7        = outcome.scores?.avg7;
  const probability = outcome.selection?.probability;
  const zoneLabel   = outcome.selection?.zoneLabel || "";
  const daysToGoal  = outcome.trend?.daysToGoal;
  const displayGain = outcome.trend?.displayDailyGain || 0;
  const dailyGainRate = outcome.trend?.dailyGainRate || 0;
  const sessionCount  = outcome.trend?.sessionCount || 0;
  const subjectAvgs   = outcome.subjects?.avgs || null;
  const confidence    = outcome.confidence || "low";

  /* ── Headline ── */
  if (!outcome.goalProfile) {
    if (headlineIcon) headlineIcon.textContent = "🎯";
    headlineText.textContent = "Set your target post to see your personal selection forecast";
    if (setupBtn) setupBtn.classList.remove("hidden");
  } else if (!outcome.hasHistory) {
    if (headlineIcon) headlineIcon.textContent = "📊";
    headlineText.textContent = `${post} — add today's marks to unlock your selection forecast`;
    if (setupBtn) setupBtn.classList.add("hidden");
  } else if (marksAway === 0) {
    if (headlineIcon) headlineIcon.textContent = "✅";
    headlineText.textContent = `You're inside the safe zone for ${post} — keep the momentum!`;
    if (setupBtn) setupBtn.classList.add("hidden");
  } else {
    if (headlineIcon) headlineIcon.textContent = "🚨";
    headlineText.textContent = `You're ${marksAway} marks away from ${post} — here's exactly what to do:`;
    if (setupBtn) setupBtn.classList.add("hidden");
  }

  /* ── Gap card ── hero number with gradient */
  if (marksAwayEl) {
    if (marksAway != null) {
      animateNumber(marksAwayEl, marksAway, 0, 1000);
      marksAwayEl.className = marksAway === 0 ? "hz-gap-hero hz-no-gap" : "hz-gap-hero";
    } else {
      marksAwayEl.textContent = "--";
      marksAwayEl.className = "hz-gap-hero";
    }
  }
  if (marksUnitEl) marksUnitEl.textContent = (marksAway === 0) ? "✓" : "marks";
  if (safeScoreEl) safeScoreEl.textContent = safeScore != null ? safeScore : "--";
  if (cutoffValEl) cutoffValEl.textContent  = cutoff != null   ? cutoff  : "--";
  if (yourAvgEl)   yourAvgEl.textContent    = overallAvg != null ? overallAvg : "--";

  /* ── Selection Chance card ── */
  if (selChanceEl) {
    if (probability != null) {
      animateNumber(selChanceEl, probability, 0, 1100, "%");
      selChanceEl.className = "hz-big-num" + (
        probability >= 70 ? " hz-chance-high" :
        probability >= 40 ? " hz-chance-mid"  : " hz-chance-low"
      );
    } else {
      selChanceEl.textContent = "--";
    }
  }
  if (zoneLabelEl) {
    zoneLabelEl.textContent = zoneLabel || "No data";
    zoneLabelEl.style.color =
      zoneLabel === "High Chance"   ? "#4ade80" :
      zoneLabel === "Above Average" ? "#86efac" :
      zoneLabel === "Moderate"      ? "#fbbf24" : "#f87171";
  }
  /* Confidence indicator */
  if (confidenceEl) {
    if (outcome.hasHistory) {
      const confLabel =
        confidence === "high"   ? "✓ High confidence (strong data)" :
        confidence === "medium" ? "~ Medium confidence" :
                                  "⚠ Low confidence (add more entries)";
      confidenceEl.textContent = confLabel;
      confidenceEl.className = `hz-confidence ${escapeHtml(confidence)}`;
      confidenceEl.style.display = "inline-flex";
    } else {
      confidenceEl.style.display = "none";
    }
  }

  if (daysLabelEl) {
    daysLabelEl.textContent = (daysToGoal != null && daysToGoal > 0)
      ? `~${daysToGoal} days to safe zone`
      : outcome.hasHistory ? "at current pace" : "no data yet";
  }

  /* ── Daily Gain card ── */
  if (dailyGainEl) {
    if (outcome.hasHistory) {
      animateNumber(dailyGainEl, displayGain, 1, 1000);
    } else {
      dailyGainEl.textContent = "--";
    }
  }
  if (daysToGoalEl) {
    if (daysToGoal != null && daysToGoal > 0) {
      daysToGoalEl.textContent = `~${daysToGoal} days to safe zone`;
    } else if (marksAway === 0) {
      daysToGoalEl.textContent = "Already in safe zone ✓";
    } else if (outcome.hasHistory && dailyGainRate <= 0) {
      daysToGoalEl.textContent = "Trend flat — add more data";
    } else {
      daysToGoalEl.textContent = "Track more entries for estimate";
    }
  }

  /* ── Urgency Bar ── */
  if (urgencyIconEl && urgencyTextEl) {
    _setUrgencyBar(urgencyIconEl, urgencyTextEl, {
      marksAway, safeScore, overallAvg, avg7, dailyGainRate,
      daysToGoal, probability, hasHistory: outcome.hasHistory, post
    });
  }

  /* ── Subject Weakness Grid with weighted impact ── */
  if (subjectGridEl) {
    if (subjectAvgs) {
      // Weights per subject: Quant and Reasoning are high-value for CGL/CHSL
      const weights = { Quant: 1.3, Reasoning: 1.2, GK: 1.0, English: 1.0, Computer: 0.8 };
      const order = ["Quant", "English", "Reasoning", "GK", "Computer"];
      const rows = order.map(s => ({
        label: s,
        avg: subjectAvgs[s] || 0,
        weight: weights[s] || 1.0
      }));
      const maxAvg = Math.max(...rows.map(r => r.avg), 1);
      subjectGridEl.innerHTML = rows.map(({ label, avg, weight }) => {
        const relScore = avg / maxAvg;
        const impact   = ((1 - relScore) * weight * 10).toFixed(0); // potential gain
        const cls = relScore < 0.75 ? "weak" : relScore >= 0.92 ? "strong" : "neutral";
        const statusTag =
          cls === "weak"   ? `+${impact} pts potential` :
          cls === "strong" ? "✓ GOOD"                   : "OK";
        return `<div class="hz-subject ${escapeHtml(cls)}">
          <div class="hz-subject-label">${escapeHtml(label)}</div>
          <div class="hz-subject-score">${avg.toFixed(1)}</div>
          <div class="hz-subject-impact">${escapeHtml(statusTag)}</div>
        </div>`;
      }).join("");
    } else {
      subjectGridEl.innerHTML = "";
    }
  }

  // Check for milestone notifications
  _checkMilestoneNotifications(outcome);
}

/** Compute and render urgency message */
function _setUrgencyBar(iconEl, textEl, d) {
  if (!d.hasHistory || d.marksAway == null) {
    iconEl.textContent = "⏳";
    textEl.textContent = "Add your first marks to see your urgency status.";
    textEl.className = "hz-urgency-text";
    return;
  }
  if (d.marksAway === 0) {
    iconEl.textContent = "🎉";
    textEl.textContent = `You're ${Math.abs(d.overallAvg - d.safeScore + d.marksAway).toFixed(1)} marks above the safe zone. Selection chance is high — stay consistent.`;
    textEl.className = "hz-urgency-text good";
    return;
  }
  // Build urgency based on trend vs gap
  const gainRate = d.dailyGainRate || 0;
  const marksAway = d.marksAway;
  const daysToGoal = d.daysToGoal;

  if (gainRate <= 0) {
    iconEl.textContent = "🚨";
    textEl.textContent = `At current pace, you may miss cutoff by ~${marksAway} marks. Focus on GK and Quant to reverse this trend.`;
    textEl.className = "hz-urgency-text danger";
  } else if (gainRate < 0.5) {
    iconEl.textContent = "⚠️";
    textEl.textContent = `Gaining ${gainRate.toFixed(1)} marks/day — you'll close the gap in ~${daysToGoal || "?"} days. Push to 1.5 marks/day to cut that in half.`;
    textEl.className = "hz-urgency-text warn";
  } else {
    iconEl.textContent = "🔥";
    textEl.textContent = `If you keep gaining +${gainRate.toFixed(1)} marks/day → you'll hit the safe zone in ~${daysToGoal || "?"} days. High selection chance!`;
    textEl.className = "hz-urgency-text good";
  }
}

/** Smart milestone notifications — fire once per session */
const _firedMilestones = new Set();
function _checkMilestoneNotifications(outcome) {
  if (!outcome.hasHistory) return;
  const p  = outcome.selection?.probability;
  const ma = outcome.scores?.marksAway;
  const gainRate = outcome.trend?.dailyGainRate || 0;

  const fire = (key, icon, msg) => {
    if (_firedMilestones.has(key)) return;
    _firedMilestones.add(key);
    showHookNotif(icon, msg);
  };

  if (ma === 0) {
    fire("inzone", "✅", "You're now inside the safe zone! Keep the momentum.");
  } else if (ma != null && ma <= 5) {
    fire("near5", "🔥", `Just ${ma} marks to the safe zone — one strong session away!`);
  } else if (ma != null && ma <= 10) {
    fire("near10", "⚠️", `${ma} marks to safe zone. Double your GK & Quant sessions this week.`);
  }

  if (p != null && p >= 60 && p < 65) {
    fire("cross60", "🎯", "You just crossed 60% selection chance. Keep improving!");
  }
  if (gainRate > 2) {
    fire("highgain", "📈", `Your daily gain is +${gainRate.toFixed(1)} marks/day — you're on track!`);
  }
}

/** Show a toast notification in the hook zone */
let _notifTimer = null;
function showHookNotif(icon, message) {
  const toast   = document.getElementById("hzNotifToast");
  const iconEl  = document.getElementById("hzNotifIcon");
  const msgEl   = document.getElementById("hzNotifMsg");
  if (!toast || !iconEl || !msgEl) return;

  if (iconEl) iconEl.textContent = icon;
  if (msgEl)  msgEl.textContent  = message;
  toast.style.display = "block";

  if (_notifTimer) clearTimeout(_notifTimer);
  _notifTimer = setTimeout(() => { toast.style.display = "none"; }, 6000);
}

/** What-If Simulator: "if I score X today, what happens?" */
function runWhatIfSimulator() {
  const inputEl  = document.getElementById("hzWhatifInput");
  const resultEl = document.getElementById("hzWhatifResult");
  if (!inputEl || !resultEl) return;

  const score = Number(inputEl.value);
  if (!Number.isFinite(score) || score < 0 || score > 250) {
    resultEl.textContent = "Enter a score between 0 and 250.";
    resultEl.style.color = "#f87171";
    return;
  }

  const outcome   = _lastOutcome;
  const safeScore = outcome?.scores?.safeScore;
  const overallAvg = outcome?.scores?.overallAvg;
  const sessionCount = outcome?.trend?.sessionCount || 1;

  if (!safeScore || !overallAvg) {
    resultEl.textContent = "Set your goal first to run simulations.";
    resultEl.style.color = "#fbbf24";
    return;
  }

  // Simulate new avg = rolling in this one score
  const newAvg = ((overallAvg * sessionCount) + score) / (sessionCount + 1);
  const newGap = safeScore - newAvg;
  const newRatio = newAvg / safeScore;

  let newProb;
  if (newRatio >= 1.05) newProb = 92;
  else if (newRatio >= 1.0) newProb = 82;
  else if (newRatio >= 0.96) newProb = 68;
  else if (newRatio >= 0.92) newProb = 52;
  else if (newRatio >= 0.87) newProb = 38;
  else if (newRatio >= 0.80) newProb = 22;
  else newProb = 10;

  const currentProb = outcome?.selection?.probability || 0;
  const probDelta = newProb - currentProb;
  const deltaStr = probDelta >= 0 ? `↑ +${probDelta}%` : `↓ ${probDelta}%`;

  if (newGap <= 0) {
    resultEl.textContent = `Score ${score} → avg ${newAvg.toFixed(1)} → ✅ Safe Zone! Selection chance ~${newProb}% (${deltaStr})`;
    resultEl.style.color = "#4ade80";
  } else {
    resultEl.textContent = `Score ${score} → avg ${newAvg.toFixed(1)} → gap ${newGap.toFixed(1)} marks | chance ${newProb}% (${deltaStr})`;
    resultEl.style.color = newProb >= 60 ? "#a78bfa" : "#fbbf24";
  }
}

function hideUnlockedPlanButtons(unlockedPlan) {
  const unlockButtons = document.querySelectorAll(".js-unlock-plan");
  unlockButtons.forEach((button) => {
    const buttonPlan = Number(button.dataset.plan || 0);
    const isUnlocked = buttonPlan > 0 && buttonPlan <= Number(unlockedPlan || 0);

    // Keep CTA visible for everyone so there is always a way to open trial/buy modal.
    button.classList.remove("hidden");
    button.disabled = false;
    button.classList.toggle("premium-active", isUnlocked);
  });

  // Never hide direct-buy buttons; they are the fail-safe checkout path.
  const directBuyButtons = document.querySelectorAll(".js-direct-buy-now");
  directBuyButtons.forEach((button) => {
    button.classList.remove("hidden");
    button.disabled = false;
  });

  const topGetAllFeaturesBtn = document.getElementById("getAllFeaturesTopBtn");
  if (topGetAllFeaturesBtn) {
    topGetAllFeaturesBtn.classList.remove("hidden");
    topGetAllFeaturesBtn.disabled = false;
    topGetAllFeaturesBtn.style.display = "inline-flex";
    topGetAllFeaturesBtn.style.visibility = "visible";
  }
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
  if (startRazorpayUnlock._inFlight) {
    showPaymentStatus("Checkout is already opening...", "info");
    return;
  }

  startRazorpayUnlock._inFlight = true;
  const originalText = showButtonLoading(triggerButton, "Starting payment...");
  showPaymentStatus("Preparing secure checkout...", "info");

  try {
    const userKey = getUserKey();
    // Only bail out for PAID unlocks — a trial-active user should still be able to pay.
    const paidUnlocked = Number(paymentAccessState.unlockedPlan || 0);

    if (paidUnlocked >= plan) {
      showPaymentStatus(`${getPlanName(plan)} already subscribed. Thank you!`, "success");
      hideUnlockedPlanButtons(paidUnlocked);
      updatePremiumOptions(paidUnlocked);
      resetButtonLoading(triggerButton, originalText);
      return;
    }

    if (typeof window.Razorpay === "undefined") {
      throw new Error("Razorpay SDK not loaded. Check app-preview.html script tag.");
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
  } finally {
    startRazorpayUnlock._inFlight = false;
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

  statusDiv.className = `fixed top-24 right-4 z-[200] max-w-sm border shadow-2xl rounded-2xl px-4 py-3 ${styleMap[type] || styleMap.info}`;
  statusDiv.innerHTML = `
    <div class="font-semibold">${escapeHtml(message)}</div>
  `;
  statusDiv.classList.remove("hidden");
  statusDiv.style.display = "block";

  clearTimeout(showPaymentStatus._timer);
  showPaymentStatus._timer = setTimeout(() => {
    statusDiv.classList.add("hidden");
    statusDiv.style.display = "none";
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
          plan >= 99
            ? renderMetricCard({
                title: `Category Rank (${category})`,
                value: categoryRankValue,
                subtitle: "Included in Monthly ₹99",
                locked: false,
                tone: "emerald"
              })
            : renderLockedMetricCard({
                title: `Category Rank (${category})`,
                previewValue: categoryRankValue,
                subtitle: "Unlock exact category position",
                lockText: "Unlock Monthly ₹99",
                plan: 99
              })
        }

        ${
          plan >= 99
            ? renderMetricCard({
                title: "Percentile",
                value: percentileRaw,
                subtitle: `Included in Monthly ₹99 • ${percentileHelp}`,
                locked: false,
                tone: "indigo"
              })
            : renderLockedMetricCard({
                title: "Percentile",
                previewValue: percentileRaw,
                subtitle: "Unlock percentile insight",
                lockText: "Unlock Monthly ₹99",
                plan: 99
              })
        }
      </div>

      ${plan < 99 ? renderUpgradePanel99() : ""}

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
  plan = 99
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

function renderUpgradePanel99() {
  return `
    <div class="mt-6 rounded-3xl border border-purple-200 bg-gradient-to-r from-purple-50 to-white p-6 shadow-sm">
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div class="text-xl font-bold text-gray-900">Unlock complete rank service in Monthly ₹99</div>
          <div class="text-gray-600 mt-2 max-w-2xl">
            Get category rank, percentile, overall seat position, what-if jumps, competition density, and post chances in one monthly plan.
          </div>

          <div class="grid sm:grid-cols-3 gap-3 mt-5">
            <div class="rounded-2xl border bg-white p-4 text-sm text-gray-700">✅ Category rank + percentile</div>
            <div class="rounded-2xl border bg-white p-4 text-sm text-gray-700">✅ Seat position + score zone</div>
            <div class="rounded-2xl border bg-white p-4 text-sm text-gray-700">✅ What-if jumps + post chances</div>
          </div>
        </div>

        <div class="shrink-0">
          <button
            type="button"
            class="js-unlock-plan px-5 py-3 rounded-2xl bg-purple-600 text-white font-semibold shadow hover:bg-purple-700 transition"
            data-plan="99"
          >
            Start Monthly ₹99
          </button>
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
      goalProfile = null;
      applyBenchmarkToUI(null);
      updateTopGoalFrame();
      updateGoalGapBanner(lastMarksEntries);
      updateTodayActionPlan(lastMarksEntries);
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
    updateTopGoalFrame();
    updateGoalGapBanner(lastMarksEntries);
    updateTodayActionPlan(lastMarksEntries);
    setBenchmarkStatus("Benchmark loaded.", "success");
  } catch (err) {
    console.error("loadBenchmarkProfile error:", err);
    applyBenchmarkToUI(null);
    updateTopGoalFrame();
    updateGoalGapBanner(lastMarksEntries);
    updateTodayActionPlan(lastMarksEntries);
    setBenchmarkStatus("Could not load benchmark profile.", "error");
  }
}

async function saveBenchmarkProfile() {
  if (!(await ensurePremiumAccess("Benchmark saving"))) {
    return;
  }

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

async function loadQuestionLabItems(options = {}) {
  const interactive = options.interactive !== false;
  if (interactive && !(await ensurePremiumAccess("Question Lab loading"))) {
    return;
  }

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
  if (!(await ensurePremiumAccess("Mock generation"))) {
    return;
  }

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
  if (!(await ensurePremiumAccess("Adding marks"))) {
    return;
  }

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
      lastMarksEntries = Array.isArray(data.entries) ? data.entries : [];
      displayMarksHistory(data.entries);
      drawProgressChart(data.entries);
      drawSubjectChart(data.entries);
      updateProgressSummary(data.entries);
      updateBenchmarkReview(data.entries);
      updateStreakDisplay(data.entries);
      renderWeeklyReport(buildWeeklyReport(data.entries));
      updateGoalGapBanner(lastMarksEntries);
      updateTodayActionPlan(lastMarksEntries);
      loadUserOutcome();
      if (!Array.isArray(data.entries) || data.entries.length === 0) {
        showProgressStatus("Start by adding today's marks.", "info");
      }
    }
  } catch (error) {
    console.error("Load marks error:", error);
    lastMarksEntries = [];
    updateGoalGapBanner(lastMarksEntries);
    updateTodayActionPlan(lastMarksEntries);
    loadUserOutcome();
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
  const cap = selectedTier === "tier2" ? 600 : 250;
  const buffer = selectedTier === "tier2" ? 20 : 8;
  const recommendedTarget = Math.min(cap, Math.round(cutoff + buffer));

  if (targetScoreEl) {
    targetScoreEl.max = String(cap);
    targetScoreEl.placeholder = selectedTier === "tier2" ? "e.g. 360" : "e.g. 150";
    const currentTarget = Number(targetScoreEl.value || 0);

    // If target is blank, capped out of range, or below cutoff, auto-correct to a realistic value.
    if (!currentTarget || currentTarget > cap || currentTarget < Math.round(cutoff)) {
      targetScoreEl.value = String(recommendedTarget);
    }
  }

  const previousCutoffInput = document.getElementById("previousCutoffInput");
  if (selectedTier !== "tier2" && previousCutoffInput && !previousCutoffInput.value) {
    previousCutoffInput.value = String(Math.round(cutoff));
  }

  if (statusEl) {
    const baseYear = goalCutoffCatalog.baseYear ? String(goalCutoffCatalog.baseYear) : "latest";
    const tierLabel = String(goalCutoffCatalog.tier || "tier1").toUpperCase();
    statusEl.textContent = `Auto cutoff loaded (${tierLabel}, ${baseYear} baseline): ${Math.round(cutoff)} | Recommended target: ${recommendedTarget}`;
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

  if (Number.isFinite(autoCutoff) && autoCutoff > 0 && targetScore < autoCutoff) {
    if (statusEl) {
      statusEl.textContent = `Target score is too low for selected post/category. Keep it at or above cutoff (${Math.round(autoCutoff)}).`;
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
    updateTopGoalFrame();
    updateGoalGapBanner(lastMarksEntries);
    updateTodayActionPlan(lastMarksEntries);
    loadUserOutcome();
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
  const prev7 = sorted.slice(7, 14);
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
  // Weekly improvement vs previous week
  let weekImprovement = null;
  if (prev7.length >= 3) {
    const prevAvg = prev7.reduce((acc, e) => acc + Number(e.total_marks || 0), 0) / prev7.length;
    weekImprovement = Number((overallAvg - prevAvg).toFixed(1));
  }
  return { subjectAvgs, subjectLabels, overallAvg, bestDay, worstDay, benchmarkGap, weekImprovement, count: last7.length };
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
  const { subjectAvgs, subjectLabels, overallAvg, bestDay, worstDay, benchmarkGap, weekImprovement, count } = report;

  // Weekly improvement headline sentence
  let improvementHtml = "";
  if (weekImprovement != null) {
    const daysGoal = _lastOutcome?.trend?.daysToGoal;
    const sign   = weekImprovement >= 0 ? "+" : "";
    const color  = weekImprovement >= 0 ? "#047857" : "#b91c1c";
    const emoji  = weekImprovement >= 0 ? "📈" : "📉";
    const paceMsg = daysGoal != null && daysGoal > 0
      ? ` At this rate → safe zone in ~${daysGoal} days.`
      : "";
    improvementHtml = `
      <div style="margin-top:12px;padding:10px 14px;border-radius:12px;background:#0f172a;border:1px solid #334155;color:#f1f5f9;font-size:13px;font-weight:700;">
        ${emoji} You ${weekImprovement >= 0 ? "improved" : "dropped"} <span style="color:${color}">${sign}${weekImprovement} marks</span> this week.${escapeHtml(paceMsg)}
      </div>`;
  }

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
      ${improvementHtml}
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
    referralState.code = normalizeReferralCode(data.referralCode || "");
    if (referralState.code) {
      setStoredReferralCode(referralState.code);
    }

    saveUnlockedPlan(unlockedPlan);
    setCurrentAccessPlan(effectivePlan);
    updatePremiumOptions(effectivePlan);
    hideUnlockedPlanButtons(unlockedPlan);
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
      body: JSON.stringify({
        userKey: getUserKey(),
        plan: 99,
        referralCode: getStoredReferralCode()
      })
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
    hideUnlockedPlanButtons(paymentAccessState.unlockedPlan);

    if (data?.referralReward?.credited) {
      showPaymentStatus("2-day premium trial activated. Referral validated and +2 bonus days credited to inviter.", "success");
    } else {
      showPaymentStatus("2-day premium trial activated. Explore all exclusive insights now.", "success");
    }
  } catch (err) {
    console.error("startFreeTrial error:", err);
    showPaymentStatus(err.message || "Could not start trial", "error");
  } finally {
    resetButtonLoading(triggerButton, originalText);
  }
}

function isLiveAdminModeEnabled() {
  try {
    const url = new URL(window.location.href);
    const adminParam = String(url.searchParams.get("admin") || "").trim();
    if (adminParam === "1" || adminParam.toLowerCase() === "true") {
      localStorage.setItem(ADMIN_MODE_STORAGE_KEY, "1");
      return true;
    }
    return String(localStorage.getItem(ADMIN_MODE_STORAGE_KEY) || "") === "1";
  } catch (err) {
    console.error("isLiveAdminModeEnabled error:", err);
    return false;
  }
}

function setLiveAdminStatus(message, isError = false) {
  const el = document.getElementById("liveAdminStatus");
  if (!el) return;
  el.textContent = message || "";
  el.style.color = isError ? "#b91c1c" : "#334155";
}

function renderLiveAdminMetrics(metrics = {}) {
  const el = document.getElementById("liveAdminMetrics");
  if (!el) return;

  el.innerHTML = `
    <div class="rounded-xl border border-slate-300 bg-white p-3 text-sm font-semibold text-slate-700">Goal: ${Number(metrics.goalSubscribers || 0).toLocaleString("en-IN")}</div>
    <div class="rounded-xl border border-slate-300 bg-white p-3 text-sm font-semibold text-slate-700">Paid: ${Number(metrics.paidSubscribers || 0).toLocaleString("en-IN")}</div>
    <div class="rounded-xl border border-slate-300 bg-white p-3 text-sm font-semibold text-slate-700">Remaining: ${Number(metrics.remainingToGoal || 0).toLocaleString("en-IN")}</div>
    <div class="rounded-xl border border-slate-300 bg-white p-3 text-sm font-semibold text-slate-700">Progress: ${Number(metrics.goalProgressPct || 0).toFixed(2)}%</div>
    <div class="rounded-xl border border-slate-300 bg-white p-3 text-sm font-semibold text-slate-700">Active Trials: ${Number(metrics.activeTrials || 0).toLocaleString("en-IN")}</div>
    <div class="rounded-xl border border-slate-300 bg-white p-3 text-sm font-semibold text-slate-700">Trial-to-Paid Gap: ${Number(metrics.trialToPaidGap || 0).toLocaleString("en-IN")}</div>
    <div class="rounded-xl border border-slate-300 bg-white p-3 text-sm font-semibold text-slate-700">Month Adds: ${Number(metrics.currentMonthPaidAdds || 0).toLocaleString("en-IN")}</div>
    <div class="rounded-xl border border-slate-300 bg-white p-3 text-sm font-semibold text-slate-700">Daily Run-Rate: ${Number(metrics.dailyRunRateThisMonth || 0).toFixed(2)}</div>
    <div class="rounded-xl border border-slate-300 bg-white p-3 text-sm font-semibold text-slate-700">Projected Month Adds: ${Number(metrics.projectedMonthPaidAdds || 0).toLocaleString("en-IN")}</div>
    <div class="rounded-xl border border-slate-300 bg-white p-3 text-sm font-semibold text-slate-700">Days To Goal: ${metrics.estimatedDaysToGoal == null ? "N/A" : Number(metrics.estimatedDaysToGoal).toLocaleString("en-IN")}</div>
    <div class="rounded-xl border border-slate-300 bg-white p-3 text-sm font-semibold text-slate-700">MRR (Rs): ${Number(metrics.monthlyRecurringRevenueRs || 0).toLocaleString("en-IN")}</div>
    <div class="rounded-xl border border-slate-300 bg-white p-3 text-sm font-semibold text-slate-700">ARR (Rs): ${Number(metrics.annualRunRateRs || 0).toLocaleString("en-IN")}</div>
  `;
}

async function requestLiveAdminMetrics(path, method = "GET", body = null) {
  const adminKey = String(document.getElementById("liveAdminKey")?.value || "").trim();
  if (!adminKey) {
    throw new Error("Enter admin key");
  }

  const options = {
    method,
    headers: {
      "x-admin-key": adminKey
    }
  };

  if (body && method !== "GET") {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const response = await fetch(path, options);
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || "Admin request failed");
  }
  return data;
}

async function loadLiveAdminMetrics() {
  try {
    setLiveAdminStatus("Loading subscriber growth metrics...");
    const data = await requestLiveAdminMetrics("/api/payment/metrics/subscribers", "GET");
    const metrics = data.metrics || {};
    renderLiveAdminMetrics(metrics);

    const goalInput = document.getElementById("liveGoalInput");
    if (goalInput) {
      goalInput.value = String(Number(metrics.goalSubscribers || 100000));
    }

    setLiveAdminStatus("Metrics loaded.");
  } catch (err) {
    console.error("loadLiveAdminMetrics error:", err);
    setLiveAdminStatus(err.message || "Could not load metrics", true);
  }
}

async function saveLiveSubscriberGoal() {
  try {
    const goalValue = Number(document.getElementById("liveGoalInput")?.value || 0);
    if (!Number.isFinite(goalValue) || goalValue <= 0) {
      setLiveAdminStatus("Enter a valid positive goal.", true);
      return;
    }

    setLiveAdminStatus("Saving goal...");
    await requestLiveAdminMetrics("/api/payment/metrics/subscribers/goal", "POST", {
      goalSubscribers: goalValue
    });
    setLiveAdminStatus("Goal saved.");
    await loadLiveAdminMetrics();
  } catch (err) {
    console.error("saveLiveSubscriberGoal error:", err);
    setLiveAdminStatus(err.message || "Could not save goal", true);
  }
}

function initLiveAdminGrowthPanel() {
  const panel = document.getElementById("liveAdminGrowthPanel");
  if (!panel) return;

  if (!isLiveAdminModeEnabled()) {
    panel.classList.add("hidden");
    return;
  }

  panel.classList.remove("hidden");

  const loadBtn = document.getElementById("liveLoadMetricsBtn");
  if (loadBtn) {
    loadBtn.addEventListener("click", function () {
      loadLiveAdminMetrics();
    });
  }

  const saveBtn = document.getElementById("liveSaveGoalBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      saveLiveSubscriberGoal();
    });
  }
}

function getSocialDisplayName() {
  try {
    const saved = String(localStorage.getItem("sscranklab_display_name") || "").trim();
    if (saved) return saved;

    const userKey = String(getUserKey() || "");
    const suffix = userKey.slice(-4).toUpperCase();
    const generated = suffix ? `SSC#${suffix}` : "SSC Aspirant";
    localStorage.setItem("sscranklab_display_name", generated);
    return generated;
  } catch (err) {
    console.error("getSocialDisplayName error:", err);
    return "SSC Aspirant";
  }
}

function setSocialStatus(message, isError = false) {
  const el = document.getElementById("socialStatus");
  if (!el) return;
  el.textContent = message || "";
  el.style.color = isError ? "#b91c1c" : "#334155";
}

async function socialRequest(path, method = "GET", body = null) {
  const options = { method, headers: {} };
  if (body && method !== "GET") {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const response = await fetch(path, options);
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

function renderMyGroups() {
  const host = document.getElementById("myGroupsList");
  if (!host) return;

  if (!Array.isArray(socialState.myGroups) || socialState.myGroups.length === 0) {
    host.innerHTML = '<div class="group-item">No groups yet. Create one or join with invite.</div>';
    return;
  }

  host.innerHTML = socialState.myGroups.map((group) => {
    const active = socialState.activeGroupId === group.id ? " active" : "";
    const invite = group.inviteCode ? `<div style="font-size:11px;color:#475569;margin-top:4px;">Invite: ${escapeHtml(group.inviteCode)}</div>` : "";
    return `
      <div class="group-item${active}" data-group-id="${escapeHtml(group.id)}">
        <div style="font-weight:800;">${escapeHtml(group.name)} (${Number(group.memberCount || 0)}/${Number(group.memberLimit || 0)})</div>
        ${invite}
        <div style="display:flex;gap:8px;margin-top:8px;">
          <button type="button" data-action="open" data-group-id="${escapeHtml(group.id)}" style="padding:6px 10px;border:none;border-radius:8px;background:#0f172a;color:#fff;font-size:11px;font-weight:800;cursor:pointer;">Open</button>
          <button type="button" data-action="copy" data-code="${escapeHtml(group.inviteCode || "")}" style="padding:6px 10px;border:none;border-radius:8px;background:#e2e8f0;color:#0f172a;font-size:11px;font-weight:800;cursor:pointer;">Copy Invite</button>
        </div>
      </div>
    `;
  }).join("");
}

function renderDiscoverGroups() {
  const host = document.getElementById("discoverGroupsList");
  if (!host) return;

  if (!Array.isArray(socialState.discoverGroups) || socialState.discoverGroups.length === 0) {
    host.innerHTML = '<div class="group-item">No public groups available.</div>';
    return;
  }

  host.innerHTML = socialState.discoverGroups.map((group) => {
    const memberLabel = `${Number(group.memberCount || 0)}/${Number(group.memberLimit || 0)}`;
    const action = group.isMember
      ? `<button type="button" data-action="open" data-group-id="${escapeHtml(group.id)}" style="padding:6px 10px;border:none;border-radius:8px;background:#0f172a;color:#fff;font-size:11px;font-weight:800;cursor:pointer;">Open</button>`
      : `<button type="button" data-action="join-code" data-code="${escapeHtml(group.inviteCode || "")}" style="padding:6px 10px;border:none;border-radius:8px;background:#1d4ed8;color:#fff;font-size:11px;font-weight:800;cursor:pointer;">Join</button>`;

    return `
      <div class="group-item">
        <div style="font-weight:800;">${escapeHtml(group.name)} (${memberLabel})</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
          <span style="font-size:11px;color:#64748b;">${escapeHtml(group.visibility || "public")}</span>
          ${action}
        </div>
      </div>
    `;
  }).join("");
}

function renderMembers(members = []) {
  const host = document.getElementById("groupMembersList");
  if (!host) return;

  if (!Array.isArray(members) || members.length === 0) {
    host.innerHTML = '<div class="member"><div class="name">No members loaded</div></div>';
    return;
  }

  host.innerHTML = members.map((member) => {
    const role = member.role === "owner" ? "Owner" : "Member";
    return `
      <div class="member">
        <div class="name">${escapeHtml(member.displayName || member.userKey || "Member")}</div>
        <div class="meta">${escapeHtml(member.userKey || "")} | <strong>${escapeHtml(role)}</strong></div>
      </div>
    `;
  }).join("");
}

function renderChat(messages = []) {
  const host = document.getElementById("groupChatList");
  if (!host) return;

  if (!Array.isArray(messages) || messages.length === 0) {
    host.innerHTML = '<div class="msg">No chat yet. Send the first message.</div>';
    return;
  }

  host.innerHTML = messages.map((msg) => {
    const isChallenge = String(msg.messageType || "") === "challenge";
    const cls = isChallenge ? "msg challenge" : "msg";
    return `<div class="${cls}"><b>${escapeHtml(msg.displayName || msg.userKey || "User")}:</b> ${escapeHtml(msg.text || "")}</div>`;
  }).join("");
  host.scrollTop = host.scrollHeight;
}

function renderChallenges(challenges = []) {
  const listHost = document.getElementById("challengeList");
  const select = document.getElementById("challengeSelectInput");
  if (listHost) {
    if (!Array.isArray(challenges) || challenges.length === 0) {
      listHost.innerHTML = '<div class="group-item">No challenges yet.</div>';
    } else {
      listHost.innerHTML = challenges.map((challenge) => `
        <div class="group-item" data-challenge-id="${escapeHtml(challenge.id)}">
          <div style="font-weight:800;">${escapeHtml(challenge.title)}</div>
          <div style="font-size:11px;color:#64748b;margin-top:4px;">${Number(challenge.questionCount || 0)}Q | ${Number(challenge.timeLimitMin || 0)} min | attempts ${Number(challenge.attemptCount || 0)}</div>
          <button type="button" data-action="view-results" data-challenge-id="${escapeHtml(challenge.id)}" style="margin-top:8px;padding:6px 10px;border:none;border-radius:8px;background:#334155;color:#fff;font-size:11px;font-weight:800;cursor:pointer;">View Results</button>
        </div>
      `).join("");
    }
  }

  if (select) {
    if (!Array.isArray(challenges) || challenges.length === 0) {
      select.innerHTML = '<option value="">No challenges</option>';
    } else {
      select.innerHTML = challenges.map((challenge) => `<option value="${escapeHtml(challenge.id)}">${escapeHtml(challenge.title)}</option>`).join("");
    }
  }
}

function renderChallengeResults(payload = {}) {
  const host = document.getElementById("challengeResultsList");
  if (!host) return;

  const rows = Array.isArray(payload.results) ? payload.results : [];
  if (rows.length === 0) {
    host.innerHTML = '<div class="member"><div class="name">No attempts yet.</div></div>';
    return;
  }

  host.innerHTML = rows.map((row) => `
    <div class="member">
      <div class="name">#${Number(row.rank || 0)} ${escapeHtml(row.displayName || row.userKey || "Member")}</div>
      <div class="meta">${Number(row.score || 0)}/${Number(row.total || 0)} (${Number(row.pct || 0).toFixed(2)}%) | ${Number(row.timeTakenSec || 0)} sec</div>
    </div>
  `).join("");
}

function renderNotifications(notifications = []) {
  const list = document.getElementById("notifList");
  const toggle = document.getElementById("notifToggle");
  if (!list || !toggle) return;

  const unread = notifications.filter((item) => !item.read).length;
  toggle.textContent = `Notifications (${unread})`;

  if (notifications.length === 0) {
    list.innerHTML = '<div class="notif-item">No notifications yet.</div>';
    return;
  }

  list.innerHTML = notifications.map((item) => {
    const dot = item.read ? "" : "<span style=\"display:inline-block;width:8px;height:8px;border-radius:50%;background:#2563eb;margin-right:8px;\"></span>";
    const title = escapeHtml(String(item.title || "Update"));
    const message = escapeHtml(String(item.message || ""));
    return `<div class="notif-item">${dot}<strong>${title}</strong><div style="margin-top:4px;color:#64748b;">${message}</div></div>`;
  }).join("");
}

async function loadMyGroups({ silent = false } = {}) {
  try {
    const data = await socialRequest(`/api/social/groups/my?userKey=${encodeURIComponent(getUserKey())}`);
    socialState.myGroups = Array.isArray(data.groups) ? data.groups : [];
    renderMyGroups();
    if (!socialState.activeGroupId && socialState.myGroups.length > 0) {
      await openGroupById(socialState.myGroups[0].id, { silent: true });
    }
    if (!silent) setSocialStatus("Groups loaded.");
  } catch (err) {
    console.error("loadMyGroups error:", err);
    setSocialStatus(err.message || "Could not load groups", true);
  }
}

async function loadDiscoverGroups({ silent = false } = {}) {
  try {
    const data = await socialRequest(`/api/social/groups/discover?userKey=${encodeURIComponent(getUserKey())}`);
    socialState.discoverGroups = Array.isArray(data.groups) ? data.groups : [];
    renderDiscoverGroups();
    if (!silent) setSocialStatus("Discover list updated.");
  } catch (err) {
    console.error("loadDiscoverGroups error:", err);
    setSocialStatus(err.message || "Could not load discover groups", true);
  }
}

async function loadGroupMembers(groupId, { silent = false } = {}) {
  const data = await socialRequest(`/api/social/groups/${encodeURIComponent(groupId)}/members?userKey=${encodeURIComponent(getUserKey())}`);
  renderMembers(Array.isArray(data.members) ? data.members : []);
  if (!silent) setSocialStatus("Members loaded.");
}

async function loadGroupChat(groupId, { silent = false } = {}) {
  const data = await socialRequest(`/api/social/groups/${encodeURIComponent(groupId)}/chat?userKey=${encodeURIComponent(getUserKey())}`);
  renderChat(Array.isArray(data.messages) ? data.messages : []);
  if (!silent) setSocialStatus("Chat updated.");
}

async function loadGroupChallenges(groupId, { silent = false } = {}) {
  const data = await socialRequest(`/api/social/groups/${encodeURIComponent(groupId)}/challenges?userKey=${encodeURIComponent(getUserKey())}`);
  socialState.challenges = Array.isArray(data.challenges) ? data.challenges : [];
  renderChallenges(socialState.challenges);

  const select = document.getElementById("challengeSelectInput");
  if (select && select.value) {
    await loadChallengeResults(groupId, select.value, { silent: true });
  } else if (socialState.challenges[0]) {
    await loadChallengeResults(groupId, socialState.challenges[0].id, { silent: true });
  } else {
    renderChallengeResults({ results: [] });
  }

  if (!silent) setSocialStatus("Challenges loaded.");
}

async function loadChallengeResults(groupId, challengeId, { silent = false } = {}) {
  if (!challengeId) {
    renderChallengeResults({ results: [] });
    return;
  }
  const data = await socialRequest(`/api/social/groups/${encodeURIComponent(groupId)}/challenges/${encodeURIComponent(challengeId)}/results?userKey=${encodeURIComponent(getUserKey())}`);
  renderChallengeResults(data);
  if (!silent) setSocialStatus("Results loaded.");
}

async function openGroupById(groupId, { silent = false } = {}) {
  if (!groupId) return;
  socialState.activeGroupId = groupId;
  renderMyGroups();

  const activeGroup = socialState.myGroups.find((item) => item.id === groupId) || socialState.discoverGroups.find((item) => item.id === groupId);
  const title = document.getElementById("activeGroupTitle");
  if (title) {
    title.textContent = activeGroup ? `${activeGroup.name} Chat` : "Group Chat";
  }

  await Promise.all([
    loadGroupMembers(groupId, { silent: true }),
    loadGroupChat(groupId, { silent: true }),
    loadGroupChallenges(groupId, { silent: true })
  ]);

  if (!silent) setSocialStatus("Group opened.");

  if (socialChatPollTimer) clearInterval(socialChatPollTimer);
  socialChatPollTimer = setInterval(() => {
    if (!socialState.activeGroupId) return;
    loadGroupChat(socialState.activeGroupId, { silent: true }).catch(() => {});
    loadGroupChallenges(socialState.activeGroupId, { silent: true }).catch(() => {});
  }, SOCIAL_POLL_MS);
}

async function createGroup() {
  const name = String(document.getElementById("groupNameInput")?.value || "").trim();
  const visibility = String(document.getElementById("groupVisibilityInput")?.value || "private").trim();
  const memberLimit = Number(document.getElementById("groupLimitInput")?.value || 20);

  if (!name) {
    setSocialStatus("Enter group name first.", true);
    return;
  }

  try {
    setSocialStatus("Creating group...");
    await socialRequest("/api/social/groups/create", "POST", {
      userKey: getUserKey(),
      displayName: getSocialDisplayName(),
      name,
      visibility,
      memberLimit
    });
    document.getElementById("groupNameInput").value = "";
    await loadMyGroups({ silent: true });
    await loadDiscoverGroups({ silent: true });
    setSocialStatus("Group created.");
  } catch (err) {
    console.error("createGroup error:", err);
    setSocialStatus(err.message || "Could not create group", true);
  }
}

async function joinGroupByInvite(inviteCode) {
  const code = String(inviteCode || "").trim().toUpperCase();
  if (!code) {
    setSocialStatus("Enter invite code first.", true);
    return;
  }

  try {
    setSocialStatus("Joining group...");
    const data = await socialRequest("/api/social/groups/join", "POST", {
      userKey: getUserKey(),
      displayName: getSocialDisplayName(),
      inviteCode: code
    });
    const joinInput = document.getElementById("joinInviteInput");
    if (joinInput) joinInput.value = "";
    await loadMyGroups({ silent: true });
    await loadDiscoverGroups({ silent: true });
    await openGroupById(data.group?.id, { silent: true });
    setSocialStatus("Joined successfully.");
  } catch (err) {
    console.error("joinGroupByInvite error:", err);
    setSocialStatus(err.message || "Could not join group", true);
  }
}

async function sendChatMessage() {
  const groupId = socialState.activeGroupId;
  const input = document.getElementById("groupChatInput");
  const text = String(input?.value || "").trim();

  if (!groupId) {
    setSocialStatus("Open a group first.", true);
    return;
  }
  if (!text) return;

  try {
    await socialRequest(`/api/social/groups/${encodeURIComponent(groupId)}/chat`, "POST", {
      userKey: getUserKey(),
      displayName: getSocialDisplayName(),
      text
    });
    if (input) input.value = "";
    await loadGroupChat(groupId, { silent: true });
  } catch (err) {
    console.error("sendChatMessage error:", err);
    setSocialStatus(err.message || "Could not send message", true);
  }
}

async function createChallenge() {
  const groupId = socialState.activeGroupId;
  if (!groupId) {
    setSocialStatus("Open a group first.", true);
    return;
  }

  const title = String(document.getElementById("challengeTitleInput")?.value || "").trim();
  const questionCount = Number(document.getElementById("challengeQInput")?.value || 5);
  const timeLimitMin = Number(document.getElementById("challengeTimeInput")?.value || 15);

  if (!title) {
    setSocialStatus("Enter challenge title.", true);
    return;
  }

  try {
    await socialRequest(`/api/social/groups/${encodeURIComponent(groupId)}/challenges`, "POST", {
      userKey: getUserKey(),
      displayName: getSocialDisplayName(),
      title,
      questionCount,
      timeLimitMin
    });

    const titleInput = document.getElementById("challengeTitleInput");
    if (titleInput) titleInput.value = "";

    await loadGroupChallenges(groupId, { silent: true });
    await loadGroupChat(groupId, { silent: true });
    setSocialStatus("Challenge posted.");
  } catch (err) {
    console.error("createChallenge error:", err);
    setSocialStatus(err.message || "Could not create challenge", true);
  }
}

async function submitChallengeAttempt() {
  const groupId = socialState.activeGroupId;
  const challengeId = String(document.getElementById("challengeSelectInput")?.value || "").trim();
  const score = Number(document.getElementById("challengeScoreInput")?.value || 0);
  const total = Number(document.getElementById("challengeTotalInput")?.value || 100);
  const timeTakenSec = Number(document.getElementById("challengeTimeTakenInput")?.value || 0);

  if (!groupId || !challengeId) {
    setSocialStatus("Select group and challenge first.", true);
    return;
  }

  try {
    await socialRequest(`/api/social/groups/${encodeURIComponent(groupId)}/challenges/${encodeURIComponent(challengeId)}/attempt`, "POST", {
      userKey: getUserKey(),
      displayName: getSocialDisplayName(),
      score,
      total,
      timeTakenSec
    });
    await loadChallengeResults(groupId, challengeId, { silent: true });
    await loadGroupChallenges(groupId, { silent: true });
    setSocialStatus("Attempt submitted.");
  } catch (err) {
    console.error("submitChallengeAttempt error:", err);
    setSocialStatus(err.message || "Could not submit attempt", true);
  }
}

async function loadNotifications({ silent = false } = {}) {
  try {
    const data = await socialRequest(`/api/social/notifications/${encodeURIComponent(getUserKey())}`);
    renderNotifications(Array.isArray(data.notifications) ? data.notifications : []);
    if (!silent) setSocialStatus("Notifications synced.");
  } catch (err) {
    console.error("loadNotifications error:", err);
    if (!silent) setSocialStatus(err.message || "Could not load notifications", true);
  }
}

async function markAllNotificationsRead() {
  try {
    await socialRequest(`/api/social/notifications/${encodeURIComponent(getUserKey())}/read-all`, "POST", {});
    await loadNotifications({ silent: true });
    setSocialStatus("All notifications marked as read.");
  } catch (err) {
    console.error("markAllNotificationsRead error:", err);
    setSocialStatus(err.message || "Could not mark notifications", true);
  }
}

function initSocialFeatures() {
  const myGroups = document.getElementById("myGroupsList");
  if (!myGroups) return;

  const createBtn = document.getElementById("createGroupBtn");
  if (createBtn) {
    createBtn.addEventListener("click", function () {
      createGroup();
    });
  }

  const joinBtn = document.getElementById("joinGroupBtn");
  if (joinBtn) {
    joinBtn.addEventListener("click", function () {
      const code = document.getElementById("joinInviteInput")?.value;
      joinGroupByInvite(code);
    });
  }

  const chatBtn = document.getElementById("sendGroupMsgBtn");
  if (chatBtn) {
    chatBtn.addEventListener("click", function () {
      sendChatMessage();
    });
  }

  const chatInput = document.getElementById("groupChatInput");
  if (chatInput) {
    chatInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        sendChatMessage();
      }
    });
  }

  const challengeBtn = document.getElementById("createChallengeBtn");
  if (challengeBtn) {
    challengeBtn.addEventListener("click", function () {
      createChallenge();
    });
  }

  const submitAttemptBtn = document.getElementById("submitChallengeAttemptBtn");
  if (submitAttemptBtn) {
    submitAttemptBtn.addEventListener("click", function () {
      submitChallengeAttempt();
    });
  }

  const challengeSelect = document.getElementById("challengeSelectInput");
  if (challengeSelect) {
    challengeSelect.addEventListener("change", function () {
      if (!socialState.activeGroupId) return;
      loadChallengeResults(socialState.activeGroupId, challengeSelect.value, { silent: true }).catch(() => {});
    });
  }

  const markReadBtn = document.getElementById("markAllNotifsReadBtn");
  if (markReadBtn) {
    markReadBtn.addEventListener("click", function () {
      markAllNotificationsRead();
    });
  }

  myGroups.addEventListener("click", async function (event) {
    const button = event.target.closest("button[data-action][data-group-id],button[data-action][data-code]");
    if (!button) return;

    const action = String(button.dataset.action || "");
    if (action === "open") {
      await openGroupById(String(button.dataset.groupId || ""));
      return;
    }

    if (action === "copy") {
      const code = String(button.dataset.code || "");
      if (!code) return;
      try {
        await navigator.clipboard.writeText(code);
        setSocialStatus(`Invite copied: ${code}`);
      } catch {
        setSocialStatus(`Invite code: ${code}`);
      }
    }
  });

  const discoverList = document.getElementById("discoverGroupsList");
  if (discoverList) {
    discoverList.addEventListener("click", async function (event) {
      const button = event.target.closest("button[data-action][data-group-id],button[data-action][data-code]");
      if (!button) return;

      const action = String(button.dataset.action || "");
      if (action === "open") {
        await openGroupById(String(button.dataset.groupId || ""));
      } else if (action === "join-code") {
        await joinGroupByInvite(String(button.dataset.code || ""));
      }
    });
  }

  const challengeList = document.getElementById("challengeList");
  if (challengeList) {
    challengeList.addEventListener("click", async function (event) {
      const button = event.target.closest("button[data-action='view-results'][data-challenge-id]");
      if (!button || !socialState.activeGroupId) return;
      const challengeId = String(button.dataset.challengeId || "");
      const select = document.getElementById("challengeSelectInput");
      if (select && challengeId) select.value = challengeId;
      await loadChallengeResults(socialState.activeGroupId, challengeId);
    });
  }

  loadMyGroups({ silent: true });
  loadDiscoverGroups({ silent: true });
  loadNotifications({ silent: true });

  if (socialNotifPollTimer) clearInterval(socialNotifPollTimer);
  socialNotifPollTimer = setInterval(function () {
    loadNotifications({ silent: true }).catch(() => {});
  }, SOCIAL_POLL_MS);
}