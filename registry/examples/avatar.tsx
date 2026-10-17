import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Initials on the brand blue stand in when there is no picture; 28px by default, 24px in dense rows.
export function Product() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>MJ</AvatarFallback>
        </Avatar>
        <Avatar className="size-6">
          <AvatarFallback>RK</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex items-center gap-2.5">
        <Avatar>
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <div className="text-body-sm leading-tight">
          <p className="text-fg">Anwar Lemu</p>
          <p className="text-caption text-fg-subtle">anwar@acme.com</p>
        </div>
      </div>
    </div>
  );
}
