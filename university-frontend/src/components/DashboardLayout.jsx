import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUnreadCount } from "../api/messages";
import {
    LayoutDashboard,
    BookOpen,
    GraduationCap,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    User,
    Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Courses from "./Courses";
import AuditLogs from "./AuditLogs";
import Messages from "./Messages";

import Academic from "./Academic";

// Note: DropdownMenu might not be installed yet, I'll check and use simpler components if needed,
// but for now I'll assume standard Shadcn components or create minimalist versions.

export default function DashboardLayout({ children, role, onLogout }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeView, setActiveView] = useState("dash");

    const { data: unreadData } = useQuery({
        queryKey: ["messages", "unreadCount"],
        queryFn: getUnreadCount,
        refetchInterval: 30000,
    });
    const unreadCount = unreadData?.unread_count || 0;

    const getRoleName = () => {
        if (role === 1) return "Admin";
        if (role === 2) return "Instructor";
        if (role === 3) return "Student";
        return "User";
    };

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", id: "dash" },
        { icon: BookOpen, label: "Courses", id: "courses" },
        { icon: GraduationCap, label: "Academic", id: "academic" },
        { icon: Mail, label: "Messages", id: "messages" },
        { icon: Settings, label: "Settings", id: "settings" },
    ];

    return (
        <div className="flex h-screen bg-muted/40 overflow-hidden">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
                    !isSidebarOpen && "-translate-x-full lg:w-20"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="flex items-center justify-between h-16 px-6 border-b bg-background/50 backdrop-blur-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground shrink-0">
                                <GraduationCap size={20} />
                            </div>
                            {isSidebarOpen && (
                                <span className="font-bold text-lg tracking-tight whitespace-nowrap">UniSystem</span>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <X size={20} />
                        </Button>
                    </div>

                    {/* Navigation Items */}
                    <div className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveView(item.id)}
                                className={cn(
                                    "flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group relative",
                                    "hover:bg-accent/50 hover:text-accent-foreground",
                                    activeView === item.id ? "bg-primary/5 text-primary" : "text-muted-foreground"
                                )}
                            >
                                {item.icon && <item.icon className={cn("w-5 h-5 shrink-0", activeView === item.id ? "text-primary" : "group-hover:text-foreground")} />}
                                {isSidebarOpen && <span className="ml-3 transition-opacity duration-300">{item.label}</span>}
                                {isSidebarOpen && item.id === "messages" && unreadCount > 0 && (
                                    <Badge className="ml-auto bg-primary text-primary-foreground border-none text-[10px] font-black rounded-full px-2 py-0">
                                        {unreadCount}
                                    </Badge>
                                )}
                                {!isSidebarOpen && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-md border">
                                        {item.label}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* User Section in Sidebar */}
                    <div className="p-4 border-t bg-muted/20">
                        <div className={cn("flex items-center gap-3", !isSidebarOpen && "justify-center")}>
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 shadow-sm border border-primary/20">
                                {getRoleName().charAt(0)}
                            </div>
                            {isSidebarOpen && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate leading-none mb-1">{getRoleName()}</p>
                                    <p className="text-[10px] text-muted-foreground truncate uppercase tracking-wider font-medium">Verified Account</p>
                                </div>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            className={cn("w-full mt-4 justify-start text-destructive hover:bg-destructive/10 hover:text-destructive gap-3 rounded-xl", !isSidebarOpen && "px-0 justify-center")}
                            onClick={onLogout}
                        >
                            <LogOut size={18} />
                            {isSidebarOpen && <span>Logout</span>}
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-6 bg-background/70 backdrop-blur-md border-b sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="lg:flex"
                        >
                            <Menu size={20} />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground" onClick={() => setActiveView("messages")}>
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
                            )}
                        </Button>
                        <Separator orientation="vertical" className="h-6 mx-2" />

                        <div className="flex items-center gap-3 pl-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-medium">{getRoleName()} Account</p>
                                <p className="text-[10px] text-muted-foreground font-mono">ID: 00{role}432</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-primary/60 flex items-center justify-center text-white ring-2 ring-background shadow-sm">
                                {User && <User size={16} />}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Main Section */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-10 scroll-smooth">
                    <div className="max-w-7xl mx-auto space-y-8 pb-10">
                        {activeView === "dash" && children}
                        {activeView === "messages" && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <Messages />
                            </div>
                        )}
                        {activeView === "courses" && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h1 className="text-3xl font-black mb-6 italic">All <span className="text-primary not-italic">Courses</span></h1>
                                <Courses />
                            </div>
                        )}
                        {activeView === "academic" && <Academic />}
                        {activeView === "settings" && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
                                <div className="p-10 bg-background rounded-[2.5rem] border shadow-xl space-y-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary text-3xl font-black border border-primary/20 shadow-inner">
                                            {getRoleName().charAt(0)}
                                        </div>
                                        <div className="space-y-1">
                                            <h2 className="text-3xl font-black">{getRoleName()} Account</h2>
                                            <p className="text-muted-foreground font-medium italic opacity-70">Manage your profile and account settings from here.</p>
                                        </div>
                                    </div>
                                    <div className="grid gap-6">
                                        <div className="p-6 bg-muted/30 rounded-2xl border space-y-4">
                                            <h3 className="font-bold flex items-center gap-2"><Settings size={18} className="text-primary" /> Language Settings</h3>
                                            <p className="text-sm text-muted-foreground">You can change the system language (currently English only).</p>
                                            <Button variant="outline" disabled className="rounded-xl w-full h-11 font-bold">English (Default)</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
