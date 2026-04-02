document.addEventListener("DOMContentLoaded", function () {
  bindPredictRankButton();
  bindUnlockButtons();
  bindDirectBuyButtons();

  activeTierMode = getStoredTierMode();
  applyTierModeButtons();

  const tierModeBtnTier1 = document.getElementById("tierModeBtnTier1");
  if (tierModeBtnTier1) {
    tierModeBtnTier1.addEventListener("click", function () {
      switchTierMode("tier1");
    });
  }

  const tierModeBtnTier2 = document.getElementById("tierModeBtnTier2");
  if (tierModeBtnTier2) {
    tierModeBtnTier2.addEventListener("click", function () {
      switchTierMode("tier2");
    });
  }


  ensureUserKey();
  checkAuthOnLoad();
  captureReferralCodeFromUrl();
  restoreUnlockedPlan();
  initCharts();

  const testDateInput = document.getElementById("testDate");
  if (testDateInput && !testDateInput.value) {
    testDateInput.value = new Date().toISOString().split("T")[0];
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

  const qlabTestTypeEl = document.getElementById("qlabTestType");
  if (qlabTestTypeEl) {
    qlabTestTypeEl.addEventListener("change", updateQLAbControlVisibility);
  }

  const qlabSubjectEl = document.getElementById("qlabSubject");
  if (qlabSubjectEl) {
    qlabSubjectEl.addEventListener("change", function () {
      updateQLAbControlVisibility();
      renderQuestionLabTopicChecklist();
    });
  }

  const qlabTierEl = document.getElementById("qlabTier");
  if (qlabTierEl) {
    qlabTierEl.addEventListener("change", function () {
      const newTier = qlabTierEl.value || "tier1";
      activeTierMode = normalizeTierMode(newTier);
      setStoredTierMode(activeTierMode);
      applyTierModeButtons();
      renderQuestionLabTopicChecklist();
    });
  }

  const questionLabListEl = document.getElementById("questionLabList");
  if (questionLabListEl && questionLabListEl.dataset.optionBound !== "1") {
    questionLabListEl.dataset.optionBound = "1";
    questionLabListEl.addEventListener("click", handleQuestionLabOptionClick);
  }

  const checkQuestionLabBtn = document.getElementById("btnCheckQuestionLab");
  if (checkQuestionLabBtn) {
    checkQuestionLabBtn.addEventListener("click", checkQuestionLabPerformance);
  }

  const toggleQuestionLabAnswersBtn = document.getElementById("btnToggleQuestionLabAnswers");
  if (toggleQuestionLabAnswersBtn) {
    toggleQuestionLabAnswersBtn.addEventListener("click", toggleQuestionLabAnswers);
  }

  const startTrialBtn = document.getElementById("startTrialBtn");
  if (startTrialBtn) {
    startTrialBtn.addEventListener("click", function () {
      startFreeTrial(startTrialBtn);
    });
  }

  const saveGoalBtnEl = document.getElementById("saveGoalBtn");
  if (saveGoalBtnEl) {
    saveGoalBtnEl.addEventListener("click", saveGoalProfile);
  }

  const saveSelfReviewBtnEl = document.getElementById("saveSelfReviewBtn");
  if (saveSelfReviewBtnEl) {
    saveSelfReviewBtnEl.addEventListener("click", saveSelfDeclaredReview);
  }

  const topicDrillBtnEl = document.getElementById("topicDrillBtn");
  if (topicDrillBtnEl) {
    topicDrillBtnEl.addEventListener("click", function () {
      openTopicDrillModal(document.getElementById("testDate")?.value || "");
    });
  }

  const topicDrillCloseBtnEl = document.getElementById("topicDrillCloseBtn");
  if (topicDrillCloseBtnEl) {
    topicDrillCloseBtnEl.addEventListener("click", closeTopicDrillModal);
  }

  const topicDrillModalEl = document.getElementById("topicDrillModal");
  if (topicDrillModalEl) {
    topicDrillModalEl.addEventListener("click", function (e) {
      if (e.target === topicDrillModalEl) closeTopicDrillModal();
    });
  }

  const topicDrillTabsEl = document.getElementById("topicDrillTabs");
  if (topicDrillTabsEl) {
    topicDrillTabsEl.addEventListener("click", function (e) {
      const tab = e.target.closest(".topic-modal-tab");
      if (!tab) return;
      const subject = tab.dataset.subject;
      if (subject && subject !== _topicDrillActiveSubject) {
        _topicDrillActiveSubject = subject;
        applyTopicTabsUI();
        renderTopicRows(subject);
      }
    });
  }

  const topicDrillSaveBtnEl = document.getElementById("topicDrillSaveBtn");
  if (topicDrillSaveBtnEl) {
    topicDrillSaveBtnEl.addEventListener("click", saveTopicDrill);
  }

  const weakSuggestRefreshBtn = document.getElementById("weakSuggestRefreshBtn");
  if (weakSuggestRefreshBtn) {
    weakSuggestRefreshBtn.addEventListener("click", function () {
      updateTodayActionPlan(lastMarksEntries);
    });
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

  const closeGoalModalBtn = document.getElementById("closeGoalModal");
  if (closeGoalModalBtn) {
    closeGoalModalBtn.addEventListener("click", closeGoalModal);
  }

  const goalModalEl = document.getElementById("goalModal");
  if (goalModalEl) {
    goalModalEl.addEventListener("click", function (e) {
      if (e.target === goalModalEl) closeGoalModal();
    });
  }

  const hookSetupGoalBtn = document.getElementById("hookSetupGoalBtn");
  if (hookSetupGoalBtn) {
    hookSetupGoalBtn.addEventListener("click", function () {
      showGoalModal();
    });
  }

  const navOpenGoalBtn = document.getElementById("navOpenGoal");
  if (navOpenGoalBtn) {
    navOpenGoalBtn.addEventListener("click", function (event) {
      event.preventDefault();
      showGoalModal();
    });
  }

  const goalReminderBtn = document.getElementById("goalReminderBtn");
  if (goalReminderBtn) {
    goalReminderBtn.addEventListener("click", function () {
      showGoalModal();
    });
  }

  const hzWhatifBtn = document.getElementById("hzWhatifBtn");
  if (hzWhatifBtn) {
    hzWhatifBtn.addEventListener("click", runWhatIfSimulator);
  }

  const hzWhatifInput = document.getElementById("hzWhatifInput");
  if (hzWhatifInput) {
    hzWhatifInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        runWhatIfSimulator();
      }
    });
  }

  const hzNotifClose = document.getElementById("hzNotifClose");
  if (hzNotifClose) {
    hzNotifClose.addEventListener("click", function () {
      const toast = document.getElementById("hzNotifToast");
      if (toast) toast.style.display = "none";
    });
  }

  const closeUpgradeModalBtn = document.getElementById("closeUpgradeModal");
  if (closeUpgradeModalBtn) {
    closeUpgradeModalBtn.addEventListener("click", closeUpgradeModal);
  }

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
      startFreeTrial(startTrialBtn || upgradeModalTrialBtn);
    });
  }

  const upgradeModal = document.getElementById("upgradeModal");
  if (upgradeModal) {
    upgradeModal.addEventListener("click", function (event) {
      if (event.target === upgradeModal) closeUpgradeModal();
    });
  }

  initSocialFeatures();
  initLiveAdminGrowthPanel();
  initQuestionAdminPanel();

  loadBenchmarkProfile();
  loadMarksHistory();
  loadQuestionLabMeta();
  loadQuestionLabItems({ interactive: false });
  syncPaymentStatus();
  setInterval(syncPaymentStatus, 60000);

  attachCombinedDashboardInputListeners();
  refreshCombinedDashboard();
  updateQuestionGeneratorRecords();

  loadGoalCutoffCatalog();
  setTimeout(checkGoalOnboarding, 900);
});

function bindPredictRankButton() {
  const predictBtn = document.getElementById("btnRankPredictor");
  if (!predictBtn || predictBtn.dataset.predictBound === "1") return;

  predictBtn.dataset.predictBound = "1";
  predictBtn.type = "button";
  predictBtn.addEventListener("click", function (event) {
    event.preventDefault();
    predictRank();
  });
}

let rankChartInstance = null;
let sectionChartInstance = null;
let progressChartInstance = null;
let subjectChartInstance = null;
let benchmarkProfile = null;
let questionLabCache = [];
let questionLabMetaCache = { topics: [], coverageByTier: {} };
let questionLabLastResult = { summary: null, warnings: [], mode: "practice", served: 0 };
let questionLabSelections = {};
let questionLabAnswersVisible = false;
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
const ACTIVE_TIER_STORAGE_KEY = "sscranklab_active_tier_mode";
const LOCAL_BACKEND_PORTS = new Set(["3000", "10000", "3100"]);
let activeTierMode = "tier1";
let goalsByTierCache = {};
let benchmarksByTierCache = {};
let selfReviewByTierCache = {};
let topicDrillByTierCache = {};
let _topicDrillModalTestDate = "";
let _topicDrillActiveSubject = "Quant";

function getConfiguredApiBase() {
  try {
    const localOverride = String(localStorage.getItem("sscranklab_api_base") || "").trim();
    if (localOverride) return localOverride.replace(/\/+$/, "");

    const metaValue = String(document.querySelector('meta[name="sscranklab-api-base"]')?.content || "").trim();
    if (metaValue) return metaValue.replace(/\/+$/, "");
  } catch (err) {
    console.error("getConfiguredApiBase error:", err);
  }
  return "";
}

function getApiBaseUrl() {
  try {
    const configured = getConfiguredApiBase();
    if (configured) return configured;

    const protocol = String(window.location.protocol || "").toLowerCase();
    const hostname = String(window.location.hostname || "").toLowerCase();
    const port = String(window.location.port || "").trim();
    const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";

    if (protocol === "file:") {
      return "http://localhost:3000";
    }

    if (isLocalHost && port && !LOCAL_BACKEND_PORTS.has(port)) {
      return "http://localhost:3000";
    }
  } catch (err) {
    console.error("getApiBaseUrl error:", err);
  }

  return "";
}

function apiUrl(path) {
  const normalizedPath = String(path || "").trim();
  if (!normalizedPath) return "";
  if (/^https?:\/\//i.test(normalizedPath)) return normalizedPath;

  const prefixedPath = normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
  const base = getApiBaseUrl();
  return base ? `${base}${prefixedPath}` : prefixedPath;
}

/* Full SSC CGL Tier 1 + Tier 2 syllabus, organised by subject */
const SSC_TOPICS = {
  Quant: [
    "Number System", "Percentage", "Profit & Loss", "Ratio & Proportion",
    "Time & Work", "Time, Speed & Distance", "Simple & Compound Interest",
    "Averages & Mixtures", "Algebra", "Geometry", "Mensuration",
    "Trigonometry", "Data Interpretation"
  ],
  English: [
    "Reading Comprehension", "Cloze Test", "Error Spotting",
    "Fill in the Blanks", "Synonyms / Antonyms", "Idioms & Phrases",
    "One Word Substitution", "Sentence Improvement", "Para Jumbles",
    "Active / Passive Voice", "Direct / Indirect Speech"
  ],
  Reasoning: [
    "Analogies", "Number / Letter Series", "Coding - Decoding",
    "Blood Relations", "Direction & Distance", "Classification",
    "Syllogism", "Matrix & Missing Number", "Venn Diagrams",
    "Non-Verbal Reasoning", "Seating Arrangement", "Statement & Conclusion"
  ],
  GK: [
    "History", "Geography", "Indian Polity", "Economy",
    "Physics", "Chemistry", "Biology", "Current Affairs",
    "Static GK", "Sports & Awards"
  ],
  Computer: [
    "Computer Basics & Hardware", "MS Office - Word & Excel",
    "Internet & Networking", "Operating System",
    "MS Excel Functions", "Database Basics", "Shortcut Keys & Tricks"
  ]
};

const TIER_FORM_CONFIG = {
  tier1: {
    subjects: [
      { key: "quant", id: "quantMarks", label: "Quant", dbKey: "quant_marks", max: 50, color: "rgb(239,68,68)", bg: "rgba(239,68,68,.1)" },
      { key: "english", id: "englishMarks", label: "English", dbKey: "english_marks", max: 50, color: "rgb(34,197,94)", bg: "rgba(34,197,94,.1)" },
      { key: "reasoning", id: "reasoningMarks", label: "Reasoning", dbKey: "reasoning_marks", max: 50, color: "rgb(168,85,247)", bg: "rgba(168,85,247,.1)" },
      { key: "gk", id: "gkMarks", label: "GK", dbKey: "gk_marks", max: 50, color: "rgb(251,191,36)", bg: "rgba(251,191,36,.1)" }
    ],
    totalMax: 200
  },
  tier2: {
    subjects: [
      { key: "quant", id: "quantMarks", label: "Quant", dbKey: "quant_marks", max: 90, color: "rgb(239,68,68)", bg: "rgba(239,68,68,.1)" },
      { key: "english", id: "englishMarks", label: "English", dbKey: "english_marks", max: 135, color: "rgb(34,197,94)", bg: "rgba(34,197,94,.1)" },
      { key: "reasoning", id: "reasoningMarks", label: "Reasoning", dbKey: "reasoning_marks", max: 90, color: "rgb(168,85,247)", bg: "rgba(168,85,247,.1)" },
      { key: "gk", id: "gkMarks", label: "GK", dbKey: "gk_marks", max: 75, color: "rgb(251,191,36)", bg: "rgba(251,191,36,.1)" },
      { key: "computer", id: "computerMarks", label: "Computer", dbKey: "computer_marks", max: 60, color: "rgb(6,182,212)", bg: "rgba(6,182,212,.1)", qualifying: true }
    ],
    totalMax: 390  // merit only: Quant(90)+English(135)+Reasoning(90)+GK(75); Computer(60) qualifying
  }
};

function getTierCfg() {
  return TIER_FORM_CONFIG[normalizeTierMode(activeTierMode)] || TIER_FORM_CONFIG.tier1;
}

let pendingSelfReviewDate = "";

function normalizeTierMode(value) {
  const tier = String(value || "tier1").trim().toLowerCase();
  return tier === "tier2" ? "tier2" : "tier1";
}

function getStoredTierMode() {
  try {
    return normalizeTierMode(localStorage.getItem(ACTIVE_TIER_STORAGE_KEY) || "tier1");
  } catch (err) {
    console.error("getStoredTierMode error:", err);
    return "tier1";
  }
}

function setStoredTierMode(tier) {
  try {
    localStorage.setItem(ACTIVE_TIER_STORAGE_KEY, normalizeTierMode(tier));
  } catch (err) {
    console.error("setStoredTierMode error:", err);
  }
}

function applyTierModeButtons() {
  const tier1Btn = document.getElementById("tierModeBtnTier1");
  const tier2Btn = document.getElementById("tierModeBtnTier2");
  if (tier1Btn) tier1Btn.classList.toggle("active", activeTierMode === "tier1");
  if (tier2Btn) tier2Btn.classList.toggle("active", activeTierMode === "tier2");

  // Sync question lab tier dropdown
  const qlabTierEl = document.getElementById("qlabTier");
  if (qlabTierEl) qlabTierEl.value = activeTierMode;

  // Rank predictor is Tier 2 only — hide when Tier 1 is active
  const predictorBox = document.getElementById("predictorTier2Box");
  const predictorNotice = document.getElementById("predictorTier1Notice");
  if (predictorBox) predictorBox.style.display = activeTierMode === "tier2" ? "" : "none";
  if (predictorNotice) predictorNotice.style.display = activeTierMode === "tier1" ? "" : "none";

  applyMarksFormForTier(activeTierMode);
}

function applyMarksFormForTier(tier) {
  const normalizedTier = normalizeTierMode(tier);
  const cfg = TIER_FORM_CONFIG[normalizedTier] || TIER_FORM_CONFIG.tier1;
  const hasComputer = cfg.subjects.some(function (s) { return s.key === "computer"; });

  const wrap = document.getElementById("computerMarksWrap");
  if (wrap) wrap.style.display = hasComputer ? "contents" : "none";

  cfg.subjects.forEach(function (sub) {
    const el = document.getElementById(sub.id);
    if (!el) return;
    el.max = sub.max;
    el.min = 0;
    el.placeholder = sub.label + " (0-" + sub.max + ")";

    const targetEl = document.getElementById(sub.key + "TargetInput");
    if (targetEl) {
      targetEl.max = sub.max;
      targetEl.min = 0;
      targetEl.placeholder = sub.label + " <= " + sub.max;
    }
  });

  const computerTargetWrap = document.getElementById("computerTargetWrap");
  if (computerTargetWrap) computerTargetWrap.style.display = hasComputer ? "contents" : "none";

  const overallTargetInput = document.getElementById("overallTargetInput");
  const previousCutoffInput = document.getElementById("previousCutoffInput");
  if (overallTargetInput) overallTargetInput.max = cfg.totalMax;
  if (previousCutoffInput) previousCutoffInput.max = cfg.totalMax;

  const marksInput = document.getElementById("marksInput");
  if (marksInput) {
    marksInput.min = "0";
    marksInput.max = String(cfg.totalMax);
    marksInput.placeholder = `Enter marks (0-${cfg.totalMax})`;
    const currentMarks = Number(marksInput.value || 0);
    if (Number.isFinite(currentMarks) && currentMarks > cfg.totalMax) {
      marksInput.value = String(cfg.totalMax);
    }
  }

  const whatIfInput = document.getElementById("hzWhatifInput");
  if (whatIfInput) {
    whatIfInput.min = "0";
    whatIfInput.max = String(cfg.totalMax);
    whatIfInput.placeholder = normalizedTier === "tier2" ? "Try: 320" : "Try: 145";
  }

  const grid = document.querySelector(".marks-form-grid");
  if (grid) grid.style.gridTemplateColumns = cfg.subjects.length <= 4 ? "repeat(2,minmax(0,1fr))" : "repeat(3,minmax(0,1fr))";
}

function switchTierMode(nextTier) {
  activeTierMode = normalizeTierMode(nextTier);
  setStoredTierMode(activeTierMode);
  applyTierModeButtons();
  loadBenchmarkProfile();
  loadMarksHistory();
  loadUserOutcome();

  questionLabCache = [];
  resetQuestionLabAttemptState({
    warnings: [`Switched to ${activeTierMode.toUpperCase()} mode. Load a fresh set for this tier.`],
    served: 0
  });
  renderQuestionLabItems([]);
  renderQuestionLabInsights();
  loadQuestionLabMeta();
  loadQuestionLabItems({ interactive: false });
}

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
    const targetPlan = Number(button.dataset.plan || 99);
    await startRazorpayUnlock(targetPlan, button);
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

async function runSyncPaymentStatusSafe() {
  if (typeof syncPaymentStatus === "function") {
    await syncPaymentStatus();
    return;
  }
  console.warn("syncPaymentStatus missing; continuing with local access state");
}

async function ensurePremiumAccess(actionLabel = "This action") {
  try {
    await runSyncPaymentStatusSafe();
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

/* ---------------------------------------------------------------
   AUTH SYSTEM
--------------------------------------------------------------- */
function isAuthenticated() {
  return !!localStorage.getItem("sscranklab_user_email");
}

function showAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) modal.classList.remove("hidden");
}

function hideAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) modal.classList.add("hidden");
}

