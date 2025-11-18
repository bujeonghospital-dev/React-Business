// Contact dashboard sub-layout
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Dashboard | ระบบจัดการติดต่อลูกค้า",
  description: "Real-time contact management dashboard",
};

export default function ContactDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
