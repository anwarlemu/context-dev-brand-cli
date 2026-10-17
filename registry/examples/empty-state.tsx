import { Radar } from "lucide-react";

import { EmptyState } from "@/components/product/empty-state";
import { Button } from "@/components/ui/button";

export function Product() {
  return <EmptyState icon={<Radar strokeWidth={1.25} />} title="No monitors yet" description="Watch a page and we'll tell you the moment it changes." action={<Button>New monitor</Button>} />;
}
