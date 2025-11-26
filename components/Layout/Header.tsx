import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  HelpCircle,
  Menu,
  Clock,
  ArrowRight,
  Users,
  BarChart2,
  Building2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  leadService,
  dealService,
  companyService,
} from "../../services/supabaseServices";

interface HeaderProps {
  onMenuClick: () => void;
}

const NOTIFICATIONS = [
  {
    id: 1,
    title: "New Lead Assigned",
    desc: "Shivtej Magar was assigned to you.",
    time: "5m ago",
    unread: true,
  },
  {
    id: 2,
    title: "Goal Reached",
    desc: "You hit your weekly email target!",
    time: "1h ago",
    unread: true,
  },
  {
    id: 3,
    title: "Meeting Reminder",
    desc: "Demo with TechFlow in 30 mins.",
    time: "2h ago",
    unread: false,
  },
  {
    id: 4,
    title: "System Update",
    desc: "Nexus SalesOS updated to v2.1.",
    time: "1d ago",
    unread: false,
  },
];

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearch(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      const [leads, deals, companies] = await Promise.all([
        leadService.getAll(),
        dealService.getAll(),
        companyService.getAll(),
      ]);

      const foundLeads = leads
        .filter((l) => l.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .map((l) => ({ ...l, type: "lead" }));
      const foundDeals = deals
        .filter((d) =>
          d.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map((d) => ({ ...d, type: "deal" }));
      const foundCompanies = companies
        .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .map((c) => ({ ...c, type: "company" }));

      setSearchResults(
        [...foundLeads, ...foundDeals, ...foundCompanies].slice(0, 5)
      );
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearchResultClick = (result: any) => {
    setShowSearch(false);
    setSearchQuery("");
    if (result.type === "lead") navigate("/prospect/people");
    if (result.type === "company") navigate("/prospect/companies");
    if (result.type === "deal") navigate("/meetings/deals");
  };

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-dark/90 backdrop-blur-md border-b border-white/5 z-30 flex items-center justify-between px-4 md:px-6">
      {/* Mobile Menu & Search */}
      <div className="flex items-center flex-1 gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden text-gray-400 hover:text-white"
        >
          <Menu size={24} />
        </button>

        {/* Search Bar */}
        <div
          className="relative w-full max-w-md hidden sm:block"
          ref={searchRef}
        >
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Search leads, companies, deals..."
              className="w-full bg-white/5 border border-white/5 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-all focus:ring-1 focus:ring-primary focus:bg-white/10"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearch(true);
              }}
              onFocus={() => setShowSearch(true)}
            />
          </div>

          {/* Search Results Dropdown */}
          {showSearch && searchQuery.length > 1 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-dark border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
              {searchResults.length > 0 ? (
                searchResults.map((result, idx) => (
                  <div
                    key={`${result.type}-${result.id}-${idx}`}
                    onClick={() => handleSearchResultClick(result)}
                    className="p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-none flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-gray-400">
                      {result.type === "lead" && <Users size={16} />}
                      {result.type === "deal" && <BarChart2 size={16} />}
                      {result.type === "company" && <Building2 size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {result.name || result.title}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {result.type}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No results found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <div className="relative" ref={notifRef}>
          <button
            className="relative text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {NOTIFICATIONS.some((n) => n.unread) && (
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-error rounded-full border-2 border-dark"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-dark border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-3 border-b border-white/5 flex justify-between items-center bg-white/5">
                <h3 className="font-bold text-sm text-white">Notifications</h3>
                <button className="text-xs text-primary hover:underline">
                  Mark all read
                </button>
              </div>
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                {NOTIFICATIONS.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 border-b border-white/5 hover:bg-white/5 transition-colors ${
                      notif.unread ? "bg-white/5" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-1">
                        {notif.title.includes("Lead") ? (
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                        ) : notif.title.includes("Goal") ? (
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-500 mt-1.5"></div>
                        )}
                      </div>
                      <div>
                        <p
                          className={`text-sm ${
                            notif.unread
                              ? "font-bold text-white"
                              : "text-gray-300"
                          }`}
                        >
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {notif.desc}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                          <Clock size={10} /> {notif.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 text-center border-t border-white/5 bg-white/5">
                <button className="text-xs text-gray-400 hover:text-white flex items-center justify-center gap-1 w-full">
                  View All <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>

        <button className="text-gray-400 hover:text-white transition-colors hidden sm:block p-2 hover:bg-white/5 rounded-full">
          <HelpCircle size={20} />
        </button>

        {/* Mobile Search Toggle (Visible only on small screens) */}
        <button
          className="text-gray-400 hover:text-white sm:hidden"
          onClick={() => setShowSearch(!showSearch)}
        >
          <Search size={20} />
        </button>
      </div>
    </header>
  );
};
