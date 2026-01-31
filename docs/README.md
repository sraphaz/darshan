# Documentação — Darshan

Índice da documentação do projeto, organizada por tema. Use este arquivo para localizar rapidamente o documento desejado.

---

## Visão e produto

| Documento | Descrição |
|-----------|-----------|
| [PRODUCT_VISION.md](./PRODUCT_VISION.md) | Visão do produto, nome, tagline e promessa. |
| [BUSINESS_MODEL.md](./BUSINESS_MODEL.md) | Modelo de negócio e monetização. |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Sistema de design (cores, tipografia, componentes). |
| [ORACLE_CONSTITUTION.md](./ORACLE_CONSTITUTION.md) | Constituição do oráculo: princípios éticos e não fatalistas. |
| [TWELVE_PETALS_GOVERNANCE.md](./TWELVE_PETALS_GOVERNANCE.md) | Governança pelos 12 pétalas (Sri Aurobindo). |
| [MASTER_PROMPT.md](./MASTER_PROMPT.md) | Prompt mestre e sementes da IA. |

---

## Fluxos e regras da aplicação

| Documento | Descrição |
|-----------|-----------|
| [FLUXO_E_REGRAS.md](./FLUXO_E_REGRAS.md) | Fluxo completo da aplicação e regras (validação IA, estados, créditos). |
| [FLUXO_ORACULO_OFFLINE.md](./FLUXO_ORACULO_OFFLINE.md) | Modo oráculo offline (sem IA) e dicionário simbólico. |
| [INSTANT_LIGHT_ENGINE.md](./INSTANT_LIGHT_ENGINE.md) | Instant Light híbrido: Sacred Library + Personal Insight (Universal vs Personal Light). |
| [SYMBOLIC_MAP_ENGINE.md](./SYMBOLIC_MAP_ENGINE.md) | **Motor simbólico real**: engines (Jyotish, Numerologia, HD), SymbolicMap, readings modulares, Composer, APIs POST /api/map e POST /api/reading?theme=. |
| [ENGINE_2.0.md](./ENGINE_2.0.md) | Engine 2.0: SymbolicMap canônico → Insights → Composer → Readings modulares (love/career/year/action). |
| [OFFLINE_ENGINE_PIPELINE.md](./OFFLINE_ENGINE_PIPELINE.md) | Pipeline offline high-end: core, engines, SymbolicMap, insights, leituras modulares. |
| [SWISS_EPHEMERIS_INTEGRATION.md](./SWISS_EPHEMERIS_INTEGRATION.md) | Como integrar Swiss Ephemeris (opcional) em `swissProvider.ts`. |
| [ROADMAP_PARTE_2.md](./ROADMAP_PARTE_2.md) | Roadmap Parte 2: Human Design real, Year Engine, Ayurveda. |
| [RITUAL_REVELATION_FLOW.md](./RITUAL_REVELATION_FLOW.md) | Fluxo do ritual de revelação. |
| [DICIONARIO_OFFLINE.md](./DICIONARIO_OFFLINE.md) | Dicionário e significados usados no modo offline. |

---

## Sistemas (tempo, visual, práticas)

| Documento | Descrição |
|-----------|-----------|
| [TIME_PULSE_SYSTEM.md](./TIME_PULSE_SYSTEM.md) | Sistema de pulso do tempo (Jyotish, etc.). |
| [TIME_VISUAL_CORE.md](./TIME_VISUAL_CORE.md) | Núcleo visual do tempo. |
| [IMAGE_SIGIL_SYSTEM.md](./IMAGE_SIGIL_SYSTEM.md) | Sistema de imagens e sigilos. |
| [PRACTICES_LIBRARY.md](./PRACTICES_LIBRARY.md) | Biblioteca de práticas sugeridas pela revelação. |

---

## API e arquitetura técnica

| Documento | Descrição |
|-----------|-----------|
| [API_SPEC.md](./API_SPEC.md) | Especificação da API (POST /api/darshan, fases, input/output). |
| [RESPONSE_SCHEMA.md](./RESPONSE_SCHEMA.md) | Esquema das respostas da API. |
| [TECH_ARCHITECTURE.md](./TECH_ARCHITECTURE.md) | Arquitetura técnica do projeto. |

---

## Autenticação, créditos e pagamentos

| Documento | Descrição |
|-----------|-----------|
| [AUTH_CREDITS_GOOGLE_PAY.md](./AUTH_CREDITS_GOOGLE_PAY.md) | Login (código por e-mail, Google), créditos, Stripe, Mercado Pago, Google Pay. |
| [HISTORICO_RESPOSTAS_LEITURAS.md](./HISTORICO_RESPOSTAS_LEITURAS.md) | Armazenamento e UI de histórico (respostas do orb e leituras completas). |
| [PRECIFICACAO_CREDITOS.md](./PRECIFICACAO_CREDITOS.md) | Preços dos pacotes de créditos e taxa da plataforma. |
| [PAYMENTS_MERCADOPAGO.md](./PAYMENTS_MERCADOPAGO.md) | Integração Mercado Pago (Checkout Pro, webhook). |
| [FINANCE_SYSTEM.md](./FINANCE_SYSTEM.md) | Sistema financeiro (ledger, uso de IA, export CSV). |

---

## Deploy, infra e release

| Documento | Descrição |
|-----------|-----------|
| [DEPLOY_INFRA.md](./DEPLOY_INFRA.md) | Infraestrutura, serverless, variáveis de ambiente, Vercel. |
| [DEPLOY_WORKFLOWS.md](./DEPLOY_WORKFLOWS.md) | Esteiras de CI/CD (GitHub Actions) e secrets da Vercel. |
| [VERSIONING_AND_DEPLOY.md](./VERSIONING_AND_DEPLOY.md) | Versionamento (SemVer) e deploy por mudança de versão (tag `v*`). |
| [BUILD_RELEASE.md](./BUILD_RELEASE.md) | Build, bump, bundle e release (Android/Apple, scripts). |
| [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md) | Checklist de lançamento em produção. |

---

## Admin e operação

| Documento | Descrição |
|-----------|-----------|
| [ADMIN_CONFIG_ACCESS.md](./ADMIN_CONFIG_ACCESS.md) | Acesso à página /config e /monitor (código secreto). |
| [CONFIG_SEEDS.md](./CONFIG_SEEDS.md) | Configuração editável, sementes da IA, API /api/config. |
| [LOG_AUDIT.md](./LOG_AUDIT.md) | Logs e auditoria (app.log, audit.log). |

---

## Testes

| Documento | Descrição |
|-----------|-----------|
| [TESTES.md](./TESTES.md) | Estratégia e execução de testes. |

---

## Ordem sugerida para novos contribuidores

1. [PRODUCT_VISION.md](./PRODUCT_VISION.md) e [ORACLE_CONSTITUTION.md](./ORACLE_CONSTITUTION.md) — contexto do produto.
2. [FLUXO_E_REGRAS.md](./FLUXO_E_REGRAS.md) — como a aplicação funciona.
3. [AUTH_CREDITS_GOOGLE_PAY.md](./AUTH_CREDITS_GOOGLE_PAY.md) — auth e créditos.
4. [DEPLOY_INFRA.md](./DEPLOY_INFRA.md) e [DEPLOY_WORKFLOWS.md](./DEPLOY_WORKFLOWS.md) — como subir e fazer deploy.

---

*Última atualização do índice: janeiro 2025.*
