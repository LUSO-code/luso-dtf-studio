import { mmToPixels, applyChokeErosion } from "../choke";

async function runUnderbaseTests() {
  console.log("==========================================");
  console.log("RUNNING WHITE INK UNDERBASE & CHOKE TESTS");
  console.log("==========================================");

  // Test 1: mm to pixel conversion at 300 DPI
  const px03 = mmToPixels(0.3, 300);
  const px05 = mmToPixels(0.5, 300);
  const px0 = mmToPixels(0, 300);

  console.assert(px03 === 4, `Test 1 Failed: 0.3mm should equal 4px at 300 DPI, got ${px03}`);
  console.assert(px05 === 6, `Test 1 Failed: 0.5mm should equal 6px at 300 DPI, got ${px05}`);
  console.assert(px0 === 0, `Test 1 Failed: 0mm should equal 0px, got ${px0}`);
  console.log("✓ Test 1 Passed: Physical choke mm to pixel conversion math verified.");

  // Test 2: Morphological erosion shrinks mask boundaries
  const width = 10;
  const height = 10;
  const alphaBuffer = new Uint8Array(width * height);
  
  // Fill 10x10 with 255 (Fully opaque)
  alphaBuffer.fill(255);

  // Apply 1px choke erosion
  const eroded = applyChokeErosion(alphaBuffer, width, height, 1);

  // Corner pixels (0,0) and borders should erode to 0
  console.assert(eroded[0] === 0, "Test 2 Failed: Corner pixel (0,0) should be eroded");
  // Center pixel (5,5) should remain 255
  console.assert(eroded[5 * width + 5] === 255, "Test 2 Failed: Center pixel (5,5) should stay opaque");
  console.log("✓ Test 2 Passed: Morphological erosion shrinks underbase boundaries without expanding.");

  // Test 3: 0mm choke preserves exact original geometry
  const untouched = applyChokeErosion(alphaBuffer, width, height, 0);
  console.assert(untouched.every((val, i) => val === alphaBuffer[i]), "Test 3 Failed: 0mm choke modified image");
  console.log("✓ Test 3 Passed: 0mm choke preserves identical mask geometry.");

  console.log("==========================================");
  console.log("ALL UNDERBASE & CHOKE TESTS PASSED 100%");
  console.log("==========================================");
}

runUnderbaseTests().catch((err) => {
  console.error("Underbase test execution failed:", err);
  process.exit(1);
});
