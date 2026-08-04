import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildPrompt(
  transcript: string,
  existingInsights: string,
  existingHtml: string,
  context: string
) {
  return `You are an AI assistant sitting silently in a business discovery meeting between an IT consultant and a potential client. Your job is to listen to the transcript, separate business talk from general conversation, extract intelligence, and generate a working software prototype the client will see at the end of the meeting.

## STEP 1 — FILTER
First, classify each part of the transcript:
- CONVERSATION: greetings, small talk, pleasantries, tangents, meta-comments ("let me grab water", "nice to meet you", "so how long have you been doing this")
- BUSINESS: the client describing workflows, problems, volumes, people involved, tools they use, frustrations, things they wish worked differently, numbers and frequency

Only extract intelligence from BUSINESS segments. Ignore CONVERSATION entirely.

## STEP 2 — EXTRACT (from BUSINESS segments only)
Use the client's EXACT words and industry terminology. Never paraphrase into consulting jargon.

## STEP 3 — BUILD THE PROTOTYPE
Generate a complete, self-contained HTML file representing the PRIMARY screen of the software the client needs. This will be rendered live in an iframe during the meeting and shown to the client when it ends.

Prototype requirements:
- Single HTML file with all CSS in <style> tags — zero external dependencies
- Dark professional theme: background #0A1F1C, surface #0F2B24, text #F2F0E8, accent #C9A24B, green #16A374
- Show the MAIN WORKFLOW SCREEN the client described — the form, dashboard, table, or checklist they actually need
- Use the client's EXACT WORDS as field labels, column headers, button names, and section titles
- Include 3-5 rows of realistic sample data using their industry context
- Make it look like a real working application — proper layout, hover states, a nav bar with the solution name
- If the client hasn't said enough yet: build a minimal skeleton and refine it next call

---

Transcript:
${transcript}

Previous extraction (build on this — never shrink it):
${existingInsights || "{}"}

Previous prototype HTML (refine this — do not start over from scratch):
${existingHtml || "[none yet — generate initial version]"}

Company context:
${context || "None"}

---

Return ONLY valid JSON, no markdown fences:
{
  "painPoints": ["exact client quote or close paraphrase"],
  "currentTools": ["tool, system, or method they mentioned"],
  "solution": {
    "name": "2-4 word name using their industry language",
    "tagline": "One sentence using their terminology",
    "features": [
      { "name": "Feature name using a word they said", "description": "One sentence" }
    ]
  },
  "estimatedScope": "Small (2-4 weeks) / Medium (1-3 months) / Large (3-6 months)",
  "prototypeHtml": "<!DOCTYPE html><html>...</html>"
}`;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured on server" },
      { status: 500 }
    );
  }

  const { transcript, existingInsights, existingHtml, companyContext } =
    await req.json();
  if (!transcript || transcript.trim().length < 50) {
    return NextResponse.json(
      { error: "Not enough transcript yet" },
      { status: 400 }
    );
  }

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: buildPrompt(
          transcript,
          existingInsights ?? "",
          existingHtml ?? "",
          companyContext ?? ""
        ),
      },
    ],
  });

  const text = message.content[0]?.type === "text" ? message.content[0].text : "";
  // Strip markdown fences if the model added them despite instructions
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) {
    return NextResponse.json(
      { error: "No JSON in response", raw: cleaned.slice(0, 500) },
      { status: 500 }
    );
  }

  try {
    return NextResponse.json(JSON.parse(cleaned.slice(start, end + 1)));
  } catch {
    return NextResponse.json(
      { error: "Parse error", raw: cleaned.slice(0, 500) },
      { status: 500 }
    );
  }
}
