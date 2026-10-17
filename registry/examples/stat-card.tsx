"use client";

import { StatCard, StatCardGrid, StatFigure, StatFigureSkeleton, StatMeter } from "@/components/product/stat-card";

export function Product() {
  return (
    <div className="@container w-full max-w-xl">
      <StatCardGrid label="Credits and plan">
        <StatCard title="Credits used today" footer="1,204 API calls">
          <StatFigure>2,318</StatFigure>
        </StatCard>
        <StatCard title="Credits remaining" footer="Resets Nov 1" onClick={() => {}}>
          <span className="flex flex-col gap-2">
            <StatFigure suffix="/100K">41,590</StatFigure>
            <StatMeter value={41590} max={100000} />
          </span>
        </StatCard>
      </StatCardGrid>
    </div>
  );
}

export function Loading() {
  return (
    <div className="@container w-full max-w-xl">
      <StatCardGrid label="Credits">
        <StatCard title="Credits used this month">
          <StatFigureSkeleton />
        </StatCard>
        <StatCard title="Current plan" footer="Manage billing" asChild>
          <a href="#">
            <span className="text-body-sm font-medium text-fg">Pro</span>
          </a>
        </StatCard>
      </StatCardGrid>
    </div>
  );
}
