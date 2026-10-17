"use client";

import { Bot, MousePointer2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { AgentSetupWindow, SetupComment, SetupLine, SetupPrompt, SetupUrl } from "@/components/site/agent-setup-window";

const PROMPT_SEGMENTS = [
  { text: "Signup for an account & get API key with " },
  { text: "context.dev/auth.md", url: true },
  { text: ", then follow " },
  { text: "docs.context.dev/agent-quickstart", url: true },
  { text: " to integrate into the codebase" },
];
const PROMPT = PROMPT_SEGMENTS.map((s) => s.text).join("");
const MCP_URL = "https://mcp.context.dev/mcp";
const MCP_COMMAND = `claude mcp add --transport http --scope user context ${MCP_URL}`;
const CLI_COMMANDS = ["export CONTEXT_DEV_API_KEY=your_api_key", "context-dev web web-scrape-md --url https://example.com"];

export function Site() {
  return (
    <div className="w-full max-w-xl rounded-card bg-ring-tint p-2">
      <AgentSetupWindow
        agentPrompt={PROMPT}
        // The app's own agent logos go here (an <img> or an svg); these icons stand in for them.
        agents={[
          { name: "Claude Code", icon: <Sparkles /> },
          { name: "Codex", icon: <Bot /> },
          { name: "Cursor", icon: <MousePointer2 /> },
          { name: "Hermes" },
        ]}
        onCopy={({ agent, method }) => toast.success(agent ? `Prompt copied. Paste it into ${agent}.` : method === "prompt" ? "Prompt copied. Paste it into your agent." : "Copied. Run it in your terminal.")}
        methods={[
          { value: "prompt", label: "Prompt", copyText: PROMPT, content: <SetupPrompt segments={PROMPT_SEGMENTS} /> },
          {
            value: "mcp",
            label: "MCP",
            copyText: MCP_COMMAND,
            content: (
              <>
                <SetupComment order={0}># Claude Code</SetupComment>
                <SetupLine order={1}>
                  claude mcp add --transport http --scope user context <SetupUrl>{MCP_URL}</SetupUrl>
                </SetupLine>
                <SetupComment order={2}>
                  # Any other MCP client: add <SetupUrl>{MCP_URL}</SetupUrl>
                </SetupComment>
              </>
            ),
          },
          {
            value: "cli",
            label: "CLI",
            copyText: CLI_COMMANDS.join("\n"),
            content: (
              <>
                <SetupComment order={0}>
                  # Install: <SetupUrl>docs.context.dev/install-cli</SetupUrl>
                </SetupComment>
                {CLI_COMMANDS.map((command, i) => (
                  <SetupLine key={command} order={i + 1}>
                    {command}
                  </SetupLine>
                ))}
              </>
            ),
          },
        ]}
      />
    </div>
  );
}
