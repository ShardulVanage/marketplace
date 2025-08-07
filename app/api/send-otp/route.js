import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Generate 8-digit OTP
    const otp = Math.floor(10000000 + Math.random() * 90000000).toString()

    // Store OTP in session/database (for demo, we'll use a simple in-memory store)
    // In production, use Redis or database
    global.otpStore = global.otpStore || {}
    global.otpStore[email] = {
      otp,
      expires: Date.now() + 3 * 60 * 1000, // 3 minutes
    }

    // Here you would integrate with your email service (SendGrid, AWS SES, etc.)
    console.log(`OTP for ${email}: ${otp}`)

    // For demo purposes, we'll just return success
    // In production, send actual email
    return NextResponse.json({ success: true, message: "OTP sent successfully" })
  } catch (error) {
    console.error("Send OTP error:", error)
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 })
  }
}
