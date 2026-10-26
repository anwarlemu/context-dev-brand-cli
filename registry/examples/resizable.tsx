import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

export function Site() {
  return (
    <ResizablePanelGroup direction="horizontal" className="h-56 max-w-xl overflow-hidden rounded-card border border-line bg-surface">
      <ResizablePanel defaultSize={45} minSize={25} className="p-4">
        <p className="text-caption text-fg-subtle">Request</p>
        <p className="mt-1 font-mono text-caption text-fg">GET /v1/brand/retrieve?domain=stripe.com</p>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={55} minSize={25} className="p-4">
        <p className="text-caption text-fg-subtle">Response</p>
        <p className="mt-1 font-mono text-caption text-fg">{`{ "title": "Stripe", "colors": [...] }`}</p>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export function Product() {
  return (
    <ResizablePanelGroup direction="horizontal" className="h-64 max-w-2xl overflow-hidden rounded-card bg-surface shadow-card">
      <ResizablePanel defaultSize={35} minSize={20} className="p-4">
        <p className="text-body-sm text-fg">Parameters</p>
        <p className="mt-1 text-caption text-fg-subtle">domain, fields, format</p>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={65} minSize={30}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={60} minSize={20} className="p-4">
            <p className="text-body-sm text-fg">Result</p>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={40} minSize={20} className="p-4">
            <p className="text-body-sm text-fg">Headers</p>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
