import { redirect } from "next/navigation";

// Placeholder de login admin — mesma lógica do jurado, com role "admin"
// Em produção, um form identico ao do jurado, gravando cookie e validando role.
export default function AdminLoginPage() {
  redirect("/chamada/admin/dashboard");
}
