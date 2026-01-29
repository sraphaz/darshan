export type TimePulse = {
  sunrise: string;
  sunset: string;
  moonPhase: string;
};

export function getTimePulse(): TimePulse {
  return {
    sunrise: "06:10",
    sunset: "18:42",
    moonPhase: "Lua crescente",
  };
}
