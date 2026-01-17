import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseAdmin } from "../supabase";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : undefined;

// =============================================
// TYPES
// =============================================

export interface BankingToolCall {
  name: string;
  args: Record<string, unknown>;
}

export interface AgentResponse {
  text: string;
  toolCalls?: BankingToolCall[];
  conversationId: string;
  turnNumber: number;
}

export interface ConversationContext {
  userId: string;
  conversationId: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  language: string;
  userProfile?: {
    creditScore: number;
    monthlyIncome: number;
    kycStatus: string;
    accounts: Array<{ id: string; balance: number; type: string }>;
  };
}

// =============================================
// BANKING TOOLS SCHEMA
// =============================================

const BANKING_TOOLS = [
  {
    name: "check_eligibility",
    description:
      "Check user eligibility for loans, FDs, or other products based on credit score, income, and KYC status",
    inputSchema: {
      type: "object",
      properties: {
        product_type: {
          type: "string",
          enum: ["fd", "rd", "personal_loan", "business_loan", "auto_loan"],
          description: "Type of product to check eligibility for",
        },
        amount: {
          type: "number",
          description: "Amount in INR",
        },
        tenure_months: {
          type: "number",
          description: "Tenure in months (for loans and RDs)",
        },
      },
      required: ["product_type"],
    },
  },
  {
    name: "create_fixed_deposit",
    description: "Create a new fixed deposit account",
    inputSchema: {
      type: "object",
      properties: {
        amount: {
          type: "number",
          description: "Principal amount in INR",
        },
        tenure_days: {
          type: "number",
          description: "Tenure in days (365 to 1825 days)",
        },
        account_id: {
          type: "string",
          description: "Account ID to debit from",
        },
      },
      required: ["amount", "tenure_days", "account_id"],
    },
  },
  {
    name: "get_fd_rates",
    description: "Get current FD rates for different tenures",
    inputSchema: {
      type: "object",
      properties: {
        tenure_days: {
          type: "number",
          description: "Optional: get rate for specific tenure",
        },
      },
    },
  },
  {
    name: "apply_for_loan",
    description: "Apply for a loan with specified amount, type, and purpose",
    inputSchema: {
      type: "object",
      properties: {
        loan_type: {
          type: "string",
          enum: ["personal", "auto", "home", "education", "business"],
          description: "Type of loan",
        },
        amount: {
          type: "number",
          description: "Loan amount in INR",
        },
        tenure_months: {
          type: "number",
          description: "Loan tenure in months",
        },
        reason: {
          type: "string",
          description: "Purpose of the loan",
        },
      },
      required: ["loan_type", "amount", "tenure_months", "reason"],
    },
  },
  {
    name: "create_recurring_deposit",
    description: "Create a recurring deposit (RD) plan with auto-debit",
    inputSchema: {
      type: "object",
      properties: {
        monthly_amount: {
          type: "number",
          description: "Monthly deposit amount in INR",
        },
        tenure_months: {
          type: "number",
          description: "Total tenure in months",
        },
        account_id: {
          type: "string",
          description: "Account ID for auto-debit",
        },
        auto_debit_day: {
          type: "number",
          description: "Day of month for auto-debit (1-28)",
        },
      },
      required: ["monthly_amount", "tenure_months", "account_id"],
    },
  },
  {
    name: "get_investment_products",
    description: "Get available investment products based on user profile and requirements",
    inputSchema: {
      type: "object",
      properties: {
        investment_amount: {
          type: "number",
          description: "Amount to invest in INR",
        },
        risk_tolerance: {
          type: "string",
          enum: ["low", "medium", "high"],
          description: "Risk tolerance level",
        },
        tenure_months: {
          type: "number",
          description: "Investment horizon in months",
        },
      },
      required: ["investment_amount"],
    },
  },
  {
    name: "get_user_accounts",
    description: "Get list of user's bank accounts with balances",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_user_loans",
    description: "Get list of user's active loans and loan applications",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_user_fds",
    description: "Get list of user's fixed deposits and maturity details",
    inputSchema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["active", "matured", "all"],
          description: "Filter by status",
        },
      },
    },
  },
  {
    name: "get_portfolio_recommendation",
    description: "Get personalized portfolio recommendation based on user profile",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "confirm_action",
    description: "Confirm/approve an action after user verification",
    inputSchema: {
      type: "object",
      properties: {
        action_id: {
          type: "string",
          description: "ID of the action to confirm",
        },
        confirmed: {
          type: "boolean",
          description: "Whether user confirmed or rejected",
        },
      },
      required: ["action_id", "confirmed"],
    },
  },
];

