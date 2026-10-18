"use client";

import { useState } from "react";
import { SidebarAlertCard } from "@/components/product/sidebar-alert-card";
import { Button } from "@/components/ui/button";
import { ExampleMessage } from "./demo-feedback";

export function Product() {
  const [resumed, setResumed] = useState(false);
  return <div className="grid w-53 gap-3">
    <SidebarAlertCard tone="danger" tag="Last payment failed" message="Your payment method is failing." action="Fix issue" onClick={() => { window.location.href = "/preview/settings-page/Billing"; }} />
    {resumed ? <><ExampleMessage>Example plan resumed.</ExampleMessage><Button variant="outline" onClick={() => setResumed(false)}>Reset example</Button></> : <SidebarAlertCard tone="warning" tag="3 days left" message="Your plan ends on Oct 20." action="Resume plan" onClick={() => setResumed(true)} />}
  </div>;
}
