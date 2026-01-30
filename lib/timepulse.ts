import * as SunCalc from "suncalc";

export type TimePulse = {
  sunrise: string;
  sunset: string;
  moonPhase: string;
};

/** Formata Date para HH:mm em pt-BR (locale do usuário ou fixo). */
function formatTime(d: Date): string {
  return d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** Mapeia fase lunar (0–1) para rótulo em português. */
function moonPhaseLabel(phase: number): string {
  if (phase <= 0.03) return "Lua nova";
  if (phase <= 0.22) return "Lua crescente";
  if (phase <= 0.28) return "Lua quarto crescente";
  if (phase <= 0.47) return "Lua crescente";
  if (phase <= 0.53) return "Lua cheia";
  if (phase <= 0.72) return "Lua minguante";
  if (phase <= 0.78) return "Lua quarto minguante";
  if (phase <= 0.97) return "Lua minguante";
  return "Lua nova";
}

/**
 * Calcula o TimePulse do momento: nascer/pôr do sol e fase lunar.
 * Usa coordenadas padrão (São Paulo) quando não fornecidas.
 */
export function getTimePulse(
  date: Date = new Date(),
  lat: number = -23.55,
  lng: number = -46.63
): TimePulse {
  const times = SunCalc.getTimes(date, lat, lng);
  const moon = SunCalc.getMoonIllumination(date);

  return {
    sunrise: formatTime(times.sunrise),
    sunset: formatTime(times.sunset),
    moonPhase: moonPhaseLabel(moon.phase),
  };
}
