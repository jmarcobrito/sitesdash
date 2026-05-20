import Header from '@/components/Header'
import KanbanBoard from '@/components/KanbanBoard'

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <KanbanBoard />
    </div>
  )
}
