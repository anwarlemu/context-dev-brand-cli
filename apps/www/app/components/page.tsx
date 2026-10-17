import { redirect } from "next/navigation";

import { items } from "@www/lib/registry";

export default function ComponentsIndex() {
  redirect(`/components/${items[0]?.name ?? ""}`);
}
