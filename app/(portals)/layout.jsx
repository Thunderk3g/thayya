import "./portal.css";
import PortalHeader from "./components/PortalHeader";
import AssistantWidget from "./components/AssistantWidget";

export const metadata = {
  title: "Thayya™ Portal",
};

export default function PortalsLayout({ children }) {
  return (
    <div>
      <PortalHeader />
      {children}
      <AssistantWidget />
    </div>
  );
}
