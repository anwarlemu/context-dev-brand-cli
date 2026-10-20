import { CapabilityPanel, DemoRow, FileGlyph, MarkGlyph, ParamRow, ProductDemoCard, StatusChip } from "@/components/site/product-demo-card";

const OUTPUT = `{
  "status": "ready",
  "pages": 12,
  "markdown": "# Product research\\n..."
}`;

export function Site() {
  return (
    <div className="mx-auto w-full max-w-[var(--ds-layout-column-wide)] px-6 py-12 sm:px-8 md:px-10 lg:px-12">
      <ProductDemoCard
        label="Illustrative request and response"
        inputLabel="Document input"
        input={
          <>
            <DemoRow glyph={<FileGlyph type="PDF" />} title="report.pdf" detail="12 pages · 2.4 MB" status={<StatusChip>Parsed</StatusChip>} />
            <DemoRow glyph={<MarkGlyph>@</MarkGlyph>} title="alex@example.com" detail="Work email" status={<StatusChip tone="neutral">Queued</StatusChip>} />
          </>
        }
        outputLabel="JSON response"
        filename="result.json"
        output={OUTPUT}
      />
    </div>
  );
}

export function Panel() {
  return (
    <div className="w-full max-w-60">
      <CapabilityPanel label="Example request options">
        <ParamRow name="pdf.start" value="1" />
        <ParamRow name="pdf.end" value="4" />
        <ParamRow name="includeLinks" value="true" />
      </CapabilityPanel>
    </div>
  );
}
