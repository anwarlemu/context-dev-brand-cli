import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Product() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Tabs defaultValue="all">
        <TabsList aria-label="Monitors">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="text-body-sm text-fg-muted">Every monitor in this workspace.</TabsContent>
        <TabsContent value="active" className="text-body-sm text-fg-muted">Monitors checking on schedule.</TabsContent>
        <TabsContent value="paused" className="text-body-sm text-fg-muted">Monitors you stopped.</TabsContent>
      </Tabs>
      <Tabs defaultValue="json">
        <TabsList variant="segmented" aria-label="Output">
          <TabsTrigger value="json">JSON</TabsTrigger>
          <TabsTrigger value="markdown">Markdown</TabsTrigger>
          <TabsTrigger value="html">HTML</TabsTrigger>
        </TabsList>
      </Tabs>
      <Tabs defaultValue="day">
        <TabsList size="sm" aria-label="Period">
          <TabsTrigger value="day">Day</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

export function Site() {
  return (
    <Tabs defaultValue="typescript">
      <TabsList variant="pill" aria-label="Language">
        <TabsTrigger value="typescript">TypeScript</TabsTrigger>
        <TabsTrigger value="python">Python</TabsTrigger>
        <TabsTrigger value="curl">cURL</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
