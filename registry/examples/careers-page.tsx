import { CareersPage } from "@/components/site/careers-page";
import { Button } from "@/components/ui/button";

export function Site() {
  return (
    <CareersPage
      title={"Build the web layer\nfor AI agents"}
      accent={["AI agents"]}
      description="Acme is a small, remote team shipping APIs that thousands of developers rely on. Come help."
      actions={
        <>
          <Button asChild variant="pill">
            <a href="#roles">See open roles</a>
          </Button>
          <Button asChild variant="pill-outline">
            <a href="#about">How we work</a>
          </Button>
        </>
      }
      rolesDescription="Every role is remote, with a few weeks a year together in person."
      roles={[
        { title: "Senior backend engineer", team: "Engineering", location: "Remote, Americas", type: "Full time", description: "Own the crawl and extract pipeline end to end, from queues to storage.", href: "#backend" },
        { title: "Product engineer", team: "Engineering", location: "Remote, Europe", type: "Full time", description: "Ship the dashboard and the docs, from first sketch to production.", href: "#product" },
        { title: "Developer advocate", team: "Growth", location: "Remote", type: "Full time", description: "Write guides, build examples and help developers get to their first request.", href: "#advocate" },
      ]}
      note={
        <>
          Don't see your role? <a href="#apply">Send us a note</a> about what you would like to work on.
        </>
      }
    />
  );
}
