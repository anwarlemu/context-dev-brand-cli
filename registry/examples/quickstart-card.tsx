"use client";

import { useState } from "react";

import { CardLink } from "@/components/product/glyph-card";
import { CopyPill, KeyField, QuickstartCard, QuickstartStep, SnippetBox } from "@/components/product/quickstart-card";

const KEY = "ctx_live_9f2c41b7e0a84d6c3b5e";

export function Product() {
  const [method, setMethod] = useState<"mcp" | "cli">("mcp");
  return (
    <div className="h-[30rem] w-full max-w-md">
      <QuickstartCard aside={<CardLink href="#">Manage keys</CardLink>}>
        <QuickstartStep number={1} title="Copy your API key">
          <KeyField secret={KEY} name="Default" />
        </QuickstartStep>
        <QuickstartStep number={2} title="Onboard your agent">
          <SnippetBox
            label="Setup method"
            value={method}
            onValueChange={setMethod}
            snippets={[
              { value: "mcp", label: "MCP", code: "claude mcp add --transport http context-dev https://mcp.context.dev/mcp", note: "Sign in when the browser opens." },
              { value: "cli", label: "CLI", code: "npm i -g @context-dev/cli && context login" },
            ]}
          />
        </QuickstartStep>
        <QuickstartStep number={3} title="Prompt" aside={<CopyPill value="Use the context-dev MCP server for live web data." label="Copy prompt" />}>
          <p className="rounded-control border border-line px-3 py-2.5 text-body-sm leading-relaxed text-fg">Use the context-dev MCP server for live web data.</p>
        </QuickstartStep>
      </QuickstartCard>
    </div>
  );
}
