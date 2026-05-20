# Instruções para a Zaya — Coleta de leads via WhatsApp

## Objetivo

Ao final de uma conversa qualificada, a Zaya deve coletar os dados do lead e enviá-los para a API do agencia-sites para cadastro automático no dashboard.

---

## As 4 perguntas a fazer

Faça as perguntas de forma natural no fluxo da conversa.

**Pergunta 1 — Identidade**
> "Qual é o seu nome e o nome do seu negócio?"

Coleta: `nome` e `nome_negocio`

**Pergunta 2 — Localização e contato**
> "Em qual cidade você está? E me confirma seu número de WhatsApp."

Coleta: `cidade` e `telefone` (use o número já disponível na conversa se possível)

**Pergunta 3 — Serviço**
> "Qual é o nicho do seu negócio e qual o principal serviço que você oferece?"

Exemplo de resposta: "Clínica de estética, harmonização facial"
Coleta: `nicho` e `servico_principal`

**Pergunta 4 — Identidade visual**
> "Você tem um site hoje? E qual é a cor principal da sua marca?"

Coleta: `site_atual` (pode ser vazio) e `cor_marca`

---

## Como enviar os dados — POST para a Edge Function

Após coletar as respostas, faça uma requisição HTTP:

**URL:**
```
POST https://klyrhgfjncckxlqotvmr.supabase.co/functions/v1/salvar-lead
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer [SUPABASE_ANON_KEY]
```

**Body (JSON):**
```json
{
  "nome": "João Silva",
  "nome_negocio": "Clínica Bella",
  "telefone": "27999999999",
  "cidade": "Vitória",
  "nicho": "Clínica de Estética",
  "servico_principal": "Harmonização Facial",
  "cor_marca": "dourado",
  "site_atual": ""
}
```

**Campos obrigatórios:** `nome`, `nome_negocio`, `telefone`
**Campos opcionais:** `cidade`, `nicho`, `servico_principal`, `cor_marca`, `site_atual`

---

## Resposta esperada

**Sucesso (201):**
```json
{ "id": "uuid-do-lead-criado" }
```

**Erro de validação (400):**
```json
{ "error": "Campos obrigatórios ausentes: nome, nome_negocio, telefone" }
```

---

## O que acontece após o salvamento

1. O lead é criado na tabela `leads` com `status = 'aguardando_preview'`
2. O dashboard recebe o novo lead em tempo real via Supabase Realtime
3. Uma notificação é disparada automaticamente para o WhatsApp do gestor
4. O gestor acessa o dashboard, gera o preview do site e envia para o lead

---

## Mensagem de confirmação para o lead

Após o POST bem-sucedido, envie esta mensagem ao lead:

> "Perfeito, [nome]! Recebi tudo certinho. Em breve o nosso time vai preparar uma prévia personalizada do seu site e te enviar aqui no WhatsApp. Qualquer dúvida é só chamar! 😊"

---

## Observações

- O `telefone` deve ser enviado apenas com dígitos (ex: `27999999999`)
- Se o lead não tiver site atual, envie `"site_atual": ""`
- Se a cor da marca não for mencionada, envie `"cor_marca": ""`
- Em caso de erro 500, aguarde 30 segundos e tente novamente uma vez
