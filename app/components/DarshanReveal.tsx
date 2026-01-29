"use client";

type Props = {
  steps: string[];
};

export default function DarshanReveal({ steps }: Props) {
  return (
    <div className="mt-8 space-y-3 text-center max-w-md">
      {steps.map((line, index) => (
        <p key={line + index} className="text-sm opacity-80">
          {line}
        </p>
      ))}
    </div>
  );
}
