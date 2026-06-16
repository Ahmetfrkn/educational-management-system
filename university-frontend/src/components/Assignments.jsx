import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAssignments, submitAssignment } from '../api/assignments';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Send, Clock } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function Assignments({ course_id }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['assignments', course_id],
    queryFn: () => getAssignments(course_id),
    enabled: !!course_id,
  });

  const mutation = useMutation({
    mutationFn: submitAssignment,
    onSuccess: () => {
      toast.success('Assignment submitted successfully');
      queryClient.invalidateQueries({
        queryKey: ['assignments', course_id],
      });
    },
    onError: (error) => {
      toast.error('Submission failed', {
        description: error.response?.data?.message || 'An error occurred.'
      });
    }
  });

  const handleSubmit = (assignment_id) => {
    mutation.mutate({
      assignment_id,
      student_id: Number(localStorage.getItem("user_id")),
      content_url: 'https://example.com/solution.pdf',
    });
  };

  if (isLoading) return <div className="space-y-3 p-4 animate-pulse">
    {[1, 2].map(i => <div key={i} className="h-16 bg-muted rounded-xl" />)}
  </div>;

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <FileText className="w-8 h-8 mx-auto opacity-20 mb-2" />
        <p className="text-xs font-medium">No assignments defined for this course yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map(a => (
        <Card key={a.assignment_id} className="border-none bg-background/50 hover:bg-background transition-colors shadow-none ring-1 ring-border/50 rounded-2xl overflow-hidden group">
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold tracking-tight">{a.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="px-1.5 py-0 text-[10px] uppercase font-bold tracking-wider opacity-70">
                      {a.max_points} Points
                    </Badge>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                      <Clock size={10} /> Due Date: {new Date(a.due_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleSubmit(a.assignment_id)}
                disabled={mutation.isPending}
                className="rounded-xl h-8 text-xs font-bold hover:bg-primary/10 hover:text-primary gap-2"
              >
                {mutation.isPending ? "..." : <><Send size={14} /> Submit</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
