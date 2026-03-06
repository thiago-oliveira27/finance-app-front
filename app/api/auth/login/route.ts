import { NextRequest, NextResponse } from "next/server"

// Puxa a URL do seu Spring Boot das variáveis de ambiente
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export async function POST(request: NextRequest) {
  try {
    const credentials = await request.json()

    // Requisição direta para o serviço de autenticação do Java
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    })

    const data = await response.text()
    const contentType = response.headers.get("Content-Type") || "application/json"

    // Retorna a resposta do backend mantendo o status original (200, 401, etc)
    return new NextResponse(data, {
      status: response.status,
      headers: { "Content-Type": contentType },
    })

  } catch (error) {
    // Log interno simplificado (não aparece para o usuário final)
    console.error("Auth Proxy Error:", error)

    return NextResponse.json(
      { message: "Serviço de autenticação indisponível no momento." },
      { status: 503 }
    )
  }
}