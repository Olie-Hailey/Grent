import { redirect } from "next/navigation";

export default function AdminProfilePage() {
  redirect("/admin?tab=profile");
}
