import React, { useState } from "react";
import { loginUser } from "../api/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await loginUser({ email, password });

      // ✅ Token & user info
      localStorage.setItem("token", res.token);
      localStorage.setItem("role_id", String(res.user.role_id));
      localStorage.setItem("user_id", String(res.user.id)); // ✅ MOST IMPORTANT

      // Notify App.jsx
      if (onLoginSuccess) onLoginSuccess(res.user.role_id);

      setMessage(`Login successful: ${res.user.name} (${res.user.role})`);
    } catch (err) {
      setMessage(err.response?.data?.message || "An error occurred");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          placeholder="example@mail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>

      <Button type="submit" className="w-full">
        Login
      </Button>

      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}
