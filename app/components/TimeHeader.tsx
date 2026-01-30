"use client";

import { getMoonPhaseHover } from "@/lib/knowledge/moonPhases";
import Tooltip from "./Tooltip";

const HOVER_SUNRISE = "Nascer do sol";
const HOVER_SUNSET = "Pôr do sol";

type Props = {
  sunrise: string;
  sunset: string;
  moonPhase: string;
};

const iconClass = "w-4 h-4 shrink-0 text-white/70";

function IconSun() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function IconCrescent() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor" fillOpacity="0.85" aria-hidden>
      <path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10 10 10 0 0 1-10-10A10 10 0 0 1 12 2zm0 2.5a7.5 7.5 0 0 0-7.5 7.5 7.5 7.5 0 0 0 7.5 7.5 7.5 7.5 0 0 0 7.5-7.5A7.5 7.5 0 0 0 12 4.5z" />
    </svg>
  );
}

const itemClass = "flex items-center gap-2 text-[11px] uppercase tracking-widest text-white/60";

export default function TimeHeader({ sunrise, sunset, moonPhase }: Props) {
  return (
    <header className="flex items-center gap-6">
      <Tooltip text={HOVER_SUNRISE} groupName="sunrise">
        <span className={itemClass}>
          <IconSun />
          <span>{sunrise}</span>
        </span>
      </Tooltip>
      <Tooltip text={HOVER_SUNSET} groupName="sunset">
        <span className={itemClass}>
          <IconMoon />
          <span>{sunset}</span>
        </span>
      </Tooltip>
      <Tooltip text={getMoonPhaseHover(moonPhase)} groupName="moon">
        <span className={`${itemClass} normal-case`}>
          <IconCrescent />
          <span className="tracking-normal">{moonPhase}</span>
        </span>
      </Tooltip>
    </header>
  );
}

export function TimeHeaderSunrise({ sunrise }: { sunrise: string }) {
  return (
    <Tooltip text={HOVER_SUNRISE} groupName="sunrise">
      <span className={itemClass}>
        <IconSun />
        <span>{sunrise}</span>
      </span>
    </Tooltip>
  );
}

export function TimeHeaderSunsetMoon({ sunset, moonPhase }: { sunset: string; moonPhase: string }) {
  return (
    <div className="flex items-center gap-6">
      <Tooltip text={HOVER_SUNSET} groupName="sunset">
        <span className={itemClass}>
          <IconMoon />
          <span>{sunset}</span>
        </span>
      </Tooltip>
      <Tooltip text={getMoonPhaseHover(moonPhase)} groupName="moon">
        <span className={`${itemClass} normal-case`}>
          <IconCrescent />
          <span className="tracking-normal">{moonPhase}</span>
        </span>
      </Tooltip>
    </div>
  );
}