// =============================================
// SYSTEM PROMPT
// =============================================

function getSystemPrompt(language: string): string {
  // Use English only for system instruction to avoid Gemini API encoding issues
  // Language-specific responses are handled in conversation flow
  return `You are an intelligent banking AI advisor. Your role is to help users with: (1) Fixed Deposits (FD) - Create, explain rates, calculate maturity amounts (2) Loans - Application, eligibility check, EMI calculation, approval (3) Recurring Deposits (RD) - Monthly savings plans with auto-debit (4) Portfolio Recommendations - Personalized investment advice (5) Insurance and Investments - Product recommendations. Guidelines: Always use simple, clear language in the user's preferred language. For amounts greater than 1 lakh, request OTP verification. Repeat all terms before user confirms. Escalate to manual review if uncertain. Always confirm transaction details before execution. Maintain conversation context across turns. If user changes mind, allow cancellation with explanation.`;
}

// =============================================
// TOOL IMPLEMENTATIONS
// =============================================

async function checkEligibility(
  userId: string,
  params: Record<string, unknown>
): Promise<unknown> {
  const { product_type, amount, tenure_months } = params;

  // Fetch user profile
  if (!supabaseAdmin) {
    return { error: "Database not initialized" };
  }

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("soft_credit_score")
    .eq("id", userId)
    .single();

  const creditScore = user?.soft_credit_score || 600;
  const monthlyIncome = 50000; // Mock: fetch from accounts table

  let eligible = false;
  let reason = "";
  let maxAmount = 0;

  switch (product_type) {
    case "fd":
      eligible = creditScore >= 300; // Very low threshold
      reason = eligible
        ? "आप FD के लिए पात्र हैं"
        : "आपको FD के लिए KYC पूरा करना चाहिए";
      maxAmount = 10000000; // ₹1 crore max
      break;

    case "personal_loan":
      eligible = creditScore >= 650;
      maxAmount = Math.min(500000, monthlyIncome * 12);
      reason = eligible
        ? `आप ${maxAmount} तक के ऋण के लिए पात्र हैं`
        : "क्रेडिट स्कोर बहुत कम है";
      break;

    case "business_loan":
      eligible = creditScore >= 700;
      maxAmount = Math.min(2000000, monthlyIncome * 24);
      reason = eligible
        ? `आप ${maxAmount} तक के ऋण के लिए पात्र हैं`
        : "व्यावसायिक ऋण के लिए उच्च स्कोर की आवश्यकता है";
      break;

    case "rd":
      eligible = true;
      reason = "आप RD के लिए पात्र हैं";
      maxAmount = monthlyIncome / 2; // Max 50% of monthly income
      break;
  }

  return {
    eligible,
    reason,
    creditScore,
    monthlyIncome,
    maxAmount,
    maxLoanAmount: maxAmount,
    recommendedRate: creditScore >= 700 ? 10.5 : 12.5, // Mock rates
  };
}

async function createFixedDeposit(
  userId: string,
  params: Record<string, unknown>
): Promise<unknown> {
  const { amount, tenure_days, account_id } = params;

  // Calculate maturity amount
  const rate = (tenure_days as number) <= 365 ? 6.5 : (tenure_days as number) <= 730 ? 7.0 : 7.5; // Mock rates
  const years = (tenure_days as number) / 365;
  const maturityAmount = Number(amount) * Math.pow(1 + rate / 100, years);

  const fdId = `FD-${Date.now()}`;

  return {
    success: true,
    fdId,
    amount,
    tenure_days,
    rate: `${rate}% p.a.`,
    maturityAmount: Math.round(maturityAmount * 100) / 100,
    maturityDate: new Date(Date.now() + (tenure_days as number) * 24 * 60 * 60 * 1000),
    message: `आपका FD सफलतापूर्वक बनाया गया है। परिपक्व राशि: ₹${Math.round(maturityAmount)}`,
  };
}

