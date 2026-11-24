import { NotFoundPage } from "@/components/site/not-found-page";
import { Button } from "@/components/ui/button";

function AcmeMark() {
  return (
    <svg viewBox="0 0 48 33" aria-hidden="true">
      <rect x="16" width="32" height="32" rx="2" fill="currentColor" />
      <circle cx="10" cy="23" r="10" fill="currentColor" />
    </svg>
  );
}

export function Site() {
  return (
    <NotFoundPage
      title="This page isn't on the web anymore."
      description="It may have been moved, renamed, or removed. Here are a few ways back in."
      pathname="/pricng"
      knownPaths={["/", "/pricing", "/blog", "/contact", "/docs"]}
      logo={<AcmeMark />}
      homeHref="#home"
      homeLabel="Acme home"
      actions={
        <>
          <Button asChild variant="pill-on-brand">
            <a href="#home">Take me home</a>
          </Button>
          <Button asChild variant="pill-on-brand" className="border-white/40">
            <a href="#docs">View documentation</a>
          </Button>
        </>
      }
      note={
        <>
          Looking for something specific? Try the <a href="#sitemap">sitemap</a>, the <a href="#llms">llms.txt index</a>, or the <a href="#docs">docs index</a>.
        </>
      }
    />
  );
}
