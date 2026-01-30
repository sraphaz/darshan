# Darshan API Spec (v0.2)

## Endpoint: POST /api/darshan

### Modelo: 7 fases, uma resposta por vez

O oráculo não retorna 7 linhas de uma vez. Cada requisição corresponde a **uma fase** (1–7) e retorna **uma mensagem**. O usuário interage (pergunta, comentário ou “continuar”) e o chat avança para a próxima fase. O histórico é enviado para o modelo aprofundar sem repetir.

### Input

```json
{
  "phase": 1,
  "userMessage": "string | vazio",
  "userProfile": {
    "fullName": "string opcional",
    "birthDate": "YYYY-MM-DD opcional",
    "birthPlace": "string opcional",
    "birthTime": "HH:mm opcional"
  },
  "history": [
    {
      "phase": 1,
      "userMessage": "opcional",
      "darshanMessage": "string"
    }
  ]
}
```

- **phase** (1–7): fase atual do ritual.
- **userMessage**: o que o usuário disse nesta interação (ou vazio para “continuar”).
- **userProfile**: dados para prompt Jyotish mais específico e considerações astrológicas.
- **history**: turnos já vividos nesta rodada (fase + mensagem do usuário + resposta Darshan).

### Output (sempre JSON)

```json
{
  "message": "uma única mensagem para esta fase, em português",
  "phase": 1
}
```

### As 7 fases

1. Luz — frase-oráculo  
2. Pulso Jyotish — qualidade do tempo agora (usa mapa do usuário se houver)  
3. Arquétipo Chinês — ciclo anual vigente  
4. Elemento — Ayurveda (Terra/Água/Fogo/Ar/Éter)  
5. Consciência — guna (Sattva/Rajas/Tamas) em linguagem humana  
6. Ação mínima — prática corporal segura (30–90s)  
7. Pergunta final — devolução à presença  

### Regras

- Uma resposta por requisição; conteúdo variado, sem fórmulas fixas.
- Histórico evita repetição e permite aprofundar.
- Perfil do usuário alimenta Jyotish/astrologia sem fixar identidade.
