"use client";

/** Ícone vetorial simplificado do cubo de Metatron (geometria sagrada). */
export default function IconMetatronCube({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* Centro */}
      <circle cx="12" cy="12" r="2.2" />
      {/* 6 círculos em hexágono ao redor do centro */}
      <circle cx="12" cy="5.2" r="1.8" />
      <circle cx="17.2" cy="8.8" r="1.8" />
      <circle cx="17.2" cy="15.2" r="1.8" />
      <circle cx="12" cy="18.8" r="1.8" />
      <circle cx="6.8" cy="15.2" r="1.8" />
      <circle cx="6.8" cy="8.8" r="1.8" />
      {/* Linhas do centro aos 6 vértices */}
      <line x1="12" y1="12" x2="12" y2="5.2" />
      <line x1="12" y1="12" x2="17.2" y2="8.8" />
      <line x1="12" y1="12" x2="17.2" y2="15.2" />
      <line x1="12" y1="12" x2="12" y2="18.8" />
      <line x1="12" y1="12" x2="6.8" y2="15.2" />
      <line x1="12" y1="12" x2="6.8" y2="8.8" />
      {/* Hexágono externo (conecta os 6 círculos) */}
      <path d="M12 5.2 L17.2 8.8 L17.2 15.2 L12 18.8 L6.8 15.2 L6.8 8.8 Z" />
    </svg>
  );
}
