// Função MINIMALISTA - sem imports, sem nada
// Se essa não funcionar, o problema é na configuração do Vercel

export default function handler(req: any, res: any) {
  res.status(200).json({ 
    ping: "pong",
    timestamp: new Date().toISOString() 
  })
}

