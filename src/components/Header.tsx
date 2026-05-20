'use client'

import { useEffect, useState } from 'react'

export default function Header() {
  const [date, setDate] = useState('')

  useEffect(() => {
    const now = new Date()
    setDate(
      now.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    )
  }, [])

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Preview Sites — Operação</h1>
        <p className="text-sm text-gray-500 capitalize mt-0.5">{date}</p>
      </div>
      <div className="flex gap-3">
        <a
          href="/leads/novo"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Novo lead
        </a>
        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
          Relatório
        </button>
      </div>
    </header>
  )
}
