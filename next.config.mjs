/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mantendo seus rewrites para o Java
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ]
  },

  // CONFIGURAÇÃO PARA REMOVER O ÍCONE "N"
  devIndicators: {
    appIsrStatus: false, // Remove o ícone de status de renderização
    buildActivity: false, // Remove o indicador de compilação
  },
}

export default nextConfig