function initAuthModal() {
  const registerBtn = document.getElementById("authRegisterBtn");
  const loginBtn = document.getElementById("authLoginBtn");
  const guestBtn = document.getElementById("authGuestBtn");
  const guestBtn2 = document.getElementById("authGuestBtn2");
  const showLogin = document.getElementById("authShowLogin");
  const showRegister = document.getElementById("authShowRegister");
  const registerView = document.getElementById("authRegisterView");
  const loginView = document.getElementById("authLoginView");

  if (showLogin) showLogin.addEventListener("click", function () {
    registerView.style.display = "none";
    loginView.style.display = "block";
  });
  if (showRegister) showRegister.addEventListener("click", function () {
    loginView.style.display = "none";
    registerView.style.display = "block";
  });

  if (registerBtn) registerBtn.addEventListener("click", handleRegister);
  if (loginBtn) loginBtn.addEventListener("click", handleLogin);
  if (guestBtn) guestBtn.addEventListener("click", handleGuestContinue);
  if (guestBtn2) guestBtn2.addEventListener("click", handleGuestContinue);
}

async function handleRegister() {
  const name = (document.getElementById("authName").value || "").trim();
  const email = (document.getElementById("authEmail").value || "").trim();
  const status = document.getElementById("authRegisterStatus");

  if (!name || name.length < 2) { status.textContent = "Please enter your name."; return; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { status.textContent = "Please enter a valid email."; return; }

  status.textContent = "";
  status.style.color = "#2563eb";
  status.textContent = "Creating account...";

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email })
    });
    const data = await res.json();
    if (!data.success) {
      status.style.color = "#dc2626";
      status.textContent = data.error || "Registration failed.";
      return;
    }

    // Migrate guest data to new account
    const oldKey = localStorage.getItem("sscranklab_user_key");
    if (oldKey && oldKey.startsWith("guest_") && oldKey !== data.userKey) {
      try {
        await fetch("/api/auth/migrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ oldUserKey: oldKey, newUserKey: data.userKey })
        });
      } catch (e) { console.warn("Migration error:", e); }
    }

    localStorage.setItem("sscranklab_user_key", data.userKey);
    localStorage.setItem("sscranklab_user_email", data.email);
    localStorage.setItem("sscranklab_user_name", data.name);
    hideAuthModal();
    updateAuthUI();
    updateSidebarProfile();
    loadMarksHistory();
  } catch (err) {
    status.style.color = "#dc2626";
    status.textContent = "Network error. Please try again.";
  }
}

async function handleLogin() {
  const email = (document.getElementById("authLoginEmail").value || "").trim();
  const status = document.getElementById("authLoginStatus");

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { status.textContent = "Please enter a valid email."; return; }

  status.textContent = "";
  status.style.color = "#2563eb";
  status.textContent = "Logging in...";

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!data.success) {
      status.style.color = "#dc2626";
      status.textContent = data.error || "Login failed.";
      return;
    }

    // Migrate guest data if applicable
    const oldKey = localStorage.getItem("sscranklab_user_key");
    if (oldKey && oldKey.startsWith("guest_") && oldKey !== data.userKey) {
      try {
        await fetch("/api/auth/migrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ oldUserKey: oldKey, newUserKey: data.userKey })
        });
      } catch (e) { console.warn("Migration error:", e); }
    }

    localStorage.setItem("sscranklab_user_key", data.userKey);
    localStorage.setItem("sscranklab_user_email", data.email);
    localStorage.setItem("sscranklab_user_name", data.name);
    hideAuthModal();
    updateAuthUI();
    updateSidebarProfile();
    loadMarksHistory();
  } catch (err) {
    status.style.color = "#dc2626";
    status.textContent = "Network error. Please try again.";
  }
}

function handleGuestContinue() {
  ensureUserKey();
  localStorage.setItem("sscranklab_auth_skipped", "true");
  hideAuthModal();
}

function handleLogout() {
  localStorage.removeItem("sscranklab_user_email");
  localStorage.removeItem("sscranklab_user_name");
  localStorage.removeItem("sscranklab_auth_skipped");
  // Generate a new guest key
  const newKey = "guest_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
  localStorage.setItem("sscranklab_user_key", newKey);
  updateAuthUI();
  showAuthModal();
}

function updateAuthUI() {
  const name = localStorage.getItem("sscranklab_user_name");
  const email = localStorage.getItem("sscranklab_user_email");
  const authInfo = document.getElementById("authUserInfo");
  if (authInfo) {
    if (email) {
      authInfo.innerHTML = '<span style="font-size:13px;color:#374151;font-weight:600;">' +
        (name || email) + '</span> <a id="logoutBtn" style="font-size:12px;color:#dc2626;cursor:pointer;font-weight:700;margin-left:8px;">Logout</a>';
      const logoutBtn = document.getElementById("logoutBtn");
      if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);
    } else {
      authInfo.innerHTML = '<a id="loginPromptBtn" style="font-size:13px;color:#2563eb;cursor:pointer;font-weight:700;">Sign in</a>';
      const loginPromptBtn = document.getElementById("loginPromptBtn");
      if (loginPromptBtn) loginPromptBtn.addEventListener("click", showAuthModal);
    }
  }
}

function checkAuthOnLoad() {
  initAuthModal();
  const hasEmail = isAuthenticated();
  const skipped = localStorage.getItem("sscranklab_auth_skipped");
  if (!hasEmail && !skipped) {
    showAuthModal();
  }
  updateAuthUI();
  updateSidebarProfile();
}

function updateSidebarProfile() {
  const nameEl = document.getElementById("sidebarUserName");
  const metaEl = document.getElementById("sidebarUserMeta");
  const postBadge = document.getElementById("sidebarPostBadge");
  if (!nameEl || !metaEl) return;

  const storedName = localStorage.getItem("sscranklab_user_name");
  const storedEmail = localStorage.getItem("sscranklab_user_email");

  if (storedName) {
    nameEl.textContent = storedName;
  } else if (storedEmail) {
    nameEl.textContent = storedEmail;
  } else {
    nameEl.textContent = "Guest";
  }

  // Show target post as bold badge above name
  const post = goalProfile?.targetPost;
  if (postBadge) {
    if (post) {
      postBadge.textContent = "\uD83C\uDFAF " + post;
      postBadge.style.display = "block";
    } else {
      postBadge.style.display = "none";
    }
  }

  // Meta line: category + exam month
  const category = goalProfile?.category;
  const examDate = goalProfile?.examDate;
  const parts = [];
  if (category) parts.push(category);
  if (examDate) {
    const d = new Date(examDate + "-01T00:00:00");
    if (!Number.isNaN(d.getTime())) parts.push(d.toLocaleDateString("en-IN", { month: "short", year: "numeric" }));
  }
  metaEl.textContent = parts.length > 0 ? parts.join(" \u2022 ") : "Set your goal to get started";
}

