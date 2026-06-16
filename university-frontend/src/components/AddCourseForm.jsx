import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCourse } from '../api/courses';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BookPlus } from "lucide-react";
import { toast } from "sonner";

export default function AddCourseForm() {
  const [formData, setFormData] = useState({ title: '', code: '', description: '' });
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      toast.success('Course created successfully');
      setFormData({ title: '', code: '', description: '' });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (error) => {
      toast.error('Failed to create course', {
        description: error.response?.data?.message || 'An error occurred.'
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      instructor_id: localStorage.getItem('user_id') || 1
    };
    mutation.mutate(payload);
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-end gap-4">
        <div className="flex-1 space-y-2 w-full">
          <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Course Title</Label>
          <Input
            id="title"
            placeholder="Enter course title..."
            className="rounded-xl bg-background/50 h-10"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="w-full md:w-32 space-y-2">
          <Label htmlFor="code" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Course Code</Label>
          <Input
            id="code"
            placeholder="CS101"
            className="rounded-xl bg-background/50 font-mono h-10"
            value={formData.code}
            onChange={e => setFormData({ ...formData, code: e.target.value })}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full md:w-auto rounded-xl font-bold h-10 px-6 shadow-lg shadow-primary/10 transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <BookPlus size={16} /> Add
            </span>
          )}
        </Button>
      </form>
    </Card>
  );
}
