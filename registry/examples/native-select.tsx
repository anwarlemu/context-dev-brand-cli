import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/components/ui/native-select";

// On the contact page: team size.
export function Site() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="team-size">Team size</Label>
      <NativeSelect id="team-size" name="teamSize" defaultValue="11-50" className="w-full">
        <NativeSelectOption value="1-10">1 to 10</NativeSelectOption>
        <NativeSelectOption value="11-50">11 to 50</NativeSelectOption>
        <NativeSelectOption value="51-200">51 to 200</NativeSelectOption>
        <NativeSelectOption value="200+">More than 200</NativeSelectOption>
      </NativeSelect>
    </div>
  );
}

// In a monitor's settings: a region with groups, the compact size, and invalid and disabled states.
export function Product() {
  return (
    <div className="grid w-full max-w-sm gap-4">
      <div className="grid gap-2">
        <Label htmlFor="region">Region</Label>
        <NativeSelect id="region" defaultValue="iad" className="w-full">
          <NativeSelectOptGroup label="Americas">
            <NativeSelectOption value="iad">US East (Virginia)</NativeSelectOption>
            <NativeSelectOption value="sfo">US West (San Francisco)</NativeSelectOption>
          </NativeSelectOptGroup>
          <NativeSelectOptGroup label="Europe">
            <NativeSelectOption value="fra">Frankfurt</NativeSelectOption>
            <NativeSelectOption value="lhr">London</NativeSelectOption>
          </NativeSelectOptGroup>
        </NativeSelect>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <NativeSelect size="sm" defaultValue="hourly" aria-label="Frequency">
          <NativeSelectOption value="hourly">Hourly</NativeSelectOption>
          <NativeSelectOption value="daily">Daily</NativeSelectOption>
        </NativeSelect>
        <NativeSelect aria-label="Webhook" aria-invalid defaultValue="">
          <NativeSelectOption value="" disabled>Choose a webhook</NativeSelectOption>
          <NativeSelectOption value="slack">Slack alerts</NativeSelectOption>
        </NativeSelect>
        <NativeSelect aria-label="Plan" disabled defaultValue="pro">
          <NativeSelectOption value="pro">Pro</NativeSelectOption>
        </NativeSelect>
      </div>
    </div>
  );
}
