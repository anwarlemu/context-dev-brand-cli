"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HoldButton } from "@/components/ui/hold-button";

export function Product() {
  const [deleted, setDeleted] = useState(false);
  return <div className="grid justify-items-start gap-3">{deleted ? <><p role="status" className="text-body-sm">Example workspace deleted.</p><Button variant="outline" onClick={() => setDeleted(false)}>Reset example</Button></> : <HoldButton label="Delete workspace" onConfirm={() => setDeleted(true)} />}</div>;
}
