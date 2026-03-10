"use server";

import { supabase } from "@/lib/supabase";

interface OrderInput {
  shoe_id: number;
  size: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
}

export async function placeOrder(input: OrderInput) {
  // Validate size range server-side
  if (input.size < 39 || input.size > 45) {
    return { success: false, error: "Invalid size" };
  }

  // Check stock
  const { data: sizeRow, error: sizeError } = await supabase
    .from("shoe_sizes")
    .select("id, stock")
    .eq("shoe_id", input.shoe_id)
    .eq("size", input.size)
    .single();

  if (sizeError || !sizeRow) {
    return { success: false, error: "Size not found" };
  }

  if (sizeRow.stock <= 0) {
    return { success: false, error: "Out of stock for this size" };
  }

  // Insert order
  const { error: orderError } = await supabase.from("orders").insert({
    shoe_id: input.shoe_id,
    size: input.size,
    customer_name: input.customer_name,
    customer_phone: input.customer_phone,
    customer_email: input.customer_email,
  });

  if (orderError) {
    return { success: false, error: "Failed to place order" };
  }

  // Decrement stock
  await supabase
    .from("shoe_sizes")
    .update({ stock: sizeRow.stock - 1 })
    .eq("id", sizeRow.id);

  return { success: true };
}
