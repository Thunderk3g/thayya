import Subnav from "../components/Subnav";

const ITEMS = [
  { label: "Today", href: "/instructor/today" },
  { label: "Content Library", href: "/instructor/library" },
  { label: "Music", href: "/instructor/music" },
  { label: "My Workshops", href: "/instructor/workshops" },
  { label: "My Students", href: "/instructor/students" },
  { label: "Earnings", href: "/instructor/earnings" },
  { label: "Public Page", href: "/instructor/public" },
];

export default function InstructorLayout({ children }) {
  return (
    <section>
      <Subnav items={ITEMS} />
      {children}
    </section>
  );
}
