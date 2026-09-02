import { createFileRoute } from "@tanstack/react-router";
import { AdminPortalCore } from "@/components/admin/AdminPortalCore";

export const Route = createFileRoute("/portal-admin-8f2c7e")({
  component: () => (
    <AdminPortalCore
      portalRole="STAFF_ADMIN"
      portalTitle="Toronto Cafe Staff Portal"
      portalDescription="Baldwin Village · Staff & Barista Operations"
    />
  ),
  head: () => ({
    meta: [
      { title: "Staff Portal — Toronto Cafe" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});
