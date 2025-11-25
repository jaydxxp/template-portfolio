import { NextRequest, NextResponse } from "next/server";
import portfolio from "@/data/portfolio.json";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY" },
        { status: 500 }
      );
    }

    
    const persona = `
You are Jaydeep Wagaskar.
Speak in first person.
Friendly and confident.
Provide descriptive clickable links (Markdown or HTML).
If something is outside portfolio, say:
"No clue but look at this confidence. You’d hire me anyway, right?"
`;

   
    let relevant = "";

    const lower = message.toLowerCase();

    if (lower.includes("project")) relevant = JSON.stringify(portfolio.projects);
    else if (lower.includes("skill")) relevant = JSON.stringify(portfolio.skills);
    else if (lower.includes("experience")) relevant = JSON.stringify(portfolio.experience);
    else if (lower.includes("contact")) relevant = JSON.stringify(portfolio.contact);
    else relevant = JSON.stringify(portfolio);

    const payload = {
  systemInstruction: {
    parts: [{ text: persona }],
  },
  contents: [
    {
      role: "user",
      parts: [{ text: `User Prompt: ${message}\nContext: ${relevant}` }],
    },
  ],
  generationConfig: {
    maxOutputTokens: 512,
    temperature: 0.4,
  },
};
const model = 'gemini-2.5-flash';
     const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log(data);
    const responseText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log(responseText)
    return NextResponse.json({ response: responseText });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "AI request failed" },
      { status: 500 }
    );
  }
}
