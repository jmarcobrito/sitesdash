import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  let body: Record<string, string>
  try {
    body = await req.json()
  } catch {
    return new Response(
      JSON.stringify({ error: 'Body inválido — esperado JSON' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { nome, nome_negocio, telefone, cidade, nicho, servico_principal, cor_marca, site_atual } = body

  if (!nome || !nome_negocio || !telefone) {
    return new Response(
      JSON.stringify({ error: 'Campos obrigatórios ausentes: nome, nome_negocio, telefone' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data, error } = await supabase
    .from('leads')
    .insert({
      nome,
      nome_negocio,
      telefone,
      cidade: cidade || '',
      nicho: nicho || '',
      servico_principal: servico_principal || '',
      cor_marca: cor_marca || null,
      site_atual: site_atual || null,
      status: 'aguardando_preview',
    })
    .select('id')
    .single()

  if (error) {
    console.error('Erro ao salvar lead:', error)
    return new Response(
      JSON.stringify({ error: 'Erro ao salvar lead', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ id: data.id }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
