import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  // Soft warn at import time; runtime handlers will also handle gracefully
  console.warn("GEMINI_API_KEY is not set. RAG and AI answers will use fallback responses.");
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : undefined;

// Model selection with env override and sane fallbacks
// Prefer explicit env if provided (e.g. "gemini-2.5-flash"), else use a widely-available default
const GENERATION_MODEL = process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-1.5-flash-latest"; // fast + cheap
const EMBEDDING_MODEL = "text-embedding-004"; // outputs 768-d vectors

// Our DB column is vector(1536) from earlier OpenAI setup. To avoid a migration,
// we pad 768-d Gemini embeddings to 1536-d consistently for both docs and queries.
const TARGET_EMBED_DIM = 1536;

export async function generateEmbeddingGemini(text: string): Promise<number[]> {
  if (!genAI) {
    // Fallback: deterministic pseudo-embedding so dev doesn't break completely
    return Array.from({ length: TARGET_EMBED_DIM }, (_, i) => ((i * 31) % 997) / 997);
  }

  const embed = await genAI
    .getGenerativeModel({ model: EMBEDDING_MODEL })
    .embedContent(text);

  const vec = embed.embedding.values as number[]; // 768 dims
  // Pad to 1536 dims for compatibility with existing schema
  if (vec.length === TARGET_EMBED_DIM) return vec;
  if (vec.length < TARGET_EMBED_DIM) {
    const padded = new Array(TARGET_EMBED_DIM).fill(0);
    for (let i = 0; i < vec.length; i++) padded[i] = vec[i];
    return padded;
  }
  // In case Google changes dimension upward, truncate safely
  return vec.slice(0, TARGET_EMBED_DIM);
}

