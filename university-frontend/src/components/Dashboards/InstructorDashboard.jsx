import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getStats } from "../../api/stats";
import Courses from "../Courses";
import AddCourseForm from "../AddCourseForm";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  GraduationCap,
  FileText,
  TrendingUp,
  MoreHorizontal,
  Calendar,
  Sparkles,
  Search,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function InstructorDashboard() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const uId = localStorage.getItem("user_id");
    if (uId) setUserId(parseInt(uId));
  }, []);

  const { data: serverStats, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
  });

  const stats = [
    {
      label: "Total Students",
      value: serverStats?.my_students_count ?? "1",
      icon: Users,
      trend: "+12%",
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      label: "My Active Courses",
      value: serverStats?.my_courses_count ?? "3",
      icon: GraduationCap,
      trend: "Stable",
      color: "text-indigo-500",
      bg: "bg-indigo-500/10"
    },
    {
      label: "Pending Assignments",
      value: serverStats?.pending_assignments ?? "0",
      icon: FileText,
      trend: "+0",
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    {
      label: "Success Rate",
      value: serverStats?.success_rate ?? "88%",
      icon: TrendingUp,
      trend: "+2.4%",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-1000">
      {/* Upper Section */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-background/40 backdrop-blur-md p-8 rounded-[2rem] border shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary font-bold">
              {Sparkles && <Sparkles size={20} />}
            </div>
            <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent italic">
              Instructor <span className="not-italic">Hub</span>
            </h2>
          </div>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            {Calendar && <Calendar size={14} />} Academic Term: 2025-2026
          </p>
        </div>

      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-xl bg-background/60 backdrop-blur-xl group hover:translate-y-[-4px] transition-all duration-500 rounded-[1.5rem] overflow-hidden">
            <CardContent className="p-7">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className={stat.bg + " p-3 rounded-2xl w-fit group-hover:rotate-6 transition-transform"}>
                    {stat.icon && <stat.icon size={24} className={stat.color} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                    <div className="flex items-center gap-3">
                      <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
                      <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black rounded-full px-2 py-0.5">
                        {stat.trend}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Area: Stacked vertically */}
      <div className="space-y-8">
        {/* Horizontal Course Creation Center (Same as Admin for consistency) */}
        <Card className="border-none shadow-2xl bg-gradient-to-br from-background to-muted/20 overflow-hidden relative rounded-[2rem] ring-1 ring-white/10">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-125 transition-transform duration-1000">
            {GraduationCap && <GraduationCap size={160} />}
          </div>
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-primary/5 rounded-xl text-primary">
                {Sparkles && <Sparkles size={20} />}
              </div>
              <div className="space-y-0.5">
                <CardTitle className="text-xl font-black tracking-tight">Create New Curriculum</CardTitle>
                <CardDescription className="text-xs font-medium italic opacity-70">Instantly define a new academic course in the system.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-2 relative z-10">
            <div className="p-6 bg-background/40 backdrop-blur-sm rounded-[1.5rem] border border-dashed border-primary/20 ring-4 ring-primary/5">
              <AddCourseForm />
            </div>
          </CardContent>
        </Card>

        {/* Global Catalog: Expanded and wide */}
        <div className="space-y-6">
          <Card className="border-none shadow-2xl bg-background/80 backdrop-blur-xl overflow-hidden ring-1 ring-border/50 rounded-[2rem]">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/5 p-8">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                  {FileText && <FileText className="text-primary w-6 h-6" />}
                  My Courses
                </CardTitle>
                <CardDescription className="font-medium text-sm text-muted-foreground">All active academic courses you manage and student lists.</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="hidden md:flex h-8 px-4 rounded-full font-bold uppercase tracking-widest text-[10px] border-primary/20 text-primary bg-primary/5">Active Only</Badge>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-primary/10 transition-colors">
                  {MoreHorizontal && <MoreHorizontal size={20} />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <Courses instructorId={userId} />
            </CardContent>
          </Card>

          {/* Integrated Tips: Now horizontal at the bottom */}
          <div className="grid md:grid-cols-2 gap-4 px-4">
            <div className="flex items-start gap-4 p-5 bg-primary/5 rounded-3xl border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-2 bg-primary/10 rounded-xl text-primary mt-1">
                <Sparkles size={16} />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-widest mb-1 text-primary/80">Instructor Tip</p>
                <p className="text-sm font-medium italic text-muted-foreground">"Ensure course codes are unique when adding a new curriculum."</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 bg-muted/30 rounded-3xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-2 bg-muted-foreground/10 rounded-xl text-muted-foreground mt-1">
                <Users size={16} />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-widest mb-1 text-muted-foreground">Reminder</p>
                <p className="text-sm font-medium italic text-muted-foreground">"Don't forget to update student lists weekly."</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
