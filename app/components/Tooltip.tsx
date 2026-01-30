"use client";

type Props = {
  text: string;
  children: React.ReactNode;
  /** Alinhamento do tooltip em relação ao elemento. default: left */
  align?: "left" | "right" | "center";
  /** Nome do group para hover (deve ser único no mesmo pai). */
  groupName?: string;
  /** Quando definido, o wrapper usa esta classe (ex.: para botão fixo). */
  wrapperClassName?: string;
};

const tooltipBase =
  "absolute top-full mt-1 text-[10px] text-white/70 opacity-0 pointer-events-none transition-opacity duration-150 z-50 max-w-[200px] break-words ";

export default function Tooltip({
  text,
  children,
  align = "left",
  groupName = "tip",
  wrapperClassName,
}: Props) {
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
        className={`${tooltipBase} ${position} group-hover:opacity-100`}
        aria-hidden
      >
        {text}
      </span>
    </Wrapper>
  );
}
