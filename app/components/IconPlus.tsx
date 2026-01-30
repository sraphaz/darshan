"use client";

/** Plus minimalista — duas linhas finas cruzadas. */
export default function IconPlus({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 6v12M6 12h12" />
    </svg>
  );
}
