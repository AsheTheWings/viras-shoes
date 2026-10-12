"use server";

import { supabase } from "@/lib/supabase";
import {
  normalizePhone,
  validOrder,
  type OrderInput,
} from "@/lib/order-validation";

async function sendTelegramNotification(order: OrderInput, shoeName: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  const message = `
🛒 New Order Received!

👟 Product: ${shoeName}
📏 Size: ${order.size}
👤 Customer: ${order.customer_name}
📱 Phone: ${order.customer_phone}
📧 Email: ${order.customer_email || "N/A"}

⏰ Time: ${new Date().toLocaleString("en-GB", { timeZone: "Africa/Casablanca" })}
  `.trim();

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        signal: AbortSignal.timeout(5000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Telegram API error:", response.status, errorData);
    } else {
      console.log("Telegram notification sent successfully");
    }
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
  }
}

export async function placeOrder(input: OrderInput) {
  if (!validOrder(input)) return { success: false, error: "invalid" };
  input = {
    ...input,
    customer_name: input.customer_name.trim(),
    customer_phone: normalizePhone(input.customer_phone),
    customer_email: input.customer_email.trim(),
  };

  // Check stock
  const { data: sizeRow, error: sizeError } = await supabase
    .from("shoe_sizes")
    .select("id, stock")
    .eq("shoe_id", input.shoe_id)
    .eq("size", input.size)
    .single();

  if (sizeError || !sizeRow) {
    return { success: false, error: "stock" };
  }

  if (sizeRow.stock <= 0) {
    return { success: false, error: "stock" };
  }

  // Get shoe name for notification
  const { data: shoe } = await supabase
    .from("shoes")
    .select("name")
    .eq("id", input.shoe_id)
    .single();

  // Insert order
  const { error: orderError } = await supabase.from("orders").insert({
    shoe_id: input.shoe_id,
    size: input.size,
    customer_name: input.customer_name,
    customer_phone: input.customer_phone,
    customer_email: input.customer_email,
  });

  if (orderError) {
    return { success: false, error: "failed" };
  }

  // Decrement stock
  await supabase
    .from("shoe_sizes")
    .update({ stock: sizeRow.stock - 1 })
    .eq("id", sizeRow.id);

  // Send Telegram notification
  await sendTelegramNotification(input, shoe?.name || "Unknown");

  return { success: true };
}
