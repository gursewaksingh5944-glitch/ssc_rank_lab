/**
 * Conversion Optimization Module
 * Handles trial banner, referral display, prediction tracking, and UI improvements
 * Loaded after script.js
 */

// ===== PREDICTION COUNTER =====
const PREDICTION_TRACKING_KEY = "ssc_predictions_count";
const TRIAL_AUTO_TRIGGER_THRESHOLD = 3; // Show trial after 3 predictions

function trackPrediction() {
  try {
    let count = parseInt(localStorage.getItem(PREDICTION_TRACKING_KEY) || "0");
    count++;
    localStorage.setItem(PREDICTION_TRACKING_KEY, count);
    
    // Show trial banner after N predictions if not trial/paid
    if (count === TRIAL_AUTO_TRIGGER_THRESHOLD) {
      const plan = getUnlockedPlan() || 0;
      const trial = paymentAccessState?.trial;
      if (plan < 99 && (!trial || !trial.active)) {
        showTrialBannerAutomatic();
      }
    }
  } catch (err) {
    console.error("trackPrediction error:", err);
  }
}

function resetPredictionCounter() {
  try {
    localStorage.removeItem(PREDICTION_TRACKING_KEY);
  } catch (err) {
    console.error("resetPredictionCounter error:", err);
  }
}

// ===== TRIAL BANNER MANAGEMENT =====
function showTrialBannerAutomatic() {
  const banner = document.getElementById("prominentTrialBanner");
  if (banner && !banner.classList.contains("hidden")) {
    return; // Already visible
  }
  if (banner) {
    banner.classList.remove("hidden");
    // Auto-hide after 8 seconds if not interacted
    setTimeout(() => {
      if (banner && !banner.classList.contains("hidden")) {
        banner.classList.add("hidden");
      }
    }, 8000);
  }
}

function setupTrialBannerButton() {
  const bannerBtn = document.getElementById("bannerTrialBtn");
  if (bannerBtn) {
    bannerBtn.addEventListener("click", function () {
      resetPredictionCounter();
      if (typeof startFreeTrial === "function") {
        startFreeTrial(bannerBtn);
      }
      document.getElementById("prominentTrialBanner")?.classList.add("hidden");
    });
  }
}

// ===== REFERRAL CODE DISPLAY =====
function loadAndDisplayReferralCode() {
  try {
    const userKey = getUserKey();
    if (!userKey) return;

    // Load referral code from API or planStore
    fetch(apiUrl("/api/payment/status"), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userKey })
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.referralCode) {
          const codeInput = document.getElementById("userReferralCode");
          if (codeInput) {
            codeInput.value = data.referralCode;
          }
        }
      })
      .catch((err) => console.error("loadReferralCode error:", err));
  } catch (err) {
    console.error("loadAndDisplayReferralCode error:", err);
  }
}

function setupReferralCopyButton() {
  const copyBtn = document.getElementById("copyReferralBtn");
  const codeInput = document.getElementById("userReferralCode");

  if (copyBtn && codeInput) {
    copyBtn.addEventListener("click", function () {
      const code = codeInput.value.trim();
      if (!code) {
        showPaymentStatus("No referral code available", "error");
        return;
      }

      navigator.clipboard.writeText(code).then(() => {
        showPaymentStatus(`Referral code copied: ${code}`, "success");
        copyBtn.textContent = "Copied!";
        setTimeout(() => {
          copyBtn.textContent = "Copy";
        }, 2000);
      }).catch(() => {
        showPaymentStatus("Failed to copy code", "error");
      });
    });
  }
}

// ===== SHOW TRIAL BANNER ON LOAD IF NO TRIAL/PAID =====
function showTrialBannerIfNeeded() {
  try {
    const plan = getUnlockedPlan() || 0;
    const trial = paymentAccessState?.trial;
    
    // Show if no paid plan and no active trial
    if (plan < 99 && (!trial || !trial.active)) {
      const banner = document.getElementById("prominentTrialBanner");
      if (banner) {
        banner.classList.remove("hidden");
      }
    }
  } catch (err) {
    console.error("showTrialBannerIfNeeded error:", err);
  }
}

// ===== IMPROVE PREDICTRANK TO TRACK PREDICTIONS =====
const originalPredictRank = predictRank;
window.predictRank = async function () {
  trackPrediction(); // Track this prediction
  return originalPredictRank.apply(this, arguments);
};

// ===== UPGRADE MODAL AUTO-LOAD REFERRAL CODE =====
const originalOpenUpgradeModal = openUpgradeModal;
window.openUpgradeModal = function () {
  loadAndDisplayReferralCode();
  return originalOpenUpgradeModal.apply(this, arguments);
};

// ===== INITIALIZE ON DOM READY =====
document.addEventListener("DOMContentLoaded", function () {
  // Small delay to ensure other scripts are loaded
  setTimeout(() => {
    setupTrialBannerButton();
    setupReferralCopyButton();
    showTrialBannerIfNeeded();
    
    // Show banner on idle (after 30 seconds)
    setTimeout(() => {
      showTrialBannerIfNeeded();
    }, 30000);
  }, 500);
});

// Export for testing
window.ConversionOptimizations = {
  trackPrediction,
  resetPredictionCounter,
  showTrialBannerAutomatic,
  loadAndDisplayReferralCode,
  showTrialBannerIfNeeded
};
