import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getStats } from "../../api/stats";
import AuditLogs from "../AuditLogs";
import Courses from "../Courses";
import AddCourseForm from "../AddCourseForm";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  BookOpen,
  Activity,
  ShieldCheck,
  Plus,
  History,
  LayoutDashboard,
  Server,
  Fingerprint,
  ClipboardList,
  Eye,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [logsOpen, setLogsOpen] = useState(false);

  const { data: serverStats, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
  });

  const stats = [
    {
      label: "Total Students",
      value: serverStats?.total_students ?? "...",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      desc: "Active enrolled students"
    },
    {
      label: "Active Courses",
      value: serverStats?.active_courses ?? "...",
      icon: BookOpen,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      desc: "Published courses"
    },
    {
      label: "System Logs",
      value: serverStats?.total_logs ?? "...",
      icon: Fingerprint,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      desc: "Total audit logs"
    },
    {
      label: "Security Status",
      value: serverStats?.security_status ?? "Secure",
      icon: ShieldCheck,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      desc: "System threat analysis"
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-gradient-to-r from-background to-muted/30 backdrop-blur-md p-8 rounded-[2rem] border shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
          {LayoutDashboard && <LayoutDashboard size={180} />}
        </div>

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-4xl font-black tracking-tighter text-foreground italic">Admin <span className="text-primary not-italic">Panel</span></h2>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 rounded-full font-bold uppercase tracking-widest text-[10px]">
              Authorized Access
            </Badge>
          </div>
          <p className="text-muted-foreground font-medium max-w-lg">
            Manage university-wide academic activities, system logs, and user actions from here.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Dialog open={logsOpen} onOpenChange={setLogsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-2xl gap-2 font-bold h-12 bg-background/50 border-border/50 hover:bg-background">
                {ClipboardList && <ClipboardList size={18} />}
                System Logs
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] lg:max-w-7xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-background/95 backdrop-blur-xl">
              <DialogHeader className="p-8 pb-4 bg-destructive/5 border-b">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-destructive/10 rounded-2xl text-destructive shadow-lg shadow-destructive/10">
                    {Fingerprint && <Fingerprint size={28} />}
                  </div>
                  <div className="space-y-1 text-left">
                    <DialogTitle className="text-3xl font-black tracking-tight">System Logs</DialogTitle>
                    <DialogDescription className="font-bold uppercase tracking-widest text-[10px] opacity-60">
                      All critical system actions within the last 24 hours.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="p-8 max-h-[70vh] overflow-y-auto">
                <AuditLogs />
              </div>
              <div className="p-6 bg-muted/20 border-t flex justify-end gap-3">
                <Button variant="ghost" className="rounded-xl font-bold px-6 border border-border/50 hover:bg-background h-11" onClick={() => setLogsOpen(false)}>
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>

        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-xl bg-background/40 backdrop-blur-md hover:translate-y-[-6px] transition-all duration-500 group">
            <CardContent className="p-7">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className={stat.bg + " p-3.5 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-500"}>
                    {stat.icon && <stat.icon className={stat.color + " w-6 h-6"} />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                    <p className="text-3xl font-black tracking-tight">{stat.value}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 font-medium">
                    {stat.desc}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Area: Stacked vertically */}
      <div className="space-y-8">
        {/* Horizontal Course Creation Center */}
        <Card className="border-none shadow-2xl bg-background/30 backdrop-blur-md overflow-hidden rounded-[2rem] ring-1 ring-white/10">
          <div className="h-1.5 w-full bg-primary/10">
            <div className="h-full w-1/6 bg-primary animate-pulse shadow-[0_0_15px_rgba(var(--primary),0.5)]"></div>
          </div>
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-primary/5 rounded-xl text-primary">
                {Server && <Server size={20} />}
              </div>
              <div className="space-y-0.5">
                <CardTitle className="text-xl font-black tracking-tight">Define New Course</CardTitle>
                <CardDescription className="text-xs font-medium italic opacity-70">Quickly integrate academic units into the system.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-2">
            <div className="bg-muted/30 p-6 rounded-[1.5rem] border border-dashed border-primary/20 ring-4 ring-primary/5">
              <AddCourseForm />
            </div>
          </CardContent>
        </Card>

        {/* Global Catalog: Expanded and wide */}
        <Card className="border-none shadow-2xl bg-background rounded-[2rem] overflow-hidden ring-1 ring-border/50">
          <CardHeader className="border-b bg-muted/20 p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600">
                    {Eye && <Eye size={22} />}
                  </div>
                  <CardTitle className="text-2xl font-black tracking-tight">Active Course Catalog</CardTitle>
                </div>
                <CardDescription className="font-medium">Comprehensive management of all active courses within the university.</CardDescription>
              </div>
              <Badge variant="secondary" className="font-mono px-5 py-2 rounded-full text-lg bg-primary/10 text-primary border-none font-bold">
                Total: 42
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <Courses />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
