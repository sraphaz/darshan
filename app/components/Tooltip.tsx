"use client";

type Props = {
  text: string;
  children: React.ReactNode;
  /** Alinhamento do tooltip em relação ao elemento. default: left */
  align?: "left" | "right" | "center";
  /** Posição vertical: acima ou abaixo do elemento. default: bottom */
  side?: "top" | "bottom";
  /** Nome do group para hover (deve ser único no mesmo pai). */
  groupName?: string;
  /** Quando definido, o wrapper usa esta classe (ex.: para botão fixo). */
  wrapperClassName?: string;
};

const tooltipBase =
  "absolute py-2 px-3 min-w-[140px] max-w-[260px] " +
  "text-[11px] text-white/80 leading-snug text-left whitespace-normal " +
  "bg-black/75 backdrop-blur-sm border border-white/10 rounded-md " +
  "opacity-0 pointer-events-none transition-opacity duration-150 z-50 " +
  "shadow-lg break-words";

export default function Tooltip({
  text,
  children,
  align = "left",
  side = "bottom",
  groupName = "tip",
  wrapperClassName,
}: Props) {
  const vertical = side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5";
  const position =
    align === "right"
      ? "right-0"
      : align === "center"
        ? "left-1/2 -translate-x-1/2"
        : "left-0";
  const Wrapper = wrapperClassName ? "div" : "span";
  const wrapperClass = wrapperClassName
    ? `${wrapperClassName} group`
    : "relative group inline-flex";
  return (
    <Wrapper className={wrapperClass}>
      {children}
      <span
        className={`${tooltipBase} ${vertical} ${position} group-hover:opacity-100`}
        aria-hidden
      >
        {text}
      </span>
    </Wrapper>
  );
}
