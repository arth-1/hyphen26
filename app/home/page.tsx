"use client";

import React from "react";
import AdaptDashboard from "@/components/AdaptDashboard";
import { useSupabaseUser } from "@/lib/useSupabaseUser";

export default function HomePage() {
  const { user } = useSupabaseUser();
  return (
    <AdaptDashboard
      balance="₹ 45,230.50"
      userName={user?.email?.split("@")[0] || "User"}
    />
  );
}
