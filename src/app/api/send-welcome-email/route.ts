import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, fullName } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const name = fullName || "there";

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "ProductToVideo.ai <noreply@producttovideo.ai>",
      to: email,
      subject: "Welcome to ProductToVideo.ai!",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a;">Welcome to ProductToVideo.ai!</h1>
          <p>Hi ${name},</p>
          <p>Thanks for signing up! You're all set to start turning product URLs into stunning video ads.</p>
          <h2 style="color: #333;">Here's how to get started:</h2>
          <ol>
            <li><strong>Paste a product URL</strong> from any supported e-commerce platform</li>
            <li><strong>Let AI generate</strong> a compelling video script</li>
            <li><strong>Customize</strong> your template, colors, and music</li>
            <li><strong>Export</strong> your video in multiple formats</li>
          </ol>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://producttovideo.ai"}/new-video"
             style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">
            Create Your First Video
          </a>
          <p style="color: #666; margin-top: 24px; font-size: 14px;">
            If you have any questions, reply to this email — we're happy to help!
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
