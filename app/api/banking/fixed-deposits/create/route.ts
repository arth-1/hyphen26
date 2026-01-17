import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

// Create Fixed Deposit
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, tenure_days, account_id, conversation_id } = body;

    if (!amount || !tenure_days || !account_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not ready" }, { status: 500 });
    }

    // Validate account ownership
    const { data: account } = await supabaseAdmin
      .from("accounts")
      .select("balance")
      .eq("id", account_id)
      .eq("user_id", authUser.id)
      .single();

    if (!account) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }

    if (account.balance < amount) {
      return NextResponse.json(
        { error: "Insufficient funds" },
        { status: 400 }
      );
    }

    // Calculate maturity
    const rate = tenure_days <= 365 ? 6.5 : tenure_days <= 730 ? 7.0 : 7.5;
    const years = tenure_days / 365;
    const maturityAmount =
      Number(amount) * Math.pow(1 + rate / 100, years);
    const maturityDate = new Date(
      Date.now() + tenure_days * 24 * 60 * 60 * 1000
    );

    // Create FD
    const { data: fd, error } = await supabaseAdmin
      .from("fixed_deposits")
      .insert({
        user_id: authUser.id,
        account_id,
        principal_amount: amount,
        interest_rate: rate,
        tenure_days,
        maturity_amount: Math.round(maturityAmount * 100) / 100,
        status: "active",
        maturity_date: maturityDate,
        created_via_agent: !!conversation_id,
        agent_conversation_id: conversation_id,
        agent_metadata: { initiated_at: new Date() },
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Debit from account
    await supabaseAdmin
      .from("accounts")
      .update({
        balance: Number(account.balance) - Number(amount),
      })
      .eq("id", account_id);

    // Log transaction
    await supabaseAdmin.from("banking_audit_log").insert({
      user_id: authUser.id,
      action_type: "create_fd",
      resource_type: "fixed_deposit",
      resource_id: fd.id,
      initiated_by: conversation_id ? "ai_agent" : "user",
      conversation_id,
      amount,
      status: "success",
      details: {
        rate,
        tenure_days,
        maturity_amount: fd.maturity_amount,
      },
    });

    return NextResponse.json({
      success: true,
      fd: {
        id: fd.id,
        principal: fd.principal_amount,
        rate: `${rate}% p.a.`,
        tenure: `${tenure_days} days`,
        maturityAmount: fd.maturity_amount,
        maturityDate,
      },
      message: `FD created successfully! Maturity amount: ₹${fd.maturity_amount}`,
    });
  } catch (error) {
    console.error("FD creation error:", error);
    return NextResponse.json(
      { error: "Failed to create FD" },
      { status: 500 }
    );
  }
}
