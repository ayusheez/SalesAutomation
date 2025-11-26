import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Mail,
  Linkedin,
  Calendar,
  BarChart2,
  Sparkles,
  X,
  LogOut,
  ChevronDown,
  ChevronRight,
  PieChart,
  Settings,
  Layers,
  Zap,
} from "lucide-react";

type NavItem = {
  label: string;
  icon: React.ElementType;
  path?: string;
  children?: { label: string; path: string }[];
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Prospecting",
    icon: Users,
    children: [
      { label: "People Search", path: "/prospect/people" },
      { label: "Company Search", path: "/prospect/companies" },
      { label: "Saved Lists", path: "/prospect/saved" },
      { label: "Data Enrichment", path: "/prospect/enrichment" },
    ],
  },
  {
    label: "Email Outreach",
    icon: Mail,
    children: [
      { label: "Sequences", path: "/email/sequence" },
      { label: "Inbox", path: "/email/inbox" },
      { label: "Performance", path: "/email/analytics" },
    ],
  },
  {
    label: "LinkedIn",
    icon: Linkedin,
    children: [
      { label: "Find Leads", path: "/linkedin/find" },
      { label: "Campaigns", path: "/linkedin/sequence" },
    ],
  },
  {
    label: "Sales Pipeline",
    icon: Layers,
    children: [
      { label: "Deals Kanban", path: "/meetings/deals" },
      { label: "Calendar", path: "/meetings/calendar" },
    ],
  },
  {
    label: "AI Content",
    icon: Sparkles,
    children: [
      { label: "Generator", path: "/content/generate" },
      { label: "Scheduler", path: "/content/schedule" },
    ],
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: PieChart,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Auto-expand the section active on load
  useEffect(() => {
    const currentPath = location.pathname;
    const parentToExpand = NAV_ITEMS.find((item) =>
      item.children?.some((child) => currentPath.startsWith(child.path))
    );
    if (parentToExpand && !expandedItems.includes(parentToExpand.label)) {
      setExpandedItems((prev) => [...prev, parentToExpand.label]);
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 bottom-0 w-64 bg-dark border-r border-white/5 flex flex-col z-50
        transition-transform duration-300 ease-in-out shadow-2xl
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
      `}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 shrink-0 bg-dark/50 backdrop-blur-sm">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-[#4650c7] flex items-center justify-center shadow-lg shadow-primary/30">
              <Zap size={18} className="text-white fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Nexus
            </span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedItems.includes(item.label);
            const isParentActive = item.children
              ? item.children.some((c) => location.pathname === c.path)
              : location.pathname === item.path;

            return (
              <div key={item.label} className="mb-1">
                {item.children ? (
                  // Parent Item with Children
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      isParentActive
                        ? "bg-white/5 text-white"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon
                        size={18}
                        className={`mr-3 shrink-0 ${
                          isParentActive
                            ? "text-primary"
                            : "text-gray-500 group-hover:text-gray-300"
                        }`}
                      />
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </button>
                ) : (
                  // Standalone Item
                  <Link
                    to={item.path!}
                    onClick={onClose}
                    className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      location.pathname === item.path
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={`mr-3 shrink-0 ${
                        location.pathname === item.path
                          ? "text-white"
                          : "text-gray-500 group-hover:text-gray-300"
                      }`}
                    />
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                )}

                {/* Submenu */}
                {item.children && isExpanded && (
                  <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-1">
                    {item.children.map((child) => {
                      const isActive = location.pathname === child.path;
                      return (
                        <Link
                          key={child.path}
                          to={child.path}
                          onClick={onClose}
                          className={`flex items-center px-3 py-2 rounded-lg text-sm transition-all ${
                            isActive
                              ? "text-white bg-white/5 font-medium"
                              : "text-gray-500 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-white/5 mt-auto bg-dark/50 backdrop-blur-sm">
          <div
            className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group relative cursor-pointer"
            onClick={() => navigate("/settings")}
          >
            <div className="flex items-center min-w-0">
              <div className="relative">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/10"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center text-xs font-bold shrink-0">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-dark rounded-full"></div>
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">
                  {user?.name || "Guest User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role || "Viewer"}
                </p>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
              className="text-gray-500 hover:text-error p-1.5 rounded-md hover:bg-white/10 transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
