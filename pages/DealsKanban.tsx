import React, { useEffect, useState } from "react";
import { dealService, leadService } from "../services/supabaseServices";
import { Deal, Lead } from "../types";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input, Select } from "../components/ui/Input";
import { useToast } from "../components/ui/Toast";
import {
  Plus,
  DollarSign,
  MoreHorizontal,
  Trash2,
  Edit2,
  TrendingUp,
  Briefcase,
  AlertCircle,
} from "lucide-react";

const COLUMNS: {
  id: Deal["stage"];
  label: string;
  color: string;
  probability: number;
}[] = [
  {
    id: "to-contact",
    label: "To Contact",
    color: "border-blue-500",
    probability: 0.2,
  },
  {
    id: "in-progress",
    label: "In Progress",
    color: "border-yellow-500",
    probability: 0.6,
  },
  {
    id: "closed",
    label: "Closed",
    color: "border-green-500",
    probability: 1.0,
  },
];

export const DealsKanban: React.FC = () => {
  const { addToast } = useToast();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    value: "",
    leadId: "",
  });

  // Delete functionality
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState<string | null>(null);

  useEffect(() => {
    dealService.getAll().then(setDeals);
    leadService.getAll().then(setLeads);
  }, []);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, stage: Deal["stage"]) => {
    e.preventDefault();
    if (draggingId) {
      const updatedDeals = deals.map((d) =>
        d.id === draggingId ? { ...d, stage } : d
      );
      setDeals(updatedDeals);
      dealService.updateStage(draggingId, stage);
      setDraggingId(null);
    }
  };

  const handleEditDeal = (deal: Deal) => {
    setEditingId(deal.id);
    setFormData({
      title: deal.title,
      value: deal.value.toString(),
      leadId: deal.leadId,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.value || !formData.leadId) {
      addToast("Please fill in all fields", "error");
      return;
    }

    const selectedLead = leads.find((l) => l.id === formData.leadId);
    if (!selectedLead) return;

    if (editingId) {
      const existing = deals.find((d) => d.id === editingId);
      if (existing) {
        const updatedDeal = await dealService.update({
          ...existing,
          title: formData.title,
          value: parseInt(formData.value, 10),
          leadId: selectedLead.id,
          leadName: selectedLead.name,
        });
        setDeals(deals.map((d) => (d.id === editingId ? updatedDeal : d)));
        addToast("Deal updated successfully", "success");
      }
    } else {
      const newDeal = await dealService.add({
        title: formData.title,
        value: parseInt(formData.value, 10),
        stage: "to-contact",
        leadId: selectedLead.id,
        leadName: selectedLead.name,
      });
      setDeals([...deals, newDeal]);
      addToast("Deal added successfully to pipeline!", "success");
    }

    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ title: "", value: "", leadId: "" });
  };

  const confirmDelete = (id: string) => {
    setDealToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (dealToDelete) {
      await dealService.delete(dealToDelete);
      setDeals(deals.filter((d) => d.id !== dealToDelete));
      addToast("Deal removed from pipeline", "success");
      setIsDeleteModalOpen(false);
      setDealToDelete(null);
    }
  };

  // Financial Summary Calculations
  const totalPipeline = deals.reduce((sum, d) => sum + d.value, 0);
  const weightedPipeline = deals.reduce((sum, d) => {
    const stageProb = COLUMNS.find((c) => c.id === d.stage)?.probability || 0;
    return sum + d.value * stageProb;
  }, 0);

  return (
    <div className="lg:h-[calc(100vh-7rem)] flex flex-col min-h-[calc(100vh-7rem)]">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Deals Pipeline</h1>
          <div className="flex items-center gap-6 mt-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Total Pipeline:</span>
              <span className="font-bold text-white text-lg">
                ${totalPipeline.toLocaleString()}
              </span>
            </div>
            <div className="h-4 w-px bg-dark-secondary hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Weighted Forecast:</span>
              <span className="font-bold text-green-400 text-lg flex items-center gap-1">
                <TrendingUp size={16} /> $
                {Math.round(weightedPipeline).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        <Button
          className="flex gap-2 w-full sm:w-auto"
          onClick={() => {
            setEditingId(null);
            setFormData({ title: "", value: "", leadId: "" });
            setIsModalOpen(true);
          }}
        >
          <Plus size={16} /> Add Deal
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto lg:overflow-hidden pb-4">
        {COLUMNS.map((col) => {
          const colDeals = deals.filter((d) => d.stage === col.id);
          const totalValue = colDeals.reduce((sum, d) => sum + d.value, 0);

          return (
            <div
              key={col.id}
              className="flex flex-col lg:h-full min-h-[400px] bg-dark-surface/50 rounded-lg border border-dark-secondary shadow-xl"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {/* Column Header */}
              <div
                className={`p-4 border-t-4 ${col.color} bg-dark-secondary/50 rounded-t-lg sticky top-0 z-10 backdrop-blur-sm`}
              >
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-white">{col.label}</h3>
                  <span className="text-xs font-mono bg-black/30 px-2 py-0.5 rounded text-gray-400">
                    {colDeals.length}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-400 font-mono mt-2">
                  <span>${totalValue.toLocaleString()}</span>
                  <span className="opacity-50">
                    {Math.round(col.probability * 100)}% Prob.
                  </span>
                </div>
              </div>

              {/* Column Body */}
              <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar">
                {colDeals.map((deal) => (
                  <Card
                    key={deal.id}
                    className="cursor-move hover:border-primary transition-all bg-dark group relative hover:shadow-lg hover:-translate-y-0.5 duration-200"
                  >
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal.id)}
                      onClick={() => handleEditDeal(deal)}
                      className="p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                          <Briefcase size={10} /> Lead
                        </span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-gray-500 hover:text-white p-1 hover:bg-white/10 rounded">
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="text-gray-500 hover:text-red-500 p-1 hover:bg-red-500/10 rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete(deal.id);
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-bold text-white mb-1">
                        {deal.title}
                      </h4>
                      <p className="text-sm text-gray-400 mb-3">
                        {deal.leadName}
                      </p>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                        <div className="flex items-center text-green-400 font-semibold text-sm bg-green-500/10 inline-block px-2 py-1 rounded">
                          <DollarSign size={12} className="inline mr-1" />
                          {deal.value.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">
                          ID: #{deal.id.substring(0, 4)}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                {colDeals.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-dark-secondary/50 rounded-lg min-h-[150px]">
                    <p className="text-sm font-medium opacity-50">
                      Drop items here
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Deal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Deal" : "Create New Deal"}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingId ? "Update Deal" : "Create Deal"}
            </Button>
          </>
        }
      >
        <Input
          label="Deal Title"
          placeholder="e.g. Enterprise License Q3"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          autoFocus
        />

        <Input
          label="Value ($)"
          type="number"
          placeholder="10000"
          value={formData.value}
          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
        />

        <Select
          label="Related Prospect"
          value={formData.leadId}
          onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
        >
          <option value="">Select a prospect...</option>
          {leads.map((lead) => (
            <option key={lead.id} value={lead.id}>
              {lead.name} ({lead.company})
            </option>
          ))}
        </Select>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Deal"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center p-4">
          <AlertCircle size={32} className="text-error mb-4" />
          <p className="text-gray-300 mb-2">
            Are you sure you want to delete this deal?
          </p>
          <p className="text-sm text-gray-500">
            This will remove the deal and all associated history from your
            pipeline.
          </p>
        </div>
      </Modal>
    </div>
  );
};
