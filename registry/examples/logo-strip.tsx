import { LogoStrip } from "@/components/site/logo-strip";

const names = ["Super", "Passionfroot", "mintlify", "chatwoot", "similarweb", "Klarna.", "Ferndesk", "DocsBot", "daily.dev", "Sixtyfour", "Comp AI", "Squad"];

export function Site() {
  return (
    <LogoStrip
      label={
        <>
          Powering agents and products with <span className="text-fg-brand">the world&apos;s data.</span>
        </>
      }
      logos={names.map((name) => ({ name, node: <span className="text-h5 font-medium whitespace-nowrap text-fg">{name}</span> }))}
    />
  );
}
