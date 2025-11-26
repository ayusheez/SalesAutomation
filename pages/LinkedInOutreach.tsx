import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  LinkedInCampaign,
  LinkedInMessage,
  SequenceStep,
  Lead,
  Company,
  UserList,
} from "../types";
import {
  linkedinService,
  leadService,
  companyService,
  listService,
} from "../services/supabaseServices";
import { useToast } from "../components/ui/Toast";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  UserPlus,
  Users,
  MessageSquare,
  ThumbsUp,
  ArrowRight,
  Zap,
  Plus,
  ArrowLeft,
  Play,
  Pause,
  MoreHorizontal,
  Edit2,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  Settings,
  MousePointer,
  Send,
  Search,
  Filter,
  Save,
  Linkedin,
  X,
  List,
  CheckSquare,
} from "lucide-react";
import { Modal } from "../components/ui/Modal";
import { Input, Textarea, Select } from "../components/ui/Input";

const CHART_DATA = [
  { name: "Mon", connections: 12 },
  { name: "Tue", connections: 19 },
  { name: "Wed", connections: 15 },
  { name: "Thu", connections: 28 },
  { name: "Fri", connections: 34 },
  { name: "Sat", connections: 22 },
  { name: "Sun", connections: 10 },
];

interface LinkedInOutreachProps {
  initialView?: "find" | "builder" | "analytics";
}

