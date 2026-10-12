import assert from "node:assert/strict";
import { test } from "node:test";
import {
  contactErrors,
  normalizePhone,
  validOrder,
} from "../src/lib/order-validation.ts";

test("unit: Moroccan contact numbers normalize and an order needs reachable contact", () => {
  assert.equal(normalizePhone("+212 6 12 34 56 78"), "0612345678");
  assert.equal(normalizePhone("00212 (7) 12-34-56-78"), "0712345678");
  assert.deepEqual(contactErrors("", ""), {
    phone: false,
    email: false,
    contact: true,
  });
  assert.equal(contactErrors("061234567", "").phone, true);
  assert.equal(contactErrors("", "invalid").email, true);
  const input = {
    shoe_id: 1,
    size: 41,
    customer_name: "Customer",
    customer_phone: "",
    customer_email: "customer@example.com",
  };
  assert.equal(validOrder(input), true);
  assert.equal(validOrder({ ...input, customer_email: "" }), false);
  assert.equal(validOrder({ ...input, customer_name: " " }), false);
  assert.equal(validOrder({ ...input, size: 41.5 }), false);
  assert.equal(validOrder({ ...input, size: 46 }), false);
  assert.equal(
    validOrder({ ...input, customer_phone: "0612345678", customer_email: "" }),
    true,
  );
});
