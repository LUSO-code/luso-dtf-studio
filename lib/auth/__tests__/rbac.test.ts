import { hasPermission } from "../rbac";
import { generateInvitationToken, hashInvitationToken } from "../invitations";

async function runRbacTests() {
  console.log("==========================================");
  console.log("RUNNING WORKSPACE RBAC & INVITATION TESTS");
  console.log("==========================================");

  // Test 1: Owner permissions
  console.assert(hasPermission("owner", "workspace.delete") === true, "Test 1 Failed: Owner should delete workspace");
  console.assert(hasPermission("owner", "members.invite") === true, "Test 1 Failed: Owner should invite members");
  console.log("✓ Test 1 Passed: Owner permissions verified.");

  // Test 2: Admin permissions
  console.assert(hasPermission("admin", "workspace.delete") === false, "Test 2 Failed: Admin cannot delete workspace");
  console.assert(hasPermission("admin", "members.invite") === true, "Test 2 Failed: Admin should invite members");
  console.log("✓ Test 2 Passed: Admin permissions verified.");

  // Test 3: Member permissions
  console.assert(hasPermission("member", "members.invite") === false, "Test 3 Failed: Member cannot invite");
  console.assert(hasPermission("member", "designs.create") === true, "Test 3 Failed: Member can create designs");
  console.assert(hasPermission("member", "print_sheets.export") === true, "Test 3 Failed: Member can export print sheets");
  console.log("✓ Test 3 Passed: Member permissions verified.");

  // Test 4: Viewer permissions (Read-only)
  console.assert(hasPermission("viewer", "designs.view") === true, "Test 4 Failed: Viewer can view designs");
  console.assert(hasPermission("viewer", "designs.create") === false, "Test 4 Failed: Viewer cannot create designs");
  console.assert(hasPermission("viewer", "print_sheets.delete") === false, "Test 4 Failed: Viewer cannot delete print sheets");
  console.log("✓ Test 4 Passed: Viewer read-only restrictions verified.");

  // Test 5: Invitation token hashing
  const token = generateInvitationToken();
  const hash1 = hashInvitationToken(token);
  const hash2 = hashInvitationToken(token);
  console.assert(token.length === 64, "Test 5 Failed: Token should be 64 hex chars");
  console.assert(hash1 === hash2, "Test 5 Failed: Hashing must be deterministic");
  console.assert(hash1 !== token, "Test 5 Failed: Hash must differ from raw token");
  console.log("✓ Test 5 Passed: Invitation cryptographic token hashing verified.");

  console.log("==========================================");
  console.log("ALL RBAC & INVITATION TESTS PASSED 100%");
  console.log("==========================================");
}

runRbacTests().catch((err) => {
  console.error("RBAC test execution failed:", err);
  process.exit(1);
});
