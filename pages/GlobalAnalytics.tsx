import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { TrendingUp, Users, Mail, DollarSign } from "lucide-react";
import {
  dealService,
  leadService,
  sequenceService,
} from "../services/supabaseServices";

const PIE_COLORS = ["#2D37A3", "#4650c7", "#10b981", "#f59e0b"];

export const GlobalAnalytics: React.FC = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalLeads: 0,
    dealsWon: 0,
    emailsSent: 0,
  });

  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [sourceData, setSourceData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [deals, leads, sequences] = await Promise.all([
        dealService.getAll(),
        leadService.getAll(),
        sequenceService.getAll(),
      ]);

      // Calculate Stats
      const totalRevenue = deals
        .filter((d) => d.stage === "closed")
        .reduce((sum, d) => sum + d.value, 0);
      const dealsWon = deals.filter((d) => d.stage === "closed").length;
      const emailsSent = sequences.reduce((sum, s) => sum + s.stats.sent, 0);
      const totalLeads = leads.length;

      setStats({
        totalRevenue,
        totalLeads,
        dealsWon,
        emailsSent,
      });

      // Generate Mock Revenue Trend based on Total Revenue
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      const baseVal = totalRevenue / 6;
      const trendData = months.map((m) => ({
        name: m,
        value: Math.floor(
          baseVal + Math.random() * baseVal * 0.5 - baseVal * 0.25
        ),
      }));
      setRevenueData(trendData);

      // Source Data based on Tags or mock distribution
      setSourceData([
        { name: "Email", value: Math.floor(totalLeads * 0.45) },
        { name: "LinkedIn", value: Math.floor(totalLeads * 0.3) },
        { name: "Inbound", value: Math.floor(totalLeads * 0.15) },
        { name: "Events", value: Math.floor(totalLeads * 0.1) },
      ]);
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Global Analytics</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4 flex items-center gap-4 border-primary/30 bg-primary/5">
          <div className="p-3 rounded-full bg-primary/20 text-primary">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-bold">
              Total Revenue
            </p>
            <h3 className="text-2xl font-bold text-white">
              ${stats.totalRevenue.toLocaleString()}
            </h3>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-full bg-blue-500/20 text-blue-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-bold">
              Total Leads
            </p>
            <h3 className="text-2xl font-bold text-white">
              {stats.totalLeads.toLocaleString()}
            </h3>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-full bg-green-500/20 text-green-400">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-bold">
              Deals Won
            </p>
            <h3 className="text-2xl font-bold text-white">{stats.dealsWon}</h3>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-full bg-purple-500/20 text-purple-400">
            <Mail size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-bold">
              Emails Sent
            </p>
            <h3 className="text-2xl font-bold text-white">
              {stats.emailsSent.toLocaleString()}
            </h3>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-[400px]">
          <CardHeader>
            <h3 className="font-bold">Revenue Trend</h3>
          </CardHeader>
          <CardBody className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2D37A3" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#2D37A3" stopOpacity={0} />
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
                />
                <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#131229",
                    borderColor: "#2D37A3",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2D37A3"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorVal)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card className="h-[400px]">
          <CardHeader>
            <h3 className="font-bold">Lead Sources</h3>
          </CardHeader>
          <CardBody className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#131229",
                    borderColor: "#2D37A3",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
