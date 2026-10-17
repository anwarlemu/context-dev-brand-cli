import { BarChart3, Key, Settings } from "lucide-react";

import { Command, CommandEmpty, CommandFooter, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";

export function Product() {
  return (
    <Command className="w-full max-w-xl shadow-[0_0_0_1px_var(--ds-color-border-hairline),0_24px_64px_rgb(0_0_0/0.16)]">
      <CommandInput placeholder="Search pages, APIs, and settings" />
      <CommandList>
        <CommandEmpty>Nothing matches.</CommandEmpty>
        <CommandGroup heading="Go to">
          <CommandItem>
            <BarChart3 strokeWidth={1.5} /> Usage
            <CommandShortcut>
              <Kbd>G</Kbd> then <Kbd>U</Kbd>
            </CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Key strokeWidth={1.5} /> API keys
            <CommandShortcut>
              <Kbd>G</Kbd> then <Kbd>K</Kbd>
            </CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Settings strokeWidth={1.5} /> Settings
          </CommandItem>
        </CommandGroup>
      </CommandList>
      <CommandFooter>
        <span>
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd> to navigate
        </span>
        <span>
          <Kbd>↵</Kbd> to open
        </span>
        <span className="ml-auto">
          <Kbd>esc</Kbd> to close
        </span>
      </CommandFooter>
    </Command>
  );
}
