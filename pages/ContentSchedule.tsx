import React, { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  Plus,
  Linkedin,
  Twitter,
  Calendar as CalendarIcon,
  Instagram,
} from "lucide-react";
import { contentService } from "../services/supabaseServices";
import { ContentPost } from "../types";
import { Modal } from "../components/ui/Modal";
import { Input, Select } from "../components/ui/Input";
import { useToast } from "../components/ui/Toast";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const ContentSchedule: React.FC = () => {
  const { addToast } = useToast();
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    platform: "linkedin",
    day: "1",
    time: "10:00",
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const data = await contentService.getAllPosts();
    setPosts(data);
  };

  const handleAddPost = async () => {
    if (!newPost.title) return;
    const post: Omit<ContentPost, "id"> = {
      title: newPost.title,
      platform: newPost.platform as any,
      day: parseInt(newPost.day),
      time: newPost.time,
    };
    await contentService.addPost(post);
    addToast("Post scheduled successfully", "success");
    setIsModalOpen(false);
    loadPosts();
    setNewPost({ title: "", platform: "linkedin", day: "1", time: "10:00" });
  };

  const renderIcon = (platform: string) => {
    switch (platform) {
      case "linkedin":
        return <Linkedin size={10} className="text-[#0077b5]" />;
      case "twitter":
        return <Twitter size={10} className="text-blue-400" />;
      case "instagram":
        return <Instagram size={10} className="text-pink-500" />;
      default:
        return <CalendarIcon size={10} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Content Calendar</h1>
        <Button className="flex gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Schedule Post
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-gray-400 font-bold uppercase text-sm py-2"
          >
            {day}
          </div>
        ))}
        {/* Calendar Grid */}
        {Array.from({ length: 35 }).map((_, i) => {
          const dayIndex = i % 7;
          const dayPosts = posts.filter((p) => p.day === dayIndex);

          // Just displaying the first week repeatedly for visual fullness in this calendar grid demo
          // In a real calendar, we'd map specific dates.
          // For now, rows 2-5 are just empty/placeholders or repeating the weekly pattern visually
          if (i >= 7 && dayPosts.length > 0)
            return (
              <Card
                key={i}
                className="min-h-[120px] p-2 bg-dark-surface/10 border-dark-secondary/50 relative opacity-50"
              >
                <span className="text-xs text-gray-700 absolute top-2 right-2">
                  {i + 1}
                </span>
              </Card>
            );

          return (
            <Card
              key={i}
              className="min-h-[120px] p-2 bg-dark-surface/30 border-dark-secondary relative"
            >
              <span className="text-xs text-gray-600 absolute top-2 right-2">
                {i + 1}
              </span>
              <div className="mt-6 space-y-2">
                {dayPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-2 rounded bg-dark-surface border border-dark-secondary text-xs cursor-pointer hover:border-primary transition-colors"
                  >
                    <div className="flex items-center gap-1 mb-1">
                      {renderIcon(post.platform)}
                      <span className="text-[10px] text-gray-500">
                        {post.time}
                      </span>
                    </div>
                    <div className="font-medium text-white truncate">
                      {post.title}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule New Post"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPost}>Schedule</Button>
          </>
        }
      >
        <Input
          label="Post Title / Topic"
          value={newPost.title}
          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Platform"
            value={newPost.platform}
            onChange={(e) =>
              setNewPost({ ...newPost, platform: e.target.value })
            }
          >
            <option value="linkedin">LinkedIn</option>
            <option value="twitter">Twitter</option>
            <option value="instagram">Instagram</option>
          </Select>
          <Select
            label="Day of Week"
            value={newPost.day}
            onChange={(e) => setNewPost({ ...newPost, day: e.target.value })}
          >
            {DAYS.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </Select>
        </div>
        <Input
          label="Time"
          type="time"
          value={newPost.time}
          onChange={(e) => setNewPost({ ...newPost, time: e.target.value })}
        />
      </Modal>
    </div>
  );
};
