import { Footer } from "@www/components/footer";
import { Header } from "@www/components/header";
import { BRAND_SITE, REPO, counts, registryName } from "@www/lib/registry";

// The docs pages: the brand header and footer around them. Example previews (app/preview) render bare.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header name={registryName} repo={REPO} counts={counts} />
      {children}
      <Footer name={registryName} repo={REPO} site={BRAND_SITE} />
    </>
  );
}
