import { ParseFileTypesPanel, ParseHeroDemo, ParseOcrPanel, ParseOptionsPanel } from "@/components/site/parse-landing-visuals";
import { ProductStorySection } from "@/components/site/product-landing";

export function Site() {
  return (
    <div className="mx-auto w-full max-w-[var(--ds-layout-column-wide)] px-6 py-12 sm:px-8 md:px-10 lg:px-12">
      <ParseHeroDemo />
    </div>
  );
}

export function Capabilities() {
  return (
    <div className="w-full">
      <ProductStorySection
        title="Documents, spreadsheets, scans."
        accent="One readable format."
        description="Send the file bytes you already have and get Markdown back, with OCR for scanned pages and control over what comes through."
        items={[
          { title: "Bring your own files", description: "Send file bytes directly. Parse supports documents, spreadsheets, presentations, text, code, and supported image formats.", story: <ParseFileTypesPanel /> },
          { title: "Read scanned PDFs", description: "Enable OCR to recover selected PDF pages without a usable text layer. Pages that already contain text keep it.", story: <ParseOcrPanel /> },
          { title: "Control the output", description: "Choose a PDF page range, preserve links, and include image references when your workflow needs them.", story: <ParseOptionsPanel /> },
        ]}
      />
    </div>
  );
}
