"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { adjustInventory } from "@/lib/actions/inventory";

export function InventoryActions({ inventoryItemId }: { inventoryItemId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function adjust(delta: number) {
    startTransition(async () => {
      const result = await adjustInventory({
        inventoryItemId,
        delta,
        type: delta > 0 ? "purchase" : "adjustment",
      });
      if (!result.ok) toast.error(result.message);
      else {
        toast.success(`Stock → ${result.data.qty}`);
        router.refresh();
      }
    });
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" disabled={pending} onClick={() => adjust(-5)}>
        -5
      </Button>
      <Button size="sm" disabled={pending} onClick={() => adjust(20)}>
        +20 restock
      </Button>
    </div>
  );
}
