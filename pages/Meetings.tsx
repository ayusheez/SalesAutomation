import React, { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Plus,
  Trash2,
  Edit2,
  User,
} from "lucide-react";
import { Meeting, Lead } from "../types";
import { meetingService, leadService } from "../services/supabaseServices";
import { Modal } from "../components/ui/Modal";
import { Input, Select } from "../components/ui/Input";
import { useToast } from "../components/ui/Toast";

export const Meetings: React.FC = () => {
  const { addToast } = useToast();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    duration: "30",
    type: "Zoom" as Meeting["type"],
    leadId: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [m, l] = await Promise.all([
        meetingService.getAll(),
        leadService.getAll(),
      ]);
      setMeetings(
        m.sort(
          (a, b) =>
            new Date(`${a.date}T${a.time}`).getTime() -
            new Date(`${b.date}T${b.time}`).getTime()
        )
      );
      setLeads(l);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleEdit = (meeting: Meeting) => {
    setEditingId(meeting.id);
    setFormData({
      title: meeting.title,
      date: meeting.date,
      time: meeting.time,
      duration: meeting.duration.toString(),
      type: meeting.type,
      leadId: meeting.leadId || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this meeting?")) {
      await meetingService.delete(id);
      setMeetings(meetings.filter((m) => m.id !== id));
      addToast("Meeting deleted", "info");
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.date || !formData.time) {
      addToast("Please fill in required fields", "error");
      return;
    }

    const selectedLead = leads.find((l) => l.id === formData.leadId);

    if (editingId) {
      const existing = meetings.find((m) => m.id === editingId);
      if (existing) {
        const updated = await meetingService.update({
          ...existing,
          title: formData.title,
          date: formData.date,
          time: formData.time,
          duration: parseInt(formData.duration),
          type: formData.type,
          leadId: selectedLead?.id,
          leadName: selectedLead?.name,
        });
        setMeetings(
          meetings
            .map((m) => (m.id === editingId ? updated : m))
            .sort(
              (a, b) =>
                new Date(`${a.date}T${a.time}`).getTime() -
                new Date(`${b.date}T${b.time}`).getTime()
            )
        );
        addToast("Meeting updated successfully", "success");
      }
    } else {
      const newMeeting = await meetingService.add({
        title: formData.title,
        date: formData.date,
        time: formData.time,
        duration: parseInt(formData.duration),
        type: formData.type,
        leadId: selectedLead?.id,
        leadName: selectedLead?.name,
      });
      setMeetings(
        [...meetings, newMeeting].sort(
          (a, b) =>
            new Date(`${a.date}T${a.time}`).getTime() -
            new Date(`${b.date}T${b.time}`).getTime()
        )
      );
      addToast("Meeting scheduled successfully", "success");
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      title: "",
      date: "",
      time: "",
      duration: "30",
      type: "Zoom",
      leadId: "",
    });
  };

  const groupedMeetings = meetings.reduce((acc, meeting) => {
    const date = new Date(meeting.date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(meeting);
    return acc;
  }, {} as Record<string, Meeting[]>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Calendar & Meetings</h1>
        <Button
          className="flex gap-2 w-full sm:w-auto"
          onClick={() => {
            setEditingId(null);
            setFormData({
              title: "",
              date: "",
              time: "",
              duration: "30",
              type: "Zoom",
              leadId: "",
            });
            setIsModalOpen(true);
          }}
        >
          <Plus size={16} /> Schedule Meeting
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meetings List */}
        <div className="lg:col-span-2 space-y-6">
          {Object.keys(groupedMeetings).length > 0 ? (
            Object.entries(groupedMeetings).map(
              ([date, dayMeetings]: [string, Meeting[]]) => (
                <div key={date}>
                  <h3 className="text-gray-400 font-bold uppercase text-xs mb-3 sticky top-0 bg-dark py-2 z-10">
                    {date}
                  </h3>
                  <div className="space-y-3">
                    {dayMeetings.map((meeting) => (
                      <Card
                        key={meeting.id}
                        className="group hover:border-primary transition-colors"
                      >
                        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex gap-4">
                            <div className="flex flex-col items-center justify-center bg-dark-surface border border-dark-secondary rounded-lg w-16 h-16 shrink-0">
                              <span className="font-bold text-white">
                                {meeting.time}
                              </span>
                              <span className="text-xs text-gray-500">
                                {meeting.duration}m
                              </span>
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-lg">
                                {meeting.title}
                              </h4>
                              <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                                <div className="flex items-center gap-1">
                                  <Video size={14} /> {meeting.type}
                                </div>
                                {meeting.leadName && (
                                  <div className="flex items-center gap-1 text-primary">
                                    <User size={14} /> {meeting.leadName}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(meeting)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(meeting.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            )
          ) : (
            <div className="text-center py-12 text-gray-500 bg-dark-surface/30 rounded-lg border border-dashed border-dark-secondary">
              <CalendarIcon size={48} className="mx-auto mb-4 opacity-30" />
              <p>No upcoming meetings scheduled.</p>
            </div>
          )}
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <Card className="p-6 bg-primary/10 border-primary/30">
            <h3 className="font-bold mb-1">Next Meeting</h3>
            {meetings.length > 0 ? (
              <div className="mt-4">
                <p className="text-2xl font-bold text-white">
                  {meetings[0].title}
                </p>
                <p className="text-primary mt-1">{meetings[0].time} - Today</p>
                <Button className="w-full mt-4 bg-white text-primary hover:bg-gray-100">
                  Join Call
                </Button>
              </div>
            ) : (
              <p className="text-gray-400 text-sm mt-2">
                Your schedule is clear for now.
              </p>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="font-bold mb-4 text-gray-300">Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Total Meetings</span>
                <span className="font-bold text-white">{meetings.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>This Week</span>
                <span className="font-bold text-white">
                  {meetings.filter((m) => new Date(m.date) > new Date()).length}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Meeting" : "Schedule Meeting"}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingId ? "Update" : "Schedule"}
            </Button>
          </>
        }
      >
        <Input
          label="Meeting Title"
          placeholder="e.g. Demo Call"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          autoFocus
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
          <Input
            label="Time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Duration (min)"
            value={formData.duration}
            onChange={(e) =>
              setFormData({ ...formData, duration: e.target.value })
            }
          >
            <option value="15">15 min</option>
            <option value="30">30 min</option>
            <option value="45">45 min</option>
            <option value="60">1 hour</option>
          </Select>

          <Select
            label="Platform"
            value={formData.type}
            onChange={(e) =>
              setFormData({
                ...formData,
                type: e.target.value as Meeting["type"],
              })
            }
          >
            <option value="Zoom">Zoom</option>
            <option value="Google Meet">Google Meet</option>
            <option value="Phone">Phone Call</option>
            <option value="In-Person">In-Person</option>
          </Select>
        </div>

        <Select
          label="Related Prospect (Optional)"
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
    </div>
  );
};
