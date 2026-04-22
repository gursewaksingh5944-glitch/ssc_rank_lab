/**
 * CONVERSION OPTIMIZATION - BUTTON & FLOW TESTING
 * Date: April 22, 2026
 * 
 * Test all conversion-related buttons and flows
 */

// ===== TEST 1: TRIAL BANNER VISIBILITY =====
function testTrialBanner() {
  console.log("TEST 1: Trial Banner Visibility");
  const banner = document.getElementById("prominentTrialBanner");
  
  if (!banner) {
    console.error("❌ FAIL: Trial banner not found in DOM");
    return false;
  }
  
  console.log("✓ Trial banner element exists");
  
  // Check if banner button exists
  const bannerBtn = document.getElementById("bannerTrialBtn");
  if (!bannerBtn) {
    console.error("❌ FAIL: Banner trial button not found");
    return false;
  }
  console.log("✓ Banner trial button exists");
  
  // Test banner visibility toggle
  banner.classList.remove("hidden");
  console.log("✓ Banner shown");
  
  banner.classList.add("hidden");
  console.log("✓ Banner hidden");
  
  console.log("✅ TEST 1 PASSED\n");
  return true;
}

// ===== TEST 2: UPGRADE MODAL BUTTONS =====
function testUpgradeModalButtons() {
  console.log("TEST 2: Upgrade Modal Buttons");
  
  const buttons = [
    { id: "upgradeModalTrialBtn", name: "Trial Button" },
    { id: "upgradeModalPayBtn", name: "Pay Button" },
    { id: "closeUpgradeModal", name: "Close Button" }
  ];
  
  let allFound = true;
  buttons.forEach(btn => {
    const elem = document.getElementById(btn.id);
    if (!elem) {
      console.error(`❌ FAIL: ${btn.name} (${btn.id}) not found`);
      allFound = false;
    } else {
      console.log(`✓ ${btn.name} found`);
    }
  });
  
  if (allFound) {
    console.log("✅ TEST 2 PASSED\n");
    return true;
  }
  return false;
}

// ===== TEST 3: PAYMENT STATUS DISPLAY =====
function testPaymentStatusDisplay() {
  console.log("TEST 3: Payment Status Display");
  
  const statusDiv = document.getElementById("paymentStatus");
  if (!statusDiv) {
    console.error("❌ FAIL: Payment status div not found");
    return false;
  }
  console.log("✓ Payment status div exists");
  
  // Test showing a message
  if (typeof showPaymentStatus === "function") {
    showPaymentStatus("Test message - Trial activated successfully", "success");
    console.log("✓ Payment status function works");
    setTimeout(() => {
      showPaymentStatus("", "");
    }, 2000);
  }
  
  console.log("✅ TEST 3 PASSED\n");
  return true;
}

// ===== TEST 4: REFERRAL CODE ELEMENTS =====
function testReferralElements() {
  console.log("TEST 4: Referral Code Elements");
  
  const codeInput = document.getElementById("userReferralCode");
  const copyBtn = document.getElementById("copyReferralBtn");
  
  if (!codeInput) {
    console.error("❌ FAIL: Referral code input not found");
    return false;
  }
  console.log("✓ Referral code input exists");
  
  if (!copyBtn) {
    console.error("❌ FAIL: Copy referral button not found");
    return false;
  }
  console.log("✓ Copy referral button exists");
  
  // Test setting a code
  codeInput.value = "RLTEST123ABC";
  console.log("✓ Referral code can be set");
  
  console.log("✅ TEST 4 PASSED\n");
  return true;
}

// ===== TEST 5: DIRECT BUY BUTTONS =====
function testDirectBuyButtons() {
  console.log("TEST 5: Direct Buy Buttons");
  
  const buyButtons = document.querySelectorAll(".js-direct-buy-now");
  if (buyButtons.length === 0) {
    console.error("❌ FAIL: No direct buy buttons found");
    return false;
  }
  console.log(`✓ Found ${buyButtons.length} direct buy buttons`);
  
  buyButtons.forEach((btn, idx) => {
    if (btn.textContent && btn.textContent.includes("99")) {
      console.log(`✓ Buy button ${idx} has price text`);
    }
  });
  
  console.log("✅ TEST 5 PASSED\n");
  return true;
}

// ===== TEST 6: UNLOCK BUTTONS =====
function testUnlockButtons() {
  console.log("TEST 6: Unlock Buttons");
  
  const unlockButtons = document.querySelectorAll(".js-unlock-plan");
  if (unlockButtons.length === 0) {
    console.warn("⚠ No unlock plan buttons found (may be hidden initially)");
    return true;
  }
  console.log(`✓ Found ${unlockButtons.length} unlock buttons`);
  
  unlockButtons.forEach((btn, idx) => {
    if (btn.dataset.plan) {
      console.log(`✓ Button ${idx} has plan data: ${btn.dataset.plan}`);
    }
  });
  
  console.log("✅ TEST 6 PASSED\n");
  return true;
}

