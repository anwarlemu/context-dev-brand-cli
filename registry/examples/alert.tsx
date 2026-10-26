import { Info, KeyRound, OctagonAlert, TriangleAlert } from "lucide-react";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function Site() {
  return (
    <div className="grid w-full max-w-xl gap-3">
      <Alert variant="info">
        <Info strokeWidth={1.5} />
        <AlertTitle>Parse is now generally available</AlertTitle>
        <AlertDescription>Turn any page into clean markdown or JSON with one call. Existing keys work without changes.</AlertDescription>
      </Alert>
      <Alert>
        <KeyRound strokeWidth={1.5} />
        <AlertTitle>Keys stay on your server</AlertTitle>
        <AlertDescription>Call the API from your backend; never ship a key in a browser bundle.</AlertDescription>
      </Alert>
    </div>
  );
}

export function Product() {
  return (
    <div className="grid w-full max-w-2xl gap-3">
      <Alert variant="warning">
        <TriangleAlert strokeWidth={1.5} />
        <AlertTitle>You have used 92% of this month's credits</AlertTitle>
        <AlertDescription>Calls stop when credits run out. Upgrade, or wait until the plan renews on Nov 1.</AlertDescription>
        <AlertAction>
          <Button variant="brand" size="sm">Upgrade</Button>
        </AlertAction>
      </Alert>
      <Alert variant="destructive">
        <OctagonAlert strokeWidth={1.5} />
        <AlertTitle>Crawl stopped at 1,240 pages</AlertTitle>
        <AlertDescription>docs.example.com returned 429 for 3 minutes. Retry with a lower rate, or contact support.</AlertDescription>
        <AlertAction>
          <Button size="sm">Retry</Button>
        </AlertAction>
      </Alert>
      <Alert variant="info">
        <Info strokeWidth={1.5} />
        <AlertTitle>Webhooks now include the request ID</AlertTitle>
      </Alert>
    </div>
  );
}

export function TitleOnly() {
  return (
    <div className="grid w-full max-w-xl gap-3">
      <Alert>
        <AlertTitle>Monitors check every 15 minutes on the Starter plan.</AlertTitle>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>This key was revoked on Oct 2</AlertTitle>
        <AlertDescription>Requests with it return 401. Create a new key in API keys.</AlertDescription>
      </Alert>
    </div>
  );
}
