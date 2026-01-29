import { NextResponse } from "next/server";
import OpenAI from "openai";
import { loadMasterPrompt } from "../../../lib/darshanPrompt";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const body = await req.json();
  const question = body.question || "";
  const mode = question ? "question" : "now";
  const masterPrompt = loadMasterPrompt();
  const fallbackSteps = [
    "O tempo pede suavidade.",
    "Lua crescente: algo quer nascer devagar.",
    "O ciclo coletivo favorece transformação.",
    "Hoje há Ar: mente sensível.",
    "Rajas está alto: simplifique.",
    "Respire 4 vezes lentamente e sinta os pés.",
    "O que em você já sabe?",
  ];
  let steps = fallbackSteps;
  let safetyNote = "";

  if (!process.env.OPENAI_API_KEY) {
    safetyNote = "OPENAI_API_KEY not set; returned fallback steps.";
  } else {
    try {
      const completion = await openai.responses.create({
        model: "gpt-4o-mini",
        input: [
          {
            role: "system",
            content: masterPrompt,
          },
          {
            role: "user",
            content: question || "Pulse of Now",
          },
        ],
      });

      const text = completion.output_text ?? "";
      const parsedSteps = text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 7);
      if (parsedSteps.length === 7) {
        steps = parsedSteps;
      } else {
        safetyNote = "OpenAI response incomplete; returned fallback steps.";
      }
    } catch (error) {
      console.warn("OpenAI request failed; returning fallback steps.", error);
      safetyNote = "OpenAI request failed; returned fallback steps.";
    }
  }

  return NextResponse.json({
    mode,
    steps,
    image_prompt: null,
    safety: { flags: [], note: safetyNote },
  });
}
