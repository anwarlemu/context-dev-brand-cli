import { CapabilityPanel, DemoRow, MarkGlyph, ProductDemoCard, StatusChip } from "@/components/site/product-demo-card";

// The People enrichment page's hero demo (a work email in, a candidate profile and match score out) and its three
// capability panels: the identifiers a lookup starts from, the profile context, and the two match outcomes.

export type DemoPerson = { name: string; initials: string; email: string; role: string };

const PERSON: DemoPerson = { name: "Alex Taylor", initials: "AT", email: "alex@example.com", role: "Product engineer at Example" };
const MATCH_SCORE = 92;

const MATCH_RESPONSE = `{
  "match": {
    "status": "candidate",
    "score": ${MATCH_SCORE},
    "person": {
      "name": { "full": "${PERSON.name}" },
      "current_role": {
        "title": "Product engineer",
        "organization": { "domain": "example.com" }
      },
      "current_role_status": "present"
    }
  }
}`;

function PersonSummary({ person, detail }: { person: DemoPerson; detail: string }) {
  return (
    <div className="flex items-center gap-3.5">
      <MarkGlyph round>{person.initials}</MarkGlyph>
      <span className="flex min-w-0 flex-col">
        <span className="text-demo-title leading-demo-title text-fg">{person.name}</span>
        <span className="truncate text-demo-code leading-demo-label text-black/50">{detail}</span>
      </span>
    </div>
  );
}

export function PeopleEnrichmentHeroDemo({ person = PERSON, score = MATCH_SCORE, output = MATCH_RESPONSE }: { person?: DemoPerson; score?: number; output?: string }) {
  return (
    <ProductDemoCard
      label="Illustrative candidate profile"
      inputLabel="Identity"
      input={
        <>
          <DemoRow glyph={<MarkGlyph>@</MarkGlyph>} title={person.email} detail="Work email" status={<StatusChip>Candidate</StatusChip>} />
          <div className="flex flex-1 flex-col justify-center gap-5 px-1">
            <PersonSummary person={person} detail={person.role} />
            <p className="flex items-end gap-3 border-t border-black/10 pt-5">
              <span className="font-data text-demo-score leading-demo-score font-score text-brand">{score}</span>
              <span className="text-demo-label leading-demo-label text-black/50">match score, out of 100</span>
            </p>
          </div>
        </>
      }
      outputLabel="JSON response"
      filename="match.json"
      output={output}
    />
  );
}

const IDENTIFIERS = [
  { label: "Email", value: PERSON.email },
  { label: "Social URL", value: "x.com/alextaylor" },
  { label: "Name and company", value: `${PERSON.name}, Example` },
];

export function PeopleIdentifiersPanel() {
  return (
    <CapabilityPanel label="Examples of identifiers a lookup can start from">
      <ul className="flex flex-col gap-2">
        {IDENTIFIERS.map((identifier) => (
          <li key={identifier.label} className="flex flex-col gap-0.5 rounded-card border border-black/10 px-3.5 py-2.5">
            <span className="text-demo-meta leading-4 text-black/50">{identifier.label}</span>
            <span className="truncate text-demo-label leading-5 text-fg">{identifier.value}</span>
          </li>
        ))}
      </ul>
    </CapabilityPanel>
  );
}

const PROFILE_FIELDS = [
  { label: "Role", value: "Product engineer" },
  { label: "Experience", value: "3 roles" },
  { label: "Education", value: "1 school" },
  { label: "Profile links", value: "2 links" },
];

export function PeopleContextPanel() {
  return (
    <CapabilityPanel label="Illustrative profile context">
      <PersonSummary person={PERSON} detail="example.com" />
      <dl className="flex flex-col">
        {PROFILE_FIELDS.map((field) => (
          <div key={field.label} className="flex items-center justify-between gap-3 border-t border-hairline py-2.5 text-demo-label leading-5">
            <dt className="text-black/50">{field.label}</dt>
            <dd className="text-fg">{field.value}</dd>
          </div>
        ))}
      </dl>
    </CapabilityPanel>
  );
}

const MATCH_OUTCOMES = [
  { status: "candidate", score: String(MATCH_SCORE), next: "Use the profile", isMatch: true },
  { status: "not_found", score: "null", next: "Ask for more context", isMatch: false },
];

export function PeopleMatchPanel() {
  return (
    <CapabilityPanel label="Illustrative match results">
      {MATCH_OUTCOMES.map((outcome) => (
        <div key={outcome.status} className="flex flex-col gap-2 rounded-card border border-black/10 px-3.5 py-3">
          <div className="flex items-center justify-between gap-3">
            <StatusChip tone={outcome.isMatch ? "blue" : "neutral"}>{outcome.status}</StatusChip>
            <code className="font-mono text-demo-code leading-5 text-black/60">score {outcome.score}</code>
          </div>
          <p className="text-demo-code leading-demo-label text-black/50">{outcome.next}</p>
        </div>
      ))}
    </CapabilityPanel>
  );
}
