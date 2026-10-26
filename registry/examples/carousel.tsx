"use client";

import * as React from "react";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";

const STORIES = [
  { company: "Ramp", quote: "Brand data fills every vendor card on its own now." },
  { company: "Mercury", quote: "We onboard customers with their logo already in place." },
  { company: "Attio", quote: "Enrichment that used to take a day runs in a second." },
  { company: "Linear", quote: "Monitors tell us when a partner page changes." },
];

export function Site() {
  return (
    <div className="w-full px-12">
      <Carousel opts={{ align: "start" }} className="mx-auto w-full max-w-xl">
        <CarouselContent>
          {STORIES.map((s) => (
            <CarouselItem key={s.company} className="basis-4/5 sm:basis-1/2">
              <figure className="flex h-40 flex-col justify-between rounded-card border border-line bg-surface p-5">
                <blockquote className="text-body text-fg">“{s.quote}”</blockquote>
                <figcaption className="text-body-sm text-fg-muted">{s.company}</figcaption>
              </figure>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}

export function Product() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  React.useEffect(() => {
    if (!api) return;
    const update = () => setCurrent(api.selectedScrollSnap());
    update();
    api.on("select", update);
    return () => api.off("select", update);
  }, [api]);
  return (
    <div className="w-full px-12">
      <Carousel setApi={setApi} className="mx-auto w-full max-w-sm">
        <CarouselContent>
          {["Brand", "Scrape", "Monitor", "Crawl"].map((name) => (
            <CarouselItem key={name}>
              <div className="grid h-36 place-items-center rounded-card bg-surface shadow-card">
                <span className="text-h5 text-fg">{name} template</span>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <p className="mt-3 text-center text-caption text-fg-subtle tabular-nums">Template {current + 1} of 4</p>
    </div>
  );
}

export function Vertical() {
  return (
    <div className="py-12">
      <Carousel orientation="vertical" opts={{ align: "start" }} className="mx-auto w-full max-w-xs">
        <CarouselContent className="h-48">
          {["Oct 24, 09:12 · changed", "Oct 24, 08:12 · no change", "Oct 24, 07:12 · no change"].map((check) => (
            <CarouselItem key={check} className="basis-1/2">
              <div className="flex h-full items-center rounded-card border border-line bg-surface px-4 text-body-sm text-fg">{check}</div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
