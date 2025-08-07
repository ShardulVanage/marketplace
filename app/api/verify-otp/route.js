import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 })
    }

    // Check OTP from store
    global.otpStore = global.otpStore || {}
    const storedOtpData = global.otpStore[email]

    if (!storedOtpData) {
      return NextResponse.json({ error: "OTP not found or expired" }, { status: 400 })
    }

    if (Date.now() > storedOtpData.expires) {
      delete global.otpStore[email]
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 })
    }

    if (storedOtpData.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 })
    }

    // OTP is valid, clean up
    delete global.otpStore[email]

    return NextResponse.json({ success: true, message: "OTP verified successfully" })
  } catch (error) {
    console.error("Verify OTP error:", error)
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 })
  }
}