async function getFDRates(): Promise<unknown> {
  return {
    rates: [
      { tenure: "1 Year (365 days)", rate: 6.5 },
      { tenure: "2 Years (730 days)", rate: 7.0 },
      { tenure: "3 Years (1095 days)", rate: 7.5 },
      { tenure: "5 Years (1825 days)", rate: 7.75 },
    ],
    bestRate: 7.75,
    note: "Rates are indicative and subject to change",
  };
}

async function applyForLoan(
  userId: string,
  params: Record<string, unknown>
): Promise<unknown> {
  const { loan_type, amount, tenure_months, reason } = params;

  // Mock rate assignment
  const rateMap: Record<string, number> = {
    personal: 12.5,
    auto: 9.5,
    home: 8.5,
    education: 7.0,
    business: 11.0,
  };

  const rate = rateMap[loan_type as string] || 12.0;
  const monthlyRate = rate / 100 / 12;
  const emi =
    (Number(amount) *
      monthlyRate *
      Math.pow(1 + monthlyRate, Number(tenure_months))) /
    (Math.pow(1 + monthlyRate, Number(tenure_months)) - 1);

  const loanId = `LOAN-${Date.now()}`;

  return {
    success: true,
    loanId,
    status: "application_received",
    amount,
    rate: `${rate}% p.a.`,
    tenure_months,
    monthlyEMI: Math.round(emi),
    totalRepayment: Math.round(emi * Number(tenure_months)),
    processingFee: Math.round(Number(amount) * 0.01), // 1% fee
    message: `आपका ऋण आवेदन प्राप्त हुआ। EMI: ₹${Math.round(emi)}/माह`,
    nextSteps: [
      "अपनी आय का प्रमाण अपलोड करें",
      "KYC दस्तावेज़ सत्यापित करें",
      "उधारदाता की अनुमोदन प्रतीक्षा करें",
    ],
  };
}

async function createRecurringDeposit(
  userId: string,
  params: Record<string, unknown>
): Promise<unknown> {
  const { monthly_amount, tenure_months, account_id, auto_debit_day = 1 } =
    params;

  const rate = 5.5; // Mock rate
  const totalInvested = Number(monthly_amount) * Number(tenure_months);
  const interest =
    (totalInvested *
      rate *
      (Number(tenure_months) + 1) *
      (1 / 100)) /
    24; // Simple interest approximation
  const maturityAmount = totalInvested + interest;

  const rdId = `RD-${Date.now()}`;

  return {
    success: true,
    rdId,
    monthlyAmount: monthly_amount,
    tenure: tenure_months,
    rate: `${rate}% p.a.`,
    totalInvested: totalInvested,
    maturityAmount: Math.round(maturityAmount),
    interestEarned: Math.round(interest),
    autoDebitDay: auto_debit_day,
    startDate: new Date(),
    maturityDate: new Date(Date.now() + Number(tenure_months) * 30 * 24 * 60 * 60 * 1000),
    message: `आपका RD सफलतापूर्वक सेट किया गया है। हर माह ${auto_debit_day} को ₹${monthly_amount} स्वचालित रूप से डेबिट होंगे।`,
  };
}

