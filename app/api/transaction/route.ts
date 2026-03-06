import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Recupera o histórico de transações do usuário.
 * O token de autenticação é repassado para o backend via Header.
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization");
    
    const response = await fetch(`${BACKEND_URL}/api/transaction`, {
      headers: { "Authorization": token || "" },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Falha na recuperação de transações:", error);
    return NextResponse.json({ message: "Erro ao carregar dados do servidor." }, { status: 500 });
  }
}

/**
 * Registra uma nova movimentação financeira (Receita ou Despesa).
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization");
    const payload = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/transaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token || "",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Falha ao registrar transação:", error);
    return NextResponse.json({ message: "Erro ao processar a requisição." }, { status: 500 });
  }
}

/**
 * Remove as transações vinculadas à conta do usuário .
 */
export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization");
    
    // Encaminha a solicitação de limpeza para o serviço de persistência
    const response = await fetch(`${BACKEND_URL}/api/transaction`, {
      method: "DELETE",
      headers: { "Authorization": token || "" },
    });

    if (response.ok) {
      return new NextResponse(null, { status: 204 });
    }

    // Caso o backend retorne erro de negócio (ex: usuário não autorizado)
    const errorData = await response.json();
    return NextResponse.json(errorData, { status: response.status });
  } catch (error) {
    console.error("Erro crítico na limpeza de transações:", error);
    return NextResponse.json({ message: "Não foi possível completar a operação." }, { status: 500 });
  }
}