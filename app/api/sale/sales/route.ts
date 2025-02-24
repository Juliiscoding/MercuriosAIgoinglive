import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import axios from "axios"

export async function GET(request: NextRequest) {
  try {
    console.log("API Base URL:", process.env.NEXT_PUBLIC_API_BASE_URL)

    const accessToken = request.cookies.get("accessToken")?.value

    if (!accessToken) {
      console.log("No access token found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/sale/`
    console.log("Fetching from:", url)

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    // Check if the response is HTML
    if (typeof response.data === "string" && response.data.trim().startsWith("<!DOCTYPE html>")) {
      console.error("Received HTML response from API:", response.data.substring(0, 200) + "...")
      return NextResponse.json({ error: "Received HTML response from API" }, { status: 500 })
    }

    // Return the raw data
    return NextResponse.json(response.data)
  } catch (error: any) {
    console.error("Sales API Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        headers: error.config?.headers,
      },
    })

    if (error.response?.status === 401) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    return NextResponse.json(
      {
        error: "Failed to fetch sales data",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: error.response?.status || 500 },
    )
  }
}

