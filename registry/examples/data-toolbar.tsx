"use client";

import * as React from "react";

import { DataToolbar, DataToolbarActions, DataToolbarSearch } from "@/components/product/data-toolbar";
import { TagFilter } from "@/components/ui/tag-filter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Product() {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("all");
  return (
    <DataToolbar className="w-full max-w-2xl">
      <DataToolbarSearch value={query} onValueChange={setQuery} placeholder="Search keys" label="Search API keys" />
      <DataToolbarActions>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger appearance="ghost" aria-label="Status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </DataToolbarActions>
    </DataToolbar>
  );
}

export function Collapsible() {
  const [query, setQuery] = React.useState("");
  const [tags, setTags] = React.useState<string[]>(["pricing"]);
  return (
    <DataToolbar className="w-full max-w-2xl">
      <DataToolbarSearch collapsible value={query} onValueChange={setQuery} placeholder="Search monitors" />
      <DataToolbarActions>
        <TagFilter tags={tags} tagOptions={["pricing", "docs", "competitors"]} onAddTag={(t) => setTags((all) => [...all, t])} onRemoveTag={(t) => setTags((all) => all.filter((x) => x !== t))} />
      </DataToolbarActions>
    </DataToolbar>
  );
}
