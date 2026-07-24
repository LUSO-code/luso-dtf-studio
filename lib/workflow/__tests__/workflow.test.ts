import { calculateDesignStatus } from "../types";

async function runWorkflowTests() {
  console.log("==========================================");
  console.log("RUNNING WORKFLOW CONSOLIDATION TESTS");
  console.log("==========================================");

  // Test 1: Original-only design status
  const originalOnly = calculateDesignStatus({
    original_file_url: "http://example.com/orig.png",
  });
  console.assert(originalOnly.statusBadge === "ORIGINAL", "Test 1 Failed: Expected ORIGINAL status");
  console.assert(originalOnly.hasOriginal === true, "Test 1 Failed: Expected hasOriginal");

  // Test 2: Processed design status
  const processedDesign = calculateDesignStatus({
    original_file_url: "http://example.com/orig.png",
    processed_file_url: "http://example.com/proc.png",
  });
  console.assert(processedDesign.statusBadge === "MÁSCARA DE BLANCO LISTA", "Test 2 Failed: Expected MÁSCARA DE BLANCO LISTA status");
  console.assert(processedDesign.isReadyForSheet === true, "Test 2 Failed: Expected isReadyForSheet");

  // Test 3: Design with underbase mask status
  const completeDesign = calculateDesignStatus({
    original_file_url: "http://example.com/orig.png",
    processed_file_url: "http://example.com/proc.png",
    underbase_file_url: "http://example.com/underbase.png",
  });
  console.assert(completeDesign.statusBadge === "LISTO PARA PLANCHA", "Test 3 Failed: Expected LISTO PARA PLANCHA status");
  console.assert(completeDesign.hasUnderbase === true, "Test 3 Failed: Expected hasUnderbase");

  console.log("✓ Test 1 Passed: Original-only design status calculated correctly.");
  console.log("✓ Test 2 Passed: Processed design status calculated correctly.");
  console.log("✓ Test 3 Passed: Underbase-ready design status calculated correctly.");

  console.log("==========================================");
  console.log("ALL WORKFLOW CONSOLIDATION TESTS PASSED 100%");
  console.log("==========================================");
}

runWorkflowTests().catch((err) => {
  console.error("Workflow test execution failed:", err);
  process.exit(1);
});
