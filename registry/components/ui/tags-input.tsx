"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

// The dashboard's tags field: each tag a small blue chip (red when invalid) with its own remove button, typed with Enter
// or a comma, removed with Backspace, and a pasted list split into tags. Borders like an input.
function TagsInput({
  id,
  tags,
  onTagsChange,
  placeholder,
  isTagInvalid,
  bare = false,
  className,
}: {
  id?: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  isTagInvalid?: (tag: string) => boolean;
  /** Drops the field's own border, for a TagsInput set inside a container that draws one. */
  bare?: boolean;
  className?: string;
}) {
  const [draft, setDraft] = React.useState("");

  function commit(value: string) {
    const tag = value.trim().replace(/,$/, "");
    if (tag && !tags.includes(tag)) onTagsChange([...tags, tag]);
    setDraft("");
  }

  return (
    <div
      data-slot="tags-input"
      className={cn(
        "flex min-h-10 w-full flex-wrap items-center gap-1.5 px-2 py-1.5",
        !bare && "rounded-control border border-line bg-surface transition-[border-color,box-shadow] duration-150 ease-out focus-within:border-brand hover:border-line-strong motion-reduce:transition-none",
        className,
      )}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className={cn("flex h-6 items-center gap-1 rounded-[calc(var(--ds-radius-control)-0.125rem)] pr-1 pl-2.5 text-caption", isTagInvalid?.(tag) ? "bg-danger/8 text-danger" : "bg-blue-10 text-fg-brand")}
        >
          {tag}
          <button
            type="button"
            aria-label={`Remove ${tag}`}
            onClick={() => onTagsChange(tags.filter((existing) => existing !== tag))}
            className="grid size-4 place-items-center rounded-sm outline-none transition-colors duration-150 ease-out hover:bg-brand hover:text-on-brand focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-solid focus-visible:outline-focus-ring"
          >
            <X className="size-3" strokeWidth={1.75} />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(event) => {
          if (event.target.value.endsWith(",")) commit(event.target.value);
          else setDraft(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit(draft);
          }
          if (event.key === "Backspace" && !draft && tags.length > 0) onTagsChange(tags.slice(0, -1));
        }}
        onPaste={(event) => {
          const pasted = event.clipboardData
            .getData("text")
            .split(/[,\s]+/)
            .map((part) => part.trim())
            .filter(Boolean);
          if (pasted.length < 2) return;
          event.preventDefault();
          onTagsChange(Array.from(new Set([...tags, ...pasted])));
          setDraft("");
        }}
        onBlur={() => draft && commit(draft)}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="h-7 min-w-24 flex-1 bg-transparent px-1.5 text-body-sm text-fg outline-none placeholder:text-fg-subtle"
      />
    </div>
  );
}

export { TagsInput };
