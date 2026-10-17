import { SecretField } from "@/components/ui/secret-field";

// Masked, as a key always shows; and revealed, for the moment right after it is created.
export function Product() {
  return (
    <div className="grid w-80 gap-3">
      <SecretField secret="ctx_live_9f2c41b7e0a84d6c" label="production key" />
      <SecretField secret="ctx_test_51d0a7e3c29b84f6" label="new key" defaultRevealed />
    </div>
  );
}
