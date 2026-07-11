import api from './api';

// Fetch courses taught by the authenticated instructor
export const getInstructorCourses = async () => {
    const response = await api.get('/instructor/courses');
    return response.data;
};

// Fetch students enrolled in a specific course (Admin/Instructor)
export const getCourseStudents = async (courseId) => {
    const response = await api.get(`/courses/${courseId}/students`);
    return response.data;
};

// Update student grade for a specific enrollment
export const updateGrade = async (enrollmentId, grade) => {
    const response = await api.put(`/enrollments/${enrollmentId}/grade`, {
        final_grade: grade,
    });
    return response.data;
};

// Fetch enrollments (courses + grades) for a specific student
export const getStudentCourses = async (studentId) => {
    const response = await api.get(`/student/${studentId}/courses`);
    return response.data;
};
