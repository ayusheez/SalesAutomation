import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardBody } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { SlideOver } from "../components/ui/SlideOver";
import { Modal } from "../components/ui/Modal";
import { Input, Select } from "../components/ui/Input";
import { useToast } from "../components/ui/Toast";
import {
  leadService,
  companyService,
  listService,
  sequenceService,
} from "../services/supabaseServices";
import { generateIcebreaker } from "../services/geminiService";
import {
  Lead,
  Company,
  LeadStatus,
  UserList,
  Sequence,
  SavedSearch,
} from "../types";
import {
  Search,
  MapPin,
  Building,
  Filter,
  Download,
  Plus,
  Mail,
  Phone,
  Linkedin,
  Trash2,
  Edit2,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Globe,
  Users,
  CheckSquare,
  Square,
  Briefcase,
  Tag,
  List,
  Save,
  RefreshCw,
  Check,
  X,
  Eye,
  MoreHorizontal,
  Layers,
  ShieldCheck,
  AlertTriangle,
  UserPlus,
  PlayCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Flame,
  Zap,
  Bookmark,
  Target,
} from "lucide-react";

// --- Types & Interfaces ---

type ViewMode = "net_new" | "saved";
type EntityType = "people" | "companies";

interface FilterState {
  name: string;
  jobTitles: string;
  companies: string;
  locations: string;
  industries: string;
  keywords: string;
  employees: string[];
  managementLevels: string[];
  listId: string;
  intent: "High" | "Medium" | "Low" | "";
  signals: string[];
}

const EMPLOYEE_RANGES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "500-1000",
  "1000+",
];
const MANAGEMENT_LEVELS = [
  "C-Level",
  "VP",
  "Director",
  "Manager",
  "Individual",
];
const SIGNALS_LIST = [
  "Hiring",
  "Funding",
  "Job Change",
  "New Tech Stack",
  "Expansion",
  "Rebranding",
];

// --- Components ---

interface FilterSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
  activeCount?: number;
  icon?: React.ElementType;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  isOpen,
  onToggle,
  children,
  activeCount,
  icon: Icon,
}) => (
  <div className="border-b border-white/5">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-3 px-4 text-xs font-bold uppercase text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className="text-primary" />}
        {title}
        {activeCount ? (
          <span className="bg-primary text-white px-1.5 py-0.5 rounded-full text-[10px] shadow-sm">
            {activeCount}
          </span>
        ) : null}
      </div>
      {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
    </button>
    {isOpen && (
      <div className="px-4 pb-4 pt-1 animate-in slide-in-from-top-1 duration-200">
        {children}
      </div>
    )}
  </div>
);

const TableSkeleton = () => (
  <div className="space-y-4 p-6 animate-pulse">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="flex gap-4 items-center">
        <div className="w-5 h-5 bg-white/5 rounded"></div>
        <div className="w-10 h-10 bg-white/5 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/5 rounded w-1/4"></div>
          <div className="h-3 bg-white/5 rounded w-1/3"></div>
        </div>
        <div className="w-20 h-6 bg-white/5 rounded"></div>
        <div className="w-24 h-6 bg-white/5 rounded"></div>
      </div>
    ))}
  </div>
);

