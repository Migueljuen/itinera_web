const creatorNav = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    path: "/owner",
  },
  {
    id: "activities",
    label: "Activities",
    icon: LayoutGrid,
    expandable: true,
    subItems: [
      { label: "Manage Activities", path: "/owner/activities" },
      { label: "Create Listing", path: "/owner/create" },
    ],
  },
  {
    id: "bookings",
    label: "Bookings",
    icon: Calendar,
    path: "/owner/bookings",
  },
];

const guideNav = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    path: "/guide",
  },
  {
    id: "itineraries",
    label: "Itineraries",
    icon: Calendar,
    path: "/guide/itineraries",
  },
  {
    id: "availability",
    label: "Availability",
    icon: Users,
    path: "/guide/availability",
  },
];

const driverNav = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    path: "/driver",
  },
  {
    id: "trips",
    label: "Trips",
    icon: Calendar,
    path: "/driver/trips",
  },
  {
    id: "availability",
    label: "Availability",
    icon: Users,
    path: "/driver/availability",
  },
];
