'use client'

import Link from 'next/link'
import type { Lead } from '@/types'

interface LeadCardProps {
  lead: Lead
  onDragStart: (leadId: string) => void
}

const SUB_STATUS_LABELS: Record<string, string> = {
  aguardando_retorno: '🕐 Aguardando retorno',
  proposta_enviada: '📄 Proposta enviada',
  em_revisao: '🔍 Em revisão',
  pagamento_pendente: '💳 Pagamento pendente',
}

export default function LeadCard({ lead, onDragStart }: LeadCardProps) {
  const phone = lead.telefone.replace(/\D/g, '')
  const waLink = `https://wa.me/55${phone}`

  const subLabel = lead.sub_status ? SUB_STATUS_LABELS[lead.sub_status] : null

  const statusLabel =
    lead.status === 'novo' ? '🔵 Novo lead' :
    lead.status === 'aguardando_preview' ? '⚡ Preview pendente' :
    lead.status === 'negociacao' ? (subLabel ?? '🟡 Em negociação') :
    lead.status === 'fechado' ? '🟢 Em produção' :
    '⭐ Cliente satisfeito'

  const showSubLabel = lead.status !== 'negociacao' && subLabel

  const followUpMsg = encodeURIComponent(
    `Olá ${lead.nome}, passando pra ver se você teve uma chance de analisar o que enviei. Podemos avançar? 🙂`
  )
  const upsellMsg = encodeURIComponent(
    `Olá ${lead.nome}, tudo bem? Como está o site do ${lead.nome_negocio}? Tenho algumas ideias que podem trazer mais resultados pra você!`
  )

  const actionConfig: { label: string; href: string; external: boolean } =
    lead.status === 'novo'
      ? { label: 'Contatar ↗', href: waLink, external: true }
      : lead.status === 'aguardando_preview'
      ? { label: 'Gerar preview ↗', href: `/leads/${lead.id}`, external: false }
      : lead.status === 'negociacao'
      ? { label: 'Follow-up ↗', href: `${waLink}?text=${followUpMsg}`, external: true }
      : lead.status === 'fechado'
      ? { label: 'Checklist ↗', href: `/leads/${lead.id}`, external: false }
      : { label: 'Upsell ↗', href: `${waLink}?text=${upsellMsg}`, external: true }

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move'
        onDragStart(lead.id)
      }}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow select-none"
    >
      {lead.status === 'aguardando_preview' && (
        <span className="inline-flex items-center gap-1 mb-2 px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full">
          ⚡ Preview pendente
        </span>
      )}

      <div className="mb-3">
        <h3 className="font-semibold text-gray-900 leading-tight">{lead.nome_negocio || lead.nome}</h3>
        <p className="text-sm text-gray-500 mt-0.5">
          {lead.cidade}
          {lead.nicho ? ` · ${lead.nicho}` : ''}
        </p>
        {lead.nome_negocio && (
          <p className="text-xs text-gray-400 mt-0.5">{lead.nome}</p>
        )}
      </div>

      <p className="text-sm text-gray-600 font-medium">{lead.telefone}</p>

      {lead.ticket && (
        <p className="text-sm font-semibold text-green-600 mt-1">
          {lead.ticket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
      )}

      <div className="flex gap-2 mt-3">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex-1 text-center text-xs py-1.5 font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          WhatsApp
        </a>

        {lead.preview_url && (
          <a
            href={lead.preview_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 text-center text-xs py-1.5 font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Preview
          </a>
        )}

        <Link
          href={`/leads/${lead.id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 text-center text-xs py-1.5 font-medium border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Detalhes
        </Link>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-xs font-medium text-gray-600 truncate">{statusLabel}</span>
          {showSubLabel && (
            <span className="text-xs text-gray-400 truncate">{showSubLabel}</span>
          )}
        </div>
        {actionConfig.external ? (
          <a
            href={actionConfig.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs px-3 py-1.5 font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 whitespace-nowrap transition-colors"
          >
            {actionConfig.label}
          </a>
        ) : (
          <Link
            href={actionConfig.href}
            onClick={(e) => e.stopPropagation()}
            className="text-xs px-3 py-1.5 font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 whitespace-nowrap transition-colors"
          >
            {actionConfig.label}
          </Link>
        )}
      </div>
    </div>
  )
}
