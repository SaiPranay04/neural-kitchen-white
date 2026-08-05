import { redirect } from "next/navigation";

export default function TablesRedirectPage() {
  redirect("/dashboard?tab=tables");
}
