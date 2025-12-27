import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

function buildOrderHtml(order) {
  const itemsHtml = (order.items || [])
    .map(it => `
      <tr>
        <td style="padding:8px;border:1px solid #eee">${it.name}</td>
        <td style="padding:8px;border:1px solid #eee">${it.size || "Default"}</td>
        <td style="padding:8px;border:1px solid #eee;text-align:center">${it.quantity}</td>
        <td style="padding:8px;border:1px solid #eee;text-align:right">₹${it.priceNumber}</td>
      </tr>
    `).join("");

  return `
    <div style="font-family:'Roboto', Arial, sans-serif;color:#222;max-width:600px;margin:auto;padding:20px;background:#f9f9f9;border-radius:10px;">
      <h2 style="text-align:center;color:#2c3e50;font-family:'Roboto', Arial, sans-serif;">New Order: ${order.id}</h2>
      <p style="font-family:'Roboto', Arial, sans-serif;">
        <strong>Customer:</strong> ${order.customer.name}<br/>
        <strong>Phone:</strong> ${order.customer.phone}<br/>
        <strong>Email:</strong> ${order.customer.email}
      </p>

      <h3 style="font-family:'Roboto', Arial, sans-serif;">Items</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:15px;font-family:'Roboto', Arial, sans-serif;">
        <thead>
          <tr>
            <th style="padding:8px;border:1px solid #eee;text-align:left">Product</th>
            <th style="padding:8px;border:1px solid #eee;text-align:left">Variant</th>
            <th style="padding:8px;border:1px solid #eee;text-align:center">Qty</th>
            <th style="padding:8px;border:1px solid #eee;text-align:right">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <p style="text-align:right;font-size:18px;font-weight:bold;color:#27ae60;font-family:'Roboto', Arial, sans-serif;">Total: ₹${order.total}</p>
    </div>
  `;
}


async function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    tls: { rejectUnauthorized: false }, // important for self-signed certs
  });
}

export async function POST(req) {
  try {
    const order = await req.json();

    if (!order || !order.id || !Array.isArray(order.items) || !order.customer?.name) {
      return NextResponse.json({ ok: false, error: "Invalid order payload" }, { status: 400 });
    }

    const transporter = await createTransporter();
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: process.env.TO_EMAIL,
      subject: `New COD Order ${order.id}`,
      html: buildOrderHtml(order),
      text: `New order ${order.id} - total ₹${order.total}`,
      replyTo: order.customer.email,
    });

    // ✅ Send proper ok response
    return NextResponse.json({ ok: true, message: "Order submitted successfully", messageId: info.messageId });
  } catch (err) {
    console.error("Order email error:", err);
    return NextResponse.json({ ok: false, error: err.message || err }, { status: 500 });
  }
}
