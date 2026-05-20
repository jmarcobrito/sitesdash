export type LeadStatus =
  | 'novo'
  | 'aguardando_preview'
  | 'negociacao'
  | 'fechado'
  | 'entregue'

export type SubStatus =
  | 'aguardando_retorno'
  | 'proposta_enviada'
  | 'em_revisao'
  | 'pagamento_pendente'

export interface Lead {
  id: string
  created_at: string
  nome: string
  cidade: string
  nicho: string
  telefone: string
  instagram: string | null
  preview_url: string | null
  status: LeadStatus
  sub_status: SubStatus | null
  ticket: number | null
  notas: string | null
  nome_negocio: string
  servico_principal: string
  cor_marca: string | null
  site_atual: string | null
}

export interface KanbanColumnDef {
  id: string
  title: string
  statuses: LeadStatus[]
  dropStatus: LeadStatus
  border: string
  bg: string
  header: string
  badge: string
}
