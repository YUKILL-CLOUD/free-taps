export const ITEM_PER_PAGE = 10

type RouteAccessMap = {
    [key: string]: string[];
  };

export const routeAccessMap: RouteAccessMap = {
    "/admin(.*)": ["admin"],
    "/user(.*)": ["user"],
    "/list/announcements": ["admin"],
    "/list/appointments": ["admin"],
    "/list/contacts": ["user"],
    "/list/healthRecord": ["admin"],
    "/list/home": ["user"],
    "/list/pets": ["admin", "user"],
    "/list/services": ["admin", "user"],
    "/list/users": ["admin"],
    "/list/vaccination": ["admin"],
    "/list/deworming": ["admin"],
    "/list/veterinarians": ["admin"],
    "/appointments": ["user"],
    "/list/prescriptions": ["admin", "user"],
    "/list/prescriptions/[id]": ["admin", "user"],
    "/list/prescriptions/print": ["admin", "user"],
    "/list/prescriptions/new": ["admin"],
  };