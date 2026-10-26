"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";

const PLANS = [
  { id: "starter", name: "Starter", price: "$49 a month", credits: "10,000 credits" },
  { id: "growth", name: "Growth", price: "$149 a month", credits: "50,000 credits" },
  { id: "scale", name: "Scale", price: "$399 a month", credits: "200,000 credits" },
];

function PlanPicker() {
  const [plan, setPlan] = React.useState("growth");
  return (
    <>
      <DrawerHeader>
        <DrawerTitle>Choose a plan</DrawerTitle>
        <DrawerDescription>Change it any time; unused credits carry over.</DrawerDescription>
      </DrawerHeader>
      <div role="radiogroup" aria-label="Plan" className="grid gap-1.5 px-5 pb-5">
        {PLANS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={plan === p.id}
            onClick={() => setPlan(p.id)}
            className="flex items-center justify-between rounded-card border border-line px-4 py-3 text-left outline-none transition-colors duration-150 ease-out hover:border-line-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring aria-checked:border-brand motion-reduce:transition-none"
          >
            <span className="grid gap-0.5">
              <span className="text-body-sm text-fg">{p.name}</span>
              <span className="text-caption text-fg-subtle">{p.credits}</span>
            </span>
            <span className="text-body-sm text-fg-muted tabular-nums">{p.price}</span>
          </button>
        ))}
      </div>
      <DrawerFooter>
        <DrawerClose asChild>
          <Button variant="brand">Continue with {PLANS.find((p) => p.id === plan)?.name}</Button>
        </DrawerClose>
        <DrawerClose asChild>
          <Button variant="outline">Cancel</Button>
        </DrawerClose>
      </DrawerFooter>
    </>
  );
}

export function Site() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="pill">See plans</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <PlanPicker />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export function Product() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Change plan</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <PlanPicker />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export function Directions() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {(["left", "right", "top"] as const).map((direction) => (
        <Drawer key={direction} direction={direction}>
          <DrawerTrigger asChild>
            <Button variant="outline" size="sm">
              From the {direction}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Filters</DrawerTitle>
              <DrawerDescription>Show monitors by status and schedule.</DrawerDescription>
            </DrawerHeader>
            <div className="grid gap-1 px-5 pb-5 text-body-sm text-fg-muted">
              <p>Live · 18</p>
              <p>Paused · 3</p>
              <p>Failing · 1</p>
            </div>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  );
}

export function Open() {
  return (
    <Drawer defaultOpen>
      <DrawerTrigger asChild>
        <Button variant="outline">Change plan</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <PlanPicker />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
