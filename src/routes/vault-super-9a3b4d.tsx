import { createFileRoute } from "@tanstack/react-router";
import { AdminPortalCore } from "@/components/admin/AdminPortalCore";

export const Route = createFileRoute("/vault-super-9a3b4d")({
  component: () => (
    <AdminPortalCore
      portalRole="SUPER_ADMIN"
      portalTitle="Super Admin Master Vault"
      portalDescription="Baldwin Village · Master Owner & Enterprise Controls"
    />
  ),
  head: () => ({
    meta: [
      { title: "Super Admin Vault — Toronto Cafe" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});