export const LinkedInOutreach: React.FC<LinkedInOutreachProps> = ({
  initialView = "find",
}) => {
  const { addToast } = useToast();
  const [view, setView] = useState<"find" | "builder" | "analytics">(
    initialView
  );
  const [campaigns, setCampaigns] = useState<LinkedInCampaign[]>([]);
  const [messages, setMessages] = useState<LinkedInMessage[]>([]);
  const [selectedCampaign, setSelectedCampaign] =
    useState<LinkedInCampaign | null>(null);

  // Find View State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [userLists, setUserLists] = useState<UserList[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

  // Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    title: "",
    location: "",
    industry: "",
    companySize: "",
  });

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");

  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [stepData, setStepData] = useState<Partial<SequenceStep>>({
    type: "linkedin_connect",
  });

  // Save to Campaign Modal
  const [isAddToCampaignModalOpen, setIsAddToCampaignModalOpen] =
    useState(false);
  const [targetCampaignId, setTargetCampaignId] = useState("");

  // Save to List Modal
  const [isSaveListModalOpen, setIsSaveListModalOpen] = useState(false);
  const [targetListId, setTargetListId] = useState("");
  const [newListName, setNewListName] = useState("");

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [camps, msgs, allLeads, allCompanies, uLists] = await Promise.all([
      linkedinService.getAllCampaigns(),
      linkedinService.getMessages(),
      leadService.getAll(),
      companyService.getAll(),
      listService.getAll(),
    ]);
    setCampaigns(camps);
    setMessages(msgs);
    setLeads(allLeads);
    setCompanies(allCompanies);
    setUserLists(uLists);

    // Select first campaign by default if in builder mode and none selected
    if (initialView === "builder" && camps.length > 0 && !selectedCampaign) {
      setSelectedCampaign(camps[0]);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      lead.name.toLowerCase().includes(searchLower) ||
      lead.company.toLowerCase().includes(searchLower) ||
      lead.title.toLowerCase().includes(searchLower);

    const matchesTitle =
      !filters.title ||
      lead.title.toLowerCase().includes(filters.title.toLowerCase());
    const matchesLocation =
      !filters.location ||
      lead.location.toLowerCase().includes(filters.location.toLowerCase());

    // Company based filters
    let matchesIndustry = true;
    let matchesSize = true;

    if (filters.industry || filters.companySize) {
      const company = companies.find((c) => c.name === lead.company);
      if (company) {
        if (
          filters.industry &&
          !company.industry
            .toLowerCase()
            .includes(filters.industry.toLowerCase())
        )
          matchesIndustry = false;
        if (filters.companySize && company.employees !== filters.companySize)
          matchesSize = false;
      } else {
        // If company not found but filter applied, exclude lead (strict filtering)
        if (filters.industry || filters.companySize) matchesIndustry = false;
      }
    }

    return (
      matchesSearch &&
      matchesTitle &&
      matchesLocation &&
      matchesIndustry &&
      matchesSize
    );
  });

  const handleSelectAll = () => {
    const allVisibleIds = filteredLeads.map((l) => l.id);
    const allSelected =
      allVisibleIds.length > 0 &&
      allVisibleIds.every((id) => selectedLeads.has(id));

    if (allSelected) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(allVisibleIds));
    }
  };

  const handleCreateCampaign = async () => {
    if (!newCampaignName) return;
    const newCamp = await linkedinService.addCampaign({
      name: newCampaignName,
      status: "paused",
      targetAudience: "General",
      stats: { sent: 0, accepted: 0, replied: 0 },
      steps: [
        { id: "s1", type: "linkedin_visit", order: 1 },
        { id: "s2", type: "wait", delayDays: 1, order: 2 },
        {
          id: "s3",
          type: "linkedin_connect",
          order: 3,
          content: "Hi {{firstName}}, let's connect!",
        },
      ],
    });
    setCampaigns([newCamp, ...campaigns]);
    setSelectedCampaign(newCamp);
    setView("builder");
    setIsCreateModalOpen(false);
    setNewCampaignName("");
    addToast("Campaign created successfully", "success");
  };

  const handleToggleStatus = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = await linkedinService.toggleStatus(id);
    setCampaigns(campaigns.map((c) => (c.id === id ? updated : c)));
    if (selectedCampaign?.id === id) setSelectedCampaign(updated);
    addToast(
      `Campaign ${updated.status === "active" ? "Resumed" : "Paused"}`,
      "info"
    );
  };

  const handleDeleteCampaign = async () => {
    if (!selectedCampaign) return;
    if (confirm("Delete this campaign?")) {
      await linkedinService.delete(selectedCampaign.id);
      setCampaigns(campaigns.filter((c) => c.id !== selectedCampaign.id));
      setView("find"); // Go back to find view
      setSelectedCampaign(null);
      addToast("Campaign deleted", "info");
    }
  };

  const handleAddStep = async () => {
    if (!selectedCampaign || !stepData.type) return;
    const newStep: SequenceStep = {
      id: `step-${Date.now()}`,
      type: stepData.type as any,
      content: stepData.content,
      delayDays: stepData.delayDays
        ? parseInt(stepData.delayDays as any)
        : undefined,
      order: selectedCampaign.steps.length + 1,
    };
    const newSteps = [...selectedCampaign.steps, newStep];
    await linkedinService.updateSteps(selectedCampaign.id, newSteps);

    const updatedCamp = { ...selectedCampaign, steps: newSteps };
    setCampaigns(
      campaigns.map((c) => (c.id === selectedCampaign.id ? updatedCamp : c))
    );
    setSelectedCampaign(updatedCamp);
    setIsStepModalOpen(false);
    addToast("Step added", "success");
  };

  // Quick Add Connection Function
  const handleQuickAddConnection = async () => {
    if (!selectedCampaign) return;
    const newStep: SequenceStep = {
      id: `step-${Date.now()}`,
      type: "linkedin_connect",
      content: "Hi {{firstName}}, I'd like to join your professional network.",
      order: selectedCampaign.steps.length + 1,
    };
    const newSteps = [...selectedCampaign.steps, newStep];
    await linkedinService.updateSteps(selectedCampaign.id, newSteps);

    const updatedCamp = { ...selectedCampaign, steps: newSteps };
    setCampaigns(
      campaigns.map((c) => (c.id === selectedCampaign.id ? updatedCamp : c))
    );
    setSelectedCampaign(updatedCamp);
    addToast("Connection Request step added!", "success");
  };

  const handleRemoveStep = async (stepId: string) => {
    if (!selectedCampaign) return;
    const newSteps = selectedCampaign.steps.filter((s) => s.id !== stepId);
    await linkedinService.updateSteps(selectedCampaign.id, newSteps);
    const updatedCamp = { ...selectedCampaign, steps: newSteps };
    setCampaigns(
      campaigns.map((c) => (c.id === selectedCampaign.id ? updatedCamp : c))
    );
    setSelectedCampaign(updatedCamp);
  };

  const handleAddToCampaign = async () => {
    if (!targetCampaignId) return;
    const campaign = campaigns.find((c) => c.id === targetCampaignId);
    if (!campaign) return;

    // Check if campaign has connection request, if not add it automatically
    let updatedCampaign = campaign;
    const hasConnectStep = campaign.steps.some(
      (s) => s.type === "linkedin_connect"
    );

    if (!hasConnectStep) {
      const newStep: SequenceStep = {
        id: `step-auto-${Date.now()}`,
        type: "linkedin_connect",
        content: "Hi {{firstName}}, I saw your profile and wanted to connect.",
        order: campaign.steps.length + 1,
      };
      const newSteps = [...campaign.steps, newStep];
      await linkedinService.updateSteps(campaign.id, newSteps);
      updatedCampaign = { ...campaign, steps: newSteps };
      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaign.id ? updatedCampaign : c))
      );
      addToast("Added missing Connection Request step to campaign", "info");
    }

    addToast(
      `${selectedLeads.size} leads added to "${updatedCampaign.name}"`,
      "success"
    );
    setIsAddToCampaignModalOpen(false);
    setSelectedLeads(new Set());
    setTargetCampaignId("");
  };

  const handleSaveToList = async () => {
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

    const leadsToUpdate = leads.filter((l) => selectedLeads.has(l.id));
    for (const l of leadsToUpdate) {
      const currentLists = l.lists || [];
      if (!currentLists.includes(finalListId)) {
        await leadService.update({
          ...l,
          lists: [...currentLists, finalListId],
        });
      }
    }

    // Refresh leads to show updated list counts/icons
    const freshLeads = await leadService.getAll();
    setLeads(freshLeads);

    addToast(`${selectedLeads.size} leads saved to list`, "success");
    setIsSaveListModalOpen(false);
    setSelectedLeads(new Set());
    setTargetListId("");
    setNewListName("");
  };

  // --- Render Helpers ---
  const renderIcon = (type: string) => {
    switch (type) {
      case "linkedin_connect":
        return <UserPlus size={18} />;
      case "linkedin_message":
        return <MessageSquare size={18} />;
      case "linkedin_visit":
        return <Eye size={18} />;
      case "linkedin_like":
        return <ThumbsUp size={18} />;
      case "wait":
        return <Clock size={18} />;
      default:
        return <Zap size={18} />;
    }
  };

  const renderStepLabel = (type: string) => {
    switch (type) {
      case "linkedin_connect":
        return "Connect Request";
      case "linkedin_message":
        return "Send Message";
      case "linkedin_visit":
        return "View Profile";
      case "linkedin_like":
        return "Like Post";
      case "wait":
        return "Delay";
      default:
        return "Action";
    }
  };

  const renderFindLeads = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Linkedin className="text-[#0077b5]" /> Find Leads on LinkedIn
          </h1>
          <p className="text-gray-400">
            Search and save prospects directly to your outreach campaigns.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setView("builder")}>
            Manage Campaigns
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={16} className="mr-2" /> New Campaign
          </Button>
        </div>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Search Panel */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <div className="p-4 border-b border-dark-secondary flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  className="w-full bg-dark-surface border border-dark-secondary rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-primary focus:outline-none"
                  placeholder="Search by name, title, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant={showFilters ? "primary" : "outline"}
                className="gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} /> {showFilters ? "Hide Filters" : "Filters"}
              </Button>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="p-4 bg-dark-surface/30 border-b border-dark-secondary grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top-1">
                <Input
                  placeholder="Job Title"
                  value={filters.title}
                  onChange={(e) =>
                    setFilters({ ...filters, title: e.target.value })
                  }
                  className="mb-0"
                />
                <Input
                  placeholder="Location"
                  value={filters.location}
                  onChange={(e) =>
                    setFilters({ ...filters, location: e.target.value })
                  }
                  className="mb-0"
                />
                <Input
                  placeholder="Industry"
                  value={filters.industry}
                  onChange={(e) =>
                    setFilters({ ...filters, industry: e.target.value })
                  }
                  className="mb-0"
                />
                <Select
                  value={filters.companySize}
                  onChange={(e) =>
                    setFilters({ ...filters, companySize: e.target.value })
                  }
                  className="mb-0"
                >
                  <option value="">Any Size</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-500">201-500</option>
                  <option value="500-1000">500-1000</option>
                  <option value="1000+">1000+</option>
                </Select>
              </div>
            )}

            {/* Results Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-dark-surface/50 text-xs text-gray-400 uppercase font-bold">
                  <tr>
                    <th className="px-6 py-3 w-10">
                      <input
                        type="checkbox"
                        className="rounded bg-dark border-gray-600 text-primary focus:ring-primary"
                        checked={
                          filteredLeads.length > 0 &&
                          Array.from(selectedLeads).length >=
                            filteredLeads.length
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Title</th>
                    <th className="px-6 py-3">Location</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-secondary text-sm">
                  {filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-dark-surface/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedLeads.has(lead.id)}
                          onChange={() => {
                            const newSet = new Set(selectedLeads);
                            if (newSet.has(lead.id)) newSet.delete(lead.id);
                            else newSet.add(lead.id);
                            setSelectedLeads(newSet);
                          }}
                          className="rounded bg-dark border-gray-600 text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                        <img
                          src={lead.avatarUrl}
                          className="w-8 h-8 rounded-full"
                          alt=""
                        />
                        {lead.name}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {lead.title} at{" "}
                        <span className="text-primary">{lead.company}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {lead.location}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-2 hover:border-[#0077b5] hover:text-[#0077b5]"
                          onClick={() => {
                            setSelectedLeads(new Set([lead.id]));
                            setIsAddToCampaignModalOpen(true);
                          }}
                        >
                          <UserPlus size={14} /> Connect
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredLeads.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-12 text-center text-gray-500"
                      >
                        No leads found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {selectedLeads.size > 0 && (
              <div className="p-3 bg-primary/10 border-t border-primary/20 flex justify-between items-center px-6 sticky bottom-0 backdrop-blur-md">
                <span className="text-sm font-bold text-primary">
                  {selectedLeads.size} leads selected
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 bg-white/5 border-none text-gray-300"
                    onClick={() => setSelectedLeads(new Set())}
                  >
                    Clear Selection
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 gap-2"
                    onClick={() => setIsSaveListModalOpen(true)}
                  >
                    <List size={14} /> Save to List
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 gap-2"
                    onClick={() => setIsAddToCampaignModalOpen(true)}
                  >
                    <UserPlus size={14} /> Add to Campaign
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-4">
          <Card className="bg-[#0077b5]/10 border-[#0077b5]/30">
            <CardBody className="p-4">
              <p className="text-[#0077b5] text-xs uppercase font-bold mb-1">
                Acceptance Rate
              </p>
              <h3 className="text-2xl font-bold text-white">42%</h3>
              <p className="text-xs text-gray-400 mt-1">+5% vs last week</p>
            </CardBody>
          </Card>
          <Card>
            <CardHeader className="py-3">
              <h4 className="font-bold text-sm">Active Campaigns</h4>
            </CardHeader>
            <div className="divide-y divide-dark-secondary">
              {campaigns
                .filter((c) => c.status === "active")
                .slice(0, 3)
                .map((c) => (
                  <div
                    key={c.id}
                    className="p-3 flex justify-between items-center hover:bg-dark-surface/30 cursor-pointer"
                    onClick={() => {
                      setSelectedCampaign(c);
                      setView("builder");
                    }}
                  >
                    <div className="truncate pr-2">
                      <div className="text-sm font-medium text-white truncate">
                        {c.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {c.stats.sent} sent
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-gray-600" />
                  </div>
                ))}
              {campaigns.filter((c) => c.status === "active").length === 0 && (
                <div className="p-4 text-center text-xs text-gray-500">
                  No active campaigns
                </div>
              )}
            </div>
            <div className="p-2 border-t border-dark-secondary text-center">
              <button
                className="text-xs text-primary hover:underline"
                onClick={() => setView("builder")}
              >
                View All
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderBuilder = () => {
    // If no campaign selected, show a list to select from
    if (!selectedCampaign) {
      return (
        <div className="h-full flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Select a Campaign</h2>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={16} className="mr-2" /> New Campaign
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((c) => (
              <Card
                key={c.id}
                className="cursor-pointer hover:border-primary transition-all group"
                onClick={() => setSelectedCampaign(c)}
              >
                <CardBody>
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={`p-2 rounded-lg ${
                        c.status === "active"
                          ? "bg-green-500/20 text-green-500"
                          : "bg-gray-700/50 text-gray-400"
                      }`}
                    >
                      <Zap
                        size={20}
                        fill={c.status === "active" ? "currentColor" : "none"}
                      />
                    </div>
                    <MoreHorizontal
                      size={20}
                      className="text-gray-600 group-hover:text-white"
                    />
                  </div>
                  <h3 className="font-bold text-lg text-white mb-1">
                    {c.name}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    {c.targetAudience}
                  </p>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>
                      <strong>{c.steps.length}</strong> Steps
                    </span>
                    <span>
                      <strong>{c.stats.sent}</strong> Sent
                    </span>
                  </div>
                </CardBody>
              </Card>
            ))}
            {campaigns.length === 0 && (
              <div className="col-span-full p-12 text-center border-2 border-dashed border-dark-secondary rounded-xl text-gray-500">
                No campaigns found. Create one to get started.
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="h-[calc(100vh-7rem)] flex flex-col animate-in slide-in-from-right-10 duration-300">
        {/* Builder Header */}
        <div className="flex justify-between items-center mb-6 bg-dark-surface/50 p-4 rounded-lg border border-dark-secondary">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCampaign(null)}
            >
              <ArrowLeft size={16} className="mr-2" /> All Campaigns
            </Button>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {selectedCampaign.name}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={(e) => handleToggleStatus(e, selectedCampaign.id)}
              className={
                selectedCampaign.status === "active"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-600 hover:bg-gray-700"
              }
            >
              {selectedCampaign.status === "active" ? (
                <>
                  <Pause size={16} className="mr-2" /> Pause
                </>
              ) : (
                <>
                  <Play size={16} className="mr-2" /> Resume
                </>
              )}
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteCampaign}>
              <Trash2 size={16} />
            </Button>
          </div>
        </div>

        {/* Visual Flow for Builder */}
        <div className="flex-1 bg-dark-surface/20 border border-dark-secondary rounded-xl relative overflow-hidden flex flex-col p-8">
          <div className="flex-1 overflow-x-auto flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4 min-w-[300px]">
              {/* Start Node */}
              <div className="px-4 py-2 rounded bg-green-500/20 border border-green-500 text-green-400 font-bold text-sm shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                Start Campaign
              </div>

              {/* Steps */}
              {selectedCampaign.steps.map((step, idx) => (
                <React.Fragment key={step.id}>
                  <div className="h-8 w-0.5 bg-gray-600"></div>
                  <Card className="w-80 p-4 relative group hover:border-primary transition-colors bg-dark">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded bg-dark-surface text-primary border border-dark-secondary">
                        {renderIcon(step.type)}
                      </div>
                      <div>
                        <span className="font-bold text-sm block">
                          {renderStepLabel(step.type)}
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                          Step {idx + 1}
                        </span>
                      </div>
                    </div>
                    {step.type === "wait" ? (
                      <p className="text-xs text-gray-400 bg-dark-surface p-2 rounded">
                        Wait for <strong>{step.delayDays} days</strong>
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 line-clamp-2 italic bg-dark-surface p-2 rounded border border-white/5">
                        "{step.content || "No content"}"
                      </p>
                    )}
                    <button
                      onClick={() => handleRemoveStep(step.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-dark border border-dark-secondary rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-500 shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X size={12} />
                    </button>
                  </Card>
                </React.Fragment>
              ))}

              <div className="h-8 w-0.5 bg-gray-600"></div>

              {/* Add Step Controls */}
              <div className="flex flex-col gap-2 items-center">
                <Button
                  variant="outline"
                  className="rounded-full w-10 h-10 p-0 border-dashed"
                  onClick={() => setIsStepModalOpen(true)}
                  title="Add Step"
                >
                  <Plus size={20} />
                </Button>

                {/* Quick Add Connection Button */}
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-4 gap-2 border border-blue-500/30 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20"
                  onClick={handleQuickAddConnection}
                >
                  <UserPlus size={14} /> Add Connection Request
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {view === "find" ? (
        renderFindLeads()
      ) : view === "builder" ? (
        renderBuilder()
      ) : (
        <div className="p-10 text-center text-gray-500">
          Analytics View Coming Soon
        </div>
      )}

      {/* Create Campaign Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create LinkedIn Campaign"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCampaign}>Create</Button>
          </>
        }
      >
        <Input
          label="Campaign Name"
          placeholder="e.g. Q3 Outreach"
          value={newCampaignName}
          onChange={(e) => setNewCampaignName(e.target.value)}
          autoFocus
        />
      </Modal>

      {/* Add Step Modal */}
      <Modal
        isOpen={isStepModalOpen}
        onClose={() => setIsStepModalOpen(false)}
        title="Add Step"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsStepModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStep}>Add</Button>
          </>
        }
      >
        <Select
          label="Action"
          value={stepData.type}
          onChange={(e) =>
            setStepData({ ...stepData, type: e.target.value as any })
          }
        >
          <option value="linkedin_connect">Connect Request</option>
          <option value="linkedin_message">Message</option>
          <option value="linkedin_visit">Visit Profile</option>
          <option value="wait">Wait</option>
        </Select>
        {stepData.type === "wait" ? (
          <Input
            label="Days"
            type="number"
            value={stepData.delayDays || ""}
            onChange={(e) =>
              setStepData({ ...stepData, delayDays: e.target.value as any })
            }
          />
        ) : (
          (stepData.type === "linkedin_connect" ||
            stepData.type === "linkedin_message") && (
            <Textarea
              label="Message"
              value={stepData.content || ""}
              onChange={(e) =>
                setStepData({ ...stepData, content: e.target.value })
              }
            />
          )
        )}
      </Modal>

      {/* Add to Campaign Modal */}
      <Modal
        isOpen={isAddToCampaignModalOpen}
        onClose={() => setIsAddToCampaignModalOpen(false)}
        title="Save to Campaign"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsAddToCampaignModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddToCampaign}>Save & Connect</Button>
          </>
        }
      >
        <p className="text-sm text-gray-400 mb-4">
          Select a campaign to add {selectedLeads.size} leads to. A connection
          request step will be added automatically if missing.
        </p>
        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
          {campaigns.map((c) => (
            <div
              key={c.id}
              onClick={() => setTargetCampaignId(c.id)}
              className={`p-3 rounded border cursor-pointer ${
                targetCampaignId === c.id
                  ? "bg-primary/20 border-primary"
                  : "bg-dark-surface border-dark-secondary hover:border-gray-500"
              }`}
            >
              <div className="font-bold text-white text-sm">{c.name}</div>
              <div className="text-xs text-gray-500">
                {c.steps.length} steps • {c.stats.sent} sent
              </div>
            </div>
          ))}
        </div>
        <Button
          variant="link"
          className="mt-2 pl-0 text-xs"
          onClick={() => {
            setIsAddToCampaignModalOpen(false);
            setIsCreateModalOpen(true);
          }}
        >
          + Create New Campaign
        </Button>
      </Modal>

      {/* Save to List Modal */}
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
            <Button onClick={handleSaveToList}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Select a list to save {selectedLeads.size} prospects to:
          </p>

          <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar border border-dark-secondary rounded-lg p-2 bg-dark-surface/30">
            {userLists.map((list) => (
              <label
                key={list.id}
                className="flex items-center gap-3 p-2 hover:bg-dark-secondary rounded cursor-pointer group"
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
              <div className="w-full border-t border-dark-secondary"></div>
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
    </>
  );
};
