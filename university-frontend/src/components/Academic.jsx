import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInstructorCourses, getCourseStudents, updateGrade, getStudentCourses } from "../api/academic";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  GraduationCap,
  BookOpen,
  User,
  Clock,
  Loader2,
  Save,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search
} from "lucide-react";

export default function Academic() {
  const roleId = parseInt(localStorage.getItem("role_id"));
  const userId = parseInt(localStorage.getItem("user_id"));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-xl text-primary">
          <GraduationCap size={22} />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight italic">
            Academic <span className="text-primary not-italic">Records</span>
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            {roleId === 3 ? "View your academic performance and grades." : "Manage grades for your enrolled students."}
          </p>
        </div>
      </div>

      {roleId === 3 ? (
        <StudentView userId={userId} />
      ) : (
        <InstructorView roleId={roleId} />
      )}
    </div>
  );
}

// ── Instructor View ────────────────────────────────────────────────────────
function InstructorView({ roleId }) {
  const queryClient = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [grades, setGrades] = useState({}); // { enrollmentId: "85.5" }

  // 1. Fetch Instructor Courses
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["academic", "instructorCourses"],
    queryFn: getInstructorCourses,
  });

  // 2. Fetch Enrolled Students for selected course
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["academic", "courseStudents", selectedCourseId],
    queryFn: () => getCourseStudents(selectedCourseId),
    enabled: !!selectedCourseId,
  });

  // 3. Update Grade Mutation
  const updateGradeMutation = useMutation({
    mutationFn: ({ enrollmentId, grade }) => updateGrade(enrollmentId, grade),
    onSuccess: (data) => {
      toast.success("Grade updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["academic", "courseStudents", selectedCourseId] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to update grade");
    },
  });

  // Initialize local grades state when students load
  React.useEffect(() => {
    if (students) {
      const initialGrades = {};
      students.forEach((enrollment) => {
        initialGrades[enrollment.enrollment_id] = enrollment.final_grade !== null ? enrollment.final_grade : "";
      });
      setGrades(initialGrades);
    }
  }, [students]);

  const handleGradeChange = (enrollmentId, value) => {
    setGrades((prev) => ({ ...prev, [enrollmentId]: value }));
  };

  const handleSaveGrade = (enrollmentId) => {
    const value = grades[enrollmentId];
    if (value === "" || isNaN(value) || value < 0 || value > 100) {
      toast.error("Please enter a valid grade between 0 and 100.");
      return;
    }
    updateGradeMutation.mutate({ enrollmentId, grade: parseFloat(value) });
  };

  if (coursesLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-20 bg-muted rounded-2xl w-full" />
        <div className="h-64 bg-muted rounded-2xl w-full" />
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-20 bg-muted/20 rounded-[2rem] border border-dashed border-border/50">
        <BookOpen className="w-16 h-16 mx-auto opacity-10 mb-4" />
        <p className="text-lg font-black uppercase tracking-widest text-muted-foreground/50">No Courses Found</p>
        <p className="text-sm text-muted-foreground/40 mt-2 font-medium">
          You are not currently assigned to any active courses.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <Card
            key={course.course_id}
            className={`cursor-pointer transition-all duration-200 border-2 rounded-[1.5rem] overflow-hidden hover:shadow-lg ${
              selectedCourseId === course.course_id
                ? "border-primary bg-primary/5 shadow-md"
                : "border-transparent bg-background/50 hover:border-primary/30"
            }`}
            onClick={() => setSelectedCourseId(course.course_id)}
          >
            <CardHeader className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="outline" className="mb-2 font-black uppercase text-[10px] tracking-widest">
                    {course.code}
                  </Badge>
                  <CardTitle className="text-lg font-bold leading-tight">{course.title}</CardTitle>
                </div>
                <BookOpen size={20} className={selectedCourseId === course.course_id ? "text-primary" : "text-muted-foreground/30"} />
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Selected Course Student List */}
      {selectedCourseId && (
        <Card className="border-none shadow-2xl bg-background/80 backdrop-blur-xl overflow-hidden ring-1 ring-border/50 rounded-[2rem]">
          <CardHeader className="bg-muted/10 border-b p-6">
            <CardTitle className="text-xl font-black">Enrolled Students</CardTitle>
            <CardDescription>Enter or update final exam grades for this course.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {studentsLoading ? (
              <div className="p-10 text-center text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
                <p className="font-medium">Loading students...</p>
              </div>
            ) : !students || students.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground">
                <User className="w-12 h-12 opacity-20 mx-auto mb-3" />
                <p className="font-bold">No students enrolled</p>
                <p className="text-sm opacity-70">There are no students enrolled in this course yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-black text-[10px] uppercase tracking-widest pl-6 py-4">Student</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest py-4">Enrolled Date</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest py-4 text-right">Final Grade</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest pr-6 py-4 w-32"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((enrollment) => {
                    const originalGrade = enrollment.final_grade;
                    const currentInput = grades[enrollment.enrollment_id];
                    const isChanged = currentInput !== "" && Number(currentInput) !== originalGrade && !(originalGrade === null && currentInput === undefined);

                    return (
                      <TableRow key={enrollment.enrollment_id} className="hover:bg-primary/[0.02] transition-colors group">
                        <TableCell className="pl-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                              <User size={14} className="text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-bold leading-tight">{enrollment.student?.name}</p>
                              <p className="text-[10px] text-muted-foreground font-medium">{enrollment.student?.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <Clock size={12} />
                            {new Date(enrollment.enrolled_at).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 text-right">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="---"
                            value={grades[enrollment.enrollment_id] ?? ""}
                            onChange={(e) => handleGradeChange(enrollment.enrollment_id, e.target.value)}
                            className="w-20 ml-auto rounded-xl text-center font-bold"
                          />
                        </TableCell>
                        <TableCell className="pr-6 py-4 text-right">
                          <Button
                            size="sm"
                            className={`rounded-xl h-9 px-4 font-bold transition-all ${
                              isChanged ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary"
                            }`}
                            onClick={() => handleSaveGrade(enrollment.enrollment_id)}
                            disabled={updateGradeMutation.isPending && updateGradeMutation.variables?.enrollmentId === enrollment.enrollment_id}
                          >
                            {updateGradeMutation.isPending && updateGradeMutation.variables?.enrollmentId === enrollment.enrollment_id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <>
                                <Save size={14} className="mr-1.5" /> Save
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Student View ───────────────────────────────────────────────────────────
function StudentView({ userId }) {
  const { data: enrollments, isLoading, isError } = useQuery({
    queryKey: ["academic", "studentCourses", userId],
    queryFn: () => getStudentCourses(userId),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map(i => <div key={i} className="h-48 bg-muted rounded-2xl w-full" />)}
      </div>
    );
  }

  if (isError || !enrollments || enrollments.length === 0) {
    return (
      <div className="text-center py-20 bg-muted/20 rounded-[2rem] border border-dashed border-border/50">
        <Search className="w-16 h-16 mx-auto opacity-10 mb-4" />
        <p className="text-lg font-black uppercase tracking-widest text-muted-foreground/50">No Academic Records</p>
        <p className="text-sm text-muted-foreground/40 mt-2 font-medium">
          You are not enrolled in any courses or grades have not been posted yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {enrollments.map((enrollment) => {
        const grade = enrollment.final_grade;
        const hasGrade = grade !== null && grade !== undefined;
        const isPassing = hasGrade && grade >= 50;

        return (
          <Card key={enrollment.enrollment_id} className="border-none shadow-xl bg-background/80 backdrop-blur-xl rounded-[2rem] overflow-hidden ring-1 ring-border/50 transition-all hover:shadow-2xl hover:bg-background">
            <CardHeader className="bg-muted/30 border-b p-6 relative">
              <Badge variant="outline" className="absolute top-6 right-6 font-black uppercase text-[10px] tracking-widest bg-background">
                {enrollment.course?.code}
              </Badge>
              <CardTitle className="text-xl font-black leading-tight pr-12">{enrollment.course?.title}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <User size={12} className="text-muted-foreground" />
                <span className="text-xs font-bold text-muted-foreground">{enrollment.course?.instructor?.name || "Instructor TBA"}</span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-6">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Final Grade</p>
                {hasGrade ? (
                  <div className="text-center">
                    <span className="text-5xl font-black tracking-tighter tabular-nums">
                      {grade}
                    </span>
                    <span className="text-xl font-bold text-muted-foreground/50 ml-1">/100</span>
                    <div className="mt-4">
                      {isPassing ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3 py-1 font-bold text-xs gap-1.5 rounded-xl">
                          <CheckCircle2 size={14} /> Passed
                        </Badge>
                      ) : (
                        <Badge className="bg-destructive/10 text-destructive border-destructive/20 px-3 py-1 font-bold text-xs gap-1.5 rounded-xl">
                          <XCircle size={14} /> Failed
                        </Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3 border border-border/50">
                      <Clock size={24} className="text-muted-foreground/50" />
                    </div>
                    <p className="text-sm font-bold text-muted-foreground">Pending Review</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
