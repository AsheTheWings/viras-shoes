export interface OrderInput {
  shoe_id: number;
  size: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
}

export function normalizePhone(phone: string): string {
  const compact = phone.replace(/[\s()-]/g, "");
  return compact.replace(/^(?:\+212|00212)/, "0");
}

export function contactErrors(phone: string, email: string) {
  return {
    phone:
      Boolean(phone.trim()) && !/^0[567]\d{8}$/.test(normalizePhone(phone)),
    email:
      Boolean(email.trim()) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    contact: !phone.trim() && !email.trim(),
  };
}

export function validOrder(input: OrderInput): boolean {
  if (
    !input ||
    typeof input.customer_name !== "string" ||
    typeof input.customer_phone !== "string" ||
    typeof input.customer_email !== "string"
  )
    return false;
  const errors = contactErrors(input.customer_phone, input.customer_email);
  return (
    Number.isInteger(input.shoe_id) &&
    input.shoe_id > 0 &&
    Number.isInteger(input.size) &&
    input.size >= 39 &&
    input.size <= 45 &&
    input.customer_name.trim().length > 0 &&
    input.customer_name.length <= 120 &&
    input.customer_phone.length <= 40 &&
    input.customer_email.length <= 254 &&
    !errors.phone &&
    !errors.email &&
    !errors.contact
  );
}
