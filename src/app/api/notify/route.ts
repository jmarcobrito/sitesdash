import { NextResponse } from 'next/server'

interface NotifyBody {
  nome: string
  nome_negocio: string
  nicho: string
  telefone: string
}

export async function POST(request: Request) {
  const number = process.env.WHATSAPP_NOTIFY_NUMBER
  if (!number) {
    return NextResponse.json({ error: 'WHATSAPP_NOTIFY_NUMBER not configured' }, { status: 400 })
  }

  const body: NotifyBody = await request.json()
  const { nome, nome_negocio, nicho, telefone } = body

  const text = `⚡ *Novo lead aguardando preview!*\n\n👤 *Contato:* ${nome}\n🏢 *Negócio:* ${nome_negocio}\n📌 *Nicho:* ${nicho}\n📱 *Telefone:* ${telefone}\n\nAcesse o dashboard para criar a preview.`

  const url = `https://wa.me/${number}?text=${encodeURIComponent(text)}`

  return NextResponse.json({ url })
}
