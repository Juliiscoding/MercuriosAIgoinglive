import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { email, password } = await request.json()

  // Valid credentials array
  const validCredentials = [
    { email: "user@example.com", password: "password" },
    { email: "julius@mercurios.ai", password: "password" },
  ]

  // Check if the provided credentials match any valid pair
  const isValid = validCredentials.some((cred) => cred.email === email && cred.password === password)

  if (isValid) {
    const response = NextResponse.json({ success: true })
    // Set auth and accessToken cookies
    response.cookies.set("auth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })
    response.cookies.set("accessToken", "dummy_access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })
    return response
  } else {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid credentials",
      },
      { status: 401 },
    )
  }
}

