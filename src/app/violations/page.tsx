import { redirect } from "next/navigation";

export default function ViolationsRedirectPage() {
  redirect("/teacher/dashboard");
}
