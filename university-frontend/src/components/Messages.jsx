import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInbox, getSent, getMessage, sendMessage, deleteMessage, getUnreadCount, getRecipients } from "../api/messages";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Mail,
  Send,
  Inbox,
  Trash2,
  Search,
  ArrowLeft,
  Loader2,
  MailOpen,
  PenSquare,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  MessageSquare,
} from "lucide-react";

export default function Messages() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("inbox"); // inbox | sent | detail
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [previousTab, setPreviousTab] = useState("inbox");
  const [composeOpen, setComposeOpen] = useState(false);

  // Search & pagination state
  const [inboxSearch, setInboxSearch] = useState("");
  const [sentSearch, setSentSearch] = useState("");
  const [inboxPage, setInboxPage] = useState(1);
  const [sentPage, setSentPage] = useState(1);
  const [debouncedInboxSearch, setDebouncedInboxSearch] = useState("");
  const [debouncedSentSearch, setDebouncedSentSearch] = useState("");

  // Compose form state
  const [recipientSearch, setRecipientSearch] = useState("");
  const [debouncedRecipientSearch, setDebouncedRecipientSearch] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false);

  const roleId = parseInt(localStorage.getItem("role_id"));
  const studentTemplates = [
    "Hello Professor, I would like to ask a question regarding the upcoming exam.",
    "I have submitted my assignment. Could you please confirm that you received it?",
    "Could you please clarify today's lecture topic? Thank you.",
    "I would like to schedule a meeting during your office hours."
  ];
  const instructorTemplates = [
    "Your assignment has been received successfully.",
    "Please review the feedback provided before the next class.",
    "Your exam grade has been published. Please check the Academic section.",
    "Please contact me if you have any questions regarding the course."
  ];
  const quickTemplates = roleId === 3 ? studentTemplates : instructorTemplates;

  const handleTemplateClick = (templateText) => {
    setBody((prev) => prev ? `${prev}\n\n${templateText}` : templateText);
  };

  // Debounce search inputs
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedInboxSearch(inboxSearch), 400);
    return () => clearTimeout(timer);
  }, [inboxSearch]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSentSearch(sentSearch), 400);
    return () => clearTimeout(timer);
  }, [sentSearch]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedRecipientSearch(recipientSearch), 300);
    return () => clearTimeout(timer);
  }, [recipientSearch]);

  // Reset page when search changes
  useEffect(() => { setInboxPage(1); }, [debouncedInboxSearch]);
  useEffect(() => { setSentPage(1); }, [debouncedSentSearch]);

  // ── Queries ──────────────────────────────────────────────

  const { data: inboxData, isLoading: inboxLoading, isError: inboxError } = useQuery({
    queryKey: ["messages", "inbox", inboxPage, debouncedInboxSearch],
    queryFn: () => getInbox(inboxPage, debouncedInboxSearch),
  });

  const { data: sentData, isLoading: sentLoading, isError: sentError } = useQuery({
    queryKey: ["messages", "sent", sentPage, debouncedSentSearch],
    queryFn: () => getSent(sentPage, debouncedSentSearch),
    enabled: activeTab === "sent" || activeTab === "detail",
  });

  const { data: messageDetail, isLoading: detailLoading } = useQuery({
    queryKey: ["messages", "detail", selectedMessageId],
    queryFn: () => getMessage(selectedMessageId),
    enabled: !!selectedMessageId && activeTab === "detail",
  });

  const { data: recipientsData, isLoading: recipientsLoading } = useQuery({
    queryKey: ["messages", "recipients", debouncedRecipientSearch],
    queryFn: () => getRecipients(debouncedRecipientSearch),
    enabled: composeOpen,
  });

  // ── Mutations ──────────────────────────────────────────────

  const sendMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      toast.success("Message sent successfully!");
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      resetComposeForm();
      setComposeOpen(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to send message.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMessage,
    onSuccess: () => {
      toast.success("Message deleted.");
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      if (activeTab === "detail") {
        setActiveTab(previousTab);
        setSelectedMessageId(null);
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Failed to delete message.");
    },
  });

  // ── Helpers ──────────────────────────────────────────────

  const resetComposeForm = () => {
    setSelectedRecipient(null);
    setRecipientSearch("");
    setSubject("");
    setBody("");
    setShowRecipientDropdown(false);
  };

  const openMessage = (id) => {
    setPreviousTab(activeTab);
    setSelectedMessageId(id);
    setActiveTab("detail");
    // Invalidate unread count so it refreshes after marking as read
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["messages", "unreadCount"] });
      queryClient.invalidateQueries({ queryKey: ["messages", "inbox"] });
    }, 500);
  };

  const handleSend = () => {
    if (!selectedRecipient) {
      toast.error("Please select a recipient.");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please enter a subject.");
      return;
    }
    if (!body.trim()) {
      toast.error("Please enter a message.");
      return;
    }
    sendMutation.mutate({
      receiver_id: selectedRecipient.id,
      subject: subject.trim(),
      body: body.trim(),
    });
  };

  const handleSelectRecipient = (user) => {
    setSelectedRecipient(user);
    setRecipientSearch(user.name);
    setShowRecipientDropdown(false);
  };

  const truncateText = (text, maxLength = 60) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const oneDay = 86400000;

    if (diff < oneDay) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    if (diff < oneDay * 7) {
      return date.toLocaleDateString([], { weekday: "short", hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
  };

  const getRoleBadge = (roleId) => {
    if (roleId === 2) return <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 text-[9px] font-bold px-1.5 py-0">Instructor</Badge>;
    if (roleId === 3) return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] font-bold px-1.5 py-0">Student</Badge>;
    if (roleId === 1) return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-[9px] font-bold px-1.5 py-0">Admin</Badge>;
    return null;
  };

  // ── Render: Loading Skeleton ────────────────────────────

  const renderSkeleton = () => (
    <div className="space-y-3 p-4 animate-pulse">
      {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-muted rounded-2xl w-full" />)}
    </div>
  );

  // ── Render: Error State ─────────────────────────────────

  const renderError = () => (
    <div className="p-12 text-center bg-destructive/5 rounded-[2rem] border border-dashed border-destructive/20">
      <AlertCircle className="w-12 h-12 text-destructive/30 mx-auto mb-4" />
      <p className="text-destructive font-black tracking-tight text-lg">Failed to load messages.</p>
      <p className="text-sm text-destructive/60 font-medium">Please check the API connection.</p>
    </div>
  );

  // ── Render: Empty State ─────────────────────────────────

  const renderEmpty = (type) => (
    <div className="text-center py-20 bg-muted/20 rounded-[2rem] border border-dashed border-border/50">
      {type === "inbox" ? (
        <Inbox className="w-16 h-16 mx-auto opacity-10 mb-4" />
      ) : (
        <Send className="w-16 h-16 mx-auto opacity-10 mb-4" />
      )}
      <p className="text-lg font-black uppercase tracking-widest text-muted-foreground/50">
        {type === "inbox" ? "No messages yet." : "No sent messages."}
      </p>
      <p className="text-sm text-muted-foreground/40 mt-2 font-medium">
        {type === "inbox"
          ? "Your inbox is empty. Messages you receive will appear here."
          : "Messages you send will appear here."}
      </p>
    </div>
  );

  // ── Render: Pagination ──────────────────────────────────

  const renderPagination = (data, page, setPage) => {
    if (!data || data.last_page <= 1) return null;
    return (
      <div className="flex items-center justify-between pt-4 px-2">
        <p className="text-xs text-muted-foreground font-medium">
          Page {data.current_page} of {data.last_page} • {data.total} total
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl h-8 px-3 font-bold text-xs"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft size={14} className="mr-1" /> Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl h-8 px-3 font-bold text-xs"
            disabled={page >= data.last_page}
            onClick={() => setPage(page + 1)}
          >
            Next <ChevronRight size={14} className="ml-1" />
          </Button>
        </div>
      </div>
    );
  };

  // ── Render: Search Bar ──────────────────────────────────

  const renderSearchBar = (value, onChange, placeholder) => (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 rounded-xl h-10 bg-muted/30 border-border/50 focus:bg-background"
      />
    </div>
  );

  // ── Render: Inbox Table ─────────────────────────────────

  const renderInbox = () => {
    if (inboxLoading) return renderSkeleton();
    if (inboxError) return renderError();
    if (!inboxData?.data?.length) return renderEmpty("inbox");

    return (
      <>
        <div className="rounded-[1.5rem] border bg-background/50 overflow-hidden shadow-inner">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="font-black text-[10px] uppercase tracking-widest py-4 pl-6 w-8"></TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest py-4">From</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest py-4">Subject</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest py-4 text-right pr-6">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inboxData.data.map((msg) => (
                <TableRow
                  key={msg.id}
                  className={`cursor-pointer transition-colors border-b last:border-0 group ${!msg.is_read ? "bg-primary/[0.03] hover:bg-primary/[0.06]" : "hover:bg-primary/[0.02]"}`}
                  onClick={() => openMessage(msg.id)}
                >
                  <TableCell className="pl-6 py-4">
                    {!msg.is_read ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-md shadow-primary/30 animate-pulse" />
                    ) : (
                      <MailOpen size={14} className="text-muted-foreground/30" />
                    )}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                        <User size={12} className="text-primary" />
                      </div>
                      <span className={`text-sm tracking-tight ${!msg.is_read ? "font-black text-foreground" : "font-medium text-foreground/70"}`}>
                        {msg.sender?.name || "Unknown"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${!msg.is_read ? "font-bold text-foreground" : "font-medium text-foreground/70"}`}>
                        {truncateText(msg.subject, 40)}
                      </span>
                      <span className="text-xs text-muted-foreground/50 hidden md:inline">
                        — {truncateText(msg.body, 30)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6 py-4">
                    <span className="text-[11px] font-bold text-muted-foreground bg-muted/50 px-3 py-1 rounded-full flex items-center gap-1.5 justify-end w-fit ml-auto group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                      <Clock size={12} />
                      {formatDate(msg.created_at)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {renderPagination(inboxData, inboxPage, setInboxPage)}
      </>
    );
  };

  // ── Render: Sent Table ──────────────────────────────────

  const renderSent = () => {
    if (sentLoading) return renderSkeleton();
    if (sentError) return renderError();
    if (!sentData?.data?.length) return renderEmpty("sent");

    return (
      <>
        <div className="rounded-[1.5rem] border bg-background/50 overflow-hidden shadow-inner">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="font-black text-[10px] uppercase tracking-widest py-4 pl-6">To</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest py-4">Subject</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest py-4 text-right pr-6">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sentData.data.map((msg) => (
                <TableRow
                  key={msg.id}
                  className="cursor-pointer hover:bg-primary/[0.02] transition-colors border-b last:border-0 group"
                  onClick={() => openMessage(msg.id)}
                >
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                        <User size={12} className="text-emerald-600" />
                      </div>
                      <span className="text-sm font-medium text-foreground/70 tracking-tight">
                        {msg.receiver?.name || "Unknown"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="text-sm font-medium text-foreground/70">
                      {truncateText(msg.subject, 50)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-6 py-4">
                    <span className="text-[11px] font-bold text-muted-foreground bg-muted/50 px-3 py-1 rounded-full flex items-center gap-1.5 justify-end w-fit ml-auto group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                      <Clock size={12} />
                      {formatDate(msg.created_at)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {renderPagination(sentData, sentPage, setSentPage)}
      </>
    );
  };

  // ── Render: Message Detail ──────────────────────────────

  const renderDetail = () => {
    if (detailLoading) return renderSkeleton();
    if (!messageDetail) return null;

    const msg = messageDetail;
    const userId = parseInt(localStorage.getItem("user_id"));

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Back + Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="rounded-xl gap-2 font-bold text-muted-foreground hover:text-foreground"
            onClick={() => {
              setActiveTab(previousTab);
              setSelectedMessageId(null);
            }}
          >
            <ArrowLeft size={16} /> Back to {previousTab === "inbox" ? "Inbox" : "Sent"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive font-bold"
            onClick={() => deleteMutation.mutate(msg.id)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete
          </Button>
        </div>

        {/* Message Card */}
        <Card className="border-none shadow-2xl bg-background/60 backdrop-blur-xl rounded-[2rem] overflow-hidden">
          <CardHeader className="p-8 pb-6 border-b bg-muted/10">
            <CardTitle className="text-2xl font-black tracking-tight">{msg.subject}</CardTitle>
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <User size={14} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">From</p>
                  <p className="text-sm font-bold">{msg.sender?.name || "Unknown"}</p>
                </div>
              </div>
              <Separator orientation="vertical" className="h-8 hidden sm:block" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <User size={14} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">To</p>
                  <p className="text-sm font-bold">{msg.receiver?.name || "Unknown"}</p>
                </div>
              </div>
              <Separator orientation="vertical" className="h-8 hidden sm:block" />
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Date</p>
                <p className="text-sm font-medium text-muted-foreground">
                  {new Date(msg.created_at).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="prose prose-sm max-w-none text-foreground/80 leading-relaxed whitespace-pre-wrap font-medium">
              {msg.body}
            </div>
          </CardContent>
        </Card>

        {/* Reply button if viewing an inbox message */}
        {msg.receiver_id === userId && (
          <Button
            className="rounded-xl gap-2 font-bold h-11 shadow-lg shadow-primary/10"
            onClick={() => {
              setSelectedRecipient(msg.sender);
              setRecipientSearch(msg.sender?.name || "");
              setSubject(msg.subject.startsWith("Re: ") ? msg.subject : `Re: ${msg.subject}`);
              setBody("");
              setComposeOpen(true);
            }}
          >
            <Send size={16} /> Reply
          </Button>
        )}
      </div>
    );
  };

  // ── MAIN RENDER ─────────────────────────────────────────

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <MessageSquare size={22} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight italic">
              Message <span className="text-primary not-italic">Center</span>
            </h1>
            <p className="text-sm text-muted-foreground font-medium">Communicate with your academic contacts.</p>
          </div>
        </div>

        <Button
          className="rounded-xl gap-2 font-bold h-11 shadow-lg shadow-primary/10"
          onClick={() => {
            resetComposeForm();
            setComposeOpen(true);
          }}
        >
          <PenSquare size={16} /> Compose
        </Button>
      </div>

      {/* Tab Navigation (only show when not viewing detail) */}
      {activeTab !== "detail" && (
        <div className="flex gap-2 bg-muted/50 p-1.5 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("inbox")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
              activeTab === "inbox"
                ? "bg-background shadow-md text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
          >
            <Inbox size={16} /> Inbox
            {inboxData?.total > 0 && (
              <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black rounded-full px-2 py-0 ml-1">
                {inboxData.total}
              </Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
              activeTab === "sent"
                ? "bg-background shadow-md text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
          >
            <Send size={16} /> Sent
          </button>
        </div>
      )}

      {/* Search Bar (only show when not viewing detail) */}
      {activeTab !== "detail" && (
        <div className="max-w-sm">
          {activeTab === "inbox"
            ? renderSearchBar(inboxSearch, setInboxSearch, "Search inbox by subject, sender, or content...")
            : renderSearchBar(sentSearch, setSentSearch, "Search sent by subject, receiver, or content...")}
        </div>
      )}

      {/* Content */}
      <Card className="border-none shadow-2xl bg-background/80 backdrop-blur-xl overflow-hidden ring-1 ring-border/50 rounded-[2rem]">
        <CardContent className="p-6 md:p-8">
          {activeTab === "inbox" && renderInbox()}
          {activeTab === "sent" && renderSent()}
          {activeTab === "detail" && renderDetail()}
        </CardContent>
      </Card>

      {/* ── Compose Dialog ──────────────────────────────── */}
      <Dialog open={composeOpen} onOpenChange={(open) => { setComposeOpen(open); if (!open) resetComposeForm(); }}>
        <DialogContent className="max-w-2xl p-0 border-none shadow-2xl overflow-hidden rounded-3xl">
          <div className="bg-primary p-6 text-primary-foreground">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black flex items-center gap-3">
                <PenSquare size={22} /> New Message
              </DialogTitle>
              <DialogDescription className="text-primary-foreground/70">
                Compose and send a message to your academic contacts.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-5">
            {/* Recipient */}
            <div className="space-y-2 relative">
              <Label className="font-bold text-xs uppercase tracking-wider">Recipient</Label>
              {selectedRecipient ? (
                <div className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-xl border">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <User size={12} className="text-primary" />
                  </div>
                  <span className="text-sm font-bold flex-1">{selectedRecipient.name}</span>
                  {getRoleBadge(selectedRecipient.role_id)}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => {
                      setSelectedRecipient(null);
                      setRecipientSearch("");
                    }}
                  >
                    ×
                  </Button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email..."
                      value={recipientSearch}
                      onChange={(e) => {
                        setRecipientSearch(e.target.value);
                        setShowRecipientDropdown(true);
                      }}
                      onFocus={() => setShowRecipientDropdown(true)}
                      className="pl-10 rounded-xl"
                    />
                  </div>
                  {showRecipientDropdown && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-background border rounded-xl shadow-xl max-h-48 overflow-y-auto">
                      {recipientsLoading ? (
                        <div className="p-4 text-center">
                          <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                        </div>
                      ) : recipientsData?.length > 0 ? (
                        recipientsData.map((user) => (
                          <button
                            key={user.id}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                            onClick={() => handleSelectRecipient(user)}
                          >
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                              <User size={12} className="text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold truncate">{user.name}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                            </div>
                            {getRoleBadge(user.role_id)}
                          </button>
                        ))
                      ) : (
                        <p className="p-4 text-sm text-muted-foreground text-center font-medium">No recipients found.</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-wider">Subject</Label>
              <Input
                placeholder="Enter subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="rounded-xl"
                maxLength={255}
              />
            </div>

            {/* Body */}
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-wider">Message</Label>
              <textarea
                placeholder="Write your message here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                maxLength={5000}
                className="flex w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
              <p className="text-[10px] text-muted-foreground text-right font-medium">
                {body.length}/5000
              </p>
            </div>

            {/* Quick Templates */}
            <div className="space-y-3 pt-2">
              <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Quick Templates</Label>
              <div className="flex flex-wrap gap-2">
                {quickTemplates.map((template, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleTemplateClick(template)}
                    className="text-left text-xs bg-muted/50 hover:bg-primary/10 hover:text-primary text-muted-foreground font-medium px-3 py-2 rounded-xl border border-border/50 hover:border-primary/30 transition-all active:scale-95"
                  >
                    {template.length > 40 ? template.substring(0, 40) + '...' : template}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/20 border-t flex justify-end gap-3">
            <Button
              variant="ghost"
              className="rounded-xl font-bold"
              onClick={() => { setComposeOpen(false); resetComposeForm(); }}
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl gap-2 font-bold shadow-lg shadow-primary/10"
              onClick={handleSend}
              disabled={sendMutation.isPending}
            >
              {sendMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Send Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
