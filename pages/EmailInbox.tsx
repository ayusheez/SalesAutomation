import React, { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  Mail,
  Star,
  Trash2,
  Reply,
  MoreHorizontal,
  Search,
  Paperclip,
} from "lucide-react";
import { Input } from "../components/ui/Input";
import { inboxService } from "../services/supabaseServices";
import { EmailMessage } from "../types";
import { useToast } from "../components/ui/Toast";

export const EmailInbox: React.FC = () => {
  const { addToast } = useToast();
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = async () => {
    const data = await inboxService.getAll();
    setEmails(data);
    if (data.length > 0 && !selectedEmail) {
      setSelectedEmail(data[0]);
    }
  };

  const handleDelete = async () => {
    if (selectedEmail) {
      await inboxService.delete(selectedEmail.id);
      const remaining = emails.filter((e) => e.id !== selectedEmail.id);
      setEmails(remaining);
      setSelectedEmail(remaining.length > 0 ? remaining[0] : null);
      addToast("Email deleted", "info");
    }
  };

  const filteredEmails = emails.filter(
    (e) =>
      e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.from.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Unified Inbox</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => addToast("Compose not implemented in demo", "info")}
          >
            Compose
          </Button>
        </div>
      </div>

      <div className="flex-1 flex border border-dark-secondary rounded-xl overflow-hidden bg-dark-surface/20">
        {/* Sidebar List */}
        <div className="w-full md:w-1/3 border-r border-dark-secondary flex flex-col bg-dark">
          <div className="p-4 border-b border-dark-secondary">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                className="w-full bg-dark-surface border border-dark-secondary rounded px-3 py-2 pl-9 text-sm text-white focus:outline-none focus:border-primary"
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredEmails.map((email) => (
              <div
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                className={`p-4 border-b border-dark-secondary cursor-pointer hover:bg-dark-surface transition-colors ${
                  selectedEmail?.id === email.id
                    ? "bg-dark-surface border-l-2 border-l-primary"
                    : ""
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span
                    className={`text-sm font-bold ${
                      email.unread ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {email.from}
                  </span>
                  <span className="text-xs text-gray-500">{email.time}</span>
                </div>
                <div
                  className={`text-sm mb-1 ${
                    email.unread ? "text-white font-medium" : "text-gray-300"
                  }`}
                >
                  {email.subject}
                </div>
                <div className="text-xs text-gray-500 line-clamp-1">
                  {email.preview}
                </div>
              </div>
            ))}
            {filteredEmails.length === 0 && (
              <div className="p-8 text-center text-gray-500 text-sm">
                No emails found.
              </div>
            )}
          </div>
        </div>

        {/* Email Detail */}
        {selectedEmail ? (
          <div className="hidden md:flex flex-1 flex-col bg-dark-surface/10">
            <div className="p-6 border-b border-dark-secondary flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  {selectedEmail.subject}
                </h2>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {selectedEmail.from.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">
                      {selectedEmail.from}
                    </div>
                    <div className="text-xs text-gray-400">to me</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">
                  <Star size={16} />
                </Button>
                <Button variant="secondary" size="sm">
                  <Reply size={16} />
                </Button>
                <Button variant="secondary" size="sm" onClick={handleDelete}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>

            <div className="flex-1 p-8 text-gray-300 leading-relaxed whitespace-pre-wrap">
              {selectedEmail.content || selectedEmail.preview}
            </div>

            <div className="p-4 border-t border-dark-secondary bg-dark">
              <div className="bg-dark-surface border border-dark-secondary rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-2">
                  Reply to {selectedEmail.from}...
                </div>
                <div className="flex justify-between items-center mt-4">
                  <button className="text-gray-400 hover:text-white">
                    <Paperclip size={18} />
                  </button>
                  <Button
                    size="sm"
                    onClick={() => addToast("Reply sent!", "success")}
                  >
                    Send Reply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-gray-500 bg-dark-surface/10">
            Select an email to view
          </div>
        )}
      </div>
    </div>
  );
};
