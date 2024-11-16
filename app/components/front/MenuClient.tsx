'use client'

import Link from "next/link";
import { Icon } from '@iconify/react';
import { useState } from "react";
import { useRouter } from "next/navigation";

interface MenuItemProps {
  items: any[];
  role: string;
  closeSidebar: () => void;
}

export function MenuClient({ items, role, closeSidebar }: MenuItemProps) {
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();

  const handleItemClick = (item: any, e: React.MouseEvent) => {
    e.preventDefault();
    if (item.href) {
      router.push(item.href);
      closeSidebar();
    }
    // Only toggle submenu for admin role
    if (item.submenu && role === 'admin') {
      toggleMenu(item.label);
    }
  };

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        if (!item.visible.includes(role)) return null;

        return (
          <div key={item.label}>
            {item.submenu && role === 'admin' ? (
              <div className="relative">
                <Link
                  href={item.href}
                  onClick={(e) => handleItemClick(item, e)}
                  className="flex items-center justify-start gap-4 text-gray-500 py-2 px-2 rounded-md hover:bg-mainColor-Light cursor-pointer"
                >
                  <Icon icon={item.icon} width="24" height="24" />
                  <span className="text-sm">{item.label}</span>
                  <Icon 
                    icon={openMenus[item.label] ? "mdi:chevron-up" : "mdi:chevron-down"} 
                    width="24" 
                    height="24" 
                    className="ml-auto"
                  />
                </Link>
                {openMenus[item.label] && (
                  <div className="mt-2 bg-gray-50 border-b border-gray-200 rounded-b-md">
                    {item.submenu.map((subItem: any) => {
                      if (!subItem.visible.includes(role)) return null;
                      return (
                        <Link
                          href={subItem.href}
                          key={subItem.label}
                          className="flex items-center justify-start gap-4 text-gray-500 py-2 px-4 rounded-md hover:bg-mainColor-Light border-b border-gray-200 last:border-b-0"
                        >
                          <Icon icon={subItem.icon} width="16" height="16" />
                          <span className="text-sm">{subItem.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={item.href}
                onClick={() => {
                  router.push(item.href);
                  closeSidebar();
                }}
                className="flex items-center justify-start gap-4 text-gray-500 py-2 px-2 rounded-md hover:bg-mainColor-Light"
              >
                <Icon icon={item.icon} width="20" height="20" />
                <span className="text-sm">{item.label}</span>
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
