"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Tag, X } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// The dashboard's tag filter: the picked tags as small blue chips (each clears itself), then a bordered Tags button that
// opens a searchable list, each row checked in blue when picked.
function TagFilter({
  tags,
  tagOptions,
  onAddTag,
  onRemoveTag,
  className,
}: {
  tags: string[];
  tagOptions: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const options = [...new Set([...tags, ...tagOptions])].filter((tag) => tag.toLowerCase().includes(query.trim().toLowerCase()));
  const selected = new Set(tags);

  return (
    <div data-slot="tag-filter" className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onRemoveTag(tag)}
          aria-label={`Clear tag filter ${tag}`}
          className="flex h-7 items-center gap-1 rounded-[calc(var(--ds-radius-control)-0.125rem)] bg-blue-10 pr-1.5 pl-2.5 text-caption text-fg-brand outline-none transition-colors duration-150 ease-out hover:bg-blue-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring"
        >
          {tag}
          <X className="size-3" strokeWidth={1.75} />
        </button>
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          aria-label="Filter by tags"
          className="flex h-8 items-center gap-1.5 rounded-control border border-line px-3 text-body-sm whitespace-nowrap text-fg-muted outline-none transition-colors duration-150 ease-out hover:border-line-strong hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring data-[state=open]:border-line-strong data-[state=open]:text-fg"
        >
          <Tag className="size-3.5 text-fg-subtle" strokeWidth={1.5} />
          Tags
          <ChevronsUpDown className="size-3.5 text-fg-subtle" strokeWidth={1.5} />
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={8} className="w-56 p-3">
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tags"
            aria-label="Search tags"
            className="mb-1 h-8 w-full rounded-control bg-neutral-5 px-2.5 text-body-sm text-fg outline-none placeholder:text-fg-subtle"
          />
          <ul className="max-h-64 overflow-y-auto">
            {options.length === 0 && <li className="px-2.5 py-2 text-body-sm text-fg-subtle">{tagOptions.length === 0 ? "No tags yet" : "No matching tags"}</li>}
            {options.map((tag) => {
              const isSelected = selected.has(tag);
              return (
                <li key={tag}>
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => (isSelected ? onRemoveTag(tag) : onAddTag(tag))}
                    className={cn(
                      "flex h-9 w-full items-center gap-2.5 rounded-control px-2.5 text-left text-body-sm outline-none transition-colors duration-150 ease-out hover:bg-wash-hover focus-visible:bg-wash-hover",
                      isSelected ? "text-fg" : "text-fg-muted",
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{tag}</span>
                    <Check className={cn("size-3.5 shrink-0 text-brand", !isSelected && "invisible")} strokeWidth={1.75} />
                  </button>
                </li>
              );
            })}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export { TagFilter };
