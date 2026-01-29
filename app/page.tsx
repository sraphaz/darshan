"use client";

import { useState } from "react";
import CrystalOrb from "./components/CrystalOrb";
import DarshanReveal from "./components/DarshanReveal";
import { getTimePulse } from "../lib/timepulse";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [steps, setSteps] = useState<string[]>([]);

  const pulse = getTimePulse();

  async function receiveDarshan() {
    const res = await fetch("/api/darshan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    const data = await res.json();
    setSteps(data.steps);
  }

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-black text-white px-6">
      <h1 className="text-3xl font-light tracking-wide">DARSHAN</h1>
      <p className="opacity-60 mt-2">Luz do Tempo</p>

      <div className="mt-8 text-sm opacity-70 text-center">
        🌅 {pulse.sunrise} · 🌇 {pulse.sunset}
        <br />
        🌙 {pulse.moonPhase}
      </div>

      <CrystalOrb />

      <div className="w-full max-w-md">
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Respire... faça uma pergunta, ou deixe vazio."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none"
        />
        <button
          onClick={receiveDarshan}
          className="w-full mt-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition"
        >
          Receber Luz
        </button>
      </div>

      {steps.length > 0 && <DarshanReveal steps={steps} />}
    </main>
  );
}
