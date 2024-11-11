'use client'

import Link from "next/link";
import { Icon } from '@iconify/react';
import { useState } from "react";

interface MenuItemProps {
  items: any[];
  role: string;
}

export function MenuClient({ items, role }: MenuItemProps) {
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

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
              <div>
                <div 
                  className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-mainColor-Light cursor-pointer"
                  onClick={() => toggleMenu(item.label)}
                >
                  <Icon icon={item.icon} width="20" height="20" />
                  <span className="hidden lg:block">{item.label}</span>
                  <Icon 
                    icon={openMenus[item.label] ? "mdi:chevron-up" : "mdi:chevron-down"} 
                    width="20" 
                    height="20" 
                    className="hidden lg:block ml-auto"
                  />
                </div>
                {openMenus[item.label] && (
                  <div className="ml-8">
                    {item.submenu.map((subItem: any) => {
                      if (!subItem.visible.includes(role)) return null;
                      return (
                        <Link
                          href={subItem.href}
                          key={subItem.label}
                          className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-mainColor-Light"
                        >
                          <Icon icon={subItem.icon} width="20" height="20" />
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
