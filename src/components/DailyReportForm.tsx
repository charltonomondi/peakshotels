import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { REPORT_TEMPLATES, ADMIN_ROLES, REVENUE_CONFIG, COMPLIMENTARY_ROLES, EXPENSES_ROLE, EXPENSE_DEPARTMENTS, type DepartmentTemplate } from "@/lib/reportTemplates";
import type { StaffMember } from "@/lib/staffAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Send, CheckCircle2, ChevronDown, ChevronUp, CalendarDays } from "lucide-react";

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

  // CEO action for this dept's report
  const [ceoAction, setCeoAction] = useState<{
    action_type: string; comment: string | null;
    scheduled_date: string | null; scheduled_time: string | null;
    signed_off: boolean; actioned_by_name: string | null; created_at: string;
  } | null>(null);

  // Admin: list of all submitted reports for the selected date
  const [allReports, setAllReports] = useState<{ department: string; staff_name: string; submitted: boolean; entries: Record<string, string>; id: string }[]>([]);
  const [viewingReport, setViewingReport] = useState<string | null>(null);

  const template: DepartmentTemplate | undefined = REPORT_TEMPLATES.find(t => t.role === selectedRole);

  const loadReport = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("daily_reports")
      .select("*")
      .eq("staff_id", staff.id)
      .eq("report_date", reportDate)
      .eq("department", selectedRole)
      .maybeSingle();

    if (error) console.error("loadReport error:", error.message, error.details);

    if (data) {
      setEntries(data.entries ?? {});
      setSubmitted(data.submitted === true || data.submitted === 1 || data.submitted === "true");
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
        // normalise submitted
        submitted: r.submitted === true || r.submitted === 1,
        staff_name: nameMap[r.staff_id] ?? "Unknown",
      })));
    } else {
      setAllReports([]);
    }
  }, [isAdmin, reportDate]);

  useEffect(() => { loadReport(); }, [loadReport]);
  useEffect(() => { loadAllReports(); }, [loadAllReports]);

  // Load CEO action for this dept's report
  useEffect(() => {
    if (!reportId || !submitted) { setCeoAction(null); return; }
    supabase
      .from("report_actions")
      .select("action_type, comment, scheduled_date, scheduled_time, signed_off, actioned_by_name, created_at")
      .eq("report_id", reportId)
      .maybeSingle()
      .then(({ data }) => setCeoAction(data ?? null));
  }, [reportId, submitted]);

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
      const { error } = await supabase
        .from("daily_reports")
        .update({ entries, updated_at: new Date().toISOString() })
        .eq("id", reportId);
      if (error) { alert("Save failed: " + error.message); setSaving(false); return; }
    } else {
      const { data, error } = await supabase.from("daily_reports").insert(payload).select().single();
      if (error) { alert("Save failed: " + error.message); setSaving(false); return; }
      if (data) setReportId(data.id);
    }
    setSaving(false);
  }

  async function handleSubmit() {
    if (!template) return;
    setSubmitting(true);
    const now = new Date().toISOString();

    if (reportId) {
      // update existing draft → submitted
      const { error } = await supabase
        .from("daily_reports")
        .update({ entries, submitted: true, submitted_at: now, updated_at: now })
        .eq("id", reportId);
      if (error) { alert("Submit failed: " + error.message); setSubmitting(false); return; }
    } else {
      // insert directly as submitted
      const { data, error } = await supabase
        .from("daily_reports")
        .insert({
          staff_id: staff.id,
          department: selectedRole,
          report_date: reportDate,
          entries,
          submitted: true,
          submitted_at: now,
        })
        .select()
        .single();
      if (error) { alert("Submit failed: " + error.message); setSubmitting(false); return; }
      if (data) setReportId(data.id);
    }

    // Re-fetch from DB to confirm actual saved state
    await loadReport();
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
          <span className="text-xs text-muted-foreground">
            {allReports.filter(r => r.submitted).length} / {REPORT_TEMPLATES.length} submitted
          </span>
        </div>

        <div className="grid gap-3">
          {REPORT_TEMPLATES.map(t => {
            // pick the submitted one first, fall back to draft
            const submitted = allReports.find(r => r.department === t.role && r.submitted);
            const draft = allReports.find(r => r.department === t.role && !r.submitted);
            const report = submitted ?? draft;
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

  // Admin viewing a report (read-only)
  if (isAdmin && viewingReport && viewingReport !== "own") {
    const report = allReports.find(r => r.id === viewingReport);
    const reportTemplate = REPORT_TEMPLATES.find(t => t.role === report?.department);
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setViewingReport(null)}>← Back</Button>
          <h3 className="font-semibold">{reportTemplate?.label} — {reportDate}</h3>
          <Badge className={report?.submitted ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
            {report?.submitted ? "Submitted" : "Draft"}
          </Badge>
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
        {/* Financials */}
        {(() => {
          const revenueFields = REVENUE_CONFIG[report?.department ?? ""];
          const hasRevSubs = revenueFields?.some(f => report?.entries?.[`__rev_${f}`]);
          const hasOldRev  = !!report?.entries?.["__revenue"];
          const isProc     = report?.department === "procurement";
          const hasExpSubs = isProc && EXPENSE_DEPARTMENTS.some(d => report?.entries?.[`__exp_${d}`]);
          const hasComp    = !!report?.entries?.["__complimentary"];
          if (!hasRevSubs && !hasOldRev && !hasExpSubs && !hasComp) return null;
          const fmtKes = (v: number) => `KES ${v.toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
          return (
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="bg-secondary px-4 py-2.5 border-b border-border">
                <p className="text-xs font-semibold text-foreground">Financials (KES)</p>
              </div>
              {(hasRevSubs || hasOldRev) && (
                <div className="px-4 py-3 bg-green-50/40">
                  <p className="text-xs font-semibold text-green-800 mb-2">Revenue Generated</p>
                  {hasRevSubs ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      {revenueFields.map(f => {
                        const val = parseFloat(report?.entries?.[`__rev_${f}`] ?? "0") || 0;
                        if (!val) return null;
                        return <div key={f}><p className="text-xs text-muted-foreground">{f}</p><p className="font-semibold text-green-700">{fmtKes(val)}</p></div>;
                      })}
                      {(() => {
                        const t = revenueFields.reduce((s, f) => s + (parseFloat(report?.entries?.[`__rev_${f}`] ?? "0") || 0), 0);
                        return t > 0 ? <div className="col-span-full border-t border-green-200 pt-1"><p className="text-xs font-bold text-green-900">Total: {fmtKes(t)}</p></div> : null;
                      })()}
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-green-700">{fmtKes(parseFloat(report?.entries?.["__revenue"] ?? "0"))}</p>
                  )}
                </div>
              )}
              {hasComp && (
                <div className="px-4 py-3 bg-amber-50/40 border-t border-border">
                  <p className="text-xs font-semibold text-amber-800 mb-1">Complimentary (Non-Sale)</p>
                  <p className="text-sm font-bold text-amber-700">
                    KES {parseFloat(report?.entries?.["__complimentary"] ?? "0").toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
              {hasExpSubs && (
                <div className="px-4 py-3 bg-red-50/40 border-t border-border">
                  <p className="text-xs font-semibold text-red-800 mb-2">Expenses by Department</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                    {EXPENSE_DEPARTMENTS.map(d => {
                      const val = parseFloat(report?.entries?.[`__exp_${d}`] ?? "0") || 0;
                      if (!val) return null;
                      return <div key={d}><p className="text-xs text-muted-foreground">{d}</p><p className="font-semibold text-red-700">{fmtKes(val)}</p></div>;
                    })}
                    {(() => {
                      const t = EXPENSE_DEPARTMENTS.reduce((s, d) => s + (parseFloat(report?.entries?.[`__exp_${d}`] ?? "0") || 0), 0);
                      return t > 0 ? <div className="col-span-full border-t border-red-200 pt-1"><p className="text-xs font-bold text-red-900">Total: {fmtKes(t)}</p></div> : null;
                    })()}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
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
          <div className="border border-border rounded-xl overflow-x-auto">
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

          {/* ── FINANCIALS SECTION ── role-aware ───────────────── */}
          {(() => {
            const revenueFields = REVENUE_CONFIG[selectedRole];
            const hasRevenue    = !!revenueFields;
            const hasComplimentary = COMPLIMENTARY_ROLES.includes(selectedRole);
            const isProcurement = selectedRole === EXPENSES_ROLE;

            if (!hasRevenue && !hasComplimentary && !isProcurement) return null;

            const fmt = (v: string) =>
              v ? parseFloat(v).toLocaleString("en-KE", { minimumFractionDigits: 2 }) : "";

            // Revenue sub-total
            const revTotal = hasRevenue
              ? revenueFields.reduce((s, f) => s + (parseFloat(entries[`__rev_${f}`] ?? "0") || 0), 0)
              : 0;

            return (
              <div className="border border-border rounded-xl overflow-hidden space-y-0">
                {/* ── Revenue ── */}
                {hasRevenue && (
                  <div>
                    <div className="bg-green-50 border-b border-border px-4 py-2.5 flex items-center justify-between">
                      <p className="text-xs font-semibold text-green-800">Revenue Generated (KES)</p>
                      {revTotal > 0 && (
                        <span className="text-xs font-bold text-green-700">
                          Total: KES {revTotal.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-border">
                      {revenueFields.map(f => (
                        <div key={f} className="px-4 py-3">
                          <label className="text-xs font-medium text-green-700 block mb-1">{f}</label>
                          <input
                            type="number" min="0" step="0.01"
                            disabled={submitted}
                            value={entries[`__rev_${f}`] ?? ""}
                            onChange={e => setField(`__rev_${f}`, e.target.value)}
                            placeholder="0.00"
                            className="w-full text-sm px-2.5 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-secondary/40 disabled:cursor-not-allowed"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Complimentary ── */}
                {hasComplimentary && (
                  <div className="border-t border-border">
                    <div className="bg-amber-50 px-4 py-2.5 border-b border-border">
                      <p className="text-xs font-semibold text-amber-800">Complimentary (Non-Sale) (KES)</p>
                      <p className="text-xs text-amber-600 mt-0.5">Value of items given out free — not counted as revenue</p>
                    </div>
                    <div className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        disabled={submitted}
                        value={entries["__complimentary"] ?? ""}
                        onChange={e => setField("__complimentary", e.target.value)}
                        placeholder="0.00"
                        className="w-full text-sm px-2.5 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:bg-secondary/40 disabled:cursor-not-allowed max-w-xs"
                      />
                      <p className="text-xs text-muted-foreground mt-1.5">Enter the total KES value of complimentary services/items given today</p>
                    </div>
                  </div>
                )}

                {/* ── Expenses — Procurement only ── */}
                {isProcurement && (
                  <div className="border-t border-border">
                    <div className="bg-red-50 px-4 py-2.5 border-b border-border">
                      <p className="text-xs font-semibold text-red-800">Expenses by Department (KES)</p>
                      <p className="text-xs text-red-600 mt-0.5">Fill in expenses issued to each department today</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-border">
                      {EXPENSE_DEPARTMENTS.map(dept => (
                        <div key={dept} className="px-4 py-3">
                          <label className="text-xs font-medium text-red-700 block mb-1">{dept}</label>
                          <input
                            type="number" min="0" step="0.01"
                            disabled={submitted}
                            value={entries[`__exp_${dept}`] ?? ""}
                            onChange={e => setField(`__exp_${dept}`, e.target.value)}
                            placeholder="0.00"
                            className="w-full text-sm px-2.5 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-red-500 disabled:bg-secondary/40 disabled:cursor-not-allowed"
                          />
                        </div>
                      ))}
                    </div>
                    {/* Total expenses */}
                    {(() => {
                      const total = EXPENSE_DEPARTMENTS.reduce(
                        (s, d) => s + (parseFloat(entries[`__exp_${d}`] ?? "0") || 0), 0);
                      return total > 0 ? (
                        <div className="px-4 py-2 bg-red-50/60 border-t border-border text-xs flex items-center gap-3">
                          <span className="text-muted-foreground">Total Expenses:</span>
                          <span className="font-bold text-red-700">KES {total.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            );
          })()}

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
            <>
              <p className="text-xs text-muted-foreground text-right">
                Report submitted. Contact your manager if you need to make changes.
              </p>
              {/* CEO Action notification */}
              {ceoAction && (
                <div className={`rounded-xl p-4 border mt-2 ${
                  ceoAction.signed_off
                    ? "bg-green-50 border-green-300"
                    : ceoAction.action_type === "meeting"
                    ? "bg-purple-50 border-purple-300"
                    : "bg-blue-50 border-blue-300"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold">
                      {ceoAction.signed_off && "✅ CEO has signed this off"}
                      {!ceoAction.signed_off && ceoAction.action_type === "meeting" && "📅 CEO scheduled a meeting"}
                      {!ceoAction.signed_off && ceoAction.action_type === "comment" && "💬 CEO response"}
                    </span>
                  </div>
                  {ceoAction.comment && (
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap mb-2">{ceoAction.comment}</p>
                  )}
                  {ceoAction.scheduled_date && (
                    <p className="text-sm font-medium text-purple-700 flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {ceoAction.scheduled_date}
                      {ceoAction.scheduled_time && ` at ${ceoAction.scheduled_time}`}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    — {ceoAction.actioned_by_name} · {new Date(ceoAction.created_at).toLocaleString("en-KE", {
                      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </p>
                </div>
              )}
              {submitted && !ceoAction && entries["Management Action Required"]?.trim() && (
                <p className="text-xs text-amber-600 text-right mt-1">
                  ⏳ Awaiting CEO response on your Management Action Required.
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
