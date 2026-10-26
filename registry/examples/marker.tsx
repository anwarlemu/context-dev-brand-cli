import { Circle, Clock } from "lucide-react";

import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";

export function Site() {
  return (
    <div className="grid w-full max-w-md gap-4">
      <Marker variant="separator">
        <MarkerContent>Today</MarkerContent>
      </Marker>
      <Marker variant="border">
        <MarkerContent>Recent changes</MarkerContent>
      </Marker>
    </div>
  );
}

export function Product() {
  return (
    <div className="grid w-full max-w-md gap-4">
      <Marker variant="unread">
        <MarkerContent>2 new messages</MarkerContent>
      </Marker>
      <Marker>
        <MarkerIcon>
          <Clock strokeWidth={1.5} />
        </MarkerIcon>
        <MarkerContent>Support usually replies within a few minutes</MarkerContent>
      </Marker>
      <Marker>
        <MarkerIcon>
          <Circle className="fill-success text-success" strokeWidth={1.5} />
        </MarkerIcon>
        <MarkerContent>
          Ana is online. <a href="#help">See the help center</a>
        </MarkerContent>
      </Marker>
    </div>
  );
}
