import type { Lead } from '@/types'

interface StatsRowProps {
  leads: Lead[]
}

function fmt(value: number, isCurrency = false) {
  if (isCurrency) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }
  return value.toString()
}

export default function StatsRow({ leads }: StatsRowProps) {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const prospectados = leads.length
  const previewsEnviadas = leads.filter((l) => l.preview_url !== null).length
  const emNegociacao = leads.filter((l) => l.status === 'negociacao').length

  const faturado = leads
    .filter((l) => {
      if (l.status !== 'fechado' && l.status !== 'entregue') return false
      if (!l.ticket) return false
      const d = new Date(l.created_at)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
    .reduce((acc, l) => acc + (l.ticket ?? 0), 0)

  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

  const leadsEstaSemana = leads.filter((l) => new Date(l.created_at) >= sevenDaysAgo).length

  const semResposta = leads.filter(
    (l) => l.status === 'negociacao' && new Date(l.created_at) < threeDaysAgo
  ).length

  const potencialNegociacao = leads
    .filter((l) => l.status === 'negociacao')
    .reduce((acc, l) => acc + (l.ticket ?? 0), 0)

  const sitesFechadosMes = leads.filter((l) => {
    if (l.status !== 'fechado' && l.status !== 'entregue') return false
    const d = new Date(l.created_at)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  }).length

  const stats = [
    {
      label: 'Prospectados',
      value: fmt(prospectados),
      sublabel: `↑ ${leadsEstaSemana} esta semana`,
      icon: '👥',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Previews enviadas',
      value: fmt(previewsEnviadas),
      sublabel: `${semResposta} sem resposta`,
      icon: '🖥️',
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: 'Em negociação',
      value: fmt(emNegociacao),
      sublabel: `${fmt(potencialNegociacao, true)} potencial`,
      icon: '🤝',
      color: 'text-yellow-600 bg-yellow-50',
    },
    {
      label: 'Faturado (mês)',
      value: fmt(faturado, true),
      sublabel: `${sitesFechadosMes} sites fechados`,
      icon: '💰',
      color: 'text-green-600 bg-green-50',
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-4 px-6 py-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${s.color}`}>
            {s.icon}
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sublabel}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
