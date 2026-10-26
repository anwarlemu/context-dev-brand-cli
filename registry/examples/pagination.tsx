"use client";

import * as React from "react";

import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationSummary } from "@/components/ui/pagination";

function Pages({ count, initial = 0 }: { count: number; initial?: number }) {
  const [page, setPage] = React.useState(initial);
  const go = (p: number) => (event: React.MouseEvent) => {
    event.preventDefault();
    if (p >= 0 && p < count) setPage(p);
  };
  const list = count <= 7 ? Array.from({ length: count }, (_, i) => i) : [0, ...[page - 1, page, page + 1].filter((p) => p > 0 && p < count - 1), count - 1];
  return (
    <Pagination>
      <PaginationContent>
        <PaginationSummary>
          Page {page + 1} of {count}
        </PaginationSummary>
        <PaginationItem>
          <PaginationPrevious href="#" onClick={go(page - 1)} disabled={page === 0} />
        </PaginationItem>
        {list.map((p, i) => (
          <React.Fragment key={p}>
            {i > 0 && p - list[i - 1] > 1 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink href="#" isActive={p === page} onClick={go(p)} aria-label={`Page ${p + 1}`}>
                {p + 1}
              </PaginationLink>
            </PaginationItem>
          </React.Fragment>
        ))}
        <PaginationItem>
          <PaginationNext href="#" onClick={go(page + 1)} disabled={page === count - 1} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export function Site() {
  return (
    <div className="w-full max-w-xl">
      <Pages count={5} />
    </div>
  );
}

export function Product() {
  return (
    <div className="w-full max-w-xl">
      <Pages count={24} initial={6} />
    </div>
  );
}

export function PreviousAndNext() {
  const [page, setPage] = React.useState(0);
  return (
    <Pagination className="max-w-xl">
      <PaginationContent>
        <PaginationSummary>Page {page + 1}</PaginationSummary>
        <PaginationItem>
          <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(0, p - 1)); }} disabled={page === 0} />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage((p) => p + 1); }} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
