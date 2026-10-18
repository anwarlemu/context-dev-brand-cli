import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function Product() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>API usage</CardTitle>
        <CardDescription>Requests this billing period.</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm" asChild><a href="/preview/usage-card/Product">Details</a></Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="font-data text-h4 tabular-nums">48,210</p>
      </CardContent>
    </Card>
  );
}

export function Site() {
  return (
    <Card variant="ring" className="w-full max-w-md">
      <CardTitle className="text-h4">Search</CardTitle>
      <CardDescription className="text-body">Search the web or the news and get ranked results with clean page content, not just links.</CardDescription>
    </Card>
  );
}
