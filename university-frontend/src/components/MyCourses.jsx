import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyEnrollments } from "../api/enrollments";
import { getAssignments, submitAssignment } from '../api/assignments';
import { Badge } from "@/components/ui/badge";
import { Calendar, BookOpen, FileText, Send, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function MyCourses() {
  const studentId = Number(localStorage.getItem("user_id"));

  const { data, isLoading, isError } = useQuery({
    queryKey: ["myEnrollments", studentId],
    queryFn: () => getMyEnrollments(studentId),
    enabled: !!studentId,
  });

  if (!studentId) {
    return <p className="text-sm text-muted-foreground p-4 text-center">User not found. Please log in again.</p>;
  }

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading courses...</div>;
  if (isError) return <p className="text-sm text-destructive p-4 text-center">Failed to fetch courses.</p>;

  if (!data || data.length === 0) {
    return (
      <div className="p-12 text-center space-y-3">
        <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto" />
        <p className="text-muted-foreground font-medium">You are not enrolled in any courses yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-background/50 backdrop-blur-sm">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="font-bold">Course</TableHead>
            <TableHead className="font-bold">Code</TableHead>
            <TableHead className="font-bold">Instructor</TableHead>
            <TableHead className="font-bold">Enrollment Date</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((enr) => (
            <TableRow key={`${enr.student_id}-${enr.course_id}`} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-semibold">{enr.course?.title}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-mono">{enr.course?.code}</Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">ID: {enr.course?.instructor_id || 'Not specified'}</TableCell>
              <TableCell className="text-xs text-muted-foreground flex items-center gap-2 py-4">
                <Calendar size={12} />
                {new Date(enr.created_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
