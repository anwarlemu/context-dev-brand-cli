"use client";

import * as React from "react";
import { Copy, Download, Play, RotateCcw } from "lucide-react";

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";

function Bar({ defaultValue }: { defaultValue?: string }) {
  const [wrap, setWrap] = React.useState(true);
  const [format, setFormat] = React.useState("json");
  return (
    <Menubar defaultValue={defaultValue}>
      <MenubarMenu value="request">
        <MenubarTrigger>Request</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            <Play strokeWidth={1.5} />
            Run
            <MenubarShortcut>⌘↵</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            <RotateCcw strokeWidth={1.5} />
            Reset parameters
          </MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Copy as</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>cURL</MenubarItem>
              <MenubarItem>TypeScript</MenubarItem>
              <MenubarItem>Python</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem variant="destructive">Clear history</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="view">
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarLabel>Response</MenubarLabel>
          <MenubarRadioGroup value={format} onValueChange={setFormat}>
            <MenubarRadioItem value="json">JSON</MenubarRadioItem>
            <MenubarRadioItem value="markdown">Markdown</MenubarRadioItem>
            <MenubarRadioItem value="html">HTML</MenubarRadioItem>
          </MenubarRadioGroup>
          <MenubarSeparator />
          <MenubarCheckboxItem checked={wrap} onCheckedChange={(on) => setWrap(on === true)}>
            Wrap long lines
          </MenubarCheckboxItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="export">
        <MenubarTrigger>Export</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            <Copy strokeWidth={1.5} />
            Copy response
            <MenubarShortcut>⌘C</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            <Download strokeWidth={1.5} />
            Download JSON
          </MenubarItem>
          <MenubarItem disabled>Download CSV (tables only)</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

export function Site() {
  return <Bar />;
}

export function Product() {
  return <Bar />;
}

export function Open() {
  return <Bar defaultValue="view" />;
}
