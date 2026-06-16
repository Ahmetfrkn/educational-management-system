import React, { useState } from "react";
import Courses from "../Courses";
import Assignments from "../Assignments";
import MyCourses from "../MyCourses";
import { useQuery } from "@tanstack/react-query";
import { getStats } from "../../api/stats";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Trophy,
  Clock,
  Sparkles,
  Search,
  ChevronRight,
  Bookmark,
  GraduationCap
} from "lucide-react";

export default function StudentDashboard() {
  const [openMyCourses, setOpenMyCourses] = useState(false);

  const { data: serverStats, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
  });

  const highlights = [
    { title: "Enrolled Courses", value: (serverStats?.enrolled_courses_count ?? "...") + " Courses", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Total Assignments", value: (serverStats?.total_assignments ?? "...") + " Pending", icon: Clock, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Completed", value: serverStats?.completed_tasks ?? "...", icon: Trophy, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
      <div className="relative overflow-hidden rounded-[2rem] border-none bg-primary p-8 md:p-12 text-primary-foreground shadow-2xl shadow-primary/30 group">
        <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
          {GraduationCap && <GraduationCap size={240} />}
        </div>

        <div className="relative z-10 max-w-2xl space-y-6">
          <Badge className="bg-white/20 hover:bg-white/30 text-white border-transparent backdrop-blur-md px-3 py-1 text-xs font-semibold uppercase tracking-wider">
            Academic Year 2024
          </Badge>
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Welcome, Future Graduate!</h2>
            <p className="text-primary-foreground/80 text-lg font-medium leading-relaxed">
              It's a great day to learn. Keep track of your courses, submit your assignments, and get one step closer to success.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 pt-4">
            <Button variant="secondary" onClick={() => setOpenMyCourses(true)} className="rounded-full px-6 font-bold shadow-lg">
              My Enrolled Courses <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
            <Button variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 rounded-full px-6 font-bold">
              Calendar <Clock className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {highlights.map((item, idx) => (
          <Card key={idx} className="border-none shadow-sm bg-background/60 backdrop-blur-md overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={(item.bg || "bg-muted") + " p-3 rounded-2xl"}>
                {item.icon && <item.icon className={(item.color || "") + " w-6 h-6"} />}
              </div>
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-tight">{item.title}</p>
                <p className="text-2xl font-black">{item.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Bookmark className="text-primary" /> Discover New Courses
            </h3>
            <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5">
              View All
            </Button>
          </div>

          <Card className="border-none shadow-2xl bg-background/40 backdrop-blur-sm ring-1 ring-border/50 rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <Courses />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-xl bg-background/70 backdrop-blur-md rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Clock size={18} className="text-amber-500" />
                  Upcoming Assignments
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Assignments course_id={1} />
            </CardContent>
          </Card>

        </div>
      </div>

      <Dialog open={openMyCourses} onOpenChange={setOpenMyCourses}>
        <DialogContent className="max-w-4xl p-0 border-none shadow-2xl overflow-hidden rounded-3xl">
          <div className="bg-primary p-8 text-primary-foreground">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black">My Enrolled Courses</DialogTitle>
              <DialogDescription className="text-primary-foreground/70">Your academic history and active courses.</DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-8 max-h-[60vh] overflow-y-auto">
            <MyCourses />
          </div>
          <div className="p-4 bg-muted/20 border-t flex justify-end">
            <Button onClick={() => setOpenMyCourses(false)} variant="ghost" className="font-bold">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
