"use client";

import { useState } from "react";

import { TagFilter } from "@/components/ui/tag-filter";

export function Product() {
  const [tags, setTags] = useState(["pricing"]);
  return (
    <TagFilter
      tags={tags}
      tagOptions={["pricing", "docs", "careers", "blog", "changelog"]}
      onAddTag={(tag) => setTags((current) => [...current, tag])}
      onRemoveTag={(tag) => setTags((current) => current.filter((t) => t !== tag))}
    />
  );
}
