"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Image as ImageIcon, RotateCw, X } from "lucide-react";

import { Attachment, AttachmentAction, AttachmentActions, AttachmentContent, AttachmentDescription, AttachmentGroup, AttachmentMedia, AttachmentTitle, AttachmentTrigger } from "@/components/ui/attachment";
import { Spinner } from "@/components/ui/spinner";

export function Site() {
  return (
    <AttachmentGroup className="w-full max-w-2xl">
      {[
        { name: "pricing.md", size: "4.2 KB", icon: FileText },
        { name: "products.json", size: "18.6 KB", icon: FileText },
        { name: "hero.png", size: "220 KB", icon: ImageIcon },
      ].map((f) => (
        <Attachment key={f.name}>
          <AttachmentMedia>
            <f.icon strokeWidth={1.5} />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{f.name}</AttachmentTitle>
            <AttachmentDescription>{f.size}</AttachmentDescription>
          </AttachmentContent>
          <AttachmentTrigger aria-label={`Open ${f.name}`} />
        </Attachment>
      ))}
    </AttachmentGroup>
  );
}

export function Product() {
  const [files, setFiles] = useState([
    { name: "urls-october.csv", detail: "2,400 URLs · 86 KB", state: "done" as const },
    { name: "sitemap.xml", detail: "Uploading · 64%", state: "uploading" as const },
    { name: "brand-kit.zip", detail: "Larger than the 25 MB limit", state: "error" as const },
  ]);
  return (
    <div className="grid w-full max-w-md gap-2">
      {files.map((f) => (
        <Attachment key={f.name} state={f.state} className="w-full">
          <AttachmentMedia>
            <FileSpreadsheet strokeWidth={1.5} />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{f.name}</AttachmentTitle>
            <AttachmentDescription>{f.detail}</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            {f.state === "uploading" && <Spinner className="mx-2 text-fg-subtle" />}
            {f.state === "error" && (
              <AttachmentAction aria-label={`Retry ${f.name}`}>
                <RotateCw strokeWidth={1.5} />
              </AttachmentAction>
            )}
            {f.state === "done" && (
              <AttachmentAction aria-label={`Download ${f.name}`}>
                <Download strokeWidth={1.5} />
              </AttachmentAction>
            )}
            <AttachmentAction aria-label={`Remove ${f.name}`} onClick={() => setFiles((all) => all.filter((x) => x.name !== f.name))}>
              <X strokeWidth={1.5} />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
      ))}
      {files.length === 0 && <p role="status" className="text-body-sm text-fg-muted">No files attached.</p>}
    </div>
  );
}

export function States() {
  return (
    <div className="flex flex-wrap items-start gap-3">
      <Attachment state="idle">
        <AttachmentMedia>
          <FileText strokeWidth={1.5} />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>Drop a sitemap</AttachmentTitle>
          <AttachmentDescription>XML or TXT</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment state="processing" size="sm">
        <AttachmentMedia>
          <FileText strokeWidth={1.5} />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>report.pdf</AttachmentTitle>
          <AttachmentDescription>Parsing</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment orientation="vertical">
        <AttachmentMedia>
          <ImageIcon strokeWidth={1.5} />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>logo.svg</AttachmentTitle>
          <AttachmentDescription>3.1 KB</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment size="xs">
        <AttachmentMedia>
          <FileText strokeWidth={1.5} />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>notes.txt</AttachmentTitle>
        </AttachmentContent>
      </Attachment>
    </div>
  );
}
