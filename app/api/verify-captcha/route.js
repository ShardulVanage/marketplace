import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "CAPTCHA token is required" }, { status: 400 })
    }

    // Verify the CAPTCHA token with Google
    const verifyResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    })

    const verifyData = await verifyResponse.json()

    if (!verifyData.success) {
      return NextResponse.json({ error: "CAPTCHA verification failed" }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "CAPTCHA verified successfully" })
  } catch (error) {
    console.error("CAPTCHA verification error:", error)
    return NextResponse.json({ error: "Failed to verify CAPTCHA" }, { status: 500 })
  }
}