async function getInvestmentProducts(
  userId: string,
  params: Record<string, unknown>
): Promise<unknown> {
  const { investment_amount, risk_tolerance, tenure_months } = params;

  const products = [
    {
      id: "fd_3yr",
      name: "Fixed Deposit 3 Years",
      type: "fd",
      risk: "low",
      rate: 7.5,
      allocationPercent: 30,
    },
    {
      id: "rd_36m",
      name: "Recurring Deposit 36 Months",
      type: "rd",
      risk: "low",
      rate: 5.5,
      allocationPercent: 25,
    },
    {
      id: "mf_equity",
      name: "Equity Mutual Fund SIP",
      type: "mf",
      risk: "high",
      rate: 12,
      allocationPercent: 25,
    },
    {
      id: "bonds",
      name: "Government Bonds",
      type: "bonds",
      risk: "low",
      rate: 6.5,
      allocationPercent: 20,
    },
  ];

  const recommended =
    risk_tolerance === "low"
      ? products.filter((p) => p.risk === "low")
      : risk_tolerance === "medium"
        ? products
        : products.filter((p) => p.risk !== "low");

  return {
    products: recommended,
    totalAllocation: recommended.reduce((sum, p) => sum + p.allocationPercent, 0),
    recommendation:
      risk_tolerance === "low"
        ? "आपके लिए सुरक्षित विकल्पों की सलाह दी जा रही है"
        : "आपकी प्रोफ़ाइल के लिए संतुलित पोर्टफोलियो की सलाह दी जा रही है",
  };
}

async function getUserAccounts(userId: string): Promise<unknown> {
  // Mock accounts data
  return {
    accounts: [
      {
        id: "acc-1",
        type: "savings",
        number: "ADAPT000100001",
        balance: 150000,
      },
      {
        id: "acc-2",
        type: "salary",
        number: "ADAPT000100002",
        balance: 250000,
      },
    ],
  };
}

async function getUserFDs(
  userId: string,
  params: Record<string, unknown>
): Promise<unknown> {
  const { status = "all" } = params;

  // Mock FD data
  return {
    fds: [
      {
        id: "fd-1",
        amount: 100000,
        rate: 7.0,
        status: "active",
        maturityDate: new Date("2026-12-31"),
        maturityAmount: 121051,
      },
    ],
    totalAmount: 100000,
    totalMaturityAmount: 121051,
  };
}

async function getPortfolioRecommendation(
  userId: string
): Promise<unknown> {
  return {
    recommendation: {
      emergency_fund: {
        amount: 200000,
        allocation: "Savings Account",
        description: "3 months of expenses",
      },
      fixed_income: {
        amount: 300000,
        allocation: "FD 3 years @ 7.5%",
        description: "₹57,875 interest",
      },
      growth: {
        amount: 200000,
        allocation: "Equity Mutual Fund SIP ₹5K/month",
        description: "Long-term wealth creation",
      },
      protection: {
        amount: "Premium only",
        allocation: "Term Insurance ₹50L cover",
        description: "Family protection",
      },
    },
    message:
      "यह आपकी प्रोफ़ाइल के लिए संतुलित पोर्टफोलियो है। क्या आप शुरू करना चाहते हैं?",
  };
}

// =============================================
// TOOL EXECUTOR
// =============================================

