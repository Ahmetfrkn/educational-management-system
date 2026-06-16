const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";

// List enrollments for a student
export async function getMyEnrollments(studentId) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/student/${studentId}/courses`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch enrollments");
  return res.json();
}
