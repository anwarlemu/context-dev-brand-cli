import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Product() {
  return (
    <div className="flex items-center gap-2">
      <Avatar>
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>
      <Avatar className="size-6">
        <AvatarFallback>MJ</AvatarFallback>
      </Avatar>
    </div>
  );
}
