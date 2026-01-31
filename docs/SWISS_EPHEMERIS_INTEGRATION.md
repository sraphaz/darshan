# Integração Swiss Ephemeris (opcional)

**Status:** Integração com **@fusionstrings/swiss-eph** implementada. O pacote está instalado e o provider em `lib/core/providers/swissProvider.ts` retorna planetas completos, casas (Placidus), ascendente e moonRashi/nakshatra (derivados da longitude lunar Lahiri). O WASM é carregado na primeira chamada a `buildSymbolicMap` (via `initSwissEphemeris()`); se o Swiss não estiver disponível ou falhar, o resolver usa **mhah-panchang** como fallback.

---

## Implementação atual

- **Pacote:** `@fusionstrings/swiss-eph` (WASM; Node/Next.js).
- **Inicialização:** `initSwissEphemeris()` é chamado automaticamente no início de `buildSymbolicMap(profile)` (async), garantindo que o Swiss esteja carregado antes do resolver.
- **Entrada:** `profile.birthDate`, `profile.birthTime`; lat/lon por enquanto padrão (0,0) — geocoding opcional no futuro.
- **Saída:** `AstronomicalCore` com `planets` (sun, moon, mercury, venus, mars, jupiter, saturn), `houses` (1–12), `ascendant`, `moonRashi`, `nakshatra` (chaves do dicionário).

---

## Pacotes recomendados

| Pacote | Uso | Observação |
|--------|-----|-------------|
| **@fusionstrings/panchangam** | Astrologia védica + Panchangam sobre Swiss Ephemeris (WASM) | Precisão alta; calendário védico (Tithi, Nakshatra). |
| **@fusionstrings/swiss-eph** | Swiss Ephemeris em WASM (Node, browser, edge) | 95+ funções; posições, casas, eclipses. |
| **swisseph** | Binding Node.js nativo para Swiss Ephemeris | Requer compilação nativa; não roda em browser. |

Para **Next.js (Node + eventual browser)**, prefira **@fusionstrings/panchangam** (já védico) ou **@fusionstrings/swiss-eph** (WASM, sem nativo).

---

## Passos para integrar

1. **Instalar** (ex.: Panchangam):
   ```bash
   npm install @fusionstrings/panchangam
   ```

2. **Consultar a API** do pacote (README no npm/GitHub) para:
   - Entrada: data/hora/latitude/longitude (ou só data/hora se usar lugar padrão).
   - Saída: posições planetárias (longitude), casas, ascendente, Nakshatra/Rashi se o pacote já devolver.

3. **Implementar** `trySwissCompute` em `lib/core/providers/swissProvider.ts`:
   - Converter `profile.birthDate` e `profile.birthTime` para o formato que o pacote exige.
   - Opcional: usar `profile.birthPlace` para lat/lon (geocoding) ou valor padrão.
   - Chamar o pacote e mapear o resultado para `AstronomicalCore`:
     - `planets`: longitudes (ex.: `{ sun: 45.2, moon: 120.1, ... }`).
     - `houses`: cúspides 1–12 se disponível.
     - `ascendant`: longitude do ascendente.
     - `moonRashi` / `nakshatra`: se o pacote já devolver em formato védico, mapear para as chaves usadas no Darshan (ex.: mesha, ashwini, …); senão, derivar das longitudes usando as regras em `lib/knowledge/vedic.ts` (graus → signo/nakshatra).
   - Retornar `{ providerUsed: "swiss-ephemeris", ... }`.
   - Em caso de erro (data inválida, pacote não instalado), retornar `null` para o resolver usar mhah-panchang.

4. **Testar** com e sem o pacote instalado: sem ele, o resolver deve cair no mhah-panchang sem quebrar.

---

## Mapeamento para AstronomicalCore

O tipo em `lib/core/types.ts` espera:

- `planets`: `Record<string, number>` — longitude em graus (0–360) por planeta (ex.: `sun`, `moon`, `mars`, …).
- `houses`: `Record<string, number>` — cúspide em graus por casa (ex.: `"1"` a `"12"`).
- `ascendant`: número — longitude do ascendente ( = cúspide da casa 1).
- `moonRashi` / `nakshatra`: strings — chaves do dicionário (mesha, ashwini, …) para compatibilidade com os engines e dicionários atuais.

Se o pacote retornar Nakshatra/Rashi em outro formato (número, nome em inglês), mapear para as chaves usadas em `lib/core/providers/mhahProvider.ts` (INO_TO_RASHI, INO_TO_NAKSHATRA) ou para as chaves em `lib/knowledge/types.ts`.

---

## Resolver

O `ephemerisResolver` já tenta **SwissProvider** primeiro e usa **MhahProvider** em seguida. Nada precisa ser alterado no resolver ao ativar o Swiss Ephemeris; basta fazer `trySwissCompute` retornar um `AstronomicalCore` válido quando o pacote estiver instalado e a entrada for válida.
