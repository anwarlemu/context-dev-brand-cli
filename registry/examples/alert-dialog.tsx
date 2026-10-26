"use client";

import * as React from "react";
import { KeyRound, Trash2 } from "lucide-react";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function Site() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="pill">Upgrade to Scale</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Switch to the Scale plan?</AlertDialogTitle>
          <AlertDialogDescription>Your card is charged $399 today, prorated for this month. Unused credits carry over.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Not now</AlertDialogCancel>
          <AlertDialogAction>Upgrade</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function Product() {
  const [revoked, setRevoked] = React.useState(false);
  return (
    <div className="grid justify-items-center gap-3">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" disabled={revoked}>
            Revoke key
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke the Production key?</AlertDialogTitle>
            <AlertDialogDescription>Requests signed with it fail at once. Apps using it stop working until you give them a new key.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => setRevoked(true)}>
              Revoke key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <p role="status" className="text-body-sm text-fg-muted">
        {revoked ? "The Production key is revoked in this example." : "Production key, created Oct 2"}
      </p>
    </div>
  );
}

export function Small() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <Trash2 strokeWidth={1.5} />
          Delete monitor
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2 strokeWidth={1.5} />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete this monitor?</AlertDialogTitle>
          <AlertDialogDescription>Its history of 412 checks is deleted with it.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function Open() {
  return (
    <AlertDialog defaultOpen>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <KeyRound strokeWidth={1.5} />
          Rotate key
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Rotate the Staging key?</AlertDialogTitle>
          <AlertDialogDescription>The old key keeps working for 24 hours, then stops.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Rotate key</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
