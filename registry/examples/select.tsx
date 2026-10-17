import { Calendar } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Product() {
  return (
    <div className="flex flex-wrap items-start gap-6">
      <Select defaultValue="30d">
        <SelectTrigger aria-label="Range">
          <Calendar strokeWidth={1.5} />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="90d">Last 90 days</SelectItem>
        </SelectContent>
      </Select>
      <div className="w-64">
        <Select defaultValue="markdown">
          <SelectTrigger appearance="field" aria-label="Format">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="markdown" description="Clean text for models">Markdown</SelectItem>
            <SelectItem value="html" description="The page as rendered">HTML</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
