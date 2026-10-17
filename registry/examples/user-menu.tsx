import { UserMenu } from "@/components/product/user-menu";

export function Product() {
  return (
    <div className="w-53">
      <UserMenu name="Ian Gerado" email="ian@acme.com" sections={[[{ label: "Settings" }, { label: "Changelog" }], [{ label: "Log out" }]]} />
    </div>
  );
}
