import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

export function Product() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="brand">Create key</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create an API key</DialogTitle>
          <DialogDescription>Keys work for every endpoint on your plan.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Field label="Name" htmlFor="key-name" help="Only you see this.">
            <Input id="key-name" placeholder="Production" />
          </Field>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="brand">Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
