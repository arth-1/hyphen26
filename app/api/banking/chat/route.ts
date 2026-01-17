import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import {
  runBankingAIAgent,
  type ConversationContext,
} from "@/lib/banking/ai-agent";

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { message, conversationId, language = "en" } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server not ready" },
        { status: 500 }
      );
    }

    // Create or fetch conversation
    let activeConversationId = conversationId;

    if (!activeConversationId) {
      const { data: conversation } = await supabaseAdmin
        .from("ai_agent_conversations")
        .insert({
          user_id: authUser.id,
          conversation_title: `Chat - ${new Date().toLocaleString()}`,
          intent: "banking_assistance",
          language,
          channel: "text",
        })
        .select("id")
        .single();

      activeConversationId = conversation?.id;
    }

    // Fetch conversation history
    const { data: messages } = await supabaseAdmin
      .from("ai_agent_messages")
      .select("message_type, content")
      .eq("conversation_id", activeConversationId)
      .order("created_at", { ascending: true });

    // Build conversation context
    const conversationContext: ConversationContext = {
      userId: authUser.id,
      conversationId: activeConversationId || "new",
      language,
      messages: (messages || [])
        .filter((m) => m.message_type === "user_input" || m.message_type === "agent_response")
        .map((m) => ({
          role: m.message_type === "agent_response" ? "assistant" : "user",
          content: m.content || "",
        })),
    };

    // Run AI Agent
    const agentResponse = await runBankingAIAgent(
      conversationContext,
      message
    );

    // Store user message
    await supabaseAdmin.from("ai_agent_messages").insert({
      conversation_id: activeConversationId,
      user_id: authUser.id,
      message_type: "user_input",
      content: message,
      input_method: "text",
    });

    // Store agent response
    await supabaseAdmin.from("ai_agent_messages").insert({
      conversation_id: activeConversationId,
      user_id: authUser.id,
      message_type: "agent_response",
      content: agentResponse.text,
      action_type: agentResponse.toolCalls?.[0]?.name,
      action_parameters:
        agentResponse.toolCalls?.[0]?.args || undefined,
      action_status: "completed",
    });

    // Update conversation
    if (activeConversationId) {
      await supabaseAdmin
        .from("ai_agent_conversations")
        .update({
          total_messages: conversationContext.messages.length + 2,
          updated_at: new Date(),
        })
        .eq("id", activeConversationId);
    }

    return NextResponse.json({
      conversationId: activeConversationId,
      response: agentResponse.text,
      toolCalls: agentResponse.toolCalls,
      turnNumber: agentResponse.turnNumber,
    });
  } catch (error) {
    console.error("Banking chat error:", error);
    return NextResponse.json(
      { error: "Failed to process banking request" },
      { status: 500 }
    );
  }
}
