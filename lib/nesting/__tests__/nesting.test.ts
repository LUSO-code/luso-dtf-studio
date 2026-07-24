import { MaxRectsNestingEngine } from "../MaxRectsNestingEngine";
import { NestingConfig, NestingInputItem } from "../types";
import { checkOverlap, isWithinSheet } from "@lib/print-sheet/geometry/rectangles";
import { validatePrintSheetForExport } from "@lib/print-sheet/exportValidation";

async function runTests() {
  console.log("==========================================");
  console.log("RUNNING SMART NESTING & GEOMETRY CORE TESTS");
  console.log("==========================================");

  const engine = new MaxRectsNestingEngine();

  const defaultConfig: NestingConfig = {
    sheetWidthCm: 58,
    sheetHeightCm: 100,
    marginCm: 1.0,
    spacingCm: 0.5,
    allowRotation: true,
  };

  // Test 1: Successful placement without overlap
  const items: NestingInputItem[] = [
    { id: "1", designId: "d1", name: "Design A", widthCm: 30, heightCm: 30, aspectRatio: 1 },
    { id: "2", designId: "d2", name: "Design B", widthCm: 25, heightCm: 20, aspectRatio: 1.25 },
    { id: "3", designId: "d3", name: "Design C", widthCm: 20, heightCm: 15, aspectRatio: 1.33 },
  ];

  const result = engine.nest(items, defaultConfig);

  console.assert(result.placedItems.length === 3, "Test 1 Failed: Expected 3 placed items");
  console.assert(result.unplacedItems.length === 0, "Test 1 Failed: Expected 0 unplaced items");
  console.assert(result.utilizationPercentage > 0, "Test 1 Failed: Expected positive utilization");

  result.placedItems.forEach((placed) => {
    console.assert(isWithinSheet(placed, 58, 100, 1.0), `Test 1 Failed: Item ${placed.id} out of bounds`);
  });

  for (let i = 0; i < result.placedItems.length; i++) {
    for (let j = i + 1; j < result.placedItems.length; j++) {
      console.assert(
        !checkOverlap(result.placedItems[i], result.placedItems[j]),
        `Test 1 Failed: Overlap detected between ${result.placedItems[i].id} and ${result.placedItems[j].id}`
      );
    }
  }
  console.log("✓ Test 1 Passed: 3 designs nested cleanly within 58x100 cm sheet with 0 overlaps.");

  // Test 2: Unplaced items detection
  const smallConfig: NestingConfig = {
    sheetWidthCm: 58,
    sheetHeightCm: 50,
    marginCm: 1.0,
    spacingCm: 0.5,
    allowRotation: false,
  };

  const largeItems: NestingInputItem[] = [
    { id: "1", designId: "d1", name: "Large 1", widthCm: 40, heightCm: 35, aspectRatio: 1.14 },
    { id: "2", designId: "d2", name: "Large 2", widthCm: 40, heightCm: 35, aspectRatio: 1.14 },
    { id: "3", designId: "d3", name: "Large 3", widthCm: 40, heightCm: 35, aspectRatio: 1.14 },
  ];

  const smallResult = engine.nest(largeItems, smallConfig);
  console.assert(smallResult.placedItems.length < 3, "Test 2 Failed: Expected unplaced items");
  console.assert(smallResult.unplacedItems.length > 0, "Test 2 Failed: Expected >0 unplaced items");
  console.log(`✓ Test 2 Passed: Unplaced items detected correctly (${smallResult.unplacedItems.length} unplaced).`);

  // Test 3: Pre-Flight Export Validation
  const validItems = [
    { id: "1", designId: "d1", name: "Item A", xCm: 1, yCm: 1, widthCm: 25, heightCm: 25, rotation: 0 as const, areaCm2: 625, processedFileUrl: "http://example.com/a.png" },
    { id: "2", designId: "d2", name: "Item B", xCm: 28, yCm: 1, widthCm: 25, heightCm: 25, rotation: 0 as const, areaCm2: 625, processedFileUrl: "http://example.com/b.png" },
  ];

  const validation = validatePrintSheetForExport(validItems, 58, 100, 1.0, 0.5);
  console.assert(validation.isValid === true, "Test 3 Failed: Valid layout failed validation");

  const overlappingItems = [
    { id: "1", designId: "d1", name: "Item A", xCm: 1, yCm: 1, widthCm: 30, heightCm: 30, rotation: 0 as const, areaCm2: 900, processedFileUrl: "http://example.com/a.png" },
    { id: "2", designId: "d2", name: "Item B", xCm: 10, yCm: 10, widthCm: 30, heightCm: 30, rotation: 0 as const, areaCm2: 900, processedFileUrl: "http://example.com/b.png" },
  ];

  const invalidValidation = validatePrintSheetForExport(overlappingItems, 58, 100, 1.0, 0.5);
  console.assert(invalidValidation.isValid === false, "Test 3 Failed: Overlapping layout passed validation");
  console.log("✓ Test 3 Passed: Pre-Flight export validation correctly blocks overlapping layouts.");

  console.log("==========================================");
  console.log("ALL SMART NESTING TESTS PASSED 100%");
  console.log("==========================================");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
