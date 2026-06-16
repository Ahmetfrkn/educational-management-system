import React, { useEffect, useState } from "react";

import Register from "./components/Register";
import Login from "./components/Login";
import AdminDashboard from "./components/Dashboards/AdminDashboard";
import InstructorDashboard from "./components/Dashboards/InstructorDashboard";
import StudentDashboard from "./components/Dashboards/StudentDashboard";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";

import DashboardLayout from "./components/DashboardLayout";

function App() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const savedRole = localStorage.getItem("role_id");
    if (savedRole) setRole(parseInt(savedRole));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setRole(null);
  };

  return (
    <>
      {role ? (
        <DashboardLayout role={role} onLogout={handleLogout}>
          {role === 1 && <AdminDashboard />}
          {role === 2 && <InstructorDashboard />}
          {role === 3 && <StudentDashboard />}
        </DashboardLayout>
      ) : (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background flex items-center justify-center p-4">
          <div className="w-full max-w-[440px] animate-in fade-in zoom-in duration-500">
            <div className="mb-10 text-center space-y-3">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/20 mb-6 rotate-3 hover:rotate-0 transition-transform duration-300">
                <span className="text-3xl font-bold">U</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                University System
              </h1>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                Modern academic solution for curriculum, enrollment, and student management.
              </p>
            </div>

            <Card className="border-none shadow-2xl shadow-primary/5 bg-background/60 backdrop-blur-xl transition-all hover:shadow-primary/10">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl">Welcome</CardTitle>
                <CardDescription>Access your account to continue.</CardDescription>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 rounded-xl h-11 p-1 bg-muted/50">
                    <TabsTrigger value="login" className="rounded-lg data-[state=active]:shadow-md">Login</TabsTrigger>
                    <TabsTrigger value="register" className="rounded-lg data-[state=active]:shadow-md">Register</TabsTrigger>
                  </TabsList>

                  <div className="mt-6">
                    <TabsContent value="login" className="mt-0 focus-visible:outline-none">
                      <Login onLoginSuccess={(roleId) => setRole(roleId)} />
                    </TabsContent>

                    <TabsContent value="register" className="mt-0 focus-visible:outline-none">
                      <Register />
                    </TabsContent>
                  </div>
                </Tabs>

                <Separator className="my-6 opacity-50" />

                <div className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Demo Credentials</p>
                  <p className="text-xs font-semibold text-muted-foreground">Admin: <span className="text-foreground">admin@test.com</span></p>
                  <p className="text-xs font-semibold text-muted-foreground">Password: <span className="text-foreground">password123</span></p>
                </div>
              </CardContent>
            </Card>

            <p className="mt-8 text-center text-[11px] text-muted-foreground font-medium uppercase tracking-[0.2em]">
              &copy; {new Date().getFullYear()} URS • Academic Excellence
            </p>
          </div>
        </div>
      )}

      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;