export async function generateAnswerGemini(opts: {
  query: string;
  context: string;
  language: string;
}): Promise<string> {
  const { query, context, language } = opts;
  if (!genAI) return getFallbackAnswer(language);

  const systemPrompt = getSystemPrompt(language);
  const userPrompt = `Context (authoritative government circulars):\n${context}\n\nQuestion: ${query}\n\nPlease answer in ${language} language. Keep it short, clear, and actionable for rural farmers. Cite specifics from context where appropriate.`;

  // Try primary model, then graceful fallbacks if 404/unsupported
  const tryModels = [GENERATION_MODEL, "gemini-2.0-flash-exp", "gemini-1.5-flash-latest", "gemini-1.5-flash-8b"]; 
  for (const modelName of tryModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent({
        contents: [
          { role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      });
  
      const text = result.response.text();
      if (text && text.trim()) return text.trim();
    } catch (err) {
      // 404 or unsupported model – continue to next fallback
      const e = err as unknown as { status?: number; response?: { status?: number } };
      const status = e?.status ?? e?.response?.status;
      if (status && Number(status) >= 500) {
        // Server error – no point retrying with other models immediately
        break;
      }
      continue;
    }
  }
  return getFallbackAnswer(language);
}

function getSystemPrompt(language: string): string {
  const prompts: Record<string, string> = {
    hi: "आप एक सहायक AI हैं जो भारतीय किसानों को सरकारी योजनाओं और वित्तीय सेवाओं के बारे में सरल भाषा में जानकारी देते हैं। जवाब छोटा, स्पष्ट और कार्रवाई योग्य होना चाहिए।",
    en: "You are a helpful AI that explains government schemes and financial services to Indian farmers in simple language. Answers should be short, clear, and actionable and according to the user needs, you can ask the user regarding the info that you need to tell them updated info on their finances.",
    ta: "நீங்கள் இந்திய விவசாயிகளுக்கு அரசாங்க திட்டங்கள் மற்றும் நிதி சேவைகளை எளிய மொழியில் விளக்கும் உதவிகரமான AI ஆவீர்கள். பதில்கள் குறுகியதாகவும், தெளிவாகவும், செயல்படக்கூடியதாகவும் இருக்க வேண்டும்.",
    te: "మీరు భారతీయ రైతులకు ప్రభుత్వ పథకాలు మరియు ఆర్థిక సేవలను సరళమైన భాషలో వివరించే సహాయక AI. సమాధానాలు చిన్నవిగా, స్పష్టంగా మరియు చర్య తీసుకోదగినవిగా ఉండాలి.",
    bn: "আপনি একজন সহায়ক AI যা ভারতীয় কৃষকদের সরকারি প্রকল্প এবং আর্থিক সেবা সম্পর্কে সহজ ভাষায় ব্যাখ্যা করেন। উত্তরগুলি সংক্ষিপ্ত, স্পষ্ট এবং কার্যকরী হওয়া উচিত।",
  };
  return prompts[language] || prompts["en"];
}

export function getFallbackAnswer(language: string): string {
  const answers: Record<string, string> = {
    hi: "मुझे इस बारे में सटीक जानकारी नहीं मिली। कृपया अपने स्थानीय बैंक या कृषि कार्यालय से संपर्क करें। आप हमारी ग्राहक सेवा से भी मदद ले सकते हैं।",
    en: "I could not find specific information about this. Please contact your local bank or agriculture office. You can also get help from our customer service.",
    ta: "இது பற்றி குறிப்பிட்ட தகவல் கிடைக்கவில்லை. உங்கள் உள்ளூர் வங்கி அல்லது விவசாய அலுவலகத்தை தொடர்பு கொள்ளவும். எங்கள் வாடிக்கையாளர் சேவையிலிருந்து உதவி பெறலாம்.",
    te: "దీని గురించి నిర్దిష్ట సమాచారం దొరకలేదు. దయచేసి మీ స్థానిక బ్యాంక్ లేదా వ్యవసాయ కార్యాలయాన్ని సంప్రదించండి. మా కస్టమర్ సేవ నుండి కూడా సహాయం పొందవచ్చు.",
    bn: "এটি সম্পর্কে নির্দিষ্ট তথ্য পাওয়া যায়নি। অনুগ্রহ করে আপনার স্থানীয় ব্যাঙ্ক বা কৃষি অফিসে যোগাযোগ করুন। আপনি আমাদের গ্রাহক সেবা থেকেও সাহায্য নিতে পারেন।",
  };
  return answers[language] || answers["en"];
}

// Evaluate fraud risk using Gemini based on structured signals.
export async function evaluateFraudRiskGemini(signals: {
  amount: number;
  velocityLastHour: number;
  averageAmount: number;
  monthlyIncome: number;
  newBeneficiaryAgeHours?: number;
  beneficiaryVerified?: boolean;
  priorBeneficiaryFlagged?: boolean;
  description?: string;
  categoryHint?: string;
  domainHint?: string;
  language?: string;
}): Promise<{ safe: boolean; riskScore: number; flags: string[]; reasons: string[]; model?: string; raw?: string } | null> {
  if (!genAI) return null;

  const modelNames = [GENERATION_MODEL, "gemini-2.0-flash-exp", "gemini-1.5-flash-latest", "gemini-1.5-flash-8b"];
  const prompt = `You are a banking fraud detection assistant.
You will receive structured transaction and user behavior signals. Output a strict JSON object with:
{"safe": boolean, "riskScore": number (0..1), "flags": string[], "reasons": string[]}

Guidelines:
- riskScore >= 0.7 means high risk (flag transfer), < 0.7 means allow.
- Consider capacity (amount vs monthlyIncome), unusual spikes (amount vs averageAmount), velocity, beneficiary freshness, prior flags.
- If signals indicate agricultural user context, prefer legitimate agricultural expenses; unknown domains or new beneficiaries with large amounts increase risk.
- Keep reasons short.

Signals:\n${JSON.stringify(signals)}`;

  for (const name of modelNames) {
    try {
      const model = genAI.getGenerativeModel({ model: name });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 300 },
      });
      const text = result.response?.text()?.trim();
      if (!text) continue;

      // Try to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const raw = jsonMatch ? jsonMatch[0] : text;
      const parsed = JSON.parse(raw);
      const safe = Boolean(parsed.safe);
      const riskScore = Math.max(0, Math.min(1, Number(parsed.riskScore)));
      const flags = Array.isArray(parsed.flags) ? parsed.flags.map(String) : [];
      const reasons = Array.isArray(parsed.reasons) ? parsed.reasons.map(String) : [];
      return { safe, riskScore, flags, reasons, model: name, raw };
    } catch {
      continue;
    }
  }
  return null;
}
