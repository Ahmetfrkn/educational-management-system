import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "../api/audit";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Clock, Activity, Shield, User, Database, Search } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["auditLogs"],
    queryFn: getAuditLogs,
  });

  const getActionBadge = (action) => {
    const actionLower = action?.toLowerCase() || "";
    if (actionLower.includes("create") && !actionLower.includes("grade"))
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold px-2 py-0.5">CREATE</Badge>;
    if (actionLower.includes("delete") || actionLower.includes("unenroll"))
      return <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] font-bold px-2 py-0.5">DELETE</Badge>;
    if (actionLower.includes("update_grade"))
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] font-bold px-2 py-0.5">GRADE UPDATE</Badge>;
    if (actionLower.includes("update"))
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] font-bold px-2 py-0.5">UPDATE</Badge>;
    
    return <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 uppercase">{action}</Badge>;
  };

  const filteredData = data?.filter((log) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    // Check basic fields
    if (log.action_type?.toLowerCase().includes(query)) return true;
    if (log.actor?.name?.toLowerCase().includes(query)) return true;
    if (log.entity_type?.toLowerCase().includes(query)) return true;
    
    // Check JSON fields for grades
    if (log.action_type === 'UPDATE_GRADE') {
      try {
        const before = JSON.parse(log.before_json || '{}');
        const after = JSON.parse(log.after_json || '{}');
        
        if (after.student_name?.toLowerCase().includes(query)) return true;
        if (after.course_name?.toLowerCase().includes(query)) return true;
        if (String(after.final_grade).includes(query)) return true;
        if (String(before.final_grade).includes(query)) return true;
      } catch (e) {
        // Ignore parse errors in search
      }
    }
    return false;
  });

  if (isLoading) {
    return (
      <div className="space-y-4 p-4 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-14 bg-muted rounded-2xl w-full" />)}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-12 text-center bg-destructive/5 rounded-[2rem] border border-dashed border-destructive/20 m-4">
        <Shield className="w-12 h-12 text-destructive/30 mx-auto mb-4" />
        <p className="text-destructive font-black tracking-tight text-lg">Failed to load logs.</p>
        <p className="text-sm text-destructive/60 font-medium">Please check the API connection.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mx-1">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search logs by action, user, student, course, or grade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl h-10 bg-muted/30 border-border/50 focus:bg-background transition-colors"
          />
        </div>
      </div>

      {(!filteredData || filteredData.length === 0) ? (
        <div className="text-center py-20 bg-muted/20 m-4 rounded-[2rem] border border-dashed border-border/50">
          <Activity className="w-16 h-16 mx-auto opacity-10 mb-4" />
          <p className="text-lg font-black uppercase tracking-widest text-muted-foreground/50">
            {searchQuery ? "No matching logs found" : "No records yet."}
          </p>
        </div>
      ) : (
        <div className="rounded-[1.5rem] border bg-background/50 overflow-hidden shadow-inner">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="font-black text-[10px] uppercase tracking-widest py-4 pl-6">Action Type</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest py-4">Details / Entity</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest py-4">Actor</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest py-4 text-right pr-6">Date</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredData.map((log) => (
                <TableRow key={log.audit_id} className="hover:bg-primary/[0.02] transition-colors border-b last:border-0 group">
                  <TableCell className="py-5 pl-6 w-32">
                    {getActionBadge(log.action_type)}
                  </TableCell>
                  <TableCell>
                    {log.action_type === 'UPDATE_GRADE' ? (() => {
                      try {
                        const before = JSON.parse(log.before_json || '{}');
                        const after = JSON.parse(log.after_json || '{}');
                        const oldGrade = before.final_grade;
                        const newGrade = after.final_grade;
                        const studentName = after.student_name || 'Unknown Student';
                        const courseName = after.course_name || 'Unknown Course';
                        
                        return (
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-bold text-foreground">{studentName}</span>
                              <span className="text-muted-foreground text-xs">•</span>
                              <span className="font-medium text-muted-foreground truncate max-w-[200px]" title={courseName}>{courseName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {oldGrade === null ? (
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold px-2 py-0">
                                  Created: {newGrade}
                                </Badge>
                              ) : (
                                <div className="flex items-center gap-2 bg-muted/50 rounded-md px-2 py-1 w-fit border border-border/50">
                                  <span className="text-xs font-bold text-muted-foreground line-through decoration-destructive/50">{oldGrade}</span>
                                  <span className="text-[10px] text-muted-foreground">→</span>
                                  <span className="text-xs font-black text-primary">{newGrade}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      } catch (e) {
                        return <span className="text-sm font-bold text-muted-foreground">Invalid Grade Data</span>;
                      }
                    })() : (
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-muted rounded-lg text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <Database size={14} />
                        </div>
                        <span className="text-sm font-bold tracking-tight text-foreground/80">
                          {log.entity_type}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden shrink-0">
                        {log.actor?.profile_image ? (
                          <img src={log.actor.profile_image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User size={12} className="text-primary" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-foreground whitespace-nowrap">
                        {log.actor?.name || "System"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[11px] font-black text-foreground bg-muted/50 px-3 py-1 rounded-full flex items-center gap-1.5 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                        <Clock size={12} />
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-tighter">
                        {new Date(log.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
