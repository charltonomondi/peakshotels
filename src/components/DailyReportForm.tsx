import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { REPORT_TEMPLATES, ADMIN_ROLES, type DepartmentTemplate } from "@/lib/reportTemplates";
import type { StaffMember } from "@/lib/staffAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Send, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  staff: StaffMember;
}

interface ReportRow {
  id?: string;
  entries: Record<string, string>;
  submitted: boolean;
  report_date: string;
}

export default function DailyReportForm({ staff }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const isAdmin = ADMIN_ROLES.includes(staff.role);

  // which template to show (admins can switch dept)
  const [selectedRole, setSelectedRole] = useState<string>(
    isAdmin ? REPORT_TEMPLATES[0].role : staff.role
  );
  const [reportDate, setReportDate] = useState(today);
  const [entries, setEntries] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reportId, setReportId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [expandedHint, setExpandedHint] = useState<string | null>(null);

  // Admin: list of all submitted reports for the selected date
  const [allReports, setAllReports] = useState<{ department: string; staff_name: string; submitted: boolean; entries: Record<string, string>; id: string }[]>([]);
  const [viewingReport, setViewingReport] = useState<string | null>(null);

  const template: DepartmentTemplate | undefined = REPORT_TEMPLATES.find(t => t.role === selectedRole);

  const loadReport = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("daily_reports")
      .select("*")
      .eq("staff_id", staff.id)
      .eq("report_date", reportDate)
      .eq("department", selectedRole)
      .maybeSingle();

    if (data) {
      setEntries(data.entries ?? {});
      setSubmitted(data.submitted ?? false);
      setReportId(data.id);
    } else {
      setEntries({});
      setSubmitted(false);
      setReportId(undefined);
    }
    setLoading(false);
  }, [staff.id, reportDate, selectedRole]);

  const loadAllReports = useCallback(async () => {
    if (!isAdmin) return;
    const { data } = await supabase
      .from("daily_reports")
      .select("id, department, submitted, entries, staff_id")
      .eq("report_date", reportDate);
    if (data) {
      // fetch staff names
      const staffIds = [...new Set(data.map(r => r.staff_id))];
      const { data: members } = await supabase
        .from("staff_members")
        .select("id, full_name")
        .in("id", staffIds);
      const nameMap: Record<string, string> = {};
      (members ?? []).forEach(m => { nameMap[m.id] = m.full_name; });
      setAllReports(data.map(r => ({
        ...r,
        staff_name: nameMap[r.staff_id] ?? "Unknown",
      })));
    }
  }, [isAdmin, reportDate]);

  useEffect(() => { loadReport(); }, [loadReport]);
  useEffect(() => { loadAllReports(); }, [loadAllReports]);

  function setField(fieldName: string, value: string) {
    setEntries(prev => ({ ...prev, [fieldName]: value }));
  }

  async function handleSave() {
    if (!template) return;
    setSaving(true);
    const payload = {
      staff_id: staff.id,
      department: selectedRole,
      report_date: reportDate,
      entries,
      submitted: false,
    };
    if (reportId) {
      await supabase.from("daily_reports").update({ entries, updated_at: new Date().toISOString() }).eq("id", reportId);
    } else {
      const { data } = await supabase.from("daily_reports").insert(payload).select().single();
      if (data) setReportId(data.id);
    }
    setSaving(false);
  }

  async function handleSubmit() {
    if (!template) return;
    setSubmitting(true);
    const payload = {
      staff_id: staff.id,
      department: selectedRole,
      report_date: reportDate,
      entries,
      submitted: true,
      submitted_at: new Date().toISOString(),
    };
    if (reportId) {
      await supabase.from("daily_reports").update({
        entries, submitted: true, submitted_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      }).eq("id", reportId);
    } else {
      const { data } = await supabase.from("daily_reports").insert(payload).select().single();
      if (data) setReportId(data.id);
    }
    setSubmitted(true);
    setSubmitting(false);
    if (isAdmin) loadAllReports();
  }

  if (!template) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        No daily report template is configured for your role ({staff.role}).<br />
        Please contact your administrator.
      </div>
    );
  }

  // Admin overview panel
  if (isAdmin && !viewingReport) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-muted-foreground">Date:</label>
          <input type="date" value={reportDate} max={today}
            onChange={e => setReportDate(e.target.value)}
            className="text-sm px-3 py-1.5 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="grid gap-3">
          {REPORT_TEMPLATES.map(t => {
            const report = allReports.find(r => r.department === t.role);
            return (
              <div key={t.role} className="flex items-center justify-between p-3 border border-border rounded-xl bg-card">
                <div>
                  <p className="text-sm font-medium">{t.label}</p>
                  {report && <p className="text-xs text-muted-foreground">by {report.staff_name}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {report ? (
                    <Badge className={report.submitted ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                      {report.submitted ? "Submitted" : "Draft"}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">Not submitted</Badge>
                  )}
                  {report && (
                    <Button size="sm" variant="outline" onClick={() => setViewingReport(report.id)}>
                      View
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => {
                    setSelectedRole(t.role);
                    setViewingReport("own");
                  }}>
                    Fill in
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Admin viewing a submitted report (read-only)
  if (isAdmin && viewingReport && viewingReport !== "own") {
    const report = allReports.find(r => r.id === viewingReport);
    const reportTemplate = REPORT_TEMPLATES.find(t => t.role === report?.department);
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setViewingReport(null)}>← Back</Button>
          <h3 className="font-semibold">{reportTemplate?.label} — {reportDate}</h3>
          <Badge className="bg-green-100 text-green-700">Submitted</Badge>
        </div>
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary">
                <th className="text-left px-4 py-2 w-8 font-medium text-muted-foreground">Ser</th>
                <th className="text-left px-4 py-2 w-1/3 font-medium text-muted-foreground">Reporting Field</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Details / Figures / Comments</th>
              </tr>
            </thead>
            <tbody>
              {(reportTemplate?.fields ?? []).map((f, i) => (
                <tr key={f.ser} className={i % 2 === 0 ? "bg-background" : "bg-secondary/40"}>
                  <td className="px-4 py-3 text-muted-foreground text-xs align-top">{f.ser}</td>
                  <td className="px-4 py-3 font-medium align-top">{f.field}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-pre-wrap align-top">
                    {report?.entries[f.field] || <span className="italic text-xs">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Normal report form (staff or admin filling in)
  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="flex flex-wrap items-center gap-3">
        {isAdmin && (
          <Button variant="outline" size="sm" onClick={() => { setViewingReport(null); }}>← Overview</Button>
        )}
        {isAdmin && (
          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
            className="text-sm px-3 py-1.5 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {REPORT_TEMPLATES.map(t => (
              <option key={t.role} value={t.role}>{t.label}</option>
            ))}
          </select>
        )}
        <input type="date" value={reportDate} max={today}
          onChange={e => { setReportDate(e.target.value); }}
          className="text-sm px-3 py-1.5 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-accent"
        />
        {submitted && (
          <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Submitted
          </Badge>
        )}
      </div>

      {/* Template title */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-base">{template.label} — Daily Report</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Peaks Hotel Nanyuki · {reportDate}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Report table */}
          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary">
                  <th className="text-left px-4 py-2.5 w-8 font-medium text-muted-foreground text-xs">Ser</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs w-2/5">Reporting Field</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Details / Figures / Comments</th>
                </tr>
              </thead>
              <tbody>
                {template.fields.map((f, i) => (
                  <tr key={f.ser} className={i % 2 === 0 ? "bg-background" : "bg-secondary/30"}>
                    <td className="px-4 py-3 text-muted-foreground text-xs align-top">{f.ser}</td>
                    <td className="px-4 py-3 align-top">
                      <p className="font-medium text-sm leading-snug">{f.field}</p>
                      {f.hint && (
                        <div>
                          <button
                            className="text-xs text-accent/70 hover:text-accent flex items-center gap-1 mt-1"
                            onClick={() => setExpandedHint(expandedHint === f.ser ? null : f.ser)}
                          >
                            {expandedHint === f.ser ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            guidance
                          </button>
                          {expandedHint === f.ser && (
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-xs">{f.hint}</p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <textarea
                        disabled={submitted}
                        value={entries[f.field] ?? ""}
                        onChange={e => setField(f.field, e.target.value)}
                        placeholder={submitted ? "—" : "Enter details…"}
                        rows={2}
                        className="w-full text-sm px-2.5 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-accent resize-y disabled:bg-secondary/40 disabled:text-muted-foreground disabled:cursor-not-allowed min-h-[56px]"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          {!submitted && (
            <div className="flex gap-3 justify-end pt-1">
              <Button variant="outline" onClick={handleSave} disabled={saving || submitting}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Draft
              </Button>
              <Button onClick={handleSubmit} disabled={saving || submitting}
                className="bg-accent hover:bg-accent/90 text-accent-foreground">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                Submit Report
              </Button>
            </div>
          )}

          {submitted && (
            <p className="text-xs text-muted-foreground text-right">
              Report submitted. Contact your manager if you need to make changes.
            </p>
          )}
        </>
      )}
    </div>
  );
}
