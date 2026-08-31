import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import AdminLayout from "../layouts/AdminLayout";
import { Card, CardContent } from "../components/ui";
import { UserPlus, Building2, BookOpen, Calendar, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { adminName } = useAuth();
  const [counts, setCounts] = useState({
    teachers: 0,
    classes: 0,
    subjects: 0,
    timetables: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [teachersRes, classesRes, subjectsRes, timetablesRes] = await Promise.all([
          supabase.from("teachers").select("*", { count: "exact", head: true }),
          supabase.from("classes").select("*", { count: "exact", head: true }),
          supabase.from("subjects").select("*", { count: "exact", head: true }),
          supabase.from("timetable").select("*", { count: "exact", head: true }),
        ]);

        setCounts({
          teachers: teachersRes.count || 0,
          classes: classesRes.count || 0,
          subjects: subjectsRes.count || 0,
          timetables: timetablesRes.count || 0,
        });
      } catch (err) {
        console.error("Failed to load dashboard counts:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCounts();
  }, []);

  const stats = [
    { name: "Teachers", value: loading ? "..." : String(counts.teachers), change: "Active", icon: UserPlus, color: "bg-blue-100 text-blue-600", bg: "bg-blue-50" },
    { name: "Classes", value: loading ? "..." : String(counts.classes), change: "Configured", icon: Building2, color: "bg-green-100 text-green-600", bg: "bg-green-50" },
    { name: "Subjects", value: loading ? "..." : String(counts.subjects), change: "Mapped", icon: BookOpen, color: "bg-purple-100 text-purple-600", bg: "bg-purple-50" },
    { name: "Timetable Slots", value: loading ? "..." : String(counts.timetables), change: "Generated", icon: Calendar, color: "bg-orange-100 text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Welcome back, {adminName}</h1>
          <p className="text-text-secondary mt-1">Overview of your school timetable management system</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.name} variant="default" padding="md" className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-start justify-between">
                  <div>
                    <p className="text-text-secondary text-sm font-medium">{stat.name}</p>
                    <p className="text-3xl font-bold text-text-primary mt-1">{stat.value}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <TrendingUp className={`${stat.color} size-4`} aria-hidden="true" />
                      <span className={`${stat.color} text-sm font-medium`}>{stat.change}</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <Icon className={`${stat.color} size-6`} aria-hidden="true" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="default" padding="md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text-primary">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Add Teacher", icon: UserPlus, href: "/teachers" },
                { label: "Add Class", icon: Building2, href: "/classes" },
                { label: "Add Subject", icon: BookOpen, href: "/subjects" },
                { label: "View Timetable", icon: Calendar, href: "/consolidated-timetable" },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link 
                    key={action.label} 
                    to={action.href}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                  >
                    <div className="p-3 bg-primary/10 text-primary rounded-xl">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-medium text-text-primary text-center">{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </Card>

          <Card variant="default" padding="md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text-primary">System Status</h2>
            </div>
            <div className="space-y-4">
              {[
                { action: "Database Engine", name: "Supabase Connected", time: "Active", type: "teacher" },
                { action: "Timetable Algorithm", name: "Greedy Ranking with Backtracking", time: "Ready", type: "class" },
                { action: "Constraints Engine", name: "Teacher Leave & Fixed Slot Checks", time: "Enforced", type: "subject" },
                { action: "Export System", name: "PDF Master & Class Exporter", time: "Ready", type: "timetable" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <TrendingUp className="size-4" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary text-sm font-medium">{activity.action}</p>
                    <p className="text-text-secondary text-sm">{activity.name}</p>
                  </div>
                  <span className="text-text-muted text-xs whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Dashboard;