'use client'
import { useSession } from "next-auth/react";
import { MenuClient } from "./MenuClient";

const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: "mdi:home",
        label: "Home",
        href: "/list/home",
        visible: ["user",]
      },
      {
        icon: "mdi:cog-outline",
        label: "Services",
        href: "/list/services",
        visible: ["user", "admin"],
        submenu: [
          {
            icon: "mdi:medical-bag",
            label: "Health Record",
            href: "/list/healthRecord",
            visible: ["admin"],
          },
          {
            icon: "mdi:syringe",
            label: "Vaccinations",
            href: "/list/vaccination",
            visible: ["admin"],
          },
          {
            icon: "mdi:medication",
            label: "Dewormings",
            href: "/list/deworming",
            visible: ["admin"],
          },
        ]
      },
      {
        icon: "mdi:contacts",
        label: "Contacts",
        href: "/list/contacts",
        visible: ["user"]
      },
      {
        icon: "mdi:account",
        label: "User",
        href: "/list/users",
        visible: ["admin"],
      },
      {
        icon: "mdi:paw",
        label: "Pets",
        href: "/list/pets",
        visible: ["admin", "user"],
      },
      {
        icon: "mdi:bullhorn",
        label: "Announcements",
        href: "/list/announcements",
        visible: ["admin"],
      },
      {
        icon: "mdi:calendar-clock",
        label: "Appointment",
        href: "/list/appointments",
        visible: ["admin"],
      },
      {
        icon: "mdi:prescription",
        label: "Prescriptions",
        href: "/list/prescriptions",
        visible: ["admin", "user"],
      },
      {
        icon: "mdi:doctor",
        label: "Veterinarian",
        href: "/list/veterinarians",
        visible: ["admin"],
      },
      {
        icon: "mdi:calendar-clock",
        label: "Appointments",
        href: "/appointments",
        visible: ["user"],
      },
      {
        icon: "ic:round-dashboard",
        label: "Dashboard",
        href: "/user",
        visible: ["user"],
      },
      {
        icon: "ic:round-dashboard",
        label: "Dashboard",
        href: "/admin",
        visible: ["admin"],
      },
    ],
  },
  // {
  //   title: "OTHER",
  //   items: [
  //     {
  //       icon: "mdi:account-circle",
  //       label: "Profile",
  //       href: "/profile",
  //       visible: ["admin", "user"],
  //     },
  //     {
  //       icon: "mdi:cog",
  //       label: "Settings",
  //       href: "/settings",
  //       visible: ["admin", "user"],
  //     },
  //     {
  //       icon: "mdi:logout",
  //       label: "Logout",
  //       href: "/logout",
  //       visible: ["admin", "user"],
  //     },
  //   ],
  // },
];

const Menu = () => {
  const { data: session } = useSession();
  const role = session?.user?.role;

  return (
    <div className="mt-4 text-sm">
      {menuItems.map((section) => (
        <div key={section.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {section.title}
          </span>
          <MenuClient items={section.items} role={role || ""} />
        </div>
      ))}
    </div>
  );
};

export default Menu;
