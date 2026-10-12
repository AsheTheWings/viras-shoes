import assert from "node:assert/strict";
import { test } from "node:test";
import { isValidAdminCode } from "../src/lib/admin-auth.ts";

test("unit: admin codes are 1 to 8 ASCII letters or digits", () => {
  for (const code of ["a", "Ab3", "Z9y8X7w6", "12345678"])
    assert.equal(isValidAdminCode(code), true, code);
  for (const code of ["", "abcdefghi", "abc 123", "abc-123", "é1234", "abc\n"])
    assert.equal(isValidAdminCode(code), false, code);
});
