import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Product() {
  return (
    <Tabs defaultValue="all" className="w-full max-w-md">
      <TabsList>
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="paused">Paused</TabsTrigger>
      </TabsList>
      <TabsContent value="all" className="text-body-sm text-fg-muted">Every monitor in this workspace.</TabsContent>
      <TabsContent value="active" className="text-body-sm text-fg-muted">Monitors checking on schedule.</TabsContent>
      <TabsContent value="paused" className="text-body-sm text-fg-muted">Monitors you stopped.</TabsContent>
    </Tabs>
  );
}

export function Site() {
  return (
    <Tabs defaultValue="typescript">
      <TabsList variant="pill">
        <TabsTrigger value="typescript">TypeScript</TabsTrigger>
        <TabsTrigger value="python">Python</TabsTrigger>
        <TabsTrigger value="curl">cURL</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
