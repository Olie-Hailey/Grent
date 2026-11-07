import { redirect } from "next/navigation";

export default function DemoBypassPage() {
  redirect("/api/auth/demo?next=/katalog");
}
