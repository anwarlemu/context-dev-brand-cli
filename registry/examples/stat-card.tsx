import { StatCard, StatFigure, StatMeter } from "@/components/product/stat-card";

export function Product() {
  return (
    <div className="grid w-full max-w-xl gap-3 sm:grid-cols-2">
      <StatCard title="Credits used today" footer="1,204 API calls">
        <StatFigure>2,318</StatFigure>
      </StatCard>
      <StatCard title="Credits remaining" footer="Resets Nov 1" interactive>
        <span className="flex flex-col gap-2">
          <StatFigure suffix="/100K">41,590</StatFigure>
          <StatMeter value={41590} max={100000} />
        </span>
      </StatCard>
    </div>
  );
}
