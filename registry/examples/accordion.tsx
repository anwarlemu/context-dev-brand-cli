import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function Site() {
  return (
    <Accordion type="single" collapsible defaultValue="a" className="w-full max-w-xl">
      <AccordionItem value="a">
        <AccordionTrigger>Do you respect robots.txt?</AccordionTrigger>
        <AccordionContent>Yes. Every crawl follows the site&rsquo;s rules unless you own the domain.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Is there a free plan?</AccordionTrigger>
        <AccordionContent>Yes: 1,000 credits a month, no card required.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
