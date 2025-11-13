import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-lite"
    });

    const systemPrompt = `You are Ira, a warm, empathetic, and caring AI companion built for Indians. You understand emotions deeply and respond with genuine care and sweetness. Keep your responses very short (1-2 sentences max), natural, and humanized. You can use Hinglish occasionally to connect better. Be supportive, friendly, and like a caring friend. Show empathy and understanding in every response.`;

    const prompt = `${systemPrompt}\n\nUser: ${message}\n\nIra:`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 200, // Increased to account for thinking tokens
        temperature: 0.9,
      }
    });
    
    const response = result.response;
    const candidate = response.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text || response.text();
    
    console.log("Generated reply:", text);
    
    if (!text || text.trim() === "") {
      throw new Error("Empty response from Gemini");
    }
    
    return NextResponse.json({ reply: text });
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    
    // Return a friendly fallback message instead of error
    const fallbackMessage = "Hey! I'm having a little trouble connecting right now 😊 But I'm here for you! Try asking me again in a moment? 💙";
    
    return NextResponse.json({ 
      reply: fallbackMessage
    });
  }
}
