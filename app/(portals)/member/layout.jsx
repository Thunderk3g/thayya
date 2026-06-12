import Subnav from "../components/Subnav";

const ITEMS = [
  { label: "Discover", href: "/member/discover" },
  { label: "Instructor Page", href: "/member/instructor" },
  { label: "Book Workshop", href: "/member/book" },
  { label: "My Bookings", href: "/member/bookings" },
  { label: "Membership", href: "/member/membership" },
];

export default function MemberLayout({ children }) {
  return (
    <section>
      <Subnav items={ITEMS} />
      {children}
    </section>
  );
}
