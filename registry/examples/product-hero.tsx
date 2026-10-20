import { ProductLandingSteps } from "@/components/site/product-landing";
import { ProductHero } from "@/components/site/product-hero";
import { ParseHeroDemo } from "@/components/site/parse-landing-visuals";

// context.dev/parse: the white hero with the default pills and the product's demo (the parse-landing-visuals item)
// under the headline, passed in as children.
export function Site() {
  return (
    <div className="w-full">
      <ProductHero
        title={["Your documents.", "Ready for your agent."]}
        description="Turn PDFs, office documents, and spreadsheets into readable Markdown, in the same workflows that use your web data."
        docsHref="https://docs.context.dev/api-reference/utility/parse-a-file"
      >
        <ParseHeroDemo />
      </ProductHero>
    </div>
  );
}

// context.dev/chatgpt: its own actions and a note, no demo, then the steps.
export function Plugin() {
  return (
    <div className="w-full">
      <ProductHero
        title={["Give ChatGPT", "the live web."]}
        description="Install the Context.dev plugin and ask ChatGPT to look something up, read a page, or bring current sources into the chat."
        docsHref="https://docs.context.dev"
        note="Sign in with your Context.dev account when ChatGPT asks. Nothing to paste."
      />
      <ProductLandingSteps
        title="Install it once."
        accent="Then just ask."
        steps={[
          { title: "Install the plugin", description: "Open the Context.dev listing in ChatGPT and add it. It takes a minute." },
          { title: "Sign in when asked", description: "ChatGPT opens a browser window. Sign in to Context.dev there. You don't paste a key into the chat." },
          { title: "Ask in a new chat", description: "Start a new conversation and ask for what you want, or type @Context.dev to use it directly." },
        ]}
      />
    </div>
  );
}
