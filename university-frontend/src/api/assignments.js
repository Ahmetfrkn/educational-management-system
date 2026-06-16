import  api  from './api';

// Get assignments for a course
export const getAssignments = async (course_id) => {
  const res = await api.get(`/courses/${course_id}/assignments`);
  return res.data;
};

// Submit an assignment
export const submitAssignment = async (data) => {
  const res = await api.post('/submissions', data);
  return res.data;
};
