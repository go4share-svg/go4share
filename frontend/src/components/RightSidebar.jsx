import React from "react";
import SidebarSection from "./SidebarSection";

const RightSidebar = ({ onSelectVideo }) => {
  console.log("RightSidebar onSelectVideo:", onSelectVideo);

  return (
    <aside
      className="
        hidden md:block
        fixed top-20 right-0
        w-72
        h-[calc(100vh-80px)]
        overflow-y-auto
        px-2
        z-20
      "
      style={{ direction: "rtl" }}
    >
      <div style={{ direction: "ltr" }}>
        <SidebarSection
          title="🆕 Nejnovější"
          type="new"
          onSelectVideo={onSelectVideo}
        />

        <SidebarSection
          title="🔥 Nejsledovanější"
          type="views"
          onSelectVideo={onSelectVideo}
        />

        <SidebarSection
          title="❤️ Nejhodnocenější"
          type="likes"
          onSelectVideo={onSelectVideo}
        />
      </div>
    </aside>
  );
};
export default RightSidebar;
