import { CapabilityPanel, DemoRow, FileGlyph, ParamRow, ProductDemoCard, StatusChip } from "@/components/site/product-demo-card";
import { ParseStory } from "@/components/visuals/stories/parse-story";

// The Parse page's hero demo (a PDF in, Markdown out, with the parse story under the file) and its three capability
// panels: the file types it reads, OCR on scanned pages, and the options a request takes.

const MARKDOWN_OUTPUT = `# Product research

Findings from customer interviews
and public documentation.

## What we learned

- Keep context with its source
- Refresh content when it changes
- Cite the page an answer came from`;

export function ParseHeroDemo({ output = MARKDOWN_OUTPUT }: { output?: string }) {
  return (
    <ProductDemoCard
      label="Illustrative document conversion"
      inputLabel="Document input"
      input={
        <>
          <DemoRow glyph={<FileGlyph type="PDF" />} title="report.pdf" detail="12 pages · 2.4 MB" status={<StatusChip>Parsed</StatusChip>} />
          <div className="mx-auto mt-auto w-full max-w-[22.75rem]">
            <ParseStory />
          </div>
        </>
      }
      outputLabel="Markdown output"
      filename="report.md"
      output={output}
    />
  );
}

const SUPPORTED_FILES = ["PDF", "DOCX", "XLSX", "PPTX", "CSV", "HTML", "MD", "PY", "PNG"];

export function ParseFileTypesPanel({ types = SUPPORTED_FILES }: { types?: string[] }) {
  return (
    <CapabilityPanel label="Examples of supported file types">
      <ul className="grid grid-cols-3 gap-x-3 gap-y-4 py-1">
        {types.map((type) => (
          <li key={type} className="flex justify-center">
            <FileGlyph type={type} />
            <span className="sr-only">{type}</span>
          </li>
        ))}
      </ul>
    </CapabilityPanel>
  );
}

const SCANNED_PAGES = [
  { number: 1, layer: "Text layer", hasText: true },
  { number: 2, layer: "Scanned", hasText: false },
  { number: 3, layer: "Scanned", hasText: false },
];

export function ParseOcrPanel({ pages = SCANNED_PAGES }: { pages?: { number: number; layer: string; hasText: boolean }[] }) {
  return (
    <CapabilityPanel label="Illustrative OCR result for a scanned PDF">
      <ParamRow name="ocr" value="true" />
      <ul className="flex flex-col gap-2">
        {pages.map(({ number, layer, hasText }) => (
          <li key={number} className="flex items-center justify-between gap-3 rounded-card border border-black/10 px-3 py-2.5">
            <span className="flex min-w-0 flex-col">
              <span className="text-demo-label leading-5 text-fg">Page {number}</span>
              <span className="text-demo-meta leading-4 text-black/50">{layer}</span>
            </span>
            {hasText ? <StatusChip tone="neutral">Kept</StatusChip> : <StatusChip>OCR</StatusChip>}
          </li>
        ))}
      </ul>
    </CapabilityPanel>
  );
}

export function ParseOptionsPanel() {
  return (
    <CapabilityPanel label="Example parse options">
      <ParamRow name="pdf.start" value="1" />
      <ParamRow name="pdf.end" value="4" />
      <ParamRow name="includeLinks" value="true" />
      <ParamRow name="includeImages" value="true" />
    </CapabilityPanel>
  );
}
