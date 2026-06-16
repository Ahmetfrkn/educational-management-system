import api from './api';

// Fetch all courses
export const getCourses = async () => {
  const res = await api.get('/courses');
  return res.data;
};

// Enroll in a course
export const enrollCourse = async (data) => {
  const res = await api.post('/enroll', data);
  return res.data;
};

export const createCourse = async (courseData) => {
  const response = await api.post('/courses', courseData);
  return response.data;
};

// Delete a course (Admin/Instructor)
export const deleteCourse = async (courseId) => {
  const response = await api.delete(`/courses/${courseId}`);
  return response.data;
};

// Get students in a course (Instructor/Admin)
export const getCourseStudents = async (courseId) => {
  const response = await api.get(`/courses/${courseId}/students`);
  return response.data;
};

// Remove enrollment (Admin)
export const unenrollStudent = async (enrollmentId) => {
  const response = await api.delete(`/enrollments/${enrollmentId}`);
  return response.data;
};