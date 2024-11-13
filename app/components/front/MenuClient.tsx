'use client'

import Link from "next/link";
import { Icon } from '@iconify/react';
import { useState } from "react";
import { useRouter } from "next/navigation";

interface MenuItemProps {
  items: any[];
  role: string;
}

export function MenuClient({ items, role }: MenuItemProps) {
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();

  const handleItemClick = (item: any, e: React.MouseEvent) => {
    e.preventDefault();
    if (item.href) {
      router.push(item.href);
    }
    if (item.submenu) {
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
            {item.submenu ? (
              <div className="relative">
                <Link
                  href={item.href}
                  onClick={(e) => handleItemClick(item, e)}
                  className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-mainColor-Light cursor-pointer"
                >
                  <Icon icon={item.icon} width="24" height="24" />
                  <span className="hidden lg:block">{item.label}</span>
                  <Icon 
                    icon={openMenus[item.label] ? "mdi:chevron-up" : "mdi:chevron-down"} 
                    width="24" 
                    height="24" 
                    className="hidden lg:block ml-auto"
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
                          className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-mainColor-Light border-b border-gray-200 last:border-b-0"
                        >
                          <Icon icon={subItem.icon} width="16" height="16" />
                          <span className="hidden lg:block">{subItem.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={item.href}
                className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-mainColor-Light"
              >
                <Icon icon={item.icon} width="20" height="20" />
                <span className="hidden lg:block">{item.label}</span>
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
