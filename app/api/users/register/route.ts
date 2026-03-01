import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] Proxying register to:", `${BACKEND_URL}/api/users/register`)
    console.log("[v0] Body:", JSON.stringify(body))

    const res = await fetch(`${BACKEND_URL}/api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const text = await res.text()
    console.log("[v0] Backend response status:", res.status)
    console.log("[v0] Backend response body:", text)

    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
    })
  } catch (error) {
    console.error("[v0] Proxy register error:", error)
    return NextResponse.json(
      { message: "Nao foi possivel conectar ao backend. Verifique se ele esta rodando em " + BACKEND_URL },
      { status: 502 }
    )
  }
}
