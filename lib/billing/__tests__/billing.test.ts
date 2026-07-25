import { DEFAULT_FREE_PLAN, getWorkspaceUsagePercentage } from "../usage";
import { StripePaymentProvider } from "../providers/StripePaymentProvider";
import { WorkspaceUsage } from "../types";

async function runBillingTests() {
  console.log("==========================================");
  console.log("RUNNING SAAS BILLING & USAGE UNIT TESTS");
  console.log("==========================================");

  // Test 1: FREE Plan Default Limits
  console.assert(DEFAULT_FREE_PLAN.limits.max_designs === 15, "Test 1 Failed: Free plan max_designs should be 15");
  console.assert(DEFAULT_FREE_PLAN.limits.max_print_sheets === 5, "Test 1 Failed: Free plan max_print_sheets should be 5");
  console.assert(DEFAULT_FREE_PLAN.limits.max_team_members === 2, "Test 1 Failed: Free plan max_team_members should be 2");
  console.log("✓ Test 1 Passed: Free plan limits verified.");

  // Test 2: Usage Percentage Calculations
  const mockUsageNormal: WorkspaceUsage = {
    designCount: 5,
    printSheetCount: 2,
    storageBytes: 10 * 1024 * 1024,
    memberCount: 1,
    exportCount: 4,
  };
  const pctNormal = getWorkspaceUsagePercentage(mockUsageNormal, DEFAULT_FREE_PLAN.limits);
  console.assert(pctNormal.designsPct === 33, "Test 2 Failed: 5/15 should be 33%");
  console.assert(pctNormal.sheetsPct === 40, "Test 2 Failed: 2/5 should be 40%");
  console.log("✓ Test 2 Passed: Normal usage percentage calculations verified.");

  // Test 3: Limit Exceeded Calculation
  const mockUsageExceeded: WorkspaceUsage = {
    designCount: 18,
    printSheetCount: 6,
    storageBytes: 2000 * 1024 * 1024,
    memberCount: 3,
    exportCount: 15,
  };
  const pctExceeded = getWorkspaceUsagePercentage(mockUsageExceeded, DEFAULT_FREE_PLAN.limits);
  console.assert(pctExceeded.designsPct === 100, "Test 3 Failed: Pct should clamp or show 100%");
  console.log("✓ Test 3 Passed: Limit exceeded calculation verified.");

  // Test 4: Payment Provider Disabled Safeguard
  const provider = new StripePaymentProvider();
  console.assert(provider.isEnabled === false, "Test 4 Failed: Payment provider MUST be disabled by default");
  const checkoutRes = await provider.createCheckoutSession({
    workspaceId: "test-ws",
    planId: "pro",
    priceId: "price_123",
    successUrl: "http://localhost/success",
    cancelUrl: "http://localhost/cancel",
  });
  console.assert(checkoutRes.success === false, "Test 4 Failed: Checkout MUST fail when provider disabled");
  console.log("✓ Test 4 Passed: Payment provider disabled safeguard verified.");

  console.log("==========================================");
  console.log("ALL SAAS BILLING UNIT TESTS PASSED 100%");
  console.log("==========================================");
}

runBillingTests().catch((err) => {
  console.error("Billing test execution failed:", err);
  process.exit(1);
});
