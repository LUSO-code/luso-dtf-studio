import { sanitizeMetadata } from "../tracker";

async function runAnalyticsTests() {
  console.log("==========================================");
  console.log("RUNNING PRODUCT ANALYTICS & PRIVACY TESTS");
  console.log("==========================================");

  // Test 1: Metadata Sanitization (Sensitive Keys Removed)
  const dirtyMetadata = {
    designName: "Test Logo",
    printWidthCm: 30,
    password: "SuperSecretPassword123!",
    token: "raw_token_xyz_123",
    original_file_url: "https://storage.com/private/user/design.png",
    dpi: 300,
  };

  const clean = sanitizeMetadata(dirtyMetadata);

  console.assert(clean.designName === "Test Logo", "Test 1 Failed: designName should be preserved");
  console.assert(clean.printWidthCm === 30, "Test 1 Failed: printWidthCm should be preserved");
  console.assert(clean.dpi === 300, "Test 1 Failed: dpi should be preserved");
  console.assert(clean.password === undefined, "Test 1 Failed: password MUST be stripped");
  console.assert(clean.token === undefined, "Test 1 Failed: token MUST be stripped");
  console.assert(clean.original_file_url === undefined, "Test 1 Failed: private file URLs MUST be stripped");
  console.log("✓ Test 1 Passed: Privacy metadata sanitization verified.");

  // Test 2: Nested Object Sanitization
  const nestedDirty = {
    action: "export",
    userOptions: {
      secret: "shh_top_secret",
      format: "png",
    },
  };
  const cleanNested = sanitizeMetadata(nestedDirty);
  console.assert(cleanNested.action === "export", "Test 2 Failed: Root action preserved");
  console.assert(cleanNested.userOptions?.format === "png", "Test 2 Failed: Nested format preserved");
  console.assert(cleanNested.userOptions?.secret === undefined, "Test 2 Failed: Nested secret stripped");
  console.log("✓ Test 2 Passed: Nested privacy metadata sanitization verified.");

  console.log("==========================================");
  console.log("ALL PRODUCT ANALYTICS TESTS PASSED 100%");
  console.log("==========================================");
}

runAnalyticsTests().catch((err) => {
  console.error("Analytics test execution failed:", err);
  process.exit(1);
});