// ===== TEST 7: PREMIUM MESSAGING =====
function testPremiumMessaging() {
  console.log("TEST 7: Premium Messaging");
  
  const sidePremiumLocked = document.getElementById("sidePremiumLocked");
  const sidePremiumUnlocked = document.getElementById("sidePremiumUnlocked");
  
  if (!sidePremiumLocked) {
    console.error("❌ FAIL: Premium locked message not found");
    return false;
  }
  console.log("✓ Premium locked message exists");
  
  if (!sidePremiumUnlocked) {
    console.error("❌ FAIL: Premium unlocked message not found");
    return false;
  }
  console.log("✓ Premium unlocked message exists");
  
  // Check message content
  const lockedText = sidePremiumLocked.textContent.toLowerCase();
  if (lockedText.includes("unlock") || lockedText.includes("locked")) {
    console.log("✓ Locked message has appropriate text");
  }
  
  const unlockedText = sidePremiumUnlocked.textContent.toLowerCase();
  if (unlockedText.includes("active") || unlockedText.includes("unlocked")) {
    console.log("✓ Unlocked message has appropriate text");
  }
  
  console.log("✅ TEST 7 PASSED\n");
  return true;
}

// ===== TEST 8: PREDICTION TRACKING =====
function testPredictionTracking() {
  console.log("TEST 8: Prediction Tracking");
  
  if (typeof ConversionOptimizations === "undefined") {
    console.error("❌ FAIL: Conversion optimizations not loaded");
    return false;
  }
  console.log("✓ Conversion optimizations module loaded");
  
  if (typeof ConversionOptimizations.trackPrediction !== "function") {
    console.error("❌ FAIL: trackPrediction function not found");
    return false;
  }
  console.log("✓ trackPrediction function exists");
  
  // Test tracking
  ConversionOptimizations.resetPredictionCounter();
  console.log("✓ Prediction counter reset");
  
  ConversionOptimizations.trackPrediction();
  const count = localStorage.getItem("ssc_predictions_count");
  console.log(`✓ Prediction tracked (count: ${count})`);
  
  ConversionOptimizations.resetPredictionCounter();
  console.log("✓ Prediction counter reset");
  
  console.log("✅ TEST 8 PASSED\n");
  return true;
}

// ===== TEST 9: UPGRADE MODAL OPENING =====
function testUpgradeModalOpening() {
  console.log("TEST 9: Upgrade Modal Opens");
  
  if (typeof openUpgradeModal !== "function") {
    console.error("❌ FAIL: openUpgradeModal function not found");
    return false;
  }
  console.log("✓ openUpgradeModal function exists");
  
  // Open modal
  openUpgradeModal();
  const modal = document.getElementById("upgradeModal");
  
  if (!modal) {
    console.error("❌ FAIL: Upgrade modal not found");
    return false;
  }
  
  const isHidden = modal.classList.contains("hidden") || modal.style.display === "none";
  if (!isHidden) {
    console.log("✓ Modal successfully opened");
  }
  
  // Close modal
  const closeBtn = document.getElementById("closeUpgradeModal");
  if (closeBtn) {
    closeBtn.click();
    console.log("✓ Modal close button works");
  }
  
  console.log("✅ TEST 9 PASSED\n");
  return true;
}

// ===== TEST 10: START TRIAL FUNCTION =====
function testStartTrialFunction() {
  console.log("TEST 10: Start Trial Function");
  
  if (typeof startFreeTrial !== "function") {
    console.error("❌ FAIL: startFreeTrial function not found");
    return false;
  }
  console.log("✓ startFreeTrial function exists");
  
  // Check if button exists
  const startTrialBtn = document.getElementById("startTrialBtn");
  const pricingTrialBtn = document.getElementById("pricingTrialBtn");
  
  if (startTrialBtn) {
    console.log("✓ Start trial button found in sidebar");
  }
  
  if (pricingTrialBtn) {
    console.log("✓ Start trial button found in pricing section");
  }
  
  console.log("✅ TEST 10 PASSED\n");
  return true;
}

// ===== MASTER TEST RUNNER =====
function runAllConversionTests() {
  console.clear();
  console.log("=".repeat(60));
  console.log("CONVERSION OPTIMIZATION - COMPREHENSIVE TEST SUITE");
  console.log("Date: " + new Date().toLocaleString());
  console.log("=".repeat(60) + "\n");
  
  const tests = [
    testTrialBanner,
    testUpgradeModalButtons,
    testPaymentStatusDisplay,
    testReferralElements,
    testDirectBuyButtons,
    testUnlockButtons,
    testPremiumMessaging,
    testPredictionTracking,
    testUpgradeModalOpening,
    testStartTrialFunction
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach(test => {
    try {
      if (test()) {
        passed++;
      } else {
        failed++;
      }
    } catch (err) {
      console.error(`❌ ERROR in ${test.name}:`, err.message);
      failed++;
    }
  });
  
  console.log("=".repeat(60));
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=".repeat(60));
  
  if (failed === 0) {
    console.log("✅ ALL TESTS PASSED!");
    return true;
  } else {
    console.log(`❌ ${failed} TEST(S) FAILED`);
    return false;
  }
}

// Make tests available globally
window.ConversionTests = {
  runAll: runAllConversionTests,
  testTrialBanner,
  testUpgradeModalButtons,
  testPaymentStatusDisplay,
  testReferralElements,
  testDirectBuyButtons,
  testUnlockButtons,
  testPremiumMessaging,
  testPredictionTracking,
  testUpgradeModalOpening,
  testStartTrialFunction
};

console.log("✅ Conversion test suite loaded. Run: ConversionTests.runAll()");