export const Prospecting: React.FC<any> = ({ initialView }) => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  // --- State ---
  const [entityType, setEntityType] = useState<EntityType>("people");
  const [viewMode, setViewMode] = useState<ViewMode>("net_new");

  const [leads, setLeads] = useState<Lead[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [userLists, setUserLists] = useState<UserList[]>([]);
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    name: "",
    jobTitles: "",
    companies: "",
    locations: "",
    industries: "",
    keywords: "",
    employees: [],
    managementLevels: [],
    listId: "all",
    intent: "",
    signals: [],
  });

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    lists: true,
    persona: true,
    company: true,
    location: true,
    keywords: false,
    intent: true,
    signals: false,
  });

  // Selection & Actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [revealingIds, setRevealingIds] = useState<Set<string>>(new Set());

  // SlideOver / Modal Details
  const [selectedItem, setSelectedItem] = useState<Lead | Company | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<any>({});

  const [isSaveListModalOpen, setIsSaveListModalOpen] = useState(false);
  const [targetListId, setTargetListId] = useState<string>("");
  const [newListName, setNewListName] = useState("");
  const [itemToSave, setItemToSave] = useState<string | null>(null);

  const [isSaveSearchModalOpen, setIsSaveSearchModalOpen] = useState(false);
  const [newSearchName, setNewSearchName] = useState("");

  const [isAddToSeqModalOpen, setIsAddToSeqModalOpen] = useState(false);
  const [targetSeqId, setTargetSeqId] = useState("");

  // AI
  const [generatedIcebreaker, setGeneratedIcebreaker] = useState("");
  const [isGeneratingIcebreaker, setIsGeneratingIcebreaker] = useState(false);

  // --- Effects ---

  useEffect(() => {
    // Handle initial view props if passed (e.g. from routing)
    if (initialView) {
      if (initialView === "people") setEntityType("people");
      if (initialView === "companies") setEntityType("companies");
      if (initialView === "saved") {
        setViewMode("saved");
        setFilters((f) => ({ ...f, listId: "all" }));
      }
    }
    loadData();
    loadSavedSearches();
  }, [initialView]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds(new Set());
  }, [filters, viewMode, entityType]);

  // Update list counts whenever leads/companies change
  useEffect(() => {
    const counts: Record<string, number> = {};
    [...leads, ...companies].forEach((item) => {
      item.lists?.forEach((listId) => {
        counts[listId] = (counts[listId] || 0) + 1;
      });
    });

    setUserLists((prev) =>
      prev.map((list) => ({
        ...list,
        count: counts[list.id] || 0,
      }))
    );
  }, [leads, companies]);

  const loadData = async () => {
    setLoading(true);
    // Simulate API delay
    const [l, c, uLists, seqs] = await Promise.all([
      leadService.getAll(),
      companyService.getAll(),
      listService.getAll(),
      sequenceService.getAll(),
    ]);

    // Ensure data is robust
    const enrichedLeads = l.map((lead) => ({
      ...lead,
      isContactRevealed: lead.isContactRevealed || false,
      emailStatus:
        lead.emailStatus ||
        ((Math.random() > 0.4 ? "verified" : "guessed") as
          | "verified"
          | "guessed"),
    }));

    setLeads(enrichedLeads);
    setCompanies(c);
    setUserLists(uLists);
    setSequences(seqs);
    setLoading(false);
  };

  const loadSavedSearches = () => {
    setSavedSearches([
      {
        id: "1",
        name: "VP Sales in Tech",
        filters: { jobTitles: "VP Sales", industries: "Software" },
      },
      {
        id: "2",
        name: "High Intent Founders",
        filters: { managementLevels: ["C-Level"], intent: "High" },
      },
    ]);
  };

  // --- Filtering Logic ---

  const filteredData = useMemo(() => {
    let data: any[] = entityType === "people" ? leads : companies;

    // View Mode Filter
    if (viewMode === "saved") {
      data = data.filter((item) => item.lists && item.lists.length > 0);
      if (filters.listId !== "all") {
        data = data.filter((item) => item.lists?.includes(filters.listId));
      }
    } else {
      // Net New Mode: Show items NOT in any list OR if we are just searching general DB
      // For simplicity in this demo, Net New shows everything or items not in lists.
      // Let's assume Net New = Not in current selected list context or All if no list selected.
      // A stricter interpretation:
      data = data.filter((item) => !item.lists || item.lists.length === 0);
    }

    if (filters.name) {
      data = data.filter((item) =>
        item.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    if (filters.locations) {
      data = data.filter((item) =>
        item.location.toLowerCase().includes(filters.locations.toLowerCase())
      );
    }

    if (filters.intent) {
      if (filters.intent === "High")
        data = data.filter((item) => (item.intentScore || 0) >= 80);
      else if (filters.intent === "Medium")
        data = data.filter(
          (item) =>
            (item.intentScore || 0) >= 50 && (item.intentScore || 0) < 80
        );
      else if (filters.intent === "Low")
        data = data.filter((item) => (item.intentScore || 0) < 50);
    }

    if (filters.signals.length > 0) {
      data = data.filter((item) =>
        item.signals?.some((s: string) => filters.signals.includes(s))
      );
    }

    if (entityType === "people") {
      if (filters.jobTitles) {
        data = data.filter((item: Lead) =>
          item.title.toLowerCase().includes(filters.jobTitles.toLowerCase())
        );
      }
      if (filters.companies) {
        data = data.filter((item: Lead) =>
          item.company.toLowerCase().includes(filters.companies.toLowerCase())
        );
      }
      if (filters.managementLevels.length > 0) {
        data = data.filter((item: Lead) => {
          return filters.managementLevels.some((level) => {
            if (level === "C-Level")
              return /\b(Chief|CEO|CTO|CFO|COO)\b/i.test(item.title);
            if (level === "VP")
              return (
                /\bVP\b/i.test(item.title) ||
                /\bVice President\b/i.test(item.title)
              );
            if (level === "Director") return /\bDirector\b/i.test(item.title);
            if (level === "Manager") return /\bManager\b/i.test(item.title);
            return true;
          });
        });
      }
    } else {
      if (filters.companies) {
        data = data.filter((item: Company) =>
          item.name.toLowerCase().includes(filters.companies.toLowerCase())
        );
      }
      if (filters.industries) {
        data = data.filter((item: Company) =>
          item.industry.toLowerCase().includes(filters.industries.toLowerCase())
        );
      }
      if (filters.employees.length > 0) {
        data = data.filter((item: Company) =>
          filters.employees.includes(item.employees)
        );
      }
    }

    if (filters.keywords) {
      const k = filters.keywords.toLowerCase();
      data = data.filter((item) => {
        const text = [
          item.name,
          (item as any).title,
          (item as any).company,
          (item as any).industry,
          (item as any).description,
          ...(item.tags || []),
        ]
          .join(" ")
          .toLowerCase();
        return text.includes(k);
      });
    }

    return data;
  }, [leads, companies, entityType, viewMode, filters]);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- Handlers ---

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleSelectAll = () => {
    // Select only visible page items for safety in this demo
    const pageIds = paginatedData.map((i) => i.id);
    const allSelected = pageIds.every((id) => selectedIds.has(id));

    const newSet = new Set(selectedIds);
    if (allSelected) {
      pageIds.forEach((id) => newSet.delete(id));
    } else {
      pageIds.forEach((id) => newSet.add(id));
    }
    setSelectedIds(newSet);
  };

  const openSaveModal = (e: React.MouseEvent, itemId?: string) => {
    e.stopPropagation();
    if (itemId) setItemToSave(itemId);
    else setItemToSave(null);
    setTargetListId("");
    setIsSaveListModalOpen(true);
  };

  const handleConfirmSave = async () => {
    let finalListId = targetListId;

    if (!finalListId && newListName) {
      const newList = await listService.add({ name: newListName, count: 0 });
      setUserLists((prev) => [...prev, newList]);
      finalListId = newList.id;
    }

    if (!finalListId) {
      addToast("Please select or create a list", "error");
      return;
    }

    const itemsToUpdate = itemToSave ? [itemToSave] : Array.from(selectedIds);

    if (itemsToUpdate.length === 0) return;

    if (entityType === "people") {
      const updatedLeads = await Promise.all(
        leads.map(async (l) => {
          if (itemsToUpdate.includes(l.id)) {
            const currentLists = l.lists || [];
            if (!currentLists.includes(finalListId)) {
              const updated = { ...l, lists: [...currentLists, finalListId] };
              await leadService.update(updated);
              return updated;
            }
          }
          return l;
        })
      );
      setLeads(updatedLeads);
    } else {
      const updatedCompanies = await Promise.all(
        companies.map(async (c) => {
          if (itemsToUpdate.includes(c.id)) {
            const currentLists = c.lists || [];
            if (!currentLists.includes(finalListId)) {
              const updated = { ...c, lists: [...currentLists, finalListId] };
              await companyService.update(updated);
              return updated;
            }
          }
          return c;
        })
      );
      setCompanies(updatedCompanies);
    }

    addToast(`${itemsToUpdate.length} ${entityType} saved to list`, "success");
    setIsSaveListModalOpen(false);
    setNewListName("");
    setTargetListId("");
    setSelectedIds(new Set());
  };

  const handleAddToSequence = async () => {
    if (!targetSeqId) return;
    const itemsToUpdate = Array.from(selectedIds);

    const updatedLeads = await Promise.all(
      leads.map(async (l) => {
        if (itemsToUpdate.includes(l.id)) {
          const updated = { ...l, campaignStatus: "Active" as const };
          await leadService.update(updated);
          return updated;
        }
        return l;
      })
    );
    setLeads(updatedLeads);

    addToast(`${itemsToUpdate.length} leads added to sequence!`, "success");
    setIsAddToSeqModalOpen(false);
    setTargetSeqId("");
    setSelectedIds(new Set());
  };

  const handleSaveSearch = () => {
    if (!newSearchName) return;
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: newSearchName,
      filters: { ...filters },
    };
    setSavedSearches([...savedSearches, newSearch]);
    setIsSaveSearchModalOpen(false);
    setNewSearchName("");
    addToast("Search criteria saved.", "success");
  };

  const applySavedSearch = (search: SavedSearch) => {
    setFilters({ ...filters, ...search.filters });
    addToast(`Applied filter: ${search.name}`, "info");
  };

  const handleRevealContact = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const lead = leads.find((l) => l.id === id);
    if (!lead) return;
    if (lead.isContactRevealed) return;

    setRevealingIds((prev) => new Set(prev).add(id));

    // Simulate API call to reveal data
    setTimeout(async () => {
      const updatedLead = { ...lead, isContactRevealed: true };
      await leadService.update(updatedLead);

      setLeads((prev) => prev.map((l) => (l.id === id ? updatedLead : l)));
      if (selectedItem?.id === id) setSelectedItem(updatedLead);

      setRevealingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      addToast("Contact info revealed (1 credit used)", "success");
    }, 800);
  };

  const handleExport = () => {
    if (selectedIds.size === 0) return;

    const items =
      entityType === "people"
        ? leads.filter((l) => selectedIds.has(l.id))
        : companies.filter((c) => selectedIds.has(c.id));

    // Create CSV content
    const headers =
      entityType === "people"
        ? ["Name", "Title", "Company", "Email", "Phone", "Location", "LinkedIn"]
        : ["Name", "Industry", "Employees", "Website", "Location"];

    const rows = items.map((item: any) => {
      if (entityType === "people") {
        return [
          item.name,
          item.title,
          item.company,
          item.isContactRevealed ? item.email : "Locked",
          item.isContactRevealed ? item.phone : "Locked",
          item.location,
          item.linkedinUrl || "",
        ];
      } else {
        return [
          item.name,
          item.industry,
          item.employees,
          item.website || "",
          item.location,
        ];
      }
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `nexus_export_${entityType}_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(`Exported ${selectedIds.size} records`, "success");
    setSelectedIds(new Set());
  };

  const handleBulkEmail = () => {
    addToast(
      `Compose window opened for ${selectedIds.size} recipients`,
      "info"
    );
    // In a real app, this would route to the inbox with recipients pre-filled
    navigate("/email/inbox");
  };

  const handleRowClick = (item: Lead | Company) => {
    setSelectedItem(item);
    setGeneratedIcebreaker("");
    setIsDetailsOpen(true);
  };

  const handleGenerateIcebreaker = async () => {
    if (!selectedItem || !("title" in selectedItem)) return;
    setIsGeneratingIcebreaker(true);
    const text = await generateIcebreaker(selectedItem as Lead);
    setGeneratedIcebreaker(text);
    setIsGeneratingIcebreaker(false);
  };

  const handleCreate = async () => {
    if (entityType === "people") {
      if (!newItem.name) return addToast("Name is required", "error");
      const added = await leadService.add({
        ...newItem,
        status: LeadStatus.NEW,
      });
      setLeads([added, ...leads]);
    } else {
      if (!newItem.name) return addToast("Name is required", "error");
      const added = await companyService.add(newItem);
      setCompanies([added, ...companies]);
    }
    setIsCreateModalOpen(false);
    setNewItem({});
    addToast("Record created manually", "success");
  };

  const toggleArrayFilter = (
    arr: string[],
    val: string,
    setter: (val: string[]) => void
  ) => {
    if (arr.includes(val)) setter(arr.filter((x) => x !== val));
    else setter([...arr, val]);
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] -m-4 md:-m-6">
      {/* === LEFT SIDEBAR: FILTERS === */}
      <div className="w-64 bg-dark border-r border-white/5 flex flex-col shrink-0 overflow-y-auto custom-scrollbar z-20">
        {/* View Switcher */}
        <div className="p-4 pb-2 sticky top-0 bg-dark z-20 border-b border-white/5">
          <div className="flex bg-white/5 border border-white/5 rounded-lg p-1 mb-4">
            <button
              onClick={() => {
                setViewMode("net_new");
                setFilters({ ...filters, listId: "all" });
              }}
              className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${
                viewMode === "net_new"
                  ? "bg-primary text-white shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Net New
            </button>
            <button
              onClick={() => setViewMode("saved")}
              className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${
                viewMode === "saved"
                  ? "bg-primary text-white shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Saved
            </button>
          </div>

          <div className="relative mb-2">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Search keywords..."
              className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 pl-9 text-xs text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none placeholder-gray-500 transition-all"
              value={filters.keywords}
              onChange={(e) =>
                setFilters({ ...filters, keywords: e.target.value })
              }
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs h-7 flex items-center justify-center gap-2 border-white/10 hover:border-white/20"
            onClick={() => setIsSaveSearchModalOpen(true)}
          >
            <Bookmark size={12} /> Save Search
          </Button>
        </div>

        {/* Saved Searches */}
        {savedSearches.length > 0 && (
          <div className="p-4 pt-2 border-b border-white/5">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">
              Saved Searches
            </p>
            <div className="space-y-1">
              {savedSearches.map((search) => (
                <button
                  key={search.id}
                  onClick={() => applySavedSearch(search)}
                  className="w-full text-left px-2 py-1.5 text-xs rounded text-gray-400 hover:text-white hover:bg-white/5 transition-colors truncate"
                >
                  {search.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Lists - Always visible if Saved view, optional in Net New for exclusion logic (not implemented here for simplicity) */}
        {viewMode === "saved" && (
          <FilterSection
            title="Lists"
            isOpen={openSections.lists}
            onToggle={() => toggleSection("lists")}
          >
            <div className="space-y-1">
              <button
                onClick={() => setFilters({ ...filters, listId: "all" })}
                className={`w-full text-left px-2 py-1.5 text-xs rounded transition-colors ${
                  filters.listId === "all"
                    ? "bg-primary/20 text-white font-bold"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                All Saved
              </button>
              {userLists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => setFilters({ ...filters, listId: list.id })}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded transition-colors flex justify-between items-center ${
                    filters.listId === list.id
                      ? "bg-primary/20 text-white font-bold"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="truncate max-w-[140px]">{list.name}</span>
                  <span className="bg-white/5 px-1.5 py-0.5 rounded text-[10px] text-gray-500">
                    {list.count}
                  </span>
                </button>
              ))}
              <button
                onClick={(e) => openSaveModal(e)}
                className="w-full text-left px-2 py-1.5 text-xs text-primary hover:underline flex items-center gap-1"
              >
                <Plus size={12} /> Create List
              </button>
            </div>
          </FilterSection>
        )}

        <FilterSection
          title="Buying Intent"
          icon={Target}
          isOpen={openSections.intent}
          onToggle={() => toggleSection("intent")}
          activeCount={filters.intent ? 1 : 0}
        >
          <div className="space-y-1">
            <button
              onClick={() => setFilters({ ...filters, intent: "" })}
              className={`w-full text-left px-2 py-1 text-xs rounded ${
                filters.intent === "" ? "text-white font-bold" : "text-gray-400"
              }`}
            >
              Any Intent
            </button>
            <button
              onClick={() => setFilters({ ...filters, intent: "High" })}
              className={`w-full text-left px-2 py-1 text-xs rounded flex items-center gap-2 ${
                filters.intent === "High"
                  ? "text-white font-bold bg-white/10"
                  : "text-gray-400"
              }`}
            >
              <Flame size={12} className="text-orange-500" /> High Intent
            </button>
            <button
              onClick={() => setFilters({ ...filters, intent: "Medium" })}
              className={`w-full text-left px-2 py-1 text-xs rounded flex items-center gap-2 ${
                filters.intent === "Medium"
                  ? "text-white font-bold bg-white/10"
                  : "text-gray-400"
              }`}
            >
              <Flame size={12} className="text-yellow-500" /> Medium Intent
            </button>
            <button
              onClick={() => setFilters({ ...filters, intent: "Low" })}
              className={`w-full text-left px-2 py-1 text-xs rounded flex items-center gap-2 ${
                filters.intent === "Low"
                  ? "text-white font-bold bg-white/10"
                  : "text-gray-400"
              }`}
            >
              <Flame size={12} className="text-blue-500" /> Low Intent
            </button>
          </div>
        </FilterSection>

        <FilterSection
          title="Signals"
          icon={Zap}
          isOpen={openSections.signals}
          onToggle={() => toggleSection("signals")}
          activeCount={filters.signals.length}
        >
          <div className="space-y-1">
            {SIGNALS_LIST.map((sig) => (
              <label
                key={sig}
                className="flex items-center gap-2 cursor-pointer hover:bg-white/5 rounded px-2 py-1"
              >
                <input
                  type="checkbox"
                  checked={filters.signals.includes(sig)}
                  onChange={() =>
                    toggleArrayFilter(filters.signals, sig, (val) =>
                      setFilters({ ...filters, signals: val })
                    )
                  }
                  className="rounded border-gray-600 bg-dark text-primary focus:ring-0 w-3 h-3"
                />
                <span className="text-xs text-gray-400">{sig}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        <FilterSection
          title="Persona"
          isOpen={openSections.persona}
          onToggle={() => toggleSection("persona")}
          activeCount={
            filters.managementLevels.length > 0 ||
            filters.jobTitles ||
            filters.name
              ? 1
              : 0
          }
        >
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">
                Name
              </label>
              <input
                placeholder="e.g. John Doe"
                className="w-full bg-white/5 border border-white/5 rounded px-2 py-1.5 text-xs text-white focus:border-primary outline-none placeholder-gray-600 transition-all"
                value={filters.name}
                onChange={(e) =>
                  setFilters({ ...filters, name: e.target.value })
                }
              />
            </div>
            {entityType === "people" && (
              <>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">
                    Job Titles
                  </label>
                  <input
                    placeholder="e.g. CEO, VP Sales"
                    className="w-full bg-white/5 border border-white/5 rounded px-2 py-1.5 text-xs text-white focus:border-primary outline-none placeholder-gray-600 transition-all"
                    value={filters.jobTitles}
                    onChange={(e) =>
                      setFilters({ ...filters, jobTitles: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">
                    Management Level
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {MANAGEMENT_LEVELS.map((l) => (
                      <button
                        key={l}
                        onClick={() =>
                          toggleArrayFilter(
                            filters.managementLevels,
                            l,
                            (val) =>
                              setFilters({ ...filters, managementLevels: val })
                          )
                        }
                        className={`px-2 py-1 rounded text-[10px] border transition-colors ${
                          filters.managementLevels.includes(l)
                            ? "bg-primary/20 border-primary text-white"
                            : "bg-white/5 border-white/5 text-gray-400 hover:border-gray-500 hover:text-white"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </FilterSection>

        <FilterSection
          title="Company"
          isOpen={openSections.company}
          onToggle={() => toggleSection("company")}
          activeCount={
            filters.companies ||
            filters.industries ||
            filters.employees.length > 0
              ? 1
              : 0
          }
        >
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">
                Company Name
              </label>
              <input
                placeholder="e.g. Acme Corp"
                className="w-full bg-white/5 border border-white/5 rounded px-2 py-1.5 text-xs text-white focus:border-primary outline-none placeholder-gray-600 transition-all"
                value={filters.companies}
                onChange={(e) =>
                  setFilters({ ...filters, companies: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">
                Industry
              </label>
              <input
                placeholder="e.g. Software, Finance"
                className="w-full bg-white/5 border border-white/5 rounded px-2 py-1.5 text-xs text-white focus:border-primary outline-none placeholder-gray-600 transition-all"
                value={filters.industries}
                onChange={(e) =>
                  setFilters({ ...filters, industries: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">
                # Employees
              </label>
              <div className="space-y-1">
                {EMPLOYEE_RANGES.map((range) => (
                  <label
                    key={range}
                    className="flex items-center gap-2 cursor-pointer hover:bg-white/5 rounded px-1 py-0.5"
                  >
                    <input
                      type="checkbox"
                      checked={filters.employees.includes(range)}
                      onChange={() =>
                        toggleArrayFilter(filters.employees, range, (val) =>
                          setFilters({ ...filters, employees: val })
                        )
                      }
                      className="rounded border-gray-600 bg-dark text-primary focus:ring-0 w-3 h-3"
                    />
                    <span className="text-xs text-gray-400">{range}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </FilterSection>

        <FilterSection
          title="Location"
          isOpen={openSections.location}
          onToggle={() => toggleSection("location")}
          activeCount={filters.locations ? 1 : 0}
        >
          <div className="flex items-center bg-white/5 border border-white/5 rounded px-2 py-1.5 transition-all focus-within:border-primary">
            <MapPin size={12} className="text-gray-500 mr-2" />
            <input
              placeholder="City, State, Country..."
              className="w-full bg-transparent text-xs text-white focus:outline-none placeholder-gray-600"
              value={filters.locations}
              onChange={(e) =>
                setFilters({ ...filters, locations: e.target.value })
              }
            />
          </div>
        </FilterSection>
      </div>

      {/* === MAIN CONTENT === */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#131229]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-white/5 bg-dark flex flex-col gap-4 shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setEntityType("people")}
                className={`text-sm font-bold pb-2 border-b-2 transition-colors flex items-center gap-2 ${
                  entityType === "people"
                    ? "text-white border-primary"
                    : "text-gray-500 border-transparent hover:text-gray-300"
                }`}
              >
                <Users size={16} /> People
                <span className="text-xs bg-white/5 px-1.5 py-0.5 rounded text-gray-400 border border-white/5">
                  {entityType === "people" ? totalItems : ""}
                </span>
              </button>
              <button
                onClick={() => setEntityType("companies")}
                className={`text-sm font-bold pb-2 border-b-2 transition-colors flex items-center gap-2 ${
                  entityType === "companies"
                    ? "text-white border-primary"
                    : "text-gray-500 border-transparent hover:text-gray-300"
                }`}
              >
                <Building size={16} /> Companies
              </button>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={loadData}>
                <RefreshCw size={14} />
              </Button>
              <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
                <Plus size={14} className="mr-1" /> Add New
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="text-gray-400">
              <span className="font-bold text-white text-lg mr-1">
                {totalItems.toLocaleString()}
              </span>{" "}
              results in{" "}
              <span className="text-primary font-bold">
                {viewMode === "net_new" ? "Net New" : "Saved Lists"}
              </span>
            </div>

            <div className="flex gap-2 items-center">
              {(filters.name ||
                filters.jobTitles ||
                filters.companies ||
                filters.locations ||
                filters.industries ||
                filters.keywords ||
                filters.intent ||
                filters.signals.length > 0) && (
                <Button
                  variant="link"
                  size="sm"
                  className="text-error h-auto p-0 text-xs"
                  onClick={() =>
                    setFilters({
                      name: "",
                      jobTitles: "",
                      companies: "",
                      locations: "",
                      industries: "",
                      keywords: "",
                      employees: [],
                      managementLevels: [],
                      listId: "all",
                      intent: "",
                      signals: [],
                    })
                  }
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar (Sticky) */}
        {selectedIds.size > 0 && (
          <div className="bg-primary text-white px-6 py-2.5 flex items-center justify-between animate-in slide-in-from-top-2 shadow-lg z-20 sticky top-0">
            <div className="text-sm font-bold flex items-center gap-2">
              <CheckSquare size={18} className="text-white" />{" "}
              {selectedIds.size} Selected
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="h-8 bg-white/20 hover:bg-white/30 text-white border-none"
                onClick={(e) => openSaveModal(e)}
              >
                <Save size={14} className="mr-1" /> Save to List
              </Button>
              <Button
                size="sm"
                className="h-8 bg-white/20 hover:bg-white/30 text-white border-none"
                onClick={() => setIsAddToSeqModalOpen(true)}
              >
                <PlayCircle size={14} className="mr-1" /> Add to Sequence
              </Button>
              <Button
                size="sm"
                className="h-8 bg-white/20 hover:bg-white/30 text-white border-none"
                onClick={handleBulkEmail}
              >
                <Mail size={14} className="mr-1" /> Email
              </Button>
              <Button
                size="sm"
                className="h-8 bg-white/20 hover:bg-white/30 text-white border-none"
                onClick={handleExport}
              >
                <Download size={14} className="mr-1" /> Export CSV
              </Button>
              <div className="w-px h-8 bg-white/20 mx-2"></div>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-white/70 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="flex-1 overflow-auto custom-scrollbar bg-dark">
          {loading ? (
            <TableSkeleton />
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#1e1d3d]/90 backdrop-blur-md text-xs font-bold text-gray-400 uppercase sticky top-0 z-10 shadow-sm border-b border-white/5">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <div
                      className="cursor-pointer hover:text-white"
                      onClick={handleSelectAll}
                    >
                      {paginatedData.length > 0 &&
                      paginatedData.every((i) => selectedIds.has(i.id)) ? (
                        <CheckSquare size={16} className="text-primary" />
                      ) : (
                        <Square size={16} />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 w-10"></th>
                  <th className="px-4 py-3">Name</th>
                  {entityType === "people" ? (
                    <>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Company</th>
                      <th className="px-4 py-3">Intent</th>
                      <th className="px-4 py-3">Tags & Signals</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Contact Info</th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-3">Industry</th>
                      <th className="px-4 py-3">Employees</th>
                      <th className="px-4 py-3">Intent</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Keywords</th>
                    </>
                  )}
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-300 divide-y divide-white/5">
                {paginatedData.map((item: any) => {
                  const isSaved = item.lists && item.lists.length > 0;
                  const isSelected = selectedIds.has(item.id);
                  const isRevealed = item.isContactRevealed; // Use persisted property
                  const isRevealing = revealingIds.has(item.id);
                  const emailStatus = item.emailStatus || "guessed";

                  const intentColor =
                    (item.intentScore || 0) > 80
                      ? "text-orange-500"
                      : (item.intentScore || 0) > 50
                      ? "text-yellow-500"
                      : "text-blue-500";

                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleRowClick(item)}
                      className={`hover:bg-white/5 transition-colors cursor-pointer group ${
                        isSelected ? "bg-primary/5" : ""
                      }`}
                    >
                      <td
                        className="px-4 py-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelection(item.id);
                        }}
                      >
                        <div
                          className={`cursor-pointer ${
                            isSelected
                              ? "text-primary"
                              : "text-gray-600 group-hover:text-gray-400"
                          }`}
                        >
                          {isSelected ? (
                            <CheckSquare size={16} />
                          ) : (
                            <Square size={16} />
                          )}
                        </div>
                      </td>
                      <td
                        className="px-4 py-3"
                        onClick={(e) => openSaveModal(e, item.id)}
                      >
                        <div
                          className={`cursor-pointer transition-transform active:scale-90 ${
                            isSaved
                              ? "text-primary"
                              : "text-gray-600 group-hover:text-gray-400"
                          }`}
                        >
                          <Save
                            size={16}
                            fill={isSaved ? "currentColor" : "none"}
                          />
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden border border-white/10 relative shadow-sm">
                            {item.avatarUrl || item.logoUrl ? (
                              <img
                                src={item.avatarUrl || item.logoUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              item.name.charAt(0)
                            )}
                            {isSaved && (
                              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary border border-dark rounded-full"></div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white hover:text-primary transition-colors">
                              {item.name}
                            </div>
                            {entityType === "companies" && item.website && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Globe size={10} /> {item.website}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {entityType === "people" ? (
                        <>
                          <td
                            className="px-4 py-3 max-w-[150px] truncate"
                            title={item.title}
                          >
                            {item.title}
                          </td>
                          <td className="px-4 py-3 text-primary hover:underline">
                            {item.company}
                          </td>

                          <td className="px-4 py-3">
                            <div
                              className={`flex items-center gap-1 font-bold ${intentColor}`}
                            >
                              <Flame size={14} fill="currentColor" />{" "}
                              {item.intentScore || 0}
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              {item.tags && item.tags.length > 0 && (
                                <div className="flex gap-1 flex-wrap">
                                  {item.tags.map((tag: string) => (
                                    <span
                                      key={tag}
                                      className="px-1.5 py-0.5 bg-primary/20 text-primary border border-primary/30 rounded text-[9px] uppercase font-bold tracking-wider"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <div className="flex gap-1 flex-wrap">
                                {(item.signals || [])
                                  .slice(0, 2)
                                  .map((sig: string) => (
                                    <span
                                      key={sig}
                                      className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] text-gray-400 uppercase tracking-wider"
                                    >
                                      {sig}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              {item.campaignStatus &&
                              item.campaignStatus !== "None" ? (
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded border w-fit font-bold uppercase ${
                                    item.campaignStatus === "Active"
                                      ? "bg-green-500/10 text-green-400 border-green-500/30"
                                      : item.campaignStatus === "Completed"
                                      ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                      : "bg-gray-500/10 text-gray-400 border-gray-500/30"
                                  }`}
                                >
                                  {item.campaignStatus}
                                </span>
                              ) : (
                                <span className="text-[10px] text-gray-600">
                                  -
                                </span>
                              )}

                              {item.linkedinStatus && (
                                <div
                                  className="flex items-center gap-1 text-[10px] text-gray-500"
                                  title={`LinkedIn: ${item.linkedinStatus}`}
                                >
                                  <Linkedin
                                    size={10}
                                    className={
                                      item.linkedinStatus === "connected"
                                        ? "text-[#0077b5]"
                                        : "text-gray-600"
                                    }
                                  />
                                  {item.linkedinStatus === "connected"
                                    ? "1st"
                                    : item.linkedinStatus === "pending"
                                    ? "Pending"
                                    : ""}
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3 text-gray-500">
                            {item.location}
                          </td>
                          <td
                            className="px-4 py-3 min-w-[180px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {isRevealed ? (
                              <div className="space-y-1 animate-in fade-in duration-300">
                                <div className="flex items-center gap-2 text-xs text-white">
                                  <Mail
                                    size={12}
                                    className={
                                      emailStatus === "verified"
                                        ? "text-green-500"
                                        : "text-orange-500"
                                    }
                                  />
                                  {item.email}
                                  {emailStatus === "verified" && (
                                    <span title="Verified">
                                      <ShieldCheck
                                        size={10}
                                        className="text-green-500"
                                      />
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  <Phone size={12} className="text-blue-400" />{" "}
                                  {item.phone}
                                </div>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-7 text-xs bg-white/5 border border-white/10 hover:border-primary hover:text-primary w-full justify-center shadow-sm"
                                onClick={(e) => handleRevealContact(e, item.id)}
                                disabled={isRevealing}
                              >
                                {isRevealing ? (
                                  <>
                                    <Loader2
                                      size={12}
                                      className="animate-spin mr-2"
                                    />{" "}
                                    Verifying...
                                  </>
                                ) : (
                                  "Access Email & Phone"
                                )}
                              </Button>
                            )}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3">{item.industry}</td>
                          <td className="px-4 py-3">{item.employees}</td>
                          <td className="px-4 py-3">
                            <div
                              className={`flex items-center gap-1 font-bold ${intentColor}`}
                            >
                              <Flame size={14} fill="currentColor" />{" "}
                              {item.intentScore || 0}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {item.location}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 flex-wrap">
                              {(item.techStack || [])
                                .slice(0, 2)
                                .map((t: string) => (
                                  <span
                                    key={t}
                                    className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-gray-400"
                                  >
                                    {t}
                                  </span>
                                ))}
                              {(item.techStack?.length || 0) > 2 && (
                                <span className="text-[10px] text-gray-500">
                                  +{item.techStack.length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                        </>
                      )}

                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 px-2 bg-white/5 hover:bg-white/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate("/email/inbox");
                            }}
                          >
                            <Mail size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 px-2 bg-white/5 hover:bg-white/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIds(new Set([item.id]));
                              setIsAddToSeqModalOpen(true);
                            }}
                          >
                            <PlayCircle size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 px-2 bg-white/5 hover:bg-white/10"
                          >
                            <Linkedin size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-12 text-center">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                        <Search size={24} className="text-gray-500" />
                      </div>
                      <p className="text-gray-400 font-medium">
                        No results found.
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Try adjusting your filters or switching views.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Pagination */}
        <div className="px-6 py-3 bg-dark border-t border-white/5 flex justify-between items-center shrink-0 text-xs">
          <div className="text-gray-500">
            Showing{" "}
            {filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}{" "}
            to {Math.min(currentPage * itemsPerPage, filteredData.length)} of{" "}
            {filteredData.length} records
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-7 text-xs gap-1 px-3"
            >
              <ArrowLeft size={12} /> Previous
            </Button>
            <div className="px-2 text-gray-400">
              Page {currentPage} of {totalPages || 1}
            </div>
            <Button
              variant="secondary"
              size="sm"
              disabled={
                currentPage === totalPages || totalPages === 0 || loading
              }
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-7 text-xs gap-1 px-3"
            >
              Next <ArrowRight size={12} />
            </Button>
          </div>
        </div>
      </div>

      {/* === DETAILS SLIDEOVER === */}
      <SlideOver
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={
          selectedItem
            ? "title" in selectedItem
              ? "Person Details"
              : "Company Details"
            : "Details"
        }
        width="max-w-lg"
      >
        {selectedItem && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-start gap-4">
              <img
                src={
                  (selectedItem as any).avatarUrl ||
                  (selectedItem as any).logoUrl
                }
                className="w-20 h-20 rounded-xl object-cover border-2 border-white/10 bg-white"
                alt=""
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {(selectedItem as any).name}
                </h2>
                <p className="text-primary text-lg mb-1">
                  {(selectedItem as any).title ||
                    (selectedItem as any).industry}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} /> {(selectedItem as any).location}
                  </span>
                  {"company" in selectedItem && (
                    <span className="flex items-center gap-1">
                      <Building size={14} /> {(selectedItem as any).company}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {(selectedItem.intentScore ||
              (selectedItem.signals && selectedItem.signals.length > 0)) && (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded bg-white/5 border border-white/5">
                  <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">
                    Buying Intent
                  </p>
                  <div className="flex items-center gap-2 font-bold text-white">
                    <Flame
                      size={16}
                      className={
                        (selectedItem.intentScore || 0) > 80
                          ? "text-orange-500"
                          : "text-blue-500"
                      }
                      fill="currentColor"
                    />
                    {selectedItem.intentScore || 0}/100
                  </div>
                </div>
                <div className="p-3 rounded bg-white/5 border border-white/5">
                  <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">
                    Signals
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedItem.signals?.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-300 border border-white/5"
                      >
                        {s}
                      </span>
                    ))}
                    {(!selectedItem.signals ||
                      selectedItem.signals.length === 0) && (
                      <span className="text-xs text-gray-600">-</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                className="flex-1 gap-2"
                onClick={() => navigate("/email/inbox")}
              >
                <Mail size={16} /> Email
              </Button>
              <Button
                variant="secondary"
                className="flex-1 gap-2"
                onClick={(e) => handleRevealContact(e, selectedItem.id)}
              >
                <Phone size={16} /> Call
              </Button>
              <Button
                variant="outline"
                className={`w-12 flex items-center justify-center p-0 ${
                  selectedItem.lists && selectedItem.lists.length > 0
                    ? "text-primary border-primary bg-primary/10"
                    : ""
                }`}
                onClick={(e) => openSaveModal(e, selectedItem.id)}
              >
                <Save
                  size={18}
                  fill={
                    selectedItem.lists && selectedItem.lists.length > 0
                      ? "currentColor"
                      : "none"
                  }
                />
              </Button>
            </div>

            <Card>
              <CardHeader className="py-3 bg-white/5">
                <h4 className="font-bold text-sm">Contact Information</h4>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm flex items-center gap-2">
                    <Mail size={14} /> Email
                  </span>
                  <span className="text-white text-sm select-all flex items-center gap-2">
                    {(selectedItem as any).isContactRevealed
                      ? (selectedItem as any).email
                      : "••••••••@company.com"}
                    {(selectedItem as any).isContactRevealed && (
                      <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-500 text-[10px] border border-green-500/20">
                        Verified
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm flex items-center gap-2">
                    <Phone size={14} /> Phone
                  </span>
                  <span className="text-white text-sm select-all">
                    {(selectedItem as any).isContactRevealed
                      ? (selectedItem as any).phone
                      : "+1 ••• ••• ••••"}
                  </span>
                </div>
                {!(selectedItem as any).isContactRevealed && (
                  <div className="pt-2 mt-2 border-t border-white/5 text-center">
                    <button
                      className="text-primary text-xs font-bold hover:underline flex items-center justify-center gap-2 mx-auto"
                      onClick={(e) => handleRevealContact(e, selectedItem.id)}
                    >
                      {revealingIds.has(selectedItem.id) ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : null}
                      {revealingIds.has(selectedItem.id)
                        ? "Verifying..."
                        : "Reveal Info (1 Credit)"}
                    </button>
                  </div>
                )}
              </CardBody>
            </Card>

            {"title" in selectedItem && (
              <Card className="bg-gradient-to-br from-primary/10 to-purple-900/10 border-primary/30">
                <CardBody>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <Sparkles size={16} className="text-primary" /> AI
                      Icebreaker
                    </h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleGenerateIcebreaker}
                      disabled={isGeneratingIcebreaker}
                    >
                      {isGeneratingIcebreaker ? "Generating..." : "Generate"}
                    </Button>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg border border-white/10 min-h-[80px] text-sm text-gray-300 italic">
                    {generatedIcebreaker ||
                      "Click generate to create a personalized intro based on their profile."}
                  </div>
                </CardBody>
              </Card>
            )}

            <div>
              <h4 className="font-bold text-white text-sm mb-3">Saved Lists</h4>
              <div className="flex flex-wrap gap-2">
                {selectedItem.lists?.map((listId) => {
                  const list = userLists.find((l) => l.id === listId);
                  return list ? (
                    <span
                      key={listId}
                      className="px-2 py-1 rounded bg-white/5 text-xs text-gray-300 flex items-center gap-1 border border-white/10"
                    >
                      <List size={10} /> {list.name}
                    </span>
                  ) : null;
                })}
                <button
                  onClick={(e) => openSaveModal(e, selectedItem.id)}
                  className="px-2 py-1 rounded border border-dashed border-gray-600 text-xs text-gray-500 hover:text-white hover:border-white transition-colors"
                >
                  + Add to List
                </button>
              </div>
            </div>
          </div>
        )}
      </SlideOver>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={`Add New ${entityType === "people" ? "Person" : "Company"}`}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate}>Save Record</Button>
          </>
        }
      >
        {entityType === "people" ? (
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={newItem.name || ""}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
            <Input
              label="Email"
              value={newItem.email || ""}
              onChange={(e) =>
                setNewItem({ ...newItem, email: e.target.value })
              }
            />
            <Input
              label="Job Title"
              value={newItem.title || ""}
              onChange={(e) =>
                setNewItem({ ...newItem, title: e.target.value })
              }
            />
            <Input
              label="Company"
              value={newItem.company || ""}
              onChange={(e) =>
                setNewItem({ ...newItem, company: e.target.value })
              }
            />
            <Input
              label="Location"
              value={newItem.location || ""}
              onChange={(e) =>
                setNewItem({ ...newItem, location: e.target.value })
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              label="Company Name"
              value={newItem.name || ""}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
            <Input
              label="Industry"
              value={newItem.industry || ""}
              onChange={(e) =>
                setNewItem({ ...newItem, industry: e.target.value })
              }
            />
            <Input
              label="Website"
              value={newItem.website || ""}
              onChange={(e) =>
                setNewItem({ ...newItem, website: e.target.value })
              }
            />
            <Select
              label="Employees"
              value={newItem.employees || ""}
              onChange={(e) =>
                setNewItem({ ...newItem, employees: e.target.value })
              }
            >
              <option value="">Select size...</option>
              <option value="1-10">1-10</option>
              <option value="11-50">11-50</option>
              <option value="51-200">51-200</option>
              <option value="201-500">201-500</option>
              <option value="500+">500+</option>
            </Select>
            <Input
              label="Location"
              value={newItem.location || ""}
              onChange={(e) =>
                setNewItem({ ...newItem, location: e.target.value })
              }
            />
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isSaveListModalOpen}
        onClose={() => setIsSaveListModalOpen(false)}
        title="Save to List"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsSaveListModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmSave}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Select a list to save{" "}
            {itemToSave ? "this prospect" : `${selectedIds.size} prospects`} to:
          </p>

          <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar border border-white/5 rounded-lg p-2 bg-white/5">
            {userLists.map((list) => (
              <label
                key={list.id}
                className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer group"
              >
                <input
                  type="radio"
                  name="list"
                  checked={targetListId === list.id}
                  onChange={() => setTargetListId(list.id)}
                  className="text-primary focus:ring-primary bg-dark border-gray-600"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">
                    {list.name}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {list.count} items
                  </p>
                </div>
              </label>
            ))}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-dark text-gray-500">Or create new</span>
            </div>
          </div>

          <Input
            placeholder="New List Name..."
            value={newListName}
            onChange={(e) => {
              setNewListName(e.target.value);
              setTargetListId("");
            }}
            onFocus={() => setTargetListId("")}
          />
        </div>
      </Modal>

      <Modal
        isOpen={isAddToSeqModalOpen}
        onClose={() => setIsAddToSeqModalOpen(false)}
        title="Add to Sequence"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsAddToSeqModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddToSequence}>Enroll Leads</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Select an active sequence to enroll selected leads:
          </p>
          <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar border border-white/5 rounded-lg p-2 bg-white/5">
            {sequences.map((seq) => (
              <label
                key={seq.id}
                className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer group"
              >
                <input
                  type="radio"
                  name="seq"
                  checked={targetSeqId === seq.id}
                  onChange={() => setTargetSeqId(seq.id)}
                  className="text-primary focus:ring-primary bg-dark border-gray-600"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">
                      {seq.name}
                    </p>
                    {seq.active ? (
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500">
                    {seq.steps.length} steps • {seq.stats.sent} sent
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isSaveSearchModalOpen}
        onClose={() => setIsSaveSearchModalOpen(false)}
        title="Save Search"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsSaveSearchModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveSearch}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Search Name"
            placeholder="e.g. SaaS Founders - NY"
            value={newSearchName}
            onChange={(e) => setNewSearchName(e.target.value)}
            autoFocus
          />
          <div className="bg-white/5 p-3 rounded border border-white/5 text-xs text-gray-400">
            <p className="font-bold text-gray-300 mb-1">Current Filters:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              {filters.intent && <li>Intent: {filters.intent}</li>}
              {filters.signals.length > 0 && (
                <li>Signals: {filters.signals.join(", ")}</li>
              )}
              {filters.jobTitles && <li>Title: {filters.jobTitles}</li>}
              {filters.locations && <li>Location: {filters.locations}</li>}
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};
