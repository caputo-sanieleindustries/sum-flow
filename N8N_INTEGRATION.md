# Integrazione n8n - Guida alla Configurazione

## 📋 Panoramica

L'applicazione è configurata per inviare webhook a n8n per le seguenti automazioni:

### 1. **Notifiche Transazioni** (`N8N_WEBHOOK_TRANSACTION`)
Invia notifiche in tempo reale quando vengono create, modificate o eliminate transazioni.

### 2. **Report Giornalieri** (`N8N_WEBHOOK_DAILY_REPORT`)
Genera report giornalieri con statistiche e riepilogo delle transazioni del giorno precedente.

---

## 🚀 Come Configurare n8n

### Passo 1: Creare un Workflow in n8n

1. Accedi a [n8n.io](https://n8n.io) o alla tua istanza self-hosted
2. Crea un nuovo workflow
3. Aggiungi un nodo **Webhook** come trigger
4. Configura il webhook:
   - **HTTP Method**: `POST`
   - **Path**: scegli un nome univoco (es. `/budget-transactions`)
   - Copia l'**URL del webhook** (sarà simile a `https://your-n8n.domain/webhook/budget-transactions`)

### Passo 2: Configurare i Webhook nell'App

Hai già configurato i seguenti webhook nell'applicazione tramite i secrets:
- `N8N_WEBHOOK_TRANSACTION` - Per notifiche su transazioni
- `N8N_WEBHOOK_DAILY_REPORT` - Per report giornalieri

---

## 📦 Payload dei Webhook

### 1. Notifiche Transazioni

```json
{
  "event": "created" | "updated" | "deleted",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "transaction": {
    "id": "uuid",
    "amount": 150.00,
    "type": "expense",
    "category_id": "uuid",
    "category_name": "Alimentari",
    "date": "2025-01-15",
    "note": "Spesa supermercato",
    "created_at": "2025-01-15T10:30:00.000Z",
    "updated_at": "2025-01-15T10:30:00.000Z"
  },
  "user_email": "user@example.com"
}
```

### 2. Report Giornalieri

```json
{
  "date": "2025-01-14",
  "timestamp": "2025-01-15T06:00:00.000Z",
  "summary": {
    "total_income": 2000.00,
    "total_expenses": 850.50,
    "net_balance": 1149.50,
    "transaction_count": 15
  },
  "by_category": {
    "Alimentari": {
      "income": 0,
      "expense": 300.50,
      "count": 5
    },
    "Stipendio": {
      "income": 2000.00,
      "expense": 0,
      "count": 1
    }
  },
  "transactions": [...]
}
```

---

## 🎯 Esempi di Automazione n8n

### Esempio 1: Notifica Slack per Nuove Transazioni

```
Webhook → If (event === 'created') → Slack → Send Message
```

**Messaggio Slack**:
```
💰 Nuova transazione {{$node["Webhook"].json["transaction"]["type"]}}
Importo: €{{$node["Webhook"].json["transaction"]["amount"]}}
Categoria: {{$node["Webhook"].json["transaction"]["category_name"]}}
Data: {{$node["Webhook"].json["transaction"]["date"]}}
```

### Esempio 2: Sincronizzazione Google Sheets

```
Webhook → Google Sheets → Append Row
```

**Configurazione Google Sheets**:
- Colonna A: Data (`{{$json["transaction"]["date"]}}`)
- Colonna B: Tipo (`{{$json["transaction"]["type"]}}`)
- Colonna C: Importo (`{{$json["transaction"]["amount"]}}`)
- Colonna D: Categoria (`{{$json["transaction"]["category_name"]}}`)
- Colonna E: Note (`{{$json["transaction"]["note"]}}`)

### Esempio 3: Email Report Giornaliero

```
Webhook → Set Variables → Send Email (Gmail/SMTP)
```

**Template Email**:
```html
<h2>Report Giornaliero Budget - {{$json["date"]}}</h2>
<p><strong>Riepilogo:</strong></p>
<ul>
  <li>Entrate: €{{$json["summary"]["total_income"]}}</li>
  <li>Uscite: €{{$json["summary"]["total_expenses"]}}</li>
  <li>Saldo Netto: €{{$json["summary"]["net_balance"]}}</li>
  <li>Numero Transazioni: {{$json["summary"]["transaction_count"]}}</li>
</ul>
```

### Esempio 4: Alert Spesa Eccessiva

```
Webhook → If (event === 'created' AND type === 'expense' AND amount > 100) → Send Notification
```

---

## ⏰ Report Giornalieri Automatici

Per eseguire automaticamente il report giornaliero, puoi:

### Opzione 1: Cron Job in n8n
1. In n8n, usa un nodo **Cron** come trigger
2. Imposta l'orario (es. ogni giorno alle 6:00)
3. Aggiungi un nodo **HTTP Request** che chiama:
   ```
   POST https://hhkiktvtxcsveotrrjqm.supabase.co/functions/v1/daily-report
   Headers:
   - Authorization: Bearer [ANON_KEY]
   ```

### Opzione 2: Cron Job Supabase (Avanzato)
Usa `pg_cron` per schedulare l'invocazione automatica della funzione `daily-report` ogni giorno.

---

## 🔗 Link Utili

- **Funzioni Edge**:
  - [notify-n8n](https://supabase.com/dashboard/project/hhkiktvtxcsveotrrjqm/functions/notify-n8n)
  - [daily-report](https://supabase.com/dashboard/project/hhkiktvtxcsveotrrjqm/functions/daily-report)

- **n8n Resources**:
  - [n8n Documentation](https://docs.n8n.io/)
  - [n8n Webhook Trigger](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
  - [n8n Templates](https://n8n.io/workflows/)

---

## 🐛 Troubleshooting

### Il webhook non viene ricevuto
1. Verifica che l'URL del webhook sia corretto nei secrets
2. Controlla i log delle funzioni edge nel backend
3. Testa il webhook manualmente con Postman o curl

### I report giornalieri non arrivano
1. Verifica che `N8N_WEBHOOK_DAILY_REPORT` sia configurato
2. Assicurati che il cron job sia attivo in n8n
3. Controlla i log della funzione `daily-report`

### I dati non sono completi
1. Verifica che le RLS policies permettano l'accesso ai dati
2. Controlla che la funzione usi `SUPABASE_SERVICE_ROLE_KEY` per accesso completo
3. Verifica i log per errori di query

---

## 💡 Suggerimenti

- **Sicurezza**: Usa webhook privati in n8n (con autenticazione) per produzione
- **Testing**: Testa i workflow con dati di esempio prima di andare in produzione
- **Monitoraggio**: Abilita i log in n8n per tracciare l'esecuzione dei workflow
- **Backup**: Esporta regolarmente i tuoi workflow n8n
