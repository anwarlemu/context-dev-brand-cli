"use client";

import { useEffect, useState } from "react";
import { SidebarAlertCard } from "@/components/product/sidebar-alert-card";
import { Button } from "@/components/ui/button";
import { ExampleMessage } from "./demo-feedback";

export function Product() {
  const [plan, setPlan] = useState<"ending" | "continuing" | "kept">("ending");
  useEffect(() => {
    if (plan !== "continuing") return;
    const timer = window.setTimeout(() => setPlan("kept"), 1200);
    return () => window.clearTimeout(timer);
  }, [plan]);
  return <div className="grid w-53 gap-1.5">
    <SidebarAlertCard tone="danger" tag="Payment failed" message="Update your card." action="Update payment" onClick={() => { window.location.href = "/preview/settings-page/Billing"; }} />
    {plan === "kept" ? <><ExampleMessage>Example plan kept.</ExampleMessage><Button variant="outline" onClick={() => setPlan("ending")}>Reset example</Button></> : <SidebarAlertCard tone="warning" tag="3 days left" message="Plan ends Oct 20." action="Keep plan" pendingAction="Continuing..." pending={plan === "continuing"} aria-label="Keep plan, scheduled to end October 20" onClick={() => setPlan("continuing")} />}
    <SidebarAlertCard tone="warning" icon="external" tag="Running low" remainingCredits={124} action="Upgrade" onClick={() => { window.location.href = "/preview/settings-page/Billing"; }} />
    <SidebarAlertCard tone="neutral" tag="Free plan" action="Subscribe" onClick={() => { window.location.href = "/preview/settings-page/Billing"; }} />
  </div>;
}
