'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Lead, LeadStatus } from '@/types'
import KanbanColumn from './KanbanColumn'
import StatsRow from './StatsRow'

const COLUMNS = [
  {
    id: 'novo',
    title: 'Novo lead',
    statuses: ['novo', 'aguardando_preview'] as LeadStatus[],
    dropStatus: 'novo' as LeadStatus,
    border: 'border-blue-300',
    bg: 'bg-blue-50',
    header: 'bg-blue-100',
    badge: 'bg-blue-200 text-blue-800',
  },
  {
    id: 'negociacao',
    title: 'Em negociação',
    statuses: ['negociacao'] as LeadStatus[],
    dropStatus: 'negociacao' as LeadStatus,
    border: 'border-yellow-300',
    bg: 'bg-yellow-50',
    header: 'bg-yellow-100',
    badge: 'bg-yellow-200 text-yellow-800',
  },
  {
    id: 'fechado',
    title: 'Fechado',
    statuses: ['fechado'] as LeadStatus[],
    dropStatus: 'fechado' as LeadStatus,
    border: 'border-green-300',
    bg: 'bg-green-50',
    header: 'bg-green-100',
    badge: 'bg-green-200 text-green-800',
  },
  {
    id: 'entregue',
    title: 'Entregue',
    statuses: ['entregue'] as LeadStatus[],
    dropStatus: 'entregue' as LeadStatus,
    border: 'border-gray-300',
    bg: 'bg-gray-50',
    header: 'bg-gray-100',
    badge: 'bg-gray-200 text-gray-700',
  },
]

export default function KanbanBoard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const draggingId = useRef<string | null>(null)

  const notifyNewLead = useCallback(async (lead: Lead) => {
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: lead.nome,
          nome_negocio: lead.nome_negocio,
          nicho: lead.nicho,
          telefone: lead.telefone,
        }),
      })
      const { url } = await res.json()
      if (url) window.open(url, '_blank')
    } catch {
      // silently ignore notification errors
    }
  }, [])

  const fetchLeads = useCallback(async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setLeads(data as Lead[])
  }, [])

  useEffect(() => {
    fetchLeads()

    const channel = supabase
      .channel('leads-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newLead = payload.new as Lead
            setLeads((prev) => [newLead, ...prev])
            if (newLead.status === 'aguardando_preview') {
              notifyNewLead(newLead)
            }
          } else if (payload.eventType === 'UPDATE') {
            setLeads((prev) =>
              prev.map((l) => (l.id === (payload.new as Lead).id ? (payload.new as Lead) : l))
            )
          } else if (payload.eventType === 'DELETE') {
            setLeads((prev) => prev.filter((l) => l.id !== (payload.old as { id: string }).id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchLeads, notifyNewLead])

  const handleDragStart = (leadId: string) => {
    draggingId.current = leadId
  }

  const handleDrop = async (status: LeadStatus) => {
    const id = draggingId.current
    if (!id) return
    draggingId.current = null

    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
    await supabase.from('leads').update({ status }).eq('id', id)
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <StatsRow leads={leads} />
      <div className="flex gap-4 px-6 pb-6 overflow-x-auto flex-1">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            title={col.title}
            border={col.border}
            bg={col.bg}
            header={col.header}
            badge={col.badge}
            leads={leads.filter((l) => col.statuses.includes(l.status))}
            onDragStart={handleDragStart}
            onDrop={() => handleDrop(col.dropStatus)}
          />
        ))}
      </div>
    </div>
  )
}
