import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCourses, enrollCourse, deleteCourse, getCourseStudents, unenrollStudent } from "../api/courses";
import { getStudents } from "../api/users";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Check, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { toast } from "sonner";
import { Trash2, Users, Loader2, BookOpen, Send } from "lucide-react";

export default function Courses({ instructorId = null }) {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  const [studentsOpen, setStudentsOpen] = useState(false);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [roleId, setRoleId] = useState(null);
  const [userId, setUserId] = useState(null);

  const [unenrollOpen, setUnenrollOpen] = useState(false);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem("role_id");
    const uId = localStorage.getItem("user_id");
    if (role) setRoleId(parseInt(role));
    if (uId) setUserId(parseInt(uId));
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
    select: (courses) => {
      if (instructorId) {
        return courses.filter(c => Number(c.instructor_id) === Number(instructorId));
      }
      return courses;
    }
  });

  const { data: students, isLoading: loadingSearch } = useQuery({
    queryKey: ["students", searchQuery],
    queryFn: () => getStudents(searchQuery),
    enabled: open && roleId === 1 && searchQuery.length > 1,
  });

  const mutation = useMutation({
    mutationFn: enrollCourse,
    onSuccess: () => {
      setOpen(false);
      setSearchQuery("");
      setSelectedStudent(null);
      toast.success("Successfully enrolled in course");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (err) => {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message || "";

      if (status === 422 || msg.includes("Duplicate entry") || msg.includes("The student is already enrolled")) {
        toast.info("This student is already enrolled in this course.");
        return;
      }
      toast.error("Enrollment failed", { description: msg });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      setDeleteOpen(false);
      toast.success("Ders silindi");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (err) => {
      toast.error("Deletion failed");
    },
  });

  const unenrollMutation = useMutation({
    mutationFn: unenrollStudent,
    onSuccess: () => {
      toast.success("Course deleted");
      setUnenrollOpen(false);
      setEnrollmentToDelete(null);
      if (selectedCourse) handleViewStudents(selectedCourse);
    },
  });

  const handleOpenEnroll = (course) => {
    setSelectedCourse(course);
    setSearchQuery("");
    setSelectedStudent(null);
    setOpen(true);
  };

  const handleConfirmEnroll = () => {
    if (!selectedCourse) return;
    const targetStudentId = roleId === 1 ? selectedStudent?.id : userId;
    if (!targetStudentId) {
      toast.error("Please select a student");
      return;
    }
    mutation.mutate({ course_id: selectedCourse.course_id, student_id: targetStudentId });
  };

  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (courseToDelete) deleteMutation.mutate(courseToDelete.course_id);
  };

  const handleViewStudents = async (course) => {
    setSelectedCourse(course);
    setStudentsOpen(true);
    setLoadingStudents(true);
    try {
      const resp = await getCourseStudents(course.course_id);
      setEnrolledStudents(resp || []);
    } catch (e) {
      toast.error("Failed to get student list.");
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleUnenrollClick = (enrollmentId) => {
    setEnrollmentToDelete(enrollmentId);
    setUnenrollOpen(true);
  };

  const handleConfirmUnenroll = () => {
    if (enrollmentToDelete) {
      unenrollMutation.mutate(enrollmentToDelete);
    }
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse text-muted-foreground">Loading courses...</div>;
  if (isError) return <div className="p-8 border rounded-2xl bg-destructive/5 text-destructive text-center font-medium">Failed to fetch courses.</div>;
  if (!data || data.length === 0) return <div className="p-12 border border-dashed rounded-3xl text-center text-muted-foreground">No courses have been added yet.</div>;

  return (
    <>
      <div className="overflow-hidden rounded-2xl border bg-background/50 backdrop-blur-sm shadow-xl shadow-border/20">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-b">
              <TableHead className="py-4 font-bold text-foreground">Course Title</TableHead>
              <TableHead className="py-4 font-bold text-foreground">Code</TableHead>
              <TableHead className="py-4 font-bold text-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((course) => (
              <TableRow key={course.course_id} className="group hover:bg-primary/5 transition-colors duration-200 border-b last:border-0">
                <TableCell className="py-5">
                  <div className="flex flex-col">
                    <span className="font-bold text-base tracking-tight">{course.title}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1 group-hover:text-primary transition-colors">
                      {BookOpen && <BookOpen size={10} />} Academic Record
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-mono bg-muted/60 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {course.code}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2 pr-2">
                    {(roleId === 3 || roleId === 1) && (
                      <Button
                        size="sm"
                        className="rounded-xl font-bold px-4 h-9 shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all hover:translate-y-[-2px] active:translate-y-0"
                        onClick={() => handleOpenEnroll(course)}
                        disabled={mutation.isPending}
                      >
                        Enroll
                      </Button>
                    )}

                    {(roleId === 1 || (roleId === 2 && Number(course.instructor_id) === userId)) && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 rounded-xl hover:bg-blue-500/10 hover:text-blue-600 transition-all"
                        onClick={() => handleViewStudents(course)}
                      >
                        {Users && <Users size={16} />}
                      </Button>
                    )}

                    {(roleId === 1 || (roleId === 2 && Number(course.instructor_id) === userId)) && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10 transition-all"
                        onClick={() => handleDeleteClick(course)}
                        disabled={deleteMutation.isPending}
                      >
                        {Trash2 && <Trash2 size={16} />}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl border-none shadow-2xl overflow-hidden p-0 max-w-md">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-2xl font-black tracking-tight">Course Enrollment</DialogTitle>
            <DialogDescription className="font-medium">
              Assign a new student to the <span className="text-primary font-bold">{selectedCourse?.title}</span> course.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 py-2 space-y-4">
            {roleId === 1 ? (
              <div className="space-y-4">
                {selectedStudent ? (
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/20 animate-in zoom-in-95">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Users size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{selectedStudent.name}</p>
                        <p className="text-xs text-muted-foreground">{selectedStudent.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setSelectedStudent(null)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search student by name or email..."
                        className="pl-10 rounded-xl h-11 bg-muted/30 border-none ring-offset-background focus-visible:ring-1 focus-visible:ring-primary"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <div className="max-h-[200px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                      {loadingSearch ? (
                        <div className="flex items-center justify-center py-8 text-muted-foreground">
                          <Loader2 className="animate-spin w-5 h-5 mr-2" />
                          <span className="text-xs font-bold uppercase tracking-widest">Searching...</span>
                        </div>
                      ) : students?.length > 0 ? (
                        students.map((student) => (
                          <button
                            key={student.id}
                            className="w-full text-left p-3 rounded-xl hover:bg-primary/5 transition-colors flex items-center justify-between group border border-transparent hover:border-primary/10"
                            onClick={() => setSelectedStudent(student)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                <Users size={14} />
                              </div>
                              <div className="overflow-hidden">
                                <p className="font-bold text-sm truncate">{student.name}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{student.email}</p>
                              </div>
                            </div>
                            <UserPlus className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all" />
                          </button>
                        ))
                      ) : searchQuery.length > 1 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p className="text-xs font-bold uppercase tracking-widest">Student not found</p>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground opacity-50">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em]">Start typing to search</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4 p-6 bg-muted/20 rounded-2xl border border-dashed border-border">
                <div className="p-3 bg-background rounded-xl">
                  <Users className="text-primary w-6 h-6" />
                </div>
                <p className="text-sm font-medium">Do you confirm the enrollment process for your own account?</p>
              </div>
            )}
          </div>

          <DialogFooter className="p-6 bg-muted/30 gap-2 sm:gap-0 mt-4">
            <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl flex-1 h-11 font-bold">Cancel</Button>
            <Button
              onClick={handleConfirmEnroll}
              disabled={mutation.isPending || (roleId === 1 && !selectedStudent)}
              className="rounded-xl flex-1 h-11 font-bold shadow-lg shadow-primary/20"
            >
              {mutation.isPending ? (
                <Loader2 className="animate-spin w-4 h-4 mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {roleId === 3 ? "Confirm Enrollment" : "Assign to Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="rounded-3xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-destructive">Dersi Sil</DialogTitle>
            <DialogDescription>
              This action will permanently delete the <span className="font-bold text-foreground">{courseToDelete?.title}</span> course.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} className="rounded-xl">Cancel</Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Permanently Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={unenrollOpen} onOpenChange={setUnenrollOpen}>
        <DialogContent className="rounded-3xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-destructive">Remove Enrollment</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this student from the course? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setUnenrollOpen(false)} className="rounded-xl">Cancel</Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              onClick={handleConfirmUnenroll}
              disabled={unenrollMutation.isPending}
            >
              {unenrollMutation.isPending ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={studentsOpen} onOpenChange={setStudentsOpen}>
        <DialogContent className="max-w-2xl rounded-3xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle>Enrolled Students</DialogTitle>
            <DialogDescription>Active student list for this course.</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {loadingStudents ? (
              <div className="flex justify-center p-8">{Loader2 && <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />}</div>
            ) : enrolledStudents.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No students enrolled yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ad Soyad</TableHead>
                    <TableHead>Email</TableHead>
                    {roleId === 1 && <TableHead className="text-right">Aksiyon</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrolledStudents.map((enr) => (
                    <TableRow key={enr.enrollment_id}>
                      <TableCell className="font-medium">{enr.student?.name}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{enr.student?.email}</TableCell>
                      {roleId === 1 && (
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 rounded-lg"
                            onClick={() => handleUnenrollClick(enr.enrollment_id)}
                            disabled={unenrollMutation.isPending}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStudentsOpen(false)} className="rounded-xl">Kapat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
