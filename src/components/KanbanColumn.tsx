'use client'

import { useState } from 'react'
import type { Lead } from '@/types'
import LeadCard from './LeadCard'

interface KanbanColumnProps {
  title: string
  border: string
  bg: string
  header: string
  badge: string
  leads: Lead[]
  onDragStart: (leadId: string) => void
  onDrop: () => void
}

export default function KanbanColumn({
  title,
  border,
  bg,
  header,
  badge,
  leads,
  onDragStart,
  onDrop,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  return (
    <div
      className={`flex flex-col w-72 min-w-[288px] rounded-xl border-2 ${border} ${isDragOver ? 'ring-2 ring-offset-1 ring-blue-400' : ''} transition-all`}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={() => {
        setIsDragOver(false)
        onDrop()
      }}
    >
      <div className={`px-4 py-3 rounded-t-xl ${header} flex items-center justify-between`}>
        <h2 className="font-semibold text-sm">{title}</h2>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge}`}>
          {leads.length}
        </span>
      </div>

      <div className={`flex flex-col gap-3 p-3 flex-1 overflow-y-auto min-h-[200px] ${bg} rounded-b-xl`}>
        {leads.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-gray-400 select-none">Solte aqui</p>
          </div>
        )}
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onDragStart={onDragStart} />
        ))}
      </div>
    </div>
  )
}
