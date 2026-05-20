'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Lead } from '@/types'

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [notas, setNotas] = useState('')
  const [ticket, setTicket] = useState('')
  const [subStatus, setSubStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchLead()
  }, [params.id])

  async function fetchLead() {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', params.id)
      .single()
    if (!error && data) {
      const l = data as Lead
      setLead(l)
      setPreviewUrl(l.preview_url ?? '')
      setNotas(l.notas ?? '')
      setTicket(l.ticket?.toString() ?? '')
      setSubStatus(l.sub_status ?? '')
    }
  }

  async function handleSave() {
    if (!lead) return
    setSaving(true)
    await supabase
      .from('leads')
      .update({
        preview_url: previewUrl || null,
        notas: notas || null,
        ticket: ticket ? parseFloat(ticket) : null,
      })
      .eq('id', lead.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    fetchLead()
  }

  async function handleSubStatusChange(val: string) {
    setSubStatus(val)
    await supabase
      .from('leads')
      .update({ sub_status: val || null })
      .eq('id', lead!.id)
  }

  async function handleDelete() {
    if (!window.confirm(`Excluir o lead "${lead!.nome_negocio || lead!.nome}"? Esta ação não pode ser desfeita.`)) return
    setDeleting(true)
    await supabase.from('leads').delete().eq('id', lead!.id)
    router.push('/')
  }

  async function handleSendPreview() {
    if (!lead || !previewUrl) return
    setSending(true)

    await supabase
      .from('leads')
      .update({ preview_url: previewUrl, status: 'negociacao' })
      .eq('id', lead.id)

    const phone = lead.telefone.replace(/\D/g, '')
    const message = encodeURIComponent(
      `Olá ${lead.nome}, preparei uma prévia do site do ${lead.nome_negocio}. Dá uma olhada: ${previewUrl}`
    )
    window.open(`https://wa.me/55${phone}?text=${message}`, '_blank')

    setSending(false)
    fetchLead()
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Carregando...</div>
      </div>
    )
  }

  const statusLabel: Record<string, string> = {
    novo: 'Novo lead',
    aguardando_preview: '⚡ Aguardando preview',
    negociacao: 'Em negociação',
    fechado: 'Fechado',
    entregue: 'Entregue',
  }

  const statusColor: Record<string, string> = {
    novo: 'bg-blue-100 text-blue-800',
    aguardando_preview: 'bg-amber-100 text-amber-800',
    negociacao: 'bg-yellow-100 text-yellow-800',
    fechado: 'bg-green-100 text-green-800',
    entregue: 'bg-gray-100 text-gray-700',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
          ← Dashboard
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-lg font-semibold text-gray-900">{lead.nome_negocio || lead.nome}</h1>
        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${statusColor[lead.status]}`}>
          {statusLabel[lead.status]}
        </span>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dados coletados pelo Kairo */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Dados coletados pelo Kairo
          </h2>
          <dl className="space-y-3">
            {[
              { label: 'Nome do contato', value: lead.nome },
              { label: 'Nome do negócio', value: lead.nome_negocio },
              { label: 'Serviço principal', value: lead.servico_principal },
              { label: 'Cidade', value: lead.cidade },
              { label: 'Nicho', value: lead.nicho },
              { label: 'Telefone', value: lead.telefone },
              { label: 'Instagram', value: lead.instagram },
              { label: 'Cor da marca', value: lead.cor_marca },
              { label: 'Site atual', value: lead.site_atual },
            ].map(({ label, value }) =>
              value ? (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-sm text-gray-500 shrink-0">{label}</dt>
                  <dd className="text-sm font-medium text-gray-900 text-right">{value}</dd>
                </div>
              ) : null
            )}
          </dl>

          <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
            <a
              href={`https://wa.me/55${lead.telefone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center text-sm py-2 font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Abrir WhatsApp
            </a>
            {lead.site_atual && (
              <a
                href={lead.site_atual}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center text-sm py-2 font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Site atual
              </a>
            )}
          </div>
        </section>

        {/* Operação */}
        <section className="flex flex-col gap-5">
          {/* Preview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Preview do site
            </h2>

            <label className="block text-sm font-medium text-gray-700 mb-1">URL da preview</label>
            <input
              type="url"
              value={previewUrl}
              onChange={(e) => setPreviewUrl(e.target.value)}
              placeholder="https://preview.meusite.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={handleSendPreview}
              disabled={!previewUrl || sending}
              className="mt-3 w-full py-2.5 text-sm font-semibold bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? 'Abrindo WhatsApp...' : '📲 Enviar preview pro lead'}
            </button>

            {lead.preview_url && (
              <a
                href={lead.preview_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block text-center text-xs text-blue-600 hover:underline"
              >
                Ver preview atual →
              </a>
            )}
          </div>

          {/* Ticket e notas */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Negócio
            </h2>

            <label className="block text-sm font-medium text-gray-700 mb-1">Ticket (R$)</label>
            <input
              type="number"
              value={ticket}
              onChange={(e) => setTicket(e.target.value)}
              placeholder="1500"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />

            <label className="block text-sm font-medium text-gray-700 mb-1">Sub-status</label>
            <select
              value={subStatus}
              onChange={(e) => handleSubStatusChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            >
              <option value="">— Nenhum —</option>
              <option value="aguardando_retorno">🕐 Aguardando retorno</option>
              <option value="proposta_enviada">📄 Proposta enviada</option>
              <option value="em_revisao">🔍 Em revisão</option>
              <option value="pagamento_pendente">💳 Pagamento pendente</option>
            </select>

            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              placeholder="Observações sobre o lead..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />

            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-3 w-full py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saved ? '✓ Salvo!' : saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </section>
      </main>

      <footer className="max-w-4xl mx-auto px-6 pb-8">
        <div className="border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-700">Excluir lead</p>
            <p className="text-xs text-red-400 mt-0.5">Remove permanentemente do dashboard</p>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm px-4 py-2 font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            {deleting ? 'Excluindo...' : 'Excluir lead'}
          </button>
        </div>
      </footer>
    </div>
  )
}
