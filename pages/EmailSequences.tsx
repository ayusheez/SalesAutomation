import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { sequenceService } from "../services/supabaseServices";
import { useToast } from "../components/ui/Toast";
import { Sequence, SequenceStep } from "../types";
import {
  Plus,
  Mail,
  Clock,
  MoreVertical,
  Play,
  Pause,
  Settings,
  ArrowLeft,
  Trash2,
  Split,
  BarChart2,
  Send,
  MessageSquare,
  Phone,
  CheckCircle,
  MousePointer,
  AlertCircle,
  Edit3,
  Copy,
  ExternalLink,
  Zap,
  Search,
  Filter,
  Eye,
  CornerDownRight,
} from "lucide-react";
import { Modal } from "../components/ui/Modal";
import { Input, Select, Textarea } from "../components/ui/Input";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";

interface EmailSequencesProps {
  initialTab?: "workflow" | "analytics" | "settings";
}

export const EmailSequences: React.FC<EmailSequencesProps> = ({
  initialTab = "workflow",
}) => {
  const { addToast } = useToast();
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [filteredSequences, setFilteredSequences] = useState<Sequence[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSequence, setSelectedSequence] = useState<Sequence | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<
    "workflow" | "analytics" | "settings"
  >(initialTab);
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  // Modal States
  const [isAddSeqModalOpen, setIsAddSeqModalOpen] = useState(false);
  const [newSeqName, setNewSeqName] = useState("");

  const [isAddStepModalOpen, setIsAddStepModalOpen] = useState(false);
  const [stepData, setStepData] = useState<{
    type: SequenceStep["type"];
    content: string;
    delayDays: string;
  }>({
    type: "email",
    content: "",
    delayDays: "1",
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    loadSequences();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredSequences(
        sequences.filter((s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredSequences(sequences);
    }
  }, [searchQuery, sequences]);

  const loadSequences = async () => {
    const data = await sequenceService.getAll();
    setSequences(data);
    setFilteredSequences(data);
    if (data.length > 0 && !selectedSequence && window.innerWidth > 1024) {
      setSelectedSequence(data[0]);
    }
  };

  const handleSelectSequence = (seq: Sequence) => {
    setSelectedSequence(seq);
    setShowMobileDetail(true);
    // Keep current tab active
  };

  // ... (Rest of the handlers like handleToggleActive, handleAddStepSubmit, etc. remain unchanged) ...
  const handleToggleActive = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!selectedSequence) return;
    await sequenceService.toggleActive(selectedSequence.id);
    const updatedSequence = {
      ...selectedSequence,
      active: !selectedSequence.active,
    };
    setSequences((prev) =>
      prev.map((s) => (s.id === selectedSequence.id ? updatedSequence : s))
    );
    setSelectedSequence(updatedSequence);
    addToast(
      `Sequence ${updatedSequence.active ? "Activated" : "Paused"}`,
      updatedSequence.active ? "success" : "info"
    );
  };

  const handleAddStepSubmit = async () => {
    if (!selectedSequence) return;
    const newStep: SequenceStep = {
      id: `new-${Date.now()}`,
      type: stepData.type,
      content: stepData.type === "wait" ? undefined : stepData.content,
      delayDays:
        stepData.type === "wait" ? parseInt(stepData.delayDays) : undefined,
      order: selectedSequence.steps.length + 1,
    };
    await sequenceService.addStep(selectedSequence.id, newStep);
    const updatedSequence = {
      ...selectedSequence,
      steps: [...selectedSequence.steps, newStep],
    };
    setSequences((prev) =>
      prev.map((s) => (s.id === selectedSequence.id ? updatedSequence : s))
    );
    setSelectedSequence(updatedSequence);
    addToast("Step added successfully", "success");
    setIsAddStepModalOpen(false);
    setStepData({ type: "email", content: "", delayDays: "1" });
  };

  const handleAddSequenceSubmit = async () => {
    if (!newSeqName) return;
    const newSequence = await sequenceService.add({
      name: newSeqName,
      active: false,
      stats: { sent: 0, opened: 0, replied: 0 },
      steps: [],
    });
    setSequences((prev) => [...prev, newSequence]);
    setSelectedSequence(newSequence);
    setShowMobileDetail(true);
    addToast("New campaign created", "success");
    setIsAddSeqModalOpen(false);
    setNewSeqName("");
  };

  const handleDeleteSequence = async () => {
    if (selectedSequence) {
      await sequenceService.delete(selectedSequence.id);
      const remaining = sequences.filter((s) => s.id !== selectedSequence.id);
      setSequences(remaining);
      setSelectedSequence(remaining.length > 0 ? remaining[0] : null);
      setShowMobileDetail(false);
      addToast("Sequence deleted", "success");
      setIsDeleteModalOpen(false);
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!selectedSequence) return;
    const updatedSteps = selectedSequence.steps.filter((s) => s.id !== stepId);
    const updatedSequence = { ...selectedSequence, steps: updatedSteps };
    setSequences((prev) =>
      prev.map((s) => (s.id === selectedSequence.id ? updatedSequence : s))
    );
    setSelectedSequence(updatedSequence);
    addToast("Step removed", "info");
  };

  const getStepConfig = (type: string) => {
    switch (type) {
      case "email":
        return {
          icon: Mail,
          color: "bg-blue-500",
          border: "border-blue-500",
          text: "text-blue-400",
          label: "Email",
        };
      case "wait":
        return {
          icon: Clock,
          color: "bg-orange-500",
          border: "border-orange-500",
          text: "text-orange-400",
          label: "Delay",
        };
      case "call":
        return {
          icon: Phone,
          color: "bg-green-500",
          border: "border-green-500",
          text: "text-green-400",
          label: "Call",
        };
      case "linkedin_connect":
      case "linkedin_message":
        return {
          icon: Send,
          color: "bg-[#0077b5]",
          border: "border-[#0077b5]",
          text: "text-[#0077b5]",
          label: "LinkedIn",
        };
      default:
        return {
          icon: Zap,
          color: "bg-purple-500",
          border: "border-purple-500",
          text: "text-purple-400",
          label: "Action",
        };
    }
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-7rem)]">
      {/* --- Left Sidebar (List) --- */}
      <div
        className={`w-full lg:w-80 flex flex-col shrink-0 ${
          showMobileDetail ? "hidden lg:flex" : "flex"
        }`}
      >
        <Card className="h-full flex flex-col border-dark-secondary shadow-xl">
          <div className="p-4 border-b border-dark-secondary bg-dark-surface/30">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-lg">Campaigns</h2>
              <Button
                size="sm"
                onClick={() => setIsAddSeqModalOpen(true)}
                className="h-8 px-2"
              >
                <Plus size={16} />
              </Button>
            </div>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-dark border border-dark-secondary rounded-md pl-9 pr-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {filteredSequences.length > 0 ? (
              filteredSequences.map((seq) => (
                <div
                  key={seq.id}
                  onClick={() => handleSelectSequence(seq)}
                  className={`p-3 rounded-lg cursor-pointer border transition-all group relative ${
                    selectedSequence?.id === seq.id
                      ? "bg-dark-surface border-primary shadow-md shadow-primary/10"
                      : "bg-transparent border-transparent hover:bg-dark-surface hover:border-dark-secondary"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3
                      className={`font-medium text-sm truncate pr-6 ${
                        selectedSequence?.id === seq.id
                          ? "text-white"
                          : "text-gray-300"
                      }`}
                    >
                      {seq.name}
                    </h3>
                    {seq.active && (
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0"></div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <Send size={10} /> {seq.stats.sent}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={10} /> {seq.stats.opened}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare size={10} /> {seq.stats.replied}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleActive();
                    }}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
                  >
                    {seq.active ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Mail size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-xs">No campaigns found.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* --- Right Content (Builder & Analytics) --- */}
      <div
        className={`flex-1 flex flex-col min-w-0 h-full ${
          !showMobileDetail ? "hidden lg:flex" : "flex"
        }`}
      >
        {selectedSequence ? (
          <Card className="h-full flex flex-col border-dark-secondary shadow-xl bg-dark overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-dark-secondary bg-dark-surface/10 shrink-0">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden p-2"
                    onClick={() => setShowMobileDetail(false)}
                  >
                    <ArrowLeft size={16} />
                  </Button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white">
                        {selectedSequence.name}
                      </h2>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          selectedSequence.active
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                        }`}
                      >
                        {selectedSequence.active ? "Active" : "Draft"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleToggleActive()}
                    className={`gap-2 shadow-lg ${
                      selectedSequence.active
                        ? "bg-orange-500 hover:bg-orange-600"
                        : "bg-primary hover:bg-primary-hover"
                    }`}
                  >
                    {selectedSequence.active ? (
                      <>
                        <Pause size={16} /> Pause
                      </>
                    ) : (
                      <>
                        <Play size={16} /> Activate
                      </>
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsDeleteModalOpen(true)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex gap-6 mt-6 border-b border-white/5">
                {["workflow", "analytics", "settings"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`pb-3 text-sm font-medium capitalize transition-colors relative ${
                      activeTab === tab
                        ? "text-white"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* --- Tab Content --- */}
            <div className="flex-1 overflow-hidden bg-[#0f0229] relative">
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(#4b5563 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              ></div>

              {activeTab === "workflow" && (
                <div className="h-full overflow-y-auto custom-scrollbar p-8">
                  <div className="max-w-3xl mx-auto flex flex-col items-center">
                    {/* ... Workflow Nodes ... */}
                    <div className="flex flex-col items-center z-10 relative group">
                      <div className="w-12 h-12 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)] mb-2">
                        <Zap size={20} fill="currentColor" />
                      </div>
                      <span className="text-[10px] uppercase font-bold text-gray-500 bg-dark px-2 py-0.5 rounded border border-dark-secondary">
                        Start Sequence
                      </span>
                    </div>
                    <div className="w-0.5 h-8 bg-dark-secondary/50"></div>
                    {selectedSequence.steps.map((step, idx) => {
                      const config = getStepConfig(step.type);
                      const StepIcon = config.icon;
                      return (
                        <React.Fragment key={step.id}>
                          <div className="w-full relative group">
                            <Card
                              className={`relative overflow-visible transition-all duration-200 hover:border-gray-500 border-dark-secondary bg-dark-surface/80 backdrop-blur-sm w-full max-w-xl mx-auto ${
                                step.variantLabel
                                  ? "border-l-4 border-l-purple-500"
                                  : ""
                              }`}
                            >
                              <div className="absolute -left-3 top-6 w-6 h-6 rounded-full bg-dark border border-dark-secondary flex items-center justify-center text-xs text-gray-500 z-20">
                                {idx + 1}
                              </div>
                              <div className="p-5 pl-8">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-10 h-10 rounded-lg ${config.color} bg-opacity-20 border ${config.border} border-opacity-30 flex items-center justify-center ${config.text}`}
                                    >
                                      <StepIcon size={20} />
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-white text-sm">
                                        {config.label}
                                      </h4>
                                      <p className="text-xs text-gray-400 truncate max-w-[200px] sm:max-w-xs">
                                        {step.type === "wait"
                                          ? `Wait for ${step.delayDays} days`
                                          : step.content ||
                                            "No content defined"}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      size="sm"
                                      variant="danger"
                                      className="h-7 px-2 text-xs"
                                      onClick={() => handleDeleteStep(step.id)}
                                    >
                                      <Trash2 size={12} />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </Card>
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setIsAddStepModalOpen(true)}
                                className="w-6 h-6 rounded-full bg-dark-secondary hover:bg-primary text-white flex items-center justify-center shadow-lg transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="w-0.5 h-12 bg-dark-secondary/50 my-1"></div>
                        </React.Fragment>
                      );
                    })}
                    <div className="flex flex-col items-center">
                      <Button
                        variant="outline"
                        className="rounded-full w-12 h-12 p-0 border-dashed border-2 border-gray-600 text-gray-500 hover:text-primary hover:border-primary mb-2"
                        onClick={() => setIsAddStepModalOpen(true)}
                      >
                        <Plus size={20} />
                      </Button>
                      <span className="text-[10px] text-gray-500">
                        Add Step
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "analytics" && (
                <div className="h-full overflow-y-auto p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 bg-gradient-to-br from-blue-900/20 to-transparent border-blue-500/30">
                      <div className="text-blue-400 text-xs font-bold uppercase mb-2">
                        Open Rate
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {selectedSequence.stats.sent > 0
                          ? Math.round(
                              (selectedSequence.stats.opened /
                                selectedSequence.stats.sent) *
                                100
                            )
                          : 0}
                        %
                      </div>
                    </Card>
                    <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-transparent border-purple-500/30">
                      <div className="text-purple-400 text-xs font-bold uppercase mb-2">
                        Reply Rate
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {selectedSequence.stats.sent > 0
                          ? Math.round(
                              (selectedSequence.stats.replied /
                                selectedSequence.stats.sent) *
                                100
                            )
                          : 0}
                        %
                      </div>
                    </Card>
                    <Card className="p-6 bg-gradient-to-br from-green-900/20 to-transparent border-green-500/30">
                      <div className="text-green-400 text-xs font-bold uppercase mb-2">
                        Total Sent
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {selectedSequence.stats.sent}
                      </div>
                    </Card>
                  </div>
                  <Card className="h-[400px] p-6">
                    <h3 className="font-bold mb-6">Engagement Overview</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: "Sent", value: selectedSequence.stats.sent },
                          {
                            name: "Opened",
                            value: selectedSequence.stats.opened,
                          },
                          {
                            name: "Replied",
                            value: selectedSequence.stats.replied,
                          },
                        ]}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#260e57"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="name"
                          stroke="#6b7280"
                          tick={{ fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#6b7280"
                          tick={{ fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#110230",
                            borderColor: "#260e57",
                            borderRadius: "8px",
                          }}
                          itemStyle={{ color: "#fff" }}
                          cursor={{ fill: "#ffffff05" }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={60}>
                          {[
                            { name: "Sent", color: "#8c52ff" },
                            { name: "Opened", color: "#3b82f6" },
                            { name: "Replied", color: "#10b981" },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="p-8 max-w-2xl">
                  <Card className="p-6 space-y-6">
                    <h3 className="font-bold text-lg mb-4">
                      Campaign Settings
                    </h3>
                    <Input
                      label="Campaign Name"
                      value={selectedSequence.name}
                      onChange={() => {}}
                    />
                    <div className="pt-4 border-t border-dark-secondary">
                      <Button>Save Changes</Button>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-dark-surface/10 border border-dark-secondary rounded-xl">
            <div className="w-20 h-20 rounded-full bg-dark-surface flex items-center justify-center mb-4">
              <MousePointer size={32} className="text-primary opacity-50" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Select a Campaign
            </h3>
            <Button className="mt-6" onClick={() => setIsAddSeqModalOpen(true)}>
              <Plus size={16} className="mr-2" /> Create New Campaign
            </Button>
          </div>
        )}
      </div>

      {/* Add Sequence Modal */}
      <Modal
        isOpen={isAddSeqModalOpen}
        onClose={() => setIsAddSeqModalOpen(false)}
        title="Create New Campaign"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsAddSeqModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddSequenceSubmit}>Create Campaign</Button>
          </>
        }
      >
        <Input
          label="Campaign Name"
          placeholder="e.g. Q3 Cold Outreach - CEOS"
          value={newSeqName}
          onChange={(e) => setNewSeqName(e.target.value)}
          autoFocus
        />
      </Modal>

      {/* Add Step Modal */}
      <Modal
        isOpen={isAddStepModalOpen}
        onClose={() => setIsAddStepModalOpen(false)}
        title="Add Step to Sequence"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsAddStepModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddStepSubmit}>Add Step</Button>
          </>
        }
      >
        <Select
          label="Step Type"
          value={stepData.type}
          onChange={(e) =>
            setStepData({
              ...stepData,
              type: e.target.value as SequenceStep["type"],
            })
          }
        >
          <option value="email">Send Email</option>
          <option value="wait">Time Delay</option>
          <option value="call">Manual Call Task</option>
          <option value="linkedin_connect">LinkedIn Connection</option>
          <option value="linkedin_message">LinkedIn Message</option>
        </Select>
        {stepData.type === "wait" ? (
          <Input
            label="Wait Duration (Days)"
            type="number"
            min="1"
            value={stepData.delayDays}
            onChange={(e) =>
              setStepData({ ...stepData, delayDays: e.target.value })
            }
          />
        ) : (
          <Textarea
            label="Template Content"
            placeholder={
              stepData.type === "email"
                ? "Hi {{firstName}}, ..."
                : "Notes for call..."
            }
            value={stepData.content}
            onChange={(e) =>
              setStepData({ ...stepData, content: e.target.value })
            }
            className="min-h-[150px]"
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Campaign"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteSequence}>
              Delete Permanently
            </Button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center p-4">
          <AlertCircle size={32} className="text-error mb-3" />
          <p className="text-lg font-bold text-white mb-2">Are you sure?</p>
          <p className="text-gray-400 text-sm">This action cannot be undone.</p>
        </div>
      </Modal>
    </div>
  );
};