async function executeTool(
  toolName: string,
  toolArgs: Record<string, unknown>,
  userId: string
): Promise<unknown> {
  try {
    switch (toolName) {
      case "check_eligibility":
        return await checkEligibility(userId, toolArgs);
      case "create_fixed_deposit":
        return await createFixedDeposit(userId, toolArgs);
      case "get_fd_rates":
        return await getFDRates();
      case "apply_for_loan":
        return await applyForLoan(userId, toolArgs);
      case "create_recurring_deposit":
        return await createRecurringDeposit(userId, toolArgs);
      case "get_investment_products":
        return await getInvestmentProducts(userId, toolArgs);
      case "get_user_accounts":
        return await getUserAccounts(userId);
      case "get_user_fds":
        return await getUserFDs(userId, toolArgs);
      case "get_portfolio_recommendation":
        return await getPortfolioRecommendation(userId);
      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  } catch (error) {
    return { error: String(error) };
  }
}

// =============================================
// MAIN AI AGENT FUNCTION
// =============================================

export async function runBankingAIAgent(
  context: ConversationContext,
  userMessage: string
): Promise<AgentResponse> {
  if (!genAI) {
    return {
      text: "AI service is not available. Please try again later.",
      conversationId: context.conversationId,
      turnNumber: context.messages.length,
    };
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // Prepare system prompt
  const systemPrompt = getSystemPrompt(context.language);

  // Format messages for API
  let formattedMessages = context.messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  // If this is the first message, prepend system instruction as initial user context
  if (formattedMessages.length === 0) {
    formattedMessages.push({
      role: "user",
      parts: [{ text: systemPrompt }],
    });
    formattedMessages.push({
      role: "model",
      parts: [{ text: "Understood. I'm ready to assist you with your banking needs." }],
    });
  }

  // Add language preference to user message
  const languageInstruction = context.language === 'hi' 
    ? '\n[Please respond entirely in Hindi]' 
    : '';
  const enhancedMessage = userMessage + languageInstruction;

  // Add new user message
  formattedMessages.push({
    role: "user",
    parts: [{ text: enhancedMessage }],
  });

  try {
    // Start multi-turn conversation without systemInstruction parameter
    const chat = model.startChat({
      history: formattedMessages.slice(0, -1), // Exclude current message from history
    });

    // Send message with tools
    const response = await chat.sendMessage(enhancedMessage, {
      tools: [{ functionDeclarations: BANKING_TOOLS }],
    } as any);

    let assistantResponse = "";
    let toolCalls: BankingToolCall[] = [];

    // Process response content (SDK returns candidates array)
    const resp = (response as any).response;
    const responseContent = Array.isArray(resp?.candidates)
      ? resp.candidates[0]?.content?.parts ?? []
      : [];

    // Fallback: use plain text if parts are missing
    if (responseContent.length === 0 && typeof resp?.text === "function") {
      assistantResponse += resp.text();
    }

    for (const part of responseContent) {
      if (part.text) {
        assistantResponse += part.text;
      }

      if ((part as any).functionCall) {
        const functionCall = (part as any).functionCall;
        toolCalls.push({
          name: functionCall.name,
          args: functionCall.args,
        });
      }
    }

    // Execute tools if needed
    let toolResults = "";
    for (const toolCall of toolCalls) {
      const result = await executeTool(
        toolCall.name,
        toolCall.args,
        context.userId
      );
      toolResults += `\n[${toolCall.name} Result]: ${JSON.stringify(result)}`;
    }

    // If tools were called, get final response
    if (toolCalls.length > 0) {
      const finalResponse = await chat.sendMessage(toolResults);
      assistantResponse = finalResponse.response.text();
    }

    return {
      text: assistantResponse || "I'll help you with your banking needs. What would you like to do?",
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      conversationId: context.conversationId,
      turnNumber: context.messages.length + 1,
    };
  } catch (error) {
    console.error("Banking AI Agent Error:", error);
    return {
      text: `I encountered an error: ${String(error)}. Please try again.`,
      conversationId: context.conversationId,
      turnNumber: context.messages.length + 1,
    };
  }
}

// =============================================
// HELPER FUNCTIONS
// =============================================

export function parseAmount(text: string): number | null {
  // Extract numbers like "50 thousand", "2 lakhs", "one crore", etc.
  const numberMap: Record<string, number> = {
    thousand: 1000,
    lakh: 100000,
    crore: 10000000,
    hundred: 100,
  };

  let value: number | null = null;
  for (const [word, multiplier] of Object.entries(numberMap)) {
    if (text.toLowerCase().includes(word)) {
      const num = parseInt(text.match(/\d+/)?.[0] || "0");
      if (num > 0) value = num * multiplier;
    }
  }

  // Also try direct number parsing
  if (value === null) {
    const directNum = parseInt(text.match(/\d+/)?.[0] || "0");
    if (directNum > 0) value = directNum;
  }

  return value;
}

export function formatCurrency(amount: number, language = "en"): string {
  if (language === "hi") {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} करोड़`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} लाख`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(2)} हज़ार`;
    }
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function calculateEMI(
  principal: number,
  rate: number,
  months: number
): number {
  const monthlyRate = rate / 100 / 12;
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);
  return Math.round(emi);
}
