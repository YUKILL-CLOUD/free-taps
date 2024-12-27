'use client';

import Menu from "@/app/components/front/Menu";
import Navbar from "@/app/components/front/Navbar";
import Footer from "@/app/components/front/Footer";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { SidebarProvider, useSidebar } from "@/app/components/front/SidebarContext";
import { Menu as MenuIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

function DashboardLayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isOpen, toggleSidebar, closeSidebar } = useSidebar();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        closeSidebar();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeSidebar]);

  return (
    <div className="h-screen flex">
      {/* LEFT */}
      <div 
        ref={sidebarRef}
        className={cn(
          "fixed top-0 left-0 h-full bg-white z-40 transition-all duration-300",
          "w-[50%] md:w-[22%] lg:w-12% xl:w-10%] p-4",
          !isOpen && "-translate-x-full",
          "shadow-[4px_0_6px_-1px_rgba(0,0,0,0.1)]",
          "rounded-tr-2xl rounded-br-2xl"
        )}
      >
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg w-full"
        >
          <Icon 
            icon="tabler:paw-filled" 
            width={32} 
            height={32}
            className="text-primary"
          />
            <span className="block font-bold text-sm text-gray-700">Tapales</span>
        </button>
        <Menu />
      </div>

      {/* RIGHT */}
      <div className={cn(
        "flex-1 flex flex-col bg-[#F7F8FA] transition-all duration-300",
        isOpen ? "ml-0 md:ml-[16%] xl:ml-[14%]" : "ml-0"
      )}>
        {/* Sticky Navbar */}
        <div className="sticky top-0 z-30 backdrop-blur-sm bg-white/70 border-b border-mainColor-100/20 shadow-sm">
          <div className="flex items-center  space-x-1.5 justify-between py-2 px-4 bg-gradient-to-t from-mainColor-50/30 to-transparent">
            {!isOpen && (
              <button
                onClick={toggleSidebar}
                className="w-auto flex items-center justify-center lg:justify-start gap-2 hover:bg-mainColor-50 rounded-lg p-1 transition-all duration-200"
              >
                <Icon 
                  icon="iconamoon:menu-burger-horizontal-bold" 
                  width={28}
                  height={28}
                  className="text-primary"
                />
              </button>
            )}
             <Icon 
                  icon="tabler:paw-filled" 
                  width={28}
                  height={28}
                  className="text-primary"
                />
                <span className="block font-bold text-sm text-gray-700">Tapales</span>
            <div className="flex-1 flex justify-end">
              <Navbar />
            </div>
          </div>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto flex flex-col">
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}
