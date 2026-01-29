type Props = {
  sunrise: string;
  sunset: string;
  moonPhase: string;
};

export default function TimeHeader({ sunrise, sunset, moonPhase }: Props) {
  return (
    <div className="text-center text-sm opacity-70 space-y-2">
      <div>
        🌅 Sunrise: {sunrise} · 🌇 Sunset: {sunset}
      </div>
      <div>🌙 Moon: {moonPhase}</div>
    </div>
  );
}
