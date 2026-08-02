"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <Button
      size="sm"
      variant="outline"
      className={className}
      onClick={async () => {
        await createClient().auth.signOut();
        router.push("/staff/login");
        router.refresh();
      }}
    >
      Sign out
    </Button>
  );
}
