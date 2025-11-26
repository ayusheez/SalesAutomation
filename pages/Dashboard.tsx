import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Line,
  ComposedChart,
  Legend,
  RadialBarChart,
  RadialBar,
} from "recharts";
import {
  Briefcase,
  Calendar,
  DollarSign,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  BrainCircuit,
  Sparkles,
  Clock,
  ChevronRight,
  Filter,
  Circle,
  Activity,
} from "lucide-react";
import { useToast } from "../components/ui/Toast";
import {
  dealService,
  sequenceService,
  taskService,
} from "../services/supabaseServices";
import { Task, Deal } from "../types";

// --- Mock Data & Generators ---

const REVENUE_DATA = [
  { name: "Mon", revenue: 4000, target: 2400, deals: 2 },
  { name: "Tue", revenue: 3000, target: 1398, deals: 1 },
  { name: "Wed", revenue: 2000, target: 9800, deals: 3 },
  { name: "Thu", revenue: 2780, target: 3908, deals: 2 },
  { name: "Fri", revenue: 1890, target: 4800, deals: 1 },
  { name: "Sat", revenue: 2390, target: 3800, deals: 4 },
  { name: "Sun", revenue: 3490, target: 4300, deals: 3 },
];

const FUNNEL_DATA = [
  { name: "Prospects", value: 1200, fill: "#6b7280" },
  { name: "Contacted", value: 850, fill: "#2D37A3" },
  { name: "Qualified", value: 420, fill: "#4650c7" },
  { name: "Proposal", value: 180, fill: "#f59e0b" },
  { name: "Closed Won", value: 65, fill: "#10b981" },
];

const SOURCE_DATA = [
  { name: "Outbound Email", value: 45, color: "#2D37A3" },
  { name: "LinkedIn", value: 30, color: "#4650c7" },
  { name: "Referrals", value: 15, color: "#10b981" },
  { name: "Events", value: 10, color: "#f59e0b" },
];

const AI_INSIGHTS = [
  {
    id: 1,
    type: "opportunity",
    text: "3 high-value prospects from 'TechFlow' visited the pricing page.",
    priority: "high",
  },
  {
    id: 2,
    type: "risk",
    text: "Deal with 'Global Corp' has been stuck in 'Negotiation' for 14 days.",
    priority: "medium",
  },
  {
    id: 3,
    type: "action",
    text: "You have 5 calls to make today to hit your weekly activity goal.",
    priority: "low",
  },
];

