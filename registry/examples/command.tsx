import { BarChart3, Key, Settings } from "lucide-react";

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command";

export function Product() {
  return (
    <Command className="w-full max-w-md shadow-floating">
      <CommandInput placeholder="Search pages and actions" />
      <CommandList>
        <CommandEmpty>Nothing found.</CommandEmpty>
        <CommandGroup heading="Go to">
          <CommandItem>
            <BarChart3 strokeWidth={1.5} /> Usage <CommandShortcut>G U</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Key strokeWidth={1.5} /> API keys <CommandShortcut>G K</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Settings strokeWidth={1.5} /> Settings <CommandShortcut>G S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
