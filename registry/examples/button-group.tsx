"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";

// On the docs: an install command with its copy button.
export function Site() {
  const [copied, setCopied] = useState(false);
  return (
    <ButtonGroup className="w-full max-w-md">
      <ButtonGroupText className="font-mono">$</ButtonGroupText>
      <Input readOnly value="npm install @context-dev/sdk" aria-label="Install command" className="font-mono" />
      <Button aria-label={copied ? "Copied" : "Copy command"} onClick={() => navigator.clipboard.writeText("npm install @context-dev/sdk").then(() => setCopied(true), () => undefined)}>
        {copied ? <Check /> : <Copy />}
      </Button>
    </ButtonGroup>
  );
}

// In the product: a pager, a split action, nested groups and a vertical stack.
export function Product() {
  const [page, setPage] = useState(2);
  return (
    <div className="grid gap-5">
      <ButtonGroup aria-label="Pages">
        <Button size="sm" aria-label="Previous page" onClick={() => setPage((p) => Math.max(1, p - 1))}>
          <ChevronLeft />
        </Button>
        <ButtonGroupText className="h-8 tabular-nums">Page {page} of 9</ButtonGroupText>
        <Button size="sm" aria-label="Next page" onClick={() => setPage((p) => Math.min(9, p + 1))}>
          <ChevronRight />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="primary" size="sm">Run crawl</Button>
        <ButtonGroupSeparator />
        <Button variant="primary" size="sm" aria-label="More run options">
          <ChevronDown />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <ButtonGroup>
          <Button size="sm">Markdown</Button>
          <Button size="sm">HTML</Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button size="sm">Export</Button>
        </ButtonGroup>
      </ButtonGroup>
      <ButtonGroup orientation="vertical" className="w-40">
        <Button size="sm">Scrape</Button>
        <Button size="sm">Search</Button>
        <Button size="sm">Crawl</Button>
      </ButtonGroup>
    </div>
  );
}
