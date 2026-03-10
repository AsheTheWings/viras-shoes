"use server";

import { supabase } from "@/lib/supabase";

interface OrderInput {
  shoe_id: number;
  size: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
}

const TELEGRAM_BOT_TOKEN = "8537894571:AAFupE29aEW3oviSIKhzwUk_EeM_M9omyN0";
const TELEGRAM_CHAT_ID = "8584666483";

async function sendTelegramNotification(order: OrderInput, shoeName: string) {
  const message = `
🛒 *New Order Received!*

👟 *Product:* ${shoeName}
📏 *Size:* ${order.size}
👤 *Customer:* ${order.customer_name}
📱 *Phone:* ${order.customer_phone}
📧 *Email:* ${order.customer_email || "N/A"}

⏰ *Time:* ${new Date().toLocaleString("en-GB", { timeZone: "Africa/Casablanca" })}
  `.trim();

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "Markdown",
        }),
      }
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
    return { success: false, error: "Failed to place order" };
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