const RADIAL_DATA = [
  { name: "Calls", x: 1, fill: "#10b981", value: 80 },
  { name: "Emails", x: 2, fill: "#2D37A3", value: 100 },
  { name: "Meetings", x: 3, fill: "#f59e0b", value: 45 },
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  // State
  const [dateRange, setDateRange] = useState("This Week");
  const [chartView, setChartView] = useState<"revenue" | "funnel" | "sources">(
    "revenue"
  );
  const [stats, setStats] = useState({
    pipelineValue: 0,
    activeDeals: 0,
    emailsSent: 0,
    meetingsBooked: 0,
  });
  const [topDeals, setTopDeals] = useState<Deal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [deals, sequences, tasksData] = await Promise.all([
        dealService.getAll(),
        sequenceService.getAll(),
        taskService.getAll(),
      ]);

      const pipelineValue = deals.reduce((sum, deal) => sum + deal.value, 0);
      const activeDeals = deals.filter((d) => d.stage !== "closed").length;
      const emailsSent = sequences.reduce(
        (sum, seq) => sum + seq.stats.sent,
        0
      );

      setStats({
        pipelineValue,
        activeDeals,
        emailsSent,
        meetingsBooked: 12,
      });

      setTopDeals(deals.sort((a, b) => b.value - a.value).slice(0, 4));
      setTasks(tasksData.filter((t) => !t.completed).slice(0, 4));

      setRecentActivities([
        {
          id: 1,
          user: "You",
          action: "moved deal",
          target: "TechFlow Enterprise",
          time: "10m ago",
          icon: Briefcase,
          color: "text-orange-400",
          bg: "bg-orange-400/10",
        },
        {
          id: 2,
          user: "Sarah",
          action: "booked meeting",
          target: "Growth.ai Q3 Review",
          time: "45m ago",
          icon: Calendar,
          color: "text-green-400",
          bg: "bg-green-400/10",
        },
        {
          id: 3,
          user: "System",
          action: "alert",
          target: "New Lead: VP Engineering",
          time: "2h ago",
          icon: Zap,
          color: "text-primary",
          bg: "bg-primary/10",
        },
      ]);
    };
    fetchData();
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#131229]/90 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-xl">
          <p className="text-sm font-bold text-white mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div
              key={index}
              className="text-xs flex items-center gap-2"
              style={{ color: entry.color }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></span>
              <span className="capitalize">{entry.name}:</span>
              <span className="font-bold">
                {entry.name === "revenue" || entry.name === "target"
                  ? `$${entry.value.toLocaleString()}`
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Header Area */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            Dashboard{" "}
            <Sparkles className="text-yellow-400 fill-yellow-400 w-5 h-5 animate-pulse" />
          </h1>
          <p className="text-gray-400 mt-1">
            Performance overview for{" "}
            <span className="text-primary font-semibold">Nexus Team</span>.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[#1e1d3d] p-1 rounded-lg border border-white/5">
          {["Today", "This Week", "This Month", "Quarter"].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                dateRange === range
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* AI Growth Assistant */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-transparent relative overflow-hidden">
        <div className="absolute -right-10 -top-10 opacity-10 rotate-12">
          <BrainCircuit size={180} className="text-primary" />
        </div>
        <CardBody className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-primary/20 rounded-lg text-primary border border-primary/20">
              <BrainCircuit size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">AI Insights</h3>
            <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold shadow-lg shadow-primary/30">
              BETA
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {AI_INSIGHTS.map((insight) => (
              <div
                key={insight.id}
                className={`p-4 rounded-xl border backdrop-blur-sm flex gap-3 items-start transition-transform hover:-translate-y-1 duration-200 ${
                  insight.priority === "high"
                    ? "bg-green-500/5 border-green-500/20"
                    : insight.priority === "medium"
                    ? "bg-orange-500/5 border-orange-500/20"
                    : "bg-blue-500/5 border-blue-500/20"
                }`}
              >
                <div
                  className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                    insight.priority === "high"
                      ? "bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                      : insight.priority === "medium"
                      ? "bg-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                      : "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                  }`}
                ></div>
                <p className="text-sm text-gray-200 leading-snug">
                  {insight.text}
                </p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* KPI Sparkline Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Revenue",
            value: `$${(stats.pipelineValue * 0.4).toLocaleString()}`,
            sub: "Pipeline Value",
            change: "+12.5%",
            isPos: true,
            data: [30, 40, 35, 50, 49, 60, 70],
            color: "#2D37A3",
          },
          {
            label: "Active Deals",
            value: stats.activeDeals,
            sub: "Avg Deal Size: $12k",
            change: "-2.4%",
            isPos: false,
            data: [10, 12, 11, 15, 12, 10, 9],
            color: "#f59e0b",
          },
          {
            label: "Meetings Booked",
            value: stats.meetingsBooked,
            sub: "Conversion: 22%",
            change: "+8.1%",
            isPos: true,
            data: [2, 4, 3, 5, 6, 8, 12],
            color: "#10b981",
          },
          {
            label: "Outreach Volume",
            value: stats.emailsSent,
            sub: "Open Rate: 45%",
            change: "+24%",
            isPos: true,
            data: [45, 52, 38, 65, 48, 60, 85],
            color: "#4650c7",
          },
        ].map((kpi, idx) => (
          <Card
            key={idx}
            className="overflow-hidden group hover:border-white/20 transition-all duration-300"
          >
            <div className="p-5 relative z-10">
              <div className="flex justify-between items-start mb-2">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                  {kpi.label}
                </p>
                <div
                  className={`flex items-center text-xs font-bold px-1.5 py-0.5 rounded-full ${
                    kpi.isPos
                      ? "text-green-400 bg-green-400/10"
                      : "text-red-400 bg-red-400/10"
                  }`}
                >
                  {kpi.isPos ? (
                    <ArrowUpRight size={12} className="mr-0.5" />
                  ) : (
                    <ArrowDownRight size={12} className="mr-0.5" />
                  )}
                  {kpi.change}
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">
                {kpi.value}
              </h3>
              <p className="text-xs text-gray-500">{kpi.sub}</p>
            </div>
            {/* Mini Sparkline */}
            <div className="h-16 w-full opacity-30 group-hover:opacity-60 transition-opacity -mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={kpi.data.map((v, i) => ({ v, i }))}>
                  <defs>
                    <linearGradient
                      id={`color-${idx}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={kpi.color}
                        stopOpacity={0.6}
                      />
                      <stop
                        offset="100%"
                        stopColor={kpi.color}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={kpi.color}
                    strokeWidth={2}
                    fill={`url(#color-${idx})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart (2/3 Width) */}
        <div className="lg:col-span-2">
          <Card className="h-[450px] flex flex-col">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-center">
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <h3 className="font-bold text-white">Performance Analytics</h3>
                <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/5">
                  {["revenue", "funnel", "sources"].map((view) => (
                    <button
                      key={view}
                      onClick={() => setChartView(view as any)}
                      className={`px-3 py-1 text-xs font-bold rounded-md capitalize transition-all ${
                        chartView === view
                          ? "bg-[#2D37A3] text-white shadow"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {view}
                    </button>
                  ))}
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-xs h-8">
                <Filter size={12} className="mr-2" /> Filter View
              </Button>
            </CardHeader>

            <CardBody className="flex-1 min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                {chartView === "revenue" ? (
                  <ComposedChart
                    data={REVENUE_DATA}
                    margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#2D37A3"
                          stopOpacity={0.5}
                        />
                        <stop
                          offset="95%"
                          stopColor="#2D37A3"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#260e57"
                      vertical={false}
                      opacity={0.5}
                    />
                    <XAxis
                      dataKey="name"
                      stroke="#6b7280"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="#6b7280"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#6b7280"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "#ffffff05" }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Bar
                      yAxisId="left"
                      dataKey="revenue"
                      name="Actual Revenue"
                      fill="url(#colorRev)"
                      barSize={30}
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="target"
                      name="Target Goal"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{
                        r: 4,
                        fill: "#10b981",
                        strokeWidth: 2,
                        stroke: "#fff",
                      }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="deals"
                      name="Deals Closed"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </ComposedChart>
                ) : chartView === "funnel" ? (
                  <BarChart
                    data={FUNNEL_DATA}
                    layout="vertical"
                    margin={{ top: 20, right: 40, bottom: 20, left: 40 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#260e57"
                      horizontal={false}
                      opacity={0.5}
                    />
                    <XAxis type="number" stroke="#6b7280" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#9ca3af"
                      tick={{ fontSize: 12, fontWeight: 600 }}
                      width={100}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "transparent" }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                      {FUNNEL_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={SOURCE_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {SOURCE_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="middle"
                      align="right"
                      layout="vertical"
                      iconType="circle"
                    />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>

        {/* Sales Velocity / Goals (1/3 Width) */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="h-[215px] flex flex-col">
            <CardHeader className="pb-2">
              <h3 className="font-bold text-white">Goal Attainment</h3>
            </CardHeader>
            <CardBody className="flex-1 min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="30%"
                  outerRadius="100%"
                  barSize={10}
                  data={RADIAL_DATA}
                >
                  <RadialBar
                    background={{ fill: "#1e1d3d" }}
                    dataKey="value"
                    cornerRadius={10}
                    label={{
                      position: "insideStart",
                      fill: "#fff",
                      fontSize: 10,
                      fontWeight: "bold",
                    }}
                  />
                  <Legend
                    iconSize={10}
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{ fontSize: "12px", color: "#9ca3af" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#131229",
                      borderColor: "#ffffff20",
                      borderRadius: "8px",
                    }}
                    itemStyle={{ color: "#fff" }}
                    cursor={false}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Upcoming Tasks Condensed */}
          <Card className="h-[215px] flex flex-col">
            <CardHeader className="pb-2 flex justify-between items-center">
              <h3 className="font-bold text-white">Today's Focus</h3>
              <span className="text-xs bg-white/5 text-gray-300 px-2 py-0.5 rounded-full border border-white/5">
                {tasks.length} Pending
              </span>
            </CardHeader>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 group cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <button className="mt-1 text-gray-500 hover:text-primary transition-colors">
                    <Circle size={16} />
                  </button>
                  <div className="flex-1">
                    <p className="text-sm text-gray-200 group-hover:text-white transition-colors line-clamp-1">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                          task.priority === "high"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-blue-500/10 text-blue-400"
                        }`}
                      >
                        {task.priority}
                      </span>
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Clock size={10} /> {task.dueDate}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="text-center text-gray-500 text-xs mt-4">
                  All caught up!
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Grid: Top Deals & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Deals Watchlist */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <DollarSign className="text-green-400" size={20} />
              <h3 className="font-bold text-white">Top Deals Watchlist</h3>
            </div>
            <Button
              variant="link"
              size="sm"
              className="text-gray-400 hover:text-white"
              onClick={() => navigate("/meetings/deals")}
            >
              View All
            </Button>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/5 text-xs text-gray-400 uppercase font-bold">
                <tr>
                  <th className="px-6 py-3">Deal Name</th>
                  <th className="px-6 py-3">Value</th>
                  <th className="px-6 py-3">Stage</th>
                  <th className="px-6 py-3">Prob.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {topDeals.map((deal) => (
                  <tr
                    key={deal.id}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => navigate("/meetings/deals")}
                  >
                    <td className="px-6 py-4 font-medium text-white">
                      {deal.title}
                      <div className="text-xs text-gray-500 font-normal">
                        {deal.leadName}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-green-400">
                      ${deal.value.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                          deal.stage === "closed"
                            ? "bg-green-500/10 text-green-400"
                            : deal.stage === "in-progress"
                            ? "bg-yellow-500/10 text-yellow-400"
                            : "bg-blue-500/10 text-blue-400"
                        }`}
                      >
                        {deal.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {deal.stage === "closed"
                        ? "100%"
                        : deal.stage === "in-progress"
                        ? "60%"
                        : "20%"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Activity Feed */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Activity className="text-primary" size={20} />
              <h3 className="font-bold text-white">Live Activity Feed</h3>
            </div>
            <Button variant="secondary" size="sm" className="h-7 px-2 text-xs">
              Refresh
            </Button>
          </CardHeader>
          <CardBody className="p-0">
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
              {recentActivities.map((act, i) => (
                <div
                  key={act.id}
                  className={`flex gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${
                    i === recentActivities.length - 1 ? "border-0" : ""
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border border-white/10 shrink-0 ${act.bg} ${act.color}`}
                  >
                    <act.icon size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">
                      <span className="font-bold">{act.user}</span> {act.action}{" "}
                      <span className="font-medium text-primary">
                        {act.target}
                      </span>
                    </p>
                    <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Clock size={10} /> {act.time}
                    </span>
                  </div>
                  <div className="self-center">
                    <ChevronRight size={16} className="text-gray-600" />
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-white/5 text-center">
              <button className="text-xs text-gray-400 hover:text-white hover:underline">
                View Activity Log
              </button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
