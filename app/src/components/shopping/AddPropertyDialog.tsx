"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateSavedHome } from "@/lib/hooks/mutations";

interface AddPropertyDialogProps {
  userId: string;
}

export function AddPropertyDialog({ userId }: AddPropertyDialogProps) {
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [beds, setBeds] = useState("");
  const [baths, setBaths] = useState("");
  const [sqft, setSqft] = useState("");
  const [notes, setNotes] = useState("");

  const createHome = useCreateSavedHome(userId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createHome.mutate(
      {
        address,
        price: price ? Number(price) : undefined,
        beds: beds ? Number(beds) : undefined,
        baths: baths ? Number(baths) : undefined,
        sqft: sqft || undefined,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setAddress("");
          setPrice("");
          setBeds("");
          setBaths("");
          setSqft("");
          setNotes("");
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="px-5 py-2.5 bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 text-base font-medium rounded-lg"
      >
        Add Property
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Property</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="123 Main St, Springfield, IL"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                placeholder="425000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sqft">Sqft</Label>
              <Input
                id="sqft"
                placeholder="1,850"
                value={sqft}
                onChange={(e) => setSqft(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="beds">Beds</Label>
              <Input
                id="beds"
                type="number"
                placeholder="3"
                value={beds}
                onChange={(e) => setBeds(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baths">Baths</Label>
              <Input
                id="baths"
                type="number"
                step="0.5"
                placeholder="2"
                value={baths}
                onChange={(e) => setBaths(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Great backyard, close to schools..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createHome.isPending || !address}
              className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm"
            >
              {createHome.isPending ? "Saving..." : "Save Property"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