function updateSidebarMeta() {
  const metaEl = document.getElementById("sidebarUserMeta");
  if (!metaEl) return;
  const category = goalProfile?.category;
  const examDate = goalProfile?.examDate;
  const entries = lastMarksEntries || [];
  const streakInfo = computeStreak(entries);
  const parts = [];
  if (category) parts.push(category);
  if (examDate) {
    const d = new Date(examDate + "-01T00:00:00");
    if (!Number.isNaN(d.getTime())) parts.push(d.toLocaleDateString("en-IN", { month: "short", year: "numeric" }));
  }
  if (streakInfo.streak > 0) parts.push("\uD83D\uDD25 " + streakInfo.streak + " day streak");
  metaEl.textContent = parts.length > 0 ? parts.join(" \u2022 ") : "Set your goal to get started";
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

  premiumInput.innerHTML = `<option value="0">Free (Project Zero + ₹49 Lite)</option>`;

  if (unlockedPlan >= 99) {
    premiumInput.insertAdjacentHTML(
      "beforeend",
      `<option value="99">Premium Pack ₹99 (${trialActive ? "Trial Access" : "Unlocked"})</option>`
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

function updatePredictorOfferStrip(unlockedPlan = 0) {
  const premiumText = document.getElementById("predictorPremiumOfferText");
  const cta = document.getElementById("predictorOfferCta");
  if (!premiumText || !cta) return;

  const trial = paymentAccessState?.trial;
  if (trial && trial.active) {
    const hours = Math.ceil(Number(trial.remainingMs || 0) / (60 * 60 * 1000));
    premiumText.textContent = `Trial active: full ₹99 features unlocked (${Math.max(0, hours)}h left)`;
    cta.textContent = "Premium Trial Active";
    cta.classList.add("active");
    cta.disabled = true;
    return;
  }

  if (Number(unlockedPlan || 0) >= 99) {
    premiumText.textContent = "Premium unlocked: full rank intelligence active";
    cta.textContent = "Premium Active";
    cta.classList.add("active");
    cta.disabled = true;
  } else {
    premiumText.textContent = "Upgrade to ₹99 for full rank intelligence + post probability";
    cta.textContent = "Unlock ₹99";
    cta.classList.remove("active");
    cta.disabled = false;
  }
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
  const topPlanBadge = document.getElementById("topPlanBadge");
  
  if (topPlanBadge) {
    if (unlockedPlan >= 99) {
      topPlanBadge.classList.remove("hidden");
    } else {
      topPlanBadge.classList.add("hidden");
    }
  }
  
  if (!planStatusText) {
    updatePredictorOfferStrip(unlockedPlan);
    updateSidePredictorBox(unlockedPlan);
    updatePremiumLockedCtas(unlockedPlan);
    updatePlansPanelState(unlockedPlan);
    return;
  }

  const trial = paymentAccessState.trial;
  if (trial && trial.active) {
    const hours = Math.ceil(Number(trial.remainingMs || 0) / (60 * 60 * 1000));
    planStatusText.textContent = `Trial active (${Math.max(0, hours)}h left): Project Zero + ₹49 Lite + full ₹99 premium are unlocked now.`;
    updatePredictorOfferStrip(unlockedPlan);
    updateSidePredictorBox(unlockedPlan);
    updatePremiumLockedCtas(unlockedPlan);
    updatePlansPanelState(unlockedPlan);
    return;
  }

  if (unlockedPlan >= 99) {
    planStatusText.textContent = "Premium Pack ₹99 unlocked: full rank intelligence active.";
  } else {
    planStatusText.textContent = "Free mode: Project Zero + ₹49 Lite. Upgrade to ₹99 for full rank intelligence.";
  }

  updatePredictorOfferStrip(unlockedPlan);
  updateSidePredictorBox(unlockedPlan);
  updatePremiumLockedCtas(unlockedPlan);
  updatePlansPanelState(unlockedPlan);
}

function updatePlansPanelState(unlockedPlan = 0) {
  const plan99 = document.getElementById("planCard99");
  const plan899 = document.getElementById("planCard899");
  const buy99 = document.getElementById("pricingBuyBtn");
  const buy899 = document.getElementById("pricingBuy899Btn");

  if (plan99) plan99.classList.toggle("active", Number(unlockedPlan || 0) >= 99);
  if (plan899) plan899.classList.toggle("active", Number(unlockedPlan || 0) >= 899);

  if (buy99) {
    buy99.textContent = Number(unlockedPlan || 0) >= 99 ? "₹99 Plan Active" : "Subscribe ₹99/month";
    buy99.disabled = Number(unlockedPlan || 0) >= 99;
    buy99.style.opacity = Number(unlockedPlan || 0) >= 99 ? "0.75" : "1";
  }

  if (buy899) {
    buy899.textContent = Number(unlockedPlan || 0) >= 899 ? "₹899 Plan Active" : "Unlock ₹899/year";
    buy899.disabled = Number(unlockedPlan || 0) >= 899;
    buy899.style.opacity = Number(unlockedPlan || 0) >= 899 ? "0.75" : "1";
  }
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
  const reminderWrap = document.getElementById("goalReminderWrap");
  const reminderMain = document.getElementById("goalReminderMain");
  const reminderSub = document.getElementById("goalReminderSub");

  if (!goalProfile) {
    if (reminderWrap) reminderWrap.classList.add("hidden");
    return;
  }

  const post = String(goalProfile.targetPost || "Not set");
  const cutoff = goalProfile.autoCutoff ? String(Math.round(Number(goalProfile.autoCutoff || 0))) : "--";
  const target = goalProfile.targetScore ? String(Math.round(Number(goalProfile.targetScore || 0))) : "--";
  const category = String(goalProfile.category || "UR");
  const tier = String(goalProfile.tier || "tier1").toUpperCase();
  const examDate = String(goalProfile.examDate || "").trim();
  let examText = "Upcoming exam";

  if (examDate) {
    const dateObj = new Date(`${examDate}-01T00:00:00`);
    if (!Number.isNaN(dateObj.getTime())) {
      examText = dateObj.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    }
  }

  if (reminderWrap && reminderMain && reminderSub) {
    reminderWrap.classList.remove("hidden");
    reminderMain.textContent = `${post} • ${tier} • Target ${target}`;
    reminderSub.textContent = `Auto cutoff ${cutoff} • ${category} • ${examText}`;
  }

  updateSidebarProfile();
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
  const subjects = getTierCfg().subjects.map(function (s) {
    return { label: s.label, value: Number(latest[s.dbKey] || 0) };
  });

  const weakest = [...subjects].sort((a, b) => a.value - b.value).slice(0, 2);
  const overallAvg = computeOverallAverageScore(entries);
  const goalTier = String(goalProfile?.tier || "tier1").toLowerCase();
  // Tier 2 merit is out of 390 (excluding qualifying Computer subject)
  // Tier 1 is out of 200 (4 subjects × 50, qualifying for Tier 2 shortlisting)
  const scoreCap = goalTier === "tier2" ? 390 : 200;
  const buffer = goalTier === "tier2" ? 8 : 5;
  const goalScore = Number(goalProfile?.autoCutoff || 0) > 0 ? Math.min(scoreCap, Number(goalProfile.autoCutoff || 0) + buffer) : 0;
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

  // Enrich with specific topic data from drill if available
  const weakTopics = getWeakTopicsFromDrill().filter(function (t) { return t.totalMistakes > 0; });
  const topTopic = weakTopics[0] ? weakTopics[0].topic + " (" + weakTopics[0].subject + ")" : null;
  const secondTopic = weakTopics[1] ? weakTopics[1].topic + " (" + weakTopics[1].subject + ")" : null;

  listEl.innerHTML = [
    topTopic
      ? "<strong>🎯 Weak Topic:</strong> " + escapeHtml(topTopic) + " — " + weakTopics[0].totalMistakes + " mistakes in " + weakTopics[0].sessions + " test" + (weakTopics[0].sessions !== 1 ? "s" : "") + ". Review concepts and redo similar questions."
      : "Solve 20 targeted " + escapeHtml(first) + " questions and analyze mistakes.",
    secondTopic
      ? "<strong>📌 Also Practice:</strong> " + escapeHtml(secondTopic) + " with timed questions to build accuracy and speed."
      : "Run 2 timed mini-mocks focused on " + escapeHtml(second) + " accuracy and speed.",
    goalScore > 0
      ? "Maintain revision so your overall average moves from " + overallAvg.toFixed(1) + " toward goal " + Math.round(goalScore) + "."
      : "Set target post to activate cutoff + safe-zone planning."
  ].map((item) => `<li>${item}</li>`).join("");
}

function getPlanName(plan) {
  if (Number(plan) === 99) return "Monthly Premium ₹99";
  if (Number(plan) === 899) return "Premium Plus ₹899/year";
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
    const res = await fetch(apiUrl(`/api/user/${encodeURIComponent(userKey)}/outcome?tier=${encodeURIComponent(activeTierMode)}`));
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
  const confidenceWrapEl = document.getElementById("hzConfidenceWrap");
  const confidenceFillEl = document.getElementById("hzConfidenceFill");
  const confidenceCountEl = document.getElementById("hzConfidenceCount");
  const daysLabelEl    = document.getElementById("hzDaysLabel");
  const dailyGainEl    = document.getElementById("hzDailyGain");
  const daysToGoalEl   = document.getElementById("hzDaysToGoal");
  const urgencyIconEl  = document.getElementById("hzUrgencyIcon");
  const urgencyTextEl  = document.getElementById("hzUrgencyText");
  const subjectGridEl  = document.getElementById("hzSubjectGrid");
  const driverNoteEl   = document.getElementById("hzDriverNote");

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
  if (confidenceEl && confidenceWrapEl && confidenceFillEl && confidenceCountEl) {
    if (outcome.hasHistory) {
      const logged = Math.min(10, Number(sessionCount || 0));
      const pct = Math.max(5, logged * 10);
      const confLabel = confidence === "high" ? "Strong confidence from test history" : "Confidence improves with more tests";
      confidenceEl.textContent = confLabel;
      confidenceEl.className = "hz-confidence medium";
      confidenceEl.style.display = "inline-flex";
      confidenceWrapEl.style.display = "block";
      confidenceFillEl.style.width = `${pct}%`;
      confidenceCountEl.textContent = `${logged}/10 tests logged`;
    } else {
      confidenceEl.style.display = "none";
      confidenceWrapEl.style.display = "none";
    }
  }

  if (driverNoteEl) {
    if (outcome.hasHistory && safeScore != null && overallAvg != null && overallAvg > safeScore && subjectAvgs) {
      const strongest = Object.entries(subjectAvgs)
        .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))
        .slice(0, 2)
        .map(([label]) => label);
      const reason = strongest.length >= 2
        ? `Driven by strong ${strongest[0]} + ${strongest[1]} performance.`
        : "Driven by consistent subject strength.";
      driverNoteEl.textContent = reason;
      driverNoteEl.style.display = "block";
    } else {
      driverNoteEl.style.display = "none";
      driverNoteEl.textContent = "";
    }
  }

  updateWeakTopicNote();

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
      daysToGoalEl.innerHTML = "⚠ Not enough data — take 3 more tests<br><small style='opacity:0.75;font-size:0.78em'>Most students drop here — don't break momentum</small>";
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
        weight: weights[s] || 1.0,
        qualifying: s === "Computer"
      }));
      const maxAvg = Math.max(...rows.filter(r => !r.qualifying).map(r => r.avg), 1);
      const sortedRows = [...rows].filter(r => !r.qualifying).sort((a, b) => Number(b.avg || 0) - Number(a.avg || 0));
      subjectGridEl.innerHTML = rows.map(({ label, avg, weight, qualifying }) => {
        if (qualifying) {
          // Computer: show qualifying status, not merit score
          const pct = Math.round((avg / 60) * 100);
          const qualCls = pct >= 40 ? "strong" : pct >= 25 ? "neutral" : "weak";
          return `<div class="hz-subject ${escapeHtml(qualCls)}">
          <div class="hz-subject-label">${escapeHtml(label)} <span style="font-size:0.65em;opacity:0.7;">(qualifying)</span></div>
          <div class="hz-subject-score">${avg.toFixed(1)}<span style="font-size:0.6em;opacity:0.6;">/60</span></div>
          <div class="hz-subject-impact">${pct >= 40 ? "Qualifying ✓" : "Below cutoff"}</div>
        </div>`;
        }
        const relScore = avg / maxAvg;
        const impact = Math.max(1, Math.round((1 - relScore) * weight * 10));
        const cls = relScore < 0.75 ? "weak" : relScore >= 0.92 ? "strong" : "neutral";
        const rankPos = sortedRows.findIndex((row) => row.label === label);
        let statusTag = "Building momentum";
        if (cls === "strong" && rankPos <= 1) statusTag = "Strong zone";
        else if (cls === "weak" && impact >= 4) statusTag = `+${impact} potential`;
        else if (cls === "weak") statusTag = "Needs attention";
        else if (impact >= 3) statusTag = `+${impact} potential`;
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
  const goalTier = String(_lastOutcome?.goalProfile?.tier || "tier1").toLowerCase();
  const scoreMax = goalTier === "tier2" ? 390 : 200;
  if (!Number.isFinite(score) || score < 0 || score > scoreMax) {
    resultEl.textContent = `Enter a merit score between 0 and ${scoreMax}.`;
    resultEl.style.color = "#f87171";
    return;
  }

  const outcome   = _lastOutcome;
  // No cross-scale conversion: scores are stored in their actual scale
  const safeScore = outcome?.scores?.safeScore;
  const overallAvg = outcome?.scores?.overallAvg;
  const sessionCount = Number(outcome?.trend?.sessionCount || 0);

  if (!safeScore) {
    resultEl.textContent = "Set your goal post first, then run simulation.";
    resultEl.style.color = "#fbbf24";
    return;
  }

  if (!Number.isFinite(overallAvg) || sessionCount <= 0) {
    resultEl.textContent = "Add daily scores in My Progress first. Simulation needs your score trend.";
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

    const createOrderResponse = await fetch(apiUrl("/api/payment/create-order"), {
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

          const verifyResponse = await fetch(apiUrl("/api/payment/verify"), {
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
  const resultDiv = document.getElementById("rankResult");
  if (!resultDiv) return;

  try {
    await runSyncPaymentStatusSafe();
    const marks = Number(document.getElementById("marksInput")?.value);
    const category = document.getElementById("categoryInput")?.value;
    const selectedPlan = Number(document.getElementById("premiumInput")?.value || 0);
    const unlockedPlan = getUnlockedPlan();
    const userKey = getUserKey();
    const selectedTier = normalizeTierMode(activeTierMode);
    const scoreMax = selectedTier === "tier2" ? 390 : 200;
    const plan = selectedPlan > 0 ? Math.min(selectedPlan, unlockedPlan) : 0;

    if (!Number.isFinite(marks) || marks < 0 || marks > scoreMax) {
      resultDiv.innerHTML = `
        <div class="bg-red-50 border border-red-200 text-red-700 font-semibold p-4 rounded-2xl shadow-sm">
          Enter valid marks between 0 and ${scoreMax} for ${selectedTier.toUpperCase()}.
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

    const predictApiUrl = apiUrl("/api/predict-v2");

    const response = await fetch(predictApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        examKey: "ssc_cgl",
        tier: selectedTier,
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
    const apiTarget = escapeHtml(getApiBaseUrl() || window.location.origin || "this app origin");
    resultDiv.innerHTML = `
      <div class="bg-white border border-red-100 p-6 rounded-3xl shadow-lg">
        <div class="text-red-600 font-bold mb-2 text-lg">Server connection error</div>
        <div class="text-gray-600 text-sm">
          Make sure backend API is reachable at <span class="font-semibold">${apiTarget}</span>
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
  const selectedTier = normalizeTierMode(data.tier || activeTierMode);

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
    <div class="result-shell">
      <div class="result-head">
        <h3 class="result-title">Your Result</h3>
        <span class="result-mode">
          ${escapeHtml(String(selectedTier).toUpperCase())} • ${escapeHtml(modeLabel)} • Plan ₹${escapeHtml(String(plan))}
        </span>
      </div>

      <div class="result-metrics">
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

      ${plan >= 99 ? renderInsightsBlock(data.insights || {}, data.postChances || {}, selectedTier) : ""}
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
  const toneClass = tone === "emerald" ? "green" : tone === "indigo" ? "indigo" : "blue";

  return `
    <div class="metric-card ${toneClass}">
      <div class="k">${escapeHtml(String(title))}</div>
      <div class="v">
        ${escapeHtml(String(value))}
      </div>
      <div class="s">
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
    <div class="metric-card locked">
      <button
        type="button"
        class="js-unlock-plan lock-cta"
        data-plan="${plan}"
      >
        🔒 ${escapeHtml(lockText)}
      </button>
      <div class="k">${escapeHtml(String(title))}</div>
      <div class="v">
        ${escapeHtml(String(previewValue))}
      </div>
      <div class="s">
        ${escapeHtml(String(subtitle))}
      </div>
    </div>
  `;
}

function renderUpgradePanel99() {
  return `
    <div class="ladder-shell" style="margin-top:14px;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap;">
        <div>
          <div class="ladder-title">Unlock complete rank service in Monthly ₹99</div>
          <div style="margin-top:6px;font-size:13px;color:#475569;font-weight:700;line-height:1.55;max-width:720px;">
            Get category rank, percentile, overall seat position, what-if jumps, competition density, and post chances in one monthly plan.
          </div>
          <div class="ladder-list" style="grid-template-columns:repeat(auto-fit,minmax(190px,1fr));margin-top:10px;">
            <div class="ladder-item"><span class="post">Category rank + percentile</span></div>
            <div class="ladder-item"><span class="post">Seat position + score zone</span></div>
            <div class="ladder-item"><span class="post">What-if jumps + post chances</span></div>
          </div>
        </div>
        <div>
          <button
            type="button"
            class="js-unlock-plan"
            style="border:none;border-radius:12px;background:#6d28d9;color:#fff;padding:10px 14px;font-size:13px;font-weight:900;cursor:pointer;"
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

function formatCandidateBand(rawBand) {
  const key = String(rawBand || "").trim().toLowerCase();
  if (key === "very high") return "Best Shot";
  if (key === "high") return "Strong Chance";
  if (key === "moderate") return "In Reach";
  if (key === "low") return "Needs Push";
  if (key === "very low") return "Long Shot";
  return rawBand || "—";
}

function renderInsightsBlock(insights = {}, postChances = {}, selectedTier = "tier1") {
  const tier = normalizeTierMode(selectedTier);
  const allowPostInsights = tier === "tier2";
  const selectionChance = allowPostInsights ? (postChances?.selectionChance || null) : null;
  const ladder = allowPostInsights && Array.isArray(postChances?.ladder) ? postChances.ladder : [];
  const items = allowPostInsights && Array.isArray(postChances?.items) ? postChances.items : [];

  const selectionChanceCard = allowPostInsights
    ? `
      <div class="insight-card">
        <div class="k">Overall Seat Position</div>
        ${
          selectionChance
            ? `
              <div class="v">
                ${
                  Number(selectionChance.categoryRank) <= Number(selectionChance.categorySeats)
                    ? "Within Seat Range"
                    : "Outside Seat Range"
                }
              </div>
              <div class="s">
                Based on category rank vs total category vacancies
                <br/>Category Seats: ${escapeHtml(String(selectionChance.categorySeats ?? "—"))}
                <br/>Category Rank: ${escapeHtml(String(selectionChance.categoryRank ?? "—"))}
              </div>
            `
            : `
              <div class="s" style="color:#b91c1c;">Not available</div>
            `
        }
      </div>
    `
    : `
      <div class="insight-card">
        <div class="k">Post Allocation</div>
        <div class="v">Tier 2 Only</div>
        <div class="s">Switch to Tier 2 mode to unlock post probability ladder and seat-position mapping.</div>
      </div>
    `;

  const scoreZoneCard =
    insights?.scoreZone
      ? `
        <div class="insight-card">
          <div class="k">Score Zone</div>
          <div class="v">${escapeHtml(insights.scoreZone)}</div>
          <div class="s">${escapeHtml(insights.note || "")}</div>
        </div>
      `
      : "";

  const whatIfCard =
    insights?.whatIf
      ? `
        <div class="insight-card">
          <div class="k">What-if Rank Jump</div>
          <div class="s" style="font-size:14px;line-height:1.7;">
            +2 marks → ~${escapeHtml(String(insights.whatIf.plus2Rank ?? "—"))} rank<br/>
            +5 marks → ~${escapeHtml(String(insights.whatIf.plus5Rank ?? "—"))} rank
          </div>
        </div>
      `
      : "";

  const densityCard =
    insights?.density
      ? `
        <div class="insight-card">
          <div class="k">Competition Density</div>
          <div class="s" style="font-size:14px;">
            In your range (±5 marks): ~${escapeHtml(String(insights.density.candidatesInBand ?? "—"))} candidates
          </div>
        </div>
      `
      : "";

  const ladderSourceItems = items.length > 0 ? items : ladder;

  const ladderBlock =
    allowPostInsights && ladderSourceItems.length > 0
      ? `
        <div class="ladder-shell">
          <h4 class="ladder-title">Post Probability Ladder</h4>
          <div class="ladder-list">
            ${ladderSourceItems.map((p) => `
              <div class="ladder-item">
                <div>
                  <div class="post">${escapeHtml(p.post || "—")}</div>
                  ${
                    p.department
                      ? `<div class="meta">${escapeHtml(p.department)}</div>`
                      : ""
                  }
                  <div class="meta">
                    Score Gap: ${escapeHtml(String(p.scoreGap ?? "—"))}
                  </div>
                </div>
                <div class="band">
                  ${escapeHtml(formatCandidateBand(p.ladderLevel || p.level || p.likelihoodBand || "—"))}
                </div>
              </div>
            `).join("")}
          </div>
          <div class="meta" style="margin-top:10px;font-size:12px;">
            Tip: +3 to +5 marks can quickly move "Needs Push" into "In Reach".
          </div>
        </div>
      `
      : "";

  const postBlock =
    allowPostInsights
      ? (
        items.length > 0
          ? `
            <div class="ladder-shell">
              <h4 class="ladder-title">Best Possible Posts</h4>
              <div class="ladder-list">
                ${items.map((p) => `
                  <div class="ladder-item">
                    <div>
                      <div class="post">${escapeHtml(p.post || "—")}</div>
                      ${p.department ? `<div class="meta">${escapeHtml(p.department)}</div>` : ""}
                      <div class="meta">Cutoff: ${escapeHtml(String(p.cutoff ?? "—"))} | Score Gap: ${escapeHtml(String(p.scoreGap ?? "—"))}</div>
                    </div>
                    <div class="band">${escapeHtml(formatCandidateBand(p.likelihoodBand || "—"))}</div>
                  </div>
                `).join("")}
              </div>
            </div>
          `
          : `
            <div class="ladder-shell">
              <h4 class="ladder-title">Post Chances</h4>
              <div style="margin-top:8px;font-size:13px;color:#b91c1c;font-weight:700;">Not available yet.</div>
            </div>
          `
      )
      : "";

  return `
    <div>
      <div class="insights-shell">
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

function getToneClasses(_tone) {
  return {
    card: "",
    label: "",
    value: "",
    sub: ""
  };
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
  const cutoffEl = document.getElementById("dashboardCutoff");
  if (!latestEl || !avg7El) return;

  if (!Array.isArray(entries) || entries.length === 0) {
    latestEl.textContent = "--";
    avg7El.textContent = "--";
    if (cutoffEl) cutoffEl.textContent = "--";
    return;
  }

  const sorted = [...entries].sort((a, b) => new Date(b.test_date) - new Date(a.test_date));
  const latest = Number(sorted[0]?.total_marks || 0);
  const recent = sorted.slice(0, 7);
  const avg7 = recent.reduce((acc, item) => acc + Number(item.total_marks || 0), 0) / recent.length;

  latestEl.textContent = Number.isFinite(latest) ? latest.toFixed(1) : "--";
  avg7El.textContent = Number.isFinite(avg7) ? avg7.toFixed(1) : "--";

  // Show cutoff from goal profile
  if (cutoffEl) {
    const cutoff = Number(goalProfile?.autoCutoff || 0);
    cutoffEl.textContent = cutoff > 0 ? String(Math.round(cutoff)) : "--";
  }
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
  const cfg = getTierCfg();

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
      overallInput.value = String(Math.min(cfg.totalMax, cutoff + plus));
    }
  }
}

function buildBenchmarkPayload() {
  const mode = String(document.getElementById("benchmarkMode")?.value || "manual_overall");
  const previousCutoff = numFromInput("previousCutoffInput", 0);
  const cfg = getTierCfg();

  let overallTarget = numFromInput("overallTargetInput", 0);
  if (mode === "cutoff_plus_5") overallTarget = Math.min(cfg.totalMax, previousCutoff + 5);
  if (mode === "cutoff_plus_7") overallTarget = Math.min(cfg.totalMax, previousCutoff + 7);

  const subjectTargets = {};
  cfg.subjects.forEach(function (sub) {
    subjectTargets[sub.key] = Math.min(sub.max, numFromInput(sub.key + "TargetInput", 0));
  });

  if (mode !== "manual_subject") {
    const per = overallTarget > 0 ? Number((overallTarget / cfg.subjects.length).toFixed(1)) : 0;
    cfg.subjects.forEach(function (sub) {
      subjectTargets[sub.key] = Math.min(sub.max, per);
    });
  }

  if (!Number.isFinite(overallTarget) || overallTarget <= 0 || overallTarget > cfg.totalMax) {
    return { error: "Overall target must be between 1 and " + cfg.totalMax };
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
  const setIf = function (id, value) {
    const el = document.getElementById(id);
    if (el) el.value = Number(value || 0) || "";
  };

  getTierCfg().subjects.forEach(function (s) {
    setIf(s.key + "TargetInput", sub[s.key]);
  });
  if (activeTierMode === "tier1") {
    setIf("computerTargetInput", "");
  }

  handleBenchmarkModeChange();
}

async function loadBenchmarkProfile() {
  const userKey = getUserKey();
  setBenchmarkStatus(`Loading ${activeTierMode.toUpperCase()} benchmark...`, "info");

  try {
    const response = await fetch(apiUrl(`/api/user/${encodeURIComponent(userKey)}`));

    if (response.status === 404) {
      benchmarkProfile = null;
      goalProfile = null;
      goalsByTierCache = {};
      benchmarksByTierCache = {};
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

    const profile = data.profile || {};
    goalsByTierCache = profile.goalsByTier && typeof profile.goalsByTier === "object" ? profile.goalsByTier : {};
    benchmarksByTierCache = profile.benchmarksByTier && typeof profile.benchmarksByTier === "object" ? profile.benchmarksByTier : {};
    selfReviewByTierCache = profile.selfReviewByTier && typeof profile.selfReviewByTier === "object" ? profile.selfReviewByTier : {};
    topicDrillByTierCache = profile.topicDrillByTier && typeof profile.topicDrillByTier === "object" ? profile.topicDrillByTier : {};

    const legacyGoal = profile.goal || null;    const legacyGoalTier = normalizeTierMode(legacyGoal?.tier || "tier1");
    goalProfile = goalsByTierCache[activeTierMode] || (legacyGoal && legacyGoalTier === activeTierMode ? legacyGoal : null);

    const legacyBenchmark = profile.benchmark || null;
    benchmarkProfile = benchmarksByTierCache[activeTierMode] || (activeTierMode === "tier1" ? legacyBenchmark : null);

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
    benchmarksByTierCache = {
      ...(benchmarksByTierCache && typeof benchmarksByTierCache === "object" ? benchmarksByTierCache : {}),
      [activeTierMode]: payload.benchmark
    };

    const profileUpdatePayload = {
      benchmarksByTier: benchmarksByTierCache
    };
    if (activeTierMode === "tier1") {
      profileUpdatePayload.benchmark = payload.benchmark;
    }

    const response = await fetch(apiUrl(`/api/user/${encodeURIComponent(userKey)}`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileUpdatePayload)
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Save failed");
    }

    const profile = data.profile || {};
    benchmarksByTierCache = profile.benchmarksByTier && typeof profile.benchmarksByTier === "object"
      ? profile.benchmarksByTier
      : benchmarksByTierCache;
    benchmarkProfile = benchmarksByTierCache[activeTierMode] || payload.benchmark;
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
  const tierSubjects = getTierCfg().subjects;
  let prioritySubject = "--";
  let maxGap = -Infinity;
  tierSubjects.forEach(function (sub) {
    const score = Number(latest[sub.dbKey] || 0);
    const target = Number(subjectTargets[sub.key] || 0);
    const g = target - score;
    if (g > maxGap) {
      maxGap = g;
      prioritySubject = sub.key;
    }
  });

  const priorityMap = {};
  tierSubjects.forEach(function (sub) {
    priorityMap[sub.key] = sub.label;
  });

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
    warning: "#b45309",
    error: "#b91c1c"
  };

  el.style.color = toneMap[type] || toneMap.info;
  el.textContent = message || "";
}

function setWeakSuggestStatus(message, type = "info") {
  const el = document.getElementById("weakSuggestStatus");
  if (!el) return;
  const toneMap = {
    info: "#1e40af",
    success: "#047857",
    error: "#b91c1c"
  };
  el.style.color = toneMap[type] || toneMap.info;
  el.textContent = message || "";
}

function mapSubjectLabelToKey(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  if (raw === "quant" || raw === "math" || raw === "mathematics") return "quant";
  if (raw === "english") return "english";
  if (raw === "reasoning") return "reasoning";
  if (raw === "gk" || raw === "ga" || raw === "general awareness") return "gk";
  if (raw === "computer") return "computer";
  return raw;
}

function buildWeakSubjectWeights() {
  const weakTopics = getWeakTopicsFromDrill().filter(function (t) {
    return Number(t.totalMistakes || 0) > 0;
  });
  const weights = {};

  weakTopics.slice(0, 8).forEach((item) => {
    const key = mapSubjectLabelToKey(item.subject);
    if (!key) return;
    weights[key] = (weights[key] || 0) + Number(item.totalMistakes || 1);
  });

  if (Object.keys(weights).length > 0) return weights;

  const latest = Array.isArray(lastMarksEntries) && lastMarksEntries.length > 0
    ? [...lastMarksEntries].sort((a, b) => new Date(b.test_date) - new Date(a.test_date))[0]
    : null;
  if (!latest) return weights;

  getTierCfg().subjects.forEach(function (sub) {
    const val = Number(latest[sub.dbKey] || 0);
    const deficit = Math.max(0, sub.max - val);
    if (deficit > 0) {
      weights[sub.key] = deficit;
    }
  });

  return weights;
}

function renderWeakTopicSuggestions(items = []) {
  const list = document.getElementById("weakSuggestList");
  if (!list) return;

  if (!Array.isArray(items) || items.length === 0) {
    list.innerHTML = "<div style='font-size:12px;color:#64748b;'>No weak-topic suggestions yet. Add topic-wise breakdown to unlock this box.</div>";
    return;
  }

  list.innerHTML = items.slice(0, 5).map((item, index) => {
    const options = Array.isArray(item.options) ? item.options : [];
    const answerIndex = Number(item.answerIndex);
    const answerOption = (Number.isInteger(answerIndex) && answerIndex >= 0 && answerIndex < options.length)
      ? String.fromCharCode(65 + answerIndex)
      : "N/A";
    const optionHtml = options.map((opt, i) => {
      return `<div style=\"font-size:12px;color:#334155;line-height:1.45;\">${String.fromCharCode(65 + i)}. ${escapeHtml(String(opt || ""))}</div>`;
    }).join("");
    return `
      <div style="border:1px solid #dbeafe;border-radius:12px;background:#ffffffde;padding:10px;">
        <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
          <span class="qlab-chip">Q${index + 1}</span>
          <span class="qlab-chip">${escapeHtml(item.subject || "subject")}</span>
          <span class="qlab-chip">${escapeHtml(item.topic || "topic")}</span>
        </div>
        <div style="margin-top:6px;font-size:13px;font-weight:800;color:#0f172a;line-height:1.45;">${escapeHtml(item.question || "")}</div>
        <div style="margin-top:6px;display:grid;gap:4px;">${optionHtml}</div>
        <div style="margin-top:7px;font-size:11px;color:#0f766e;font-weight:800;">Correct Option: ${escapeHtml(answerOption)}</div>
      </div>
    `;
  }).join("");
}

async function loadWeakTopicSuggestions() {
  const weights = buildWeakSubjectWeights();
  const hasWeights = Object.keys(weights).length > 0;

  if (!hasWeights) {
    setWeakSuggestStatus("Add topic drill or marks history to generate weak-topic suggestions.", "info");
    renderWeakTopicSuggestions([]);
    return;
  }

  setWeakSuggestStatus("Building today’s 5 weak-topic suggestions...", "info");

  try {
    const response = await fetch(apiUrl("/api/questions/generate"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "weakness-focused",
        tier: normalizeTierMode(activeTierMode),
        questionMode: "objective",
        practiceCount: 5,
        subjectWeights: weights
      })
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Could not load weak-topic suggestions");
    }

    const items = Array.isArray(data.items) ? data.items : [];
    renderWeakTopicSuggestions(items);
    setWeakSuggestStatus(`Showing ${items.length} suggestions from your weak topics.`, "success");
  } catch (err) {
    console.error("loadWeakTopicSuggestions error:", err);
    setWeakSuggestStatus("Could not load suggestions right now.", "error");
    renderWeakTopicSuggestions([]);
  }
}

function getQuestionLabFilters() {
  const sourceMode = String(document.getElementById("qlabSourceMode")?.value || "pyq").trim();
  const tier = String(document.getElementById("qlabTier")?.value || normalizeTierMode(activeTierMode)).trim();
  const testType = String(document.getElementById("qlabTestType")?.value || "full").trim();
  const subject = testType === "sectional" ? String(document.getElementById("qlabSubject")?.value || "quant").trim() : "";
  const selectedTopics = Array.from(document.querySelectorAll(".qlab-topic-check:checked"))
    .map((el) => String(el.value || "").trim())
    .filter(Boolean);

  return { sourceMode, tier, testType, subject, selectedTopics };
}

function updateQLAbControlVisibility() {
  const testType = String(document.getElementById("qlabTestType")?.value || "full").trim();
  const subjectEl = document.getElementById("qlabSubject");
  const topicWrap = document.getElementById("qlabTopicChecklistWrap");

  if (subjectEl) {
    subjectEl.style.display = testType === "sectional" ? "" : "none";
  }

  const subject = String(subjectEl?.value || "").trim();
  if (topicWrap) {
    topicWrap.style.display = (testType === "sectional" && subject === "quant") ? "block" : "none";
  }
}

function updateTopicChecklistVisibility() {
  updateQLAbControlVisibility();
}

function renderQuestionLabTopicChecklist() {
  const container = document.getElementById("qlabTopicChecklist");
  if (!container) return;

  const selectedSubject = String(document.getElementById("qlabSubject")?.value || "").trim();
  const activeTier = normalizeTierMode(activeTierMode);
  let topics = Array.isArray(questionLabMetaCache?.topics) ? questionLabMetaCache.topics : [];

  topics = topics.filter((entry) => normalizeTierMode(entry.tier || "tier1") === activeTier);

  if (selectedSubject) {
    topics = topics.filter((entry) => String(entry.subject || "") === selectedSubject);
  }

  if (topics.length === 0) {
    container.innerHTML = `<div style='font-size:12px;color:#64748b;'>No approved ${activeTier.toUpperCase()} topics found yet for this filter. Switch tier or add more question data.</div>`;
    return;
  }

  container.innerHTML = topics.slice(0, 120).map((entry) => {
    const token = `${entry.subject}::${entry.topic}`;
    const countText = Number(entry.count || 0) > 0 ? ` (${Number(entry.count)})` : "";
    return `
      <label class="qlab-topic-option">
        <input class="qlab-topic-check" type="checkbox" value="${escapeHtml(token)}" />
        <span>${escapeHtml(entry.subject || "subject")} - ${escapeHtml(entry.topic || "topic")}${escapeHtml(countText)}</span>
      </label>
    `;
  }).join("");
}

async function loadQuestionLabMeta() {
  try {
    const response = await fetch(apiUrl("/api/questions/meta"));
    const data = await response.json();
    if (!response.ok || !data.success) return;

    const topicRows = [];
    const items = Array.isArray(data.topicItems) ? data.topicItems : [];
    items.forEach((item) => {
      if (!item || !item.topic) return;
      topicRows.push({
        subject: String(item.subject || "").trim(),
        topic: String(item.topic || "").trim(),
        tier: normalizeTierMode(item.tier || "tier1"),
        count: Number(item.count || 0)
      });
    });

    topicRows.sort((a, b) => a.tier.localeCompare(b.tier) || a.subject.localeCompare(b.subject) || b.count - a.count || a.topic.localeCompare(b.topic));

    questionLabMetaCache = {
      ...data,
      topics: topicRows,
      coverageByTier: data.coverageByTier && typeof data.coverageByTier === "object" ? data.coverageByTier : {}
    };
    renderQuestionLabTopicChecklist();
    updateTopicChecklistVisibility();
  } catch (err) {
    console.error("loadQuestionLabMeta error:", err);
  }
}

function resetQuestionLabAttemptState(meta = {}) {
  questionLabSelections = {};
  questionLabAnswersVisible = false;
  questionLabLastResult = {
    mode: String(meta.mode || "practice"),
    summary: meta.summary && typeof meta.summary === "object" ? meta.summary : null,
    warnings: Array.isArray(meta.warnings) ? meta.warnings : [],
    served: Number(meta.served || 0)
  };
  updateQuestionLabActionButtons();
}

function updateQuestionLabActionButtons() {
  const hasItems = Array.isArray(questionLabCache) && questionLabCache.length > 0;
  const toggleBtn = document.getElementById("btnToggleQuestionLabAnswers");
  if (toggleBtn) {
    toggleBtn.disabled = !hasItems;
    toggleBtn.textContent = questionLabAnswersVisible ? "Hide Answers" : "Reveal Answers";
  }

  const checkBtn = document.getElementById("btnCheckQuestionLab");
  if (checkBtn) {
    checkBtn.disabled = !hasItems;
  }
}

function getQuestionLabAttemptMetrics() {
  const metrics = {
    total: Array.isArray(questionLabCache) ? questionLabCache.length : 0,
    attempted: 0,
    correct: 0,
    wrong: 0,
    score: 0,
    subjectAccuracy: {}
  };

  if (!Array.isArray(questionLabCache) || questionLabCache.length === 0) {
    metrics.accuracyPct = 0;
    return metrics;
  }

  questionLabCache.forEach((item) => {
    const questionId = String(item?.id || "");
    if (!Object.prototype.hasOwnProperty.call(questionLabSelections, questionId)) return;

    const pickedIndex = Number(questionLabSelections[questionId]);
    if (!Number.isInteger(pickedIndex)) return;

    const correctIndex = Number(item?.answerIndex);
    const subject = String(item?.subject || "Mixed").trim() || "Mixed";
    const marks = Number(item?.marks || 0);
    const negativeMarks = Number(item?.negativeMarks || 0);

    metrics.attempted += 1;
    if (!metrics.subjectAccuracy[subject]) {
      metrics.subjectAccuracy[subject] = { attempted: 0, correct: 0 };
    }
    metrics.subjectAccuracy[subject].attempted += 1;

    if (pickedIndex === correctIndex) {
      metrics.correct += 1;
      metrics.score += marks;
      metrics.subjectAccuracy[subject].correct += 1;
    } else {
      metrics.wrong += 1;
      metrics.score -= negativeMarks;
    }
  });

  metrics.accuracyPct = metrics.attempted > 0
    ? Number(((metrics.correct / metrics.attempted) * 100).toFixed(1))
    : 0;
  metrics.score = Number(metrics.score.toFixed(2));
  return metrics;
}

function buildSubjectAccuracyBars(metrics) {
  if (metrics.attempted === 0) {
    return '<div class="qlab-helper" style="margin-top:8px;">Subject-wise accuracy will appear after you check your answers.</div>';
  }
  const SUBJECT_COLORS = { quant: "#0f766e", reasoning: "#ea580c", english: "#7c3aed", gk: "#0891b2", computer: "#6d28d9" };
  const SUBJECT_LABELS = { quant: "Quantitative Aptitude", reasoning: "Reasoning", english: "English", gk: "General Awareness", computer: "Computer" };
  const rows = Object.entries(metrics.subjectAccuracy).map(([subject, data]) => {
    const pct = data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0;
    const color = SUBJECT_COLORS[subject] || "#64748b";
    const label = SUBJECT_LABELS[subject] || subject;
    const barColor = pct >= 70 ? "#10b981" : pct >= 45 ? "#f59e0b" : "#ef4444";
    return `<div style="display:grid;grid-template-columns:120px 1fr 55px;align-items:center;gap:8px;">
      <span style="font-size:12px;font-weight:700;color:${color};">${escapeHtml(label)}</span>
      <div style="background:#e2e8f0;border-radius:999px;height:8px;overflow:hidden;">
        <div style="width:${pct}%;height:100%;border-radius:999px;background:${barColor};transition:width .3s;"></div>
      </div>
      <span style="font-size:12px;font-weight:800;color:#0f172a;text-align:right;">${data.correct}/${data.attempted} (${pct}%)</span>
    </div>`;
  }).join("");
  return `<div style="margin-top:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px;">
    <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#475569;margin-bottom:8px;">Subject-wise Accuracy</div>
    <div style="display:grid;gap:6px;">${rows}</div>
  </div>`;
}

function renderQuestionLabInsights() {
  const el = document.getElementById("questionLabInsights");
  if (!el) return;

  const metrics = getQuestionLabAttemptMetrics();
  const summary = questionLabLastResult.summary && typeof questionLabLastResult.summary === "object"
    ? questionLabLastResult.summary
    : null;
  const warnings = Array.isArray(questionLabLastResult.warnings) ? questionLabLastResult.warnings : [];

  if (!Array.isArray(questionLabCache) || questionLabCache.length === 0) {
    const tierLabel = activeTierMode.toUpperCase();
    const warningHtml = warnings.length > 0
      ? `<div class="qlab-warning-list">${warnings.map((msg) => `<div class="qlab-warning">⚠️ ${escapeHtml(msg)}</div>`).join("")}</div>`
      : "";
    el.innerHTML = `<div class="qlab-helper">${tierLabel} question lab is ready. Load a fresh set, attempt it honestly, then check your performance for instant feedback.</div>${warningHtml}`;
    updateQuestionLabActionButtons();
    return;
  }

  const qualityBandMap = {
    strong: "Strong",
    good: "Good",
    limited: "Limited",
    insufficient: "Insufficient"
  };

  const subjectMix = summary && summary.subjectBreakdown
    ? Object.entries(summary.subjectBreakdown).map(([subject, count]) => `${String(subject).toUpperCase()} ${count}`).join(" • ")
    : "--";
  const qualityLabel = qualityBandMap[String(summary?.qualityBand || "good")] || "Good";
  const setCoverage = summary ? `${Math.round(Number(summary.coverageRatio || 0) * 100)}%` : "--";
  const scoreText = metrics.attempted > 0 ? `${metrics.score.toFixed(2)}` : "--";
  const accuracyText = metrics.attempted > 0 ? `${metrics.accuracyPct.toFixed(1)}%` : "--";
  const warningHtml = warnings.length > 0
    ? `<div class="qlab-warning-list">${warnings.map((msg) => `<div class="qlab-warning">⚠️ ${escapeHtml(msg)}</div>`).join("")}</div>`
    : `<div class="qlab-helper">Answers stay hidden until you reveal them. Use this as a real mock, not a passive reading session.</div>`;

  el.innerHTML = `
    <div class="qlab-insight-grid">
      <div class="qlab-insight-card">
        <div class="qlab-insight-k">Attempted</div>
        <div class="qlab-insight-v">${metrics.attempted}/${metrics.total}</div>
      </div>
      <div class="qlab-insight-card">
        <div class="qlab-insight-k">Accuracy</div>
        <div class="qlab-insight-v">${accuracyText}</div>
      </div>
      <div class="qlab-insight-card">
        <div class="qlab-insight-k">Projected Score</div>
        <div class="qlab-insight-v">${scoreText}</div>
      </div>
      <div class="qlab-insight-card">
        <div class="qlab-insight-k">Set Quality</div>
        <div class="qlab-insight-v">${escapeHtml(qualityLabel)}</div>
      </div>
      <div class="qlab-insight-card">
        <div class="qlab-insight-k">Coverage</div>
        <div class="qlab-insight-v">${escapeHtml(setCoverage)}</div>
      </div>
    </div>
    <div class="qlab-helper" style="margin-top:10px;"><strong>Set mix:</strong> ${escapeHtml(subjectMix)}</div>
    ${buildSubjectAccuracyBars(metrics)}
    ${warningHtml}
  `;

  updateQuestionLabActionButtons();
}

function handleQuestionLabOptionClick(event) {
  const optionBtn = event.target.closest(".qlab-option-btn");
  if (!optionBtn) return;

  const qid = decodeURIComponent(String(optionBtn.dataset.qid || ""));
  const idx = Number(optionBtn.dataset.idx);
  if (!qid || !Number.isInteger(idx)) return;

  questionLabSelections[qid] = idx;
  renderQuestionLabItems(questionLabCache);
  renderQuestionLabInsights();
}

function toggleQuestionLabAnswers() {
  if (!Array.isArray(questionLabCache) || questionLabCache.length === 0) {
    setQuestionLabStatus("Load a set first, then reveal answers if needed.", "info");
    return;
  }

  questionLabAnswersVisible = !questionLabAnswersVisible;
  renderQuestionLabItems(questionLabCache);
  renderQuestionLabInsights();
}

function checkQuestionLabPerformance() {
  if (!Array.isArray(questionLabCache) || questionLabCache.length === 0) {
    setQuestionLabStatus("Load a set first to check your performance.", "info");
    return;
  }

  const metrics = getQuestionLabAttemptMetrics();
  if (metrics.attempted === 0) {
    setQuestionLabStatus("Attempt a few questions first, then check performance.", "warning");
    return;
  }

  questionLabAnswersVisible = true;
  renderQuestionLabItems(questionLabCache);
  renderQuestionLabInsights();
  setQuestionLabStatus(`Checked ${metrics.attempted} answers · ${metrics.accuracyPct.toFixed(1)}% accuracy · score ${metrics.score.toFixed(2)}.`, "success");
}

function renderQuestionLabItems(items = []) {
  const container = document.getElementById("questionLabList");
  if (!container) return;

  updateQuestionLabActionButtons();

  if (!Array.isArray(items) || items.length === 0) {
    container.innerHTML = "<div class='qlab-item'>No items found for the selected tier or filters.</div>";
    return;
  }

  const SECTION_ORDER = ["quant", "reasoning", "english", "gk"];
  const SECTION_LABELS = { quant: "Quantitative Aptitude", reasoning: "General Intelligence & Reasoning", english: "English Language & Comprehension", gk: "General Awareness" };

  // Detect section changes to insert headers
  let currentSection = null;
  let globalIdx = 0;

  const html = items.map((item) => {
    const options = Array.isArray(item.options) ? item.options : [];
    const questionId = String(item?.id || `q_${globalIdx}`);
    const selectedIndex = Object.prototype.hasOwnProperty.call(questionLabSelections, questionId)
      ? Number(questionLabSelections[questionId])
      : null;

    const optionRows = options.map((opt, i) => {
      const isSelected = selectedIndex === i;
      const isAnswer = Number(item.answerIndex) === i;
      const classes = ["qlab-option-btn"];
      if (isSelected) classes.push("selected");
      if (questionLabAnswersVisible && isAnswer) classes.push("correct");
      if (questionLabAnswersVisible && isSelected && !isAnswer) classes.push("wrong");
      const answerTag = questionLabAnswersVisible && isAnswer ? " <strong>(Answer)</strong>" : "";
      return `<button type="button" class="${classes.join(" ")}" data-qid="${encodeURIComponent(questionId)}" data-idx="${i}">${String.fromCharCode(65 + i)}. ${escapeHtml(opt)}${answerTag}</button>`;
    }).join("");

    const yearText = item.year ? `Year ${item.year}` : "";
    const batchText = item.batch || item.shift || item?.source?.batch || item?.source?.shift || "";
    const explanationText = questionLabAnswersVisible
      ? (item.explanation || "No explanation added yet.")
      : "Explanation stays hidden until you reveal/check the answers.";

    globalIdx++;

    // Insert section header when subject changes
    let sectionHeader = "";
    const itemSubject = String(item.subject || "").toLowerCase();
    if (itemSubject !== currentSection) {
      currentSection = itemSubject;
      const sectionLabel = SECTION_LABELS[itemSubject] || itemSubject.toUpperCase();
      const sectionNum = SECTION_ORDER.indexOf(itemSubject) + 1;
      const sectionCount = items.filter((q) => String(q.subject || "").toLowerCase() === itemSubject).length;
      sectionHeader = `<div class="qlab-section-header"><span class="qlab-section-num">Section ${sectionNum > 0 ? sectionNum : ""}</span><span class="qlab-section-title">${escapeHtml(sectionLabel)}</span><span class="qlab-section-count">${sectionCount} Questions</span></div>`;
    }

    return `${sectionHeader}
      <div class="qlab-item">
        <div class="qlab-item-head">
          <span class="qlab-chip">${escapeHtml(item.topic || "topic")}</span>
          ${yearText ? `<span class="qlab-chip">${escapeHtml(yearText)}</span>` : ""}
          ${batchText ? `<span class="qlab-chip">${escapeHtml(String(batchText))}</span>` : ""}
        </div>
        <div class="qlab-item-qno">Q${globalIdx}</div>
        <div class="qlab-item-question">${escapeHtml(item.question || "")}</div>
        <div class="qlab-options">${optionRows}</div>
        <div class="qlab-explain ${questionLabAnswersVisible ? "" : "is-hidden"}">${escapeHtml(explanationText)}</div>
      </div>
    `;
  }).join("");

  container.innerHTML = html;
}

function computeCurrentInputAveragePct() {
  const values = [];

  const rankInput = Number(document.getElementById("marksInput")?.value);
  const rankMax = activeTierMode === "tier2" ? 390 : 200;
  if (Number.isFinite(rankInput) && rankInput >= 0) {
    values.push(Math.max(0, Math.min(100, (rankInput / rankMax) * 100)));
  }

  const subjectInputs = getTierCfg().subjects
    .map((s) => ({
      val: Number(document.getElementById(s.id)?.value),
      max: Number(s.max || 0)
    }))
    .filter((entry) => Number.isFinite(entry.val) && entry.val >= 0 && entry.max > 0)
    .map((entry) => Math.max(0, Math.min(100, (entry.val / entry.max) * 100)));

  if (subjectInputs.length > 0) {
    values.push(subjectInputs.reduce((sum, n) => sum + n, 0) / subjectInputs.length);
  }

  if (values.length === 0) return null;
  return values.reduce((sum, n) => sum + n, 0) / values.length;
}

function computeRecordedAveragePct() {
  if (!Array.isArray(lastMarksEntries) || lastMarksEntries.length === 0) return null;
  const maxTotal = Number(getTierCfg().totalMax || 200);
  if (maxTotal <= 0) return null;
  const avgMarks = lastMarksEntries.reduce((sum, e) => sum + Number(e.total_marks || 0), 0) / lastMarksEntries.length;
  return Math.max(0, Math.min(100, (avgMarks / maxTotal) * 100));
}

function computeQuestionSectionAveragePct() {
  if (!Array.isArray(questionLabCache) || questionLabCache.length === 0) return null;

  const confidenceSeries = questionLabCache
    .map((q) => Number(q.confidenceScore))
    .filter((n) => Number.isFinite(n) && n >= 0);

  if (confidenceSeries.length > 0) {
    const avgConfidence = confidenceSeries.reduce((sum, n) => sum + n, 0) / confidenceSeries.length;
    return Math.max(0, Math.min(100, avgConfidence * 100));
  }

  return null;
}

function updateQuestionGeneratorRecords() {
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  if (!Array.isArray(lastMarksEntries) || lastMarksEntries.length === 0) {
    setText("qgenBestScore", "--");
    setText("qgenAvgScore", "--");
  } else {
    const sorted = [...lastMarksEntries].sort((a, b) => Number(b.total_marks || 0) - Number(a.total_marks || 0));
    const best = Number(sorted[0]?.total_marks || 0);
    const avg = lastMarksEntries.reduce((sum, e) => sum + Number(e.total_marks || 0), 0) / lastMarksEntries.length;
    setText("qgenBestScore", `${best.toFixed(1)} / ${getTierCfg().totalMax}`);
    setText("qgenAvgScore", `${avg.toFixed(1)} / ${getTierCfg().totalMax}`);
  }

  const count = Array.isArray(questionLabCache) ? questionLabCache.length : 0;
  setText("qgenQuestionsLoaded", String(count));

  let topTopic = "--";
  if (count > 0) {
    const byTopic = {};
    questionLabCache.forEach((q) => {
      const key = String(q?.topic || "Unknown").trim() || "Unknown";
      byTopic[key] = (byTopic[key] || 0) + 1;
    });
    topTopic = Object.entries(byTopic).sort((a, b) => b[1] - a[1])[0]?.[0] || "--";
  }
  setText("qgenTopTopic", topTopic);

  const recordsEl = document.getElementById("qgenTopRecords");
  if (!recordsEl) return;

  if (!Array.isArray(lastMarksEntries) || lastMarksEntries.length === 0) {
    recordsEl.textContent = "No records yet. Save marks and generate questions to build this leaderboard.";
    return;
  }

  const topAttempts = [...lastMarksEntries]
    .sort((a, b) => Number(b.total_marks || 0) - Number(a.total_marks || 0))
    .slice(0, 3);

  recordsEl.innerHTML = topAttempts.map((entry, index) => {
    const d = new Date(entry.test_date).toLocaleDateString();
    const score = Number(entry.total_marks || 0).toFixed(1);
    return `<div style="padding:8px 0;border-bottom:${index < topAttempts.length - 1 ? "1px solid #e2e8f0" : "none"};">
      <span style="font-weight:800;color:#1e293b;">#${index + 1}</span>
      <span style="margin-left:8px;color:#334155;">${escapeHtml(d)}</span>
      <span style="float:right;font-weight:800;color:#312e81;">${score} / ${getTierCfg().totalMax}</span>
    </div>`;
  }).join("");
}

function refreshCombinedDashboard() {
  const combinedEl = document.getElementById("combinedAvgScore");
  const qEl = document.getElementById("combinedQuestionAvg");
  const rEl = document.getElementById("combinedRecordedAvg");
  const iEl = document.getElementById("combinedInputAvg");
  const noteEl = document.getElementById("combinedDashboardNote");
  const totalTestsEl = document.getElementById("combinedTotalTests");
  if (!combinedEl || !qEl || !rEl || !iEl || !noteEl) return;

  const qAvg = computeQuestionSectionAveragePct();
  const rAvg = computeRecordedAveragePct();
  const iAvg = computeCurrentInputAveragePct();

  qEl.textContent = qAvg == null ? "--" : `${qAvg.toFixed(1)}%`;
  rEl.textContent = rAvg == null ? "--" : `${rAvg.toFixed(1)}%`;
  iEl.textContent = iAvg == null ? "--" : `${iAvg.toFixed(1)}%`;

  const totalTests = Array.isArray(lastMarksEntries) ? lastMarksEntries.length : 0;
  if (totalTestsEl) totalTestsEl.textContent = String(totalTests);

  const all = [qAvg, rAvg, iAvg].filter((n) => n != null);
  if (all.length === 0) {
    combinedEl.textContent = "--";
    noteEl.textContent = "Start adding daily marks or generating questions to see your performance overview.";
    return;
  }

  const combined = all.reduce((sum, n) => sum + n, 0) / all.length;
  combinedEl.textContent = `${combined.toFixed(1)}%`;
  noteEl.textContent = `Combined from ${all.length} source${all.length > 1 ? "s" : ""} · ${totalTests} recorded test${totalTests !== 1 ? "s" : ""}`;

  // Update mock results dashboard
  refreshMockResultsDashboard();
}

function attachCombinedDashboardInputListeners() {
  const ids = ["marksInput", "quantMarks", "englishMarks", "reasoningMarks", "gkMarks", "computerMarks"];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el || el.dataset.combinedBound === "1") return;
    el.dataset.combinedBound = "1";
    el.addEventListener("input", refreshCombinedDashboard);
  });
}

function refreshMockResultsDashboard() {
  const dashboard = document.getElementById("mockResultsDashboard");
  if (!dashboard) return;

  const entries = Array.isArray(lastMarksEntries) ? lastMarksEntries : [];
  if (entries.length === 0) {
    dashboard.style.display = "none";
    return;
  }

  dashboard.style.display = "block";
  const tierCfg = getTierCfg();
  const maxMarks = tierCfg.totalMax || 200;

  // Compute stats
  const accuracies = entries.map((e) => {
    const total = Number(e.total_marks || 0);
    return (total / maxMarks) * 100;
  });
  const avgAcc = accuracies.reduce((s, n) => s + n, 0) / accuracies.length;
  const bestAcc = Math.max(...accuracies);
  const totalAttempted = entries.length;

  // Find weak subject
  const subjectAvgs = {};
  tierCfg.subjects.forEach((sub) => {
    const vals = entries.map((e) => Number(e[sub.dbKey] || 0));
    const avg = vals.reduce((s, n) => s + n, 0) / vals.length;
    subjectAvgs[sub.label] = (avg / sub.max) * 100;
  });
  const weakSubject = Object.entries(subjectAvgs).sort((a, b) => a[1] - b[1])[0];

  // Update stats
  const setT = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setT("mockTotalTests", `${totalAttempted} test${totalAttempted !== 1 ? "s" : ""}`);
  setT("mockAvgAccuracy", `${avgAcc.toFixed(1)}%`);
  setT("mockBestAccuracy", `${bestAcc.toFixed(1)}%`);
  setT("mockTotalAttempted", String(totalAttempted));
  setT("mockWeakSubject", weakSubject ? weakSubject[0] : "--");

  // Render recent results list
  const listEl = document.getElementById("mockResultsList");
  if (!listEl) return;

  const recent = [...entries]
    .sort((a, b) => new Date(b.test_date) - new Date(a.test_date))
    .slice(0, 8);

  listEl.innerHTML = recent.map((entry, i) => {
    const d = new Date(entry.test_date).toLocaleDateString();
    const total = Number(entry.total_marks || 0);
    const pct = ((total / maxMarks) * 100).toFixed(1);
    const barColor = pct >= 70 ? "#4ade80" : pct >= 50 ? "#fbbf24" : "#f87171";
    return `<div style="display:flex;align-items:center;gap:12px;padding:10px 0;${i < recent.length - 1 ? "border-bottom:1px solid rgba(255,255,255,.08);" : ""}">
      <span style="font-size:12px;color:#94a3b8;font-weight:700;min-width:70px;">${escapeHtml(d)}</span>
      <div style="flex:1;background:rgba(255,255,255,.08);border-radius:999px;height:8px;overflow:hidden;">
        <div style="width:${pct}%;height:100%;border-radius:999px;background:${barColor};transition:width .3s;"></div>
      </div>
      <span style="font-size:13px;font-weight:800;color:#fff;min-width:80px;text-align:right;">${total.toFixed(1)} / ${maxMarks}</span>
      <span style="font-size:12px;font-weight:700;color:${barColor};min-width:45px;text-align:right;">${pct}%</span>
    </div>`;
  }).join("");
}

async function loadQuestionLabItems(options = {}) {
  const interactive = options.interactive !== false;
  if (interactive && !(await ensurePremiumAccess("Question Lab loading"))) {
    return;
  }

  const { sourceMode, tier, testType, subject, selectedTopics } = getQuestionLabFilters();
  const recentQuestionIds = Array.isArray(questionLabCache)
    ? questionLabCache.map((item) => String(item?.id || "").trim()).filter(Boolean).slice(0, 120)
    : [];

  const isFull = testType === "full";
  const tierNorm = normalizeTierMode(tier || activeTierMode);
  const label = isFull ? `Full Mock (${tierNorm === "tier2" ? "130" : "100"}Q)` : `${subject || "Quant"} Sectional (25Q)`;
  setQuestionLabStatus(`Generating ${label}...`, "info");

  try {
    const body = {
      tier: tierNorm,
      testType,
      sourceMode,
      includeUnreviewed: false,
      recentQuestionIds
    };

    if (isFull) {
      body.mode = "mock";
      body.mockType = "full_ssc";
      body.scope = "overall";
    } else {
      body.mode = "mock";
      body.mockType = "sectional";
      body.scope = "selective";
      body.subjects = [subject || "quant"];
      body.count = 25;
      if (selectedTopics.length > 0) {
        body.selectedTopics = selectedTopics;
      }
    }

    const response = await fetch(apiUrl("/api/questions/mocks/generate"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Could not generate questions");
    }

    questionLabCache = Array.isArray(data.items) ? data.items : [];
    resetQuestionLabAttemptState({
      mode: data.mode,
      summary: data.summary,
      warnings: data.warnings,
      served: data.served
    });
    renderQuestionLabItems(questionLabCache);
    renderQuestionLabInsights();
    updateQuestionGeneratorRecords();
    refreshCombinedDashboard();

    if (questionLabCache.length === 0) {
      const emptyMsg = (Array.isArray(data.warnings) && data.warnings[0])
        ? data.warnings[0]
        : `No approved ${tierNorm.toUpperCase()} questions match these filters yet.`;
      setQuestionLabStatus(emptyMsg, "warning");
      return;
    }

    const statusMsg = Array.isArray(data.warnings) && data.warnings.length > 0
      ? `Generated ${questionLabCache.length} questions. ${data.warnings[0]}`
      : `Generated ${questionLabCache.length} fresh ${isFull ? "mock" : "sectional"} questions.`;
    setQuestionLabStatus(statusMsg, Array.isArray(data.warnings) && data.warnings.length > 0 ? "warning" : "success");
  } catch (err) {
    console.error("loadQuestionLabItems error:", err);
    setQuestionLabStatus("Failed to generate questions.", "error");
  }
}

// Legacy alias kept for any leftover references
async function generateMockFromLab() {
  return loadQuestionLabItems({ interactive: true });
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
  const _smTierCfg = getTierCfg();
  const _smHasComputer = _smTierCfg.subjects.some(function (s) { return s.key === "computer"; });
  const computer = _smHasComputer ? Number(document.getElementById("computerMarks")?.value || 0) : 0;

  if (!testDate) {
    showProgressStatus("Please select a date first.", "error");
    return;
  }

  const hasInvalid = _smTierCfg.subjects.some(function (sub) {
    const val = Number(document.getElementById(sub.id)?.value || 0);
    return !Number.isFinite(val) || val < 0 || val > sub.max;
  });
  if (hasInvalid) {
    const maxNote = _smTierCfg.subjects.map(function (s) { return s.label + " max " + s.max; }).join(", ");
    showProgressStatus("Marks out of range. Limits: " + maxNote + ".", "error");
    return;
  }

  showProgressStatus("Saving your marks...", "info");

  try {
    const response = await fetch(apiUrl("/api/test"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userKey,
        tier: activeTierMode,
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
      showSelfReviewPrompt(data.entry?.test_date || testDate);
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

/* ============================================================
   TOPIC-WISE DRILL MODAL
   ============================================================ */

function openTopicDrillModal(testDate) {
  const modal = document.getElementById("topicDrillModal");
  const dateLabel = document.getElementById("topicDrillDateLabel");
  const badge = document.getElementById("topicDrillSavedBadge");
  const status = document.getElementById("topicDrillStatus");
  if (!modal) return;
  _topicDrillModalTestDate = testDate || new Date().toISOString().split("T")[0];
  _topicDrillActiveSubject = "Quant";
  if (dateLabel) dateLabel.textContent = `Test date: ${_topicDrillModalTestDate} \u00b7 ${activeTierMode.toUpperCase()}`;
  if (badge) badge.style.display = "none";
  if (status) status.textContent = "";
  renderTopicRows(_topicDrillActiveSubject);
  applyTopicTabsUI();
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeTopicDrillModal() {
  const modal = document.getElementById("topicDrillModal");
  if (modal) modal.classList.remove("open");
  document.body.style.overflow = "";
}

function applyTopicTabsUI() {
  const tabs = document.querySelectorAll("#topicDrillTabs .topic-modal-tab");
  tabs.forEach(function (tab) {
    tab.classList.toggle("active", tab.dataset.subject === _topicDrillActiveSubject);
  });
}

function renderTopicRows(subject) {
  const body = document.getElementById("topicDrillBody");
  if (!body) return;
  const topics = SSC_TOPICS[subject] || [];
  const existing = (topicDrillByTierCache[activeTierMode] || {})[_topicDrillModalTestDate]?.[subject] || {};
  body.innerHTML = topics.map(function (topic) {
    const safeId = "tdr_" + topic.replace(/[^a-zA-Z0-9]/g, "_");
    const ex = existing[topic] || {};
    const mVal = ex.marks != null ? ex.marks : "";
    const eVal = ex.mistakes != null ? ex.mistakes : "";
    const tVal = ex.timeMins != null ? ex.timeMins : "";
    return '<div class="topic-row">'
      + '<div class="topic-row-label">' + escapeHtml(topic) + '</div>'
      + '<input type="number" id="' + safeId + '_marks" placeholder="\u2014" min="0" max="50" value="' + mVal + '" />'
      + '<input type="number" id="' + safeId + '_mistakes" placeholder="\u2014" min="0" max="25" value="' + eVal + '" />'
      + '<input type="number" id="' + safeId + '_mins" placeholder="\u2014" min="0" max="120" value="' + tVal + '" />'
      + '</div>';
  }).join("");
}

async function saveTopicDrill() {
  const userKey = getUserKey();
  const status = document.getElementById("topicDrillStatus");
  const badge = document.getElementById("topicDrillSavedBadge");
  const subject = _topicDrillActiveSubject;
  const topics = SSC_TOPICS[subject] || [];

  const subjectData = {};
  topics.forEach(function (topic) {
    const safeId = "tdr_" + topic.replace(/[^a-zA-Z0-9]/g, "_");
    const mRaw = (document.getElementById(safeId + "_marks")?.value || "").trim();
    const eRaw = (document.getElementById(safeId + "_mistakes")?.value || "").trim();
    const tRaw = (document.getElementById(safeId + "_mins")?.value || "").trim();
    if (mRaw !== "" || eRaw !== "" || tRaw !== "") {
      subjectData[topic] = {
        marks: mRaw !== "" ? Number(mRaw) : null,
        mistakes: eRaw !== "" ? Number(eRaw) : null,
        timeMins: tRaw !== "" ? Number(tRaw) : null
      };
    }
  });

  const tier = activeTierMode;
  const date = _topicDrillModalTestDate;
  const tierData = Object.assign({}, topicDrillByTierCache[tier] || {});
  const dateData = Object.assign({}, tierData[date] || {});
  if (Object.keys(subjectData).length > 0) {
    dateData[subject] = subjectData;
  }
  tierData[date] = dateData;
  topicDrillByTierCache = Object.assign({}, topicDrillByTierCache, { [tier]: tierData });

  try {
    const res = await fetch(apiUrl("/api/user/" + encodeURIComponent(userKey)), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicDrillByTier: topicDrillByTierCache })
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Save failed");
    if (status) status.textContent = subject + " saved \u2713";
    if (badge) { badge.style.display = "inline"; setTimeout(function () { badge.style.display = "none"; }, 3000); }
    updateTodayActionPlan(lastMarksEntries);
    updateWeakTopicNote();
  } catch (err) {
    console.error("saveTopicDrill error:", err);
    if (status) status.textContent = "Saved locally. Server sync failed.";
  }
}

/**
 * Aggregate topic drill data for current tier.
 * Returns array of {topic, subject, totalMistakes, totalMarks, sessions}
 * sorted by most mistakes descending.
 */
function getWeakTopicsFromDrill() {
  const tierData = topicDrillByTierCache[activeTierMode];
  if (!tierData || typeof tierData !== "object") return [];
  const stats = {};
  Object.values(tierData).forEach(function (dateData) {
    if (!dateData || typeof dateData !== "object") return;
    Object.entries(dateData).forEach(function ([subject, subjectData]) {
      if (!subjectData || typeof subjectData !== "object") return;
      Object.entries(subjectData).forEach(function ([topic, vals]) {
        if (!vals) return;
        const key = subject + "::" + topic;
        if (!stats[key]) stats[key] = { topic: topic, subject: subject, totalMistakes: 0, totalMarks: 0, sessions: 0 };
        if (vals.mistakes != null) stats[key].totalMistakes += Number(vals.mistakes);
        if (vals.marks != null) stats[key].totalMarks += Number(vals.marks);
        stats[key].sessions++;
      });
    });
  });
  return Object.values(stats).sort(function (a, b) { return b.totalMistakes - a.totalMistakes; });
}

/**
 * Update the purple weak-topic note in the hook zone.
 */
function updateWeakTopicNote() {
  const el = document.getElementById("hzWeakTopicNote");
  if (!el) return;
  const weakTopics = getWeakTopicsFromDrill().filter(function (t) { return t.totalMistakes > 0; });
  if (weakTopics.length === 0) {
    el.style.display = "none";
    el.textContent = "";
    return;
  }
  const top = weakTopics[0];
  const second = weakTopics[1];
  let msg = "\uD83D\uDCCC Focus area: <strong>" + escapeHtml(top.topic) + "</strong> (" + escapeHtml(top.subject) + ") \u2014 " + top.totalMistakes + " mistakes across " + top.sessions + " test" + (top.sessions !== 1 ? "s" : "") + ".";
  if (second) msg += " Also watch: <strong>" + escapeHtml(second.topic) + "</strong>.";
  el.innerHTML = msg;
  el.style.display = "block";
}

function showSelfReviewPrompt(testDate = "") {
  const box = document.getElementById("selfReviewBox");
  const context = document.getElementById("selfReviewContext");
  const weak = document.getElementById("selfWeakTopicInput");
  const guess = document.getElementById("selfGuessAreaInput");
  const notes = document.getElementById("selfReviewNotes");
  const status = document.getElementById("selfReviewStatus");
  if (!box) return;

  pendingSelfReviewDate = String(testDate || "");
  if (context) {
    const label = pendingSelfReviewDate || "today";
    context.textContent = `${activeTierMode.toUpperCase()} • Test ${label}`;
  }
  if (weak) weak.value = "";
  if (guess) guess.value = "";
  if (notes) notes.value = "";
  if (status) status.textContent = "";
  box.style.display = "block";
}

async function saveSelfDeclaredReview() {
  const userKey = getUserKey();
  const weak = String(document.getElementById("selfWeakTopicInput")?.value || "").trim();
  const guess = String(document.getElementById("selfGuessAreaInput")?.value || "").trim();
  const notes = String(document.getElementById("selfReviewNotes")?.value || "").trim();
  const status = document.getElementById("selfReviewStatus");

  if (!weak && !guess && !notes) {
    if (status) status.textContent = "Pick at least one reflection point.";
    return;
  }

  const existing = Array.isArray(selfReviewByTierCache[activeTierMode]) ? selfReviewByTierCache[activeTierMode] : [];
  const entry = {
    testDate: pendingSelfReviewDate || new Date().toISOString().split("T")[0],
    weakTopic: weak || null,
    guessedMost: guess || null,
    notes: notes || null,
    updatedAt: new Date().toISOString()
  };

  const nextList = [entry, ...existing].slice(0, 60);
  selfReviewByTierCache = {
    ...(selfReviewByTierCache && typeof selfReviewByTierCache === "object" ? selfReviewByTierCache : {}),
    [activeTierMode]: nextList
  };

  try {
    const response = await fetch(apiUrl(`/api/user/${encodeURIComponent(userKey)}`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selfReviewByTier: selfReviewByTierCache })
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Could not save self review");
    }
    if (status) status.textContent = "Self review saved.";
  } catch (err) {
    console.error("saveSelfDeclaredReview error:", err);
    if (status) status.textContent = "Saved locally in this session. Server sync failed.";
  }
}

async function loadMarksHistory() {
  const userKey = getUserKey();

  try {
    const response = await fetch(apiUrl(`/api/test/${encodeURIComponent(userKey)}?tier=${encodeURIComponent(activeTierMode)}`));
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
      updateQuestionGeneratorRecords();
      refreshCombinedDashboard();
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
    updateQuestionGeneratorRecords();
    refreshCombinedDashboard();
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

  const _histCfg = getTierCfg();
  historyDiv.innerHTML = entries.map(function (entry) {
    const subjectParts = _histCfg.subjects.map(function (s) {
      return '<div>' + s.label + ': ' + (entry[s.dbKey] || 0) + '</div>';
    }).join('');
    return '<div class="bg-gray-50 p-4 rounded-xl">'
      + '<div class="font-semibold">' + new Date(entry.test_date).toLocaleDateString() + '</div>'
      + '<div class="grid grid-cols-3 md:grid-cols-6 gap-2 mt-2 text-sm">'
      + subjectParts
      + '<div class="font-semibold">Total: ' + (entry.total_marks || 0) + '</div>'
      + '</div></div>';
  }).join('');
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
      scales: { y: { beginAtZero: true, max: getTierCfg().totalMax } }
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

  const _scCfg = getTierCfg();
  const _scDatasets = _scCfg.subjects.map(function (sub) {
    return {
      label: sub.label,
      data: sortedEntries.map(function (e) { return e[sub.dbKey]; }),
      borderColor: sub.color,
      backgroundColor: sub.bg,
      tension: 0.1
    };
  });
  const _scYMax = Math.max.apply(null, _scCfg.subjects.map(function (s) { return s.max; }));
  subjectChartInstance = new Chart(ctx, {
    type: "line",
    data: { labels: labels, datasets: _scDatasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true, max: _scYMax } }
    }
  });
}

async function loadGoalCutoffCatalog() {
  const examFamily = String(document.getElementById("goalExamFamily")?.value || "ssc_cgl");
  const tier = String(document.getElementById("goalTier")?.value || activeTierMode);
  const userKey = getUserKey();
  try {
    const response = await fetch(apiUrl(`/api/goals/cutoffs?examFamily=${encodeURIComponent(examFamily)}&tier=${encodeURIComponent(tier)}&userKey=${encodeURIComponent(userKey)}`));
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
  const cap = selectedTier === "tier2" ? 390 : 200;
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
    const smartMeta = goalCutoffCatalog.smartMeta;
    const smartSuffix = tierLabel === "SMART" && smartMeta
      ? ` | Blend T1:${Math.round(Number(smartMeta.tier1Weight || 0) * 100)}% / T2:${Math.round(Number(smartMeta.tier2Weight || 0) * 100)}%`
      : "";
    statusEl.textContent = `Auto cutoff loaded (${tierLabel}, ${baseYear} baseline): ${Math.round(cutoff)} | Recommended target: ${recommendedTarget}${smartSuffix}`;
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
  } else {
    const tierEl = document.getElementById("goalTier");
    if (tierEl) tierEl.value = activeTierMode;
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
  const category = document.getElementById("goalCategory")?.value || "UR";
  const targetPost = document.getElementById("goalTargetPost")?.value || "";
  const examDate = document.getElementById("goalExamDate")?.value || "";
  const autoCutoff = Number(document.getElementById("goalAutoCutoff")?.value || 0);

  // Auto-derive: SSC CGL posts are allocated on Tier 2 scores
  const tier = "tier2";
  const studyHours = 6;
  // Target score: cutoff + 10 marks buffer, or 200 if no cutoff
  const targetScore = Number.isFinite(autoCutoff) && autoCutoff > 0 ? Math.round(autoCutoff + 10) : 200;

  const examAllowed = ["ssc_cgl", "ssc_chsl", "ssc_mts", "ssc_cpo"];
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

  if (!targetPost || String(targetPost).length > 80) {
    if (statusEl) {
      statusEl.textContent = "Please select a valid target post.";
      statusEl.style.color = "#b91c1c";
    }
    return;
  }

  if (statusEl) { statusEl.textContent = "Saving..."; statusEl.style.color = "#1e40af"; }

  try {
    const normalizedTier = normalizeTierMode(tier);
    const nextGoal = {
      examFamily,
      tier: normalizedTier,
      category,
      targetPost,
      examDate,
      studyHours,
      targetScore,
      autoCutoff: Number.isFinite(autoCutoff) && autoCutoff > 0 ? Math.round(autoCutoff) : null,
      updatedAt: new Date().toISOString()
    };

    goalsByTierCache = {
      ...(goalsByTierCache && typeof goalsByTierCache === "object" ? goalsByTierCache : {}),
      [normalizedTier]: nextGoal
    };

    const profileUpdatePayload = {
      goalsByTier: goalsByTierCache
    };
    if (normalizedTier === "tier1") {
      profileUpdatePayload.goal = nextGoal;
    }

    const response = await fetch(apiUrl(`/api/user/${encodeURIComponent(userKey)}`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileUpdatePayload)
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || "Save failed");
    const profile = data.profile || {};
    goalsByTierCache = profile.goalsByTier && typeof profile.goalsByTier === "object"
      ? profile.goalsByTier
      : goalsByTierCache;
    goalProfile = goalsByTierCache[activeTierMode] || null;
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

  updateSidebarMeta();
}

// ============================================================
// WEEKLY REPORT CARD
// ============================================================
function buildWeeklyReport(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return null;
  const sorted = [...entries].sort((a, b) => new Date(b.test_date) - new Date(a.test_date));
  const last7 = sorted.slice(0, 7);
  const prev7 = sorted.slice(7, 14);
  const _wrcCfg = getTierCfg();
  const subjectKeys = _wrcCfg.subjects.map(function (s) { return s.key; });
  const subjectLabels = {};
  _wrcCfg.subjects.forEach(function (s) { subjectLabels[s.key] = s.label; });
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
  return { subjectAvgs, subjectLabels, overallAvg, bestDay, worstDay, benchmarkGap, weekImprovement, count: last7.length, _last7: last7 };
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
  const { subjectAvgs, overallAvg, bestDay, worstDay, benchmarkGap, weekImprovement, count, _last7 } = report;
  const tierCfg = getTierCfg();
  const fmt = function (d) {
    try { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" }); }
    catch (_) { return d; }
  };

  const tierLabel = activeTierMode === "tier2" ? "Tier 2" : "Tier 1";
  const headerHtml = `
    <div class="wrc-header">
      <div class="wrc-header-left">
        <div class="wrc-header-title">Weekly Report Card</div>
        <div class="wrc-header-sub">Last ${count} session${count !== 1 ? "s" : ""} &middot; ${tierLabel} &middot; Auto-generated</div>
      </div>
      <div class="wrc-avg-hero-wrap">
        <span class="wrc-avg-hero">${overallAvg.toFixed(1)}</span>
        <span class="wrc-avg-unit">avg / ${tierCfg.totalMax}</span>
      </div>
    </div>`;

  const gapColor = benchmarkGap === null ? "#94a3b8" : benchmarkGap > 0 ? "#f87171" : "#34d399";
  const gapText = benchmarkGap === null ? "--" : (benchmarkGap > 0 ? "-" : "+") + Math.abs(benchmarkGap).toFixed(1);
  const statsHtml = `
    <div class="wrc-stats-row">
      <div class="wrc-stat">
        <div class="wrc-stat-label">Best Day</div>
        <div class="wrc-stat-value wrc-best">${escapeHtml(String(bestDay.total_marks))}</div>
        <div class="wrc-stat-date">${fmt(bestDay.test_date)}</div>
      </div>
      <div class="wrc-stat">
        <div class="wrc-stat-label">Worst Day</div>
        <div class="wrc-stat-value wrc-worst">${escapeHtml(String(worstDay.total_marks))}</div>
        <div class="wrc-stat-date">${fmt(worstDay.test_date)}</div>
      </div>
      <div class="wrc-stat">
        <div class="wrc-stat-label">Benchmark Gap</div>
        <div class="wrc-stat-value" style="color:${gapColor}">${gapText}</div>
      </div>
    </div>`;

  let improvementHtml = "";
  if (weekImprovement != null) {
    const sign = weekImprovement >= 0 ? "+" : "";
    const col = weekImprovement >= 0 ? "#34d399" : "#f87171";
    const daysGoal = _lastOutcome?.trend?.daysToGoal;
    const pace = daysGoal != null && daysGoal > 0 ? " Safe zone in ~" + daysGoal + " days at this pace." : "";
    improvementHtml = `<div class="wrc-improvement">Week-on-week: <span style="color:${col};font-weight:900">${sign}${weekImprovement} marks</span>.${escapeHtml(pace)}</div>`;
  }

  const subjectBarsHtml = tierCfg.subjects.map(function (sub) {
    const avg = Number(subjectAvgs[sub.key] || 0);
    const pct = Math.min(100, (avg / sub.max) * 100).toFixed(1);
    return '<div class="wrc-bar-row">'
      + '<div class="wrc-bar-label">' + escapeHtml(sub.label) + '</div>'
      + '<div class="wrc-bar-track"><div class="wrc-bar-fill" style="width:' + pct + '%;background:' + sub.color + '"></div></div>'
      + '<div class="wrc-bar-val">' + avg.toFixed(1) + '<span>/' + sub.max + '</span></div>'
      + '</div>';
  }).join('');

  const subjectSection = unlockedPlan >= 99
    ? '<div class="wrc-section-title">Subject Performance</div>' + subjectBarsHtml
    : '<div class="wrc-locked-strip"><button type="button" class="js-unlock-plan" data-plan="99" style="border:none;border-radius:10px;background:#6d28d9;color:#fff;padding:8px 14px;font-size:12px;font-weight:800;cursor:pointer;">Unlock 99 plan for subject bars</button></div>';

  const recent = Array.isArray(_last7) ? _last7 : [];
  const historySection = recent.length > 0
    ? '<div class="wrc-history"><div class="wrc-section-title">Recent Sessions</div>'
      + recent.map(function (e) {
        const chips = tierCfg.subjects.map(function (sub) {
          return '<span class="wrc-chip" style="background:' + sub.bg + ';">' + sub.label.charAt(0) + ': ' + (e[sub.dbKey] || 0) + '</span>';
        }).join('');
        return '<div class="wrc-session-card"><div class="wrc-session-date">' + fmt(e.test_date) + '</div><div class="wrc-session-total">' + (e.total_marks || 0) + '</div><div class="wrc-chips">' + chips + '</div></div>';
      }).join('')
      + '</div>'
    : '';

  container.innerHTML = '<div class="wrc-shell">' + headerHtml + statsHtml + '<div class="wrc-body">' + improvementHtml + subjectSection + historySection + '</div></div>';
  container.classList.remove("hidden");
  bindUnlockButtons();
}

async function syncPaymentStatus() {
  try {
    const userKey = getUserKey();
    const response = await fetch(apiUrl(`/api/payment/status?userKey=${encodeURIComponent(userKey)}`));
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
    const response = await fetch(apiUrl("/api/payment/start-trial"), {
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

  const response = await fetch(apiUrl(path), options);
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

function setQuestionAdminStatus(message, isError = false) {
  const el = document.getElementById("questionAdminStatus");
  if (!el) return;
  el.textContent = message || "";
  el.style.color = isError ? "#b91c1c" : "#334155";
}

function renderQuestionAdminPreview(items = []) {
  const listEl = document.getElementById("questionAdminPreviewList");
  if (!listEl) return;
  if (!Array.isArray(items) || items.length === 0) {
    listEl.innerHTML = '<div class="review-item"><div class="review-q">No items to show.</div></div>';
    return;
  }

  listEl.innerHTML = items.slice(0, 25).map((item, idx) => {
    const confidence = Number(item.confidenceScore || 0).toFixed(2);
    return `
      <div class="review-item">
        <div class="review-item-head">
          <div class="review-meta">#${idx + 1} | ${escapeHtml(item.subject || "na")} | ${escapeHtml(item.topic || "na")} | confidence ${confidence}</div>
        </div>
        <div class="review-q">${escapeHtml(String(item.question || "").slice(0, 240))}</div>
      </div>
    `;
  }).join("");
}

async function requestQuestionAdmin(path, method = "GET", body = null, isFormData = false) {
  const adminKey = String(document.getElementById("questionAdminKey")?.value || "").trim();
  if (!adminKey) throw new Error("Enter admin key");

  const options = {
    method,
    headers: {
      "x-admin-key": adminKey
    }
  };

  if (body && method !== "GET") {
    if (isFormData) {
      options.body = body;
    } else {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }
  }

  const response = await fetch(apiUrl(path), options);
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || "Admin request failed");
  }
  return data;
}

function buildQuestionAdminFormData() {
  const fileInput = document.getElementById("questionAdminFile");
  const file = fileInput?.files?.[0] || null;
  if (!file) throw new Error("Choose a PDF file first");

  const fd = new FormData();
  fd.append("file", file);
  fd.append("examFamily", "ssc");
  fd.append("subject", String(document.getElementById("questionAdminSubject")?.value || "quant"));
  fd.append("topic", String(document.getElementById("questionAdminTopic")?.value || "Imported Topic"));
  fd.append("tier", String(document.getElementById("questionAdminTier")?.value || "tier1"));
  fd.append("difficulty", "medium");
  fd.append("questionMode", "objective");
  fd.append("parserPreset", String(document.getElementById("questionAdminParser")?.value || "standard"));
  fd.append("useOCR", String(document.getElementById("questionAdminOCR")?.value || "true"));
  fd.append("ocrPageLimit", String(document.getElementById("questionAdminOCRPages")?.value || "20"));
  return fd;
}

async function previewQuestionUpload() {
  try {
    setQuestionAdminStatus("Parsing PDF preview...");
    const fd = buildQuestionAdminFormData();
    const data = await requestQuestionAdmin("/api/questions/admin/import-pdf/preview", "POST", fd, true);
    renderQuestionAdminPreview(data.preview || []);

    const stats = document.getElementById("questionAdminStats");
    if (stats) {
      stats.innerHTML = `
        <div class="admin-stat">Extracted: ${Number(data.extractedCount || 0)}</div>
        <div class="admin-stat">Preset: ${escapeHtml(String(data.parserPreset || "standard"))}</div>
      `;
    }

    setQuestionAdminStatus(`Preview ready. Extracted ${Number(data.extractedCount || 0)} items.`);
  } catch (err) {
    console.error("previewQuestionUpload error:", err);
    setQuestionAdminStatus(err.message || "Preview failed", true);
  }
}

async function importQuestionUpload() {
  try {
    setQuestionAdminStatus("Importing questions to review queue...");
    const fd = buildQuestionAdminFormData();
    fd.append("autoApprove", "false");
    fd.append("reviewThreshold", "0.95");
    const data = await requestQuestionAdmin("/api/questions/admin/import-pdf", "POST", fd, true);

    const stats = document.getElementById("questionAdminStats");
    if (stats) {
      stats.innerHTML = `
        <div class="admin-stat">Imported: ${Number(data.imported || 0)}</div>
        <div class="admin-stat">Queued: ${Number(data.queuedForReview || 0)}</div>
        <div class="admin-stat">Total Bank: ${Number(data.total || 0)}</div>
      `;
    }

    setQuestionAdminStatus(`Imported ${Number(data.imported || 0)}. Queued ${Number(data.queuedForReview || 0)} for accuracy review.`);
    await loadQuestionLabMeta();
  } catch (err) {
    console.error("importQuestionUpload error:", err);
    setQuestionAdminStatus(err.message || "Import failed", true);
  }
}

async function loadQuestionReviewQueue() {
  try {
    setQuestionAdminStatus("Loading review queue...");
    const data = await requestQuestionAdmin("/api/questions/admin/review/list?status=needs_review&limit=20", "GET");
    renderQuestionAdminPreview(data.items || []);

    const stats = document.getElementById("questionAdminStats");
    if (stats) {
      stats.innerHTML = `
        <div class="admin-stat">Review Pending: ${Number(data.totalMatched || 0)}</div>
        <div class="admin-stat">Loaded: ${Number(data.count || 0)}</div>
      `;
    }

    setQuestionAdminStatus(`Loaded ${Number(data.count || 0)} review items.`);
  } catch (err) {
    console.error("loadQuestionReviewQueue error:", err);
    setQuestionAdminStatus(err.message || "Could not load review queue", true);
  }
}

async function runQuestionAutoDecision(decision) {
  try {
    const isApprove = decision === "approve";
    const body = {
      decision,
      reviewedBy: "auto_admin",
      minConfidence: isApprove ? 0.9 : undefined,
      maxConfidence: isApprove ? undefined : 0.15,
      rejectReason: isApprove ? "" : "Auto-rejected due to very low confidence",
      limit: 200
    };

    setQuestionAdminStatus(isApprove ? "Auto-approving high-confidence items..." : "Auto-rejecting very low-confidence items...");
    const data = await requestQuestionAdmin("/api/questions/admin/review/auto-decision", "POST", body);
    setQuestionAdminStatus(`${isApprove ? "Approved" : "Rejected"} ${Number(data.updated || 0)} items automatically.`);
    await loadQuestionReviewQueue();
  } catch (err) {
    console.error("runQuestionAutoDecision error:", err);
    setQuestionAdminStatus(err.message || "Auto decision failed", true);
  }
}

function initQuestionAdminPanel() {
  const panel = document.getElementById("questionAdminPanel");
  if (!panel) return;

  if (!isLiveAdminModeEnabled()) {
    panel.classList.add("hidden");
    return;
  }

  panel.classList.remove("hidden");

  const previewBtn = document.getElementById("questionAdminPreviewBtn");
  if (previewBtn) previewBtn.addEventListener("click", previewQuestionUpload);

  const importBtn = document.getElementById("questionAdminImportBtn");
  if (importBtn) importBtn.addEventListener("click", importQuestionUpload);

  const loadReviewBtn = document.getElementById("questionAdminReviewLoadBtn");
  if (loadReviewBtn) loadReviewBtn.addEventListener("click", loadQuestionReviewQueue);

  const autoApproveBtn = document.getElementById("questionAdminAutoApproveBtn");
  if (autoApproveBtn) {
    autoApproveBtn.addEventListener("click", function () {
      runQuestionAutoDecision("approve");
    });
  }

  const autoRejectBtn = document.getElementById("questionAdminAutoRejectBtn");
  if (autoRejectBtn) {
    autoRejectBtn.addEventListener("click", function () {
      runQuestionAutoDecision("reject");
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

  const response = await fetch(apiUrl(path), options);
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
