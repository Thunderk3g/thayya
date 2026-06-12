import "./portal.css";
import PortalHeader from "./components/PortalHeader";

export const metadata = {
  title: "Thayya™ Portal",
};

export default function PortalsLayout({ children }) {
  return (
    <div>
      <PortalHeader />
      {children}
    </div>
  );
}
