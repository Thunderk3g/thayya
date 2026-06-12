import Subnav from "../components/Subnav";

const ITEMS = [
  { label: "Overview", href: "/admin/overview" },
  { label: "Content Drops", href: "/admin/content" },
  { label: "Instructors", href: "/admin/instructors" },
  { label: "Commission", href: "/admin/commission" },
  { label: "Members", href: "/admin/members" },
];

export default function AdminLayout({ children }) {
  return (
    <section>
      <Subnav items={ITEMS} />
      {children}
    </section>
  );
}
