export interface ReportField {
  ser: string;
  field: string;
  hint?: string;
}

export interface DepartmentTemplate {
  role: string;
  label: string;
  kpiLabel: string;
  fields: ReportField[];
}

// Shared common fields (ser 4–12 for most depts, 2–10 for Front Office)
const COMMON_FIELDS_FULL: ReportField[] = [
  { ser: "4",  field: "Revenue / Income" },
  { ser: "5",  field: "Cost Control / Variances" },
  { ser: "6",  field: "Guest Relations",      hint: "Complaints, compliments, engagement and follow-up" },
  { ser: "7",  field: "Staff Matters",        hint: "Attendance, deployment, productivity, training and discipline" },
  { ser: "8",  field: "Stocks / Supplies",    hint: "Shortages, stock-outs, receipts and unusual consumption" },
  { ser: "9",  field: "Equipment / Maintenance", hint: "Faults, completed repairs and pending repairs" },
  { ser: "10", field: "Safety / Security",    hint: "Incidents, hazards, accidents or near misses" },
  { ser: "11", field: "Tomorrow's Priorities" },
  { ser: "12", field: "Management Action Required" },
];

// Front Office only goes to ser 10
const FRONT_OFFICE_COMMON: ReportField[] = [
  { ser: "2", field: "Revenue / Income" },
  { ser: "3", field: "Cost Control / Variances" },
  { ser: "4", field: "Guest Relations",      hint: "Complaints, compliments, engagement and follow-up" },
  { ser: "5", field: "Staff Matters",        hint: "Attendance, deployment, productivity, training and discipline" },
  { ser: "6", field: "Stocks / Supplies",    hint: "Shortages, stock-outs, receipts and unusual consumption" },
  { ser: "7", field: "Equipment / Maintenance", hint: "Faults, completed repairs and pending repairs" },
  { ser: "8", field: "Safety / Security",    hint: "Incidents, hazards, accidents or near misses" },
  { ser: "9", field: "Tomorrow's Priorities" },
  { ser: "10", field: "Management Action Required" },
];

export const REPORT_TEMPLATES: DepartmentTemplate[] = [
  // ── Front Office ──────────────────────────────────────────────────────────
  {
    role: "receptionist",
    label: "Front Office",
    kpiLabel: "Rooms occupied; occupancy %; arrivals; departures; reservations; walk-ins; calls; e-mails; WhatsApp enquiries; conference enquiries; complaints; compliments; VIPs; guest engagement",
    fields: [
      { ser: "",  field: "Date / Shift / HOD" },
      { ser: "",  field: "Yesterday / Today's Results" },
      { ser: "1", field: "Key KPI figures", hint: "Rooms occupied; occupancy %; arrivals; departures; reservations; walk-ins; calls; e-mails; WhatsApp enquiries; conference enquiries; complaints; compliments; VIPs; guest engagement" },
      ...FRONT_OFFICE_COMMON,
    ],
  },

  // ── Kitchen ───────────────────────────────────────────────────────────────
  {
    role: "kitchen",
    label: "Kitchen",
    kpiLabel: "Breakfast covers; lunch covers; dinner covers; conference meals; buffet production; special diets; wastage; food returns; hygiene issues; portion control; equipment faults",
    fields: [
      { ser: "1", field: "Date / Shift / HOD" },
      { ser: "2", field: "Yesterday / Today Results" },
      { ser: "3", field: "Key KPI figures", hint: "Breakfast covers; lunch covers; dinner covers; conference meals; buffet production; special diets; wastage; food returns; hygiene issues; portion control; equipment faults" },
      ...COMMON_FIELDS_FULL,
    ],
  },

  // ── Food & Beverage ───────────────────────────────────────────────────────
  {
    role: "food_beverage",
    label: "Food & Beverage",
    kpiLabel: "Restaurant covers; restaurant sales; bar sales; Summit sales; Wellness Eatery sales; outdoor dining; guest feedback; beverage wastage; promotions",
    fields: [
      { ser: "1", field: "Date / Shift / HOD" },
      { ser: "2", field: "Yesterday / Today Results" },
      { ser: "3", field: "Key KPI figures", hint: "Restaurant covers; restaurant sales; bar sales; Summit sales; Wellness Eatery sales; outdoor dining; guest feedback; beverage wastage; promotions" },
      ...COMMON_FIELDS_FULL,
    ],
  },

  // ── Procurement & Stores ──────────────────────────────────────────────────
  {
    role: "procurement",
    label: "Procurement & Stores",
    kpiLabel: "Purchase requests; purchase orders; goods received; supplier issues; stock-outs; emergency purchases; price changes; items awaiting approval",
    fields: [
      { ser: "1", field: "Date / Shift / HOD" },
      { ser: "2", field: "Yesterday / Today Results" },
      { ser: "3", field: "Key KPI figures", hint: "Purchase requests; purchase orders; goods received; supplier issues; stock-outs; emergency purchases; price changes; items awaiting approval" },
      ...COMMON_FIELDS_FULL,
    ],
  },

  // ── Stock & Cost Control ──────────────────────────────────────────────────
  {
    role: "stock_control",
    label: "Stock & Cost Control",
    kpiLabel: "Food cost; beverage cost; kitchen variance; bar variance; wastage; expired stock; slow-moving stock; inventory adjustments; high-cost items",
    fields: [
      { ser: "1", field: "Date / Shift / HOD" },
      { ser: "2", field: "Yesterday / Today Results" },
      { ser: "3", field: "Key KPI figures", hint: "Food cost; beverage cost; kitchen variance; bar variance; wastage; expired stock; slow-moving stock; inventory adjustments; high-cost items" },
      ...COMMON_FIELDS_FULL,
    ],
  },

  // ── Accounts ─────────────────────────────────────────────────────────────
  {
    role: "accounts",
    label: "Accounts",
    kpiLabel: "Cash received; amount banked; M-Pesa; card payments; credit sales; collections; supplier payments; debtors; financial exceptions",
    fields: [
      { ser: "1", field: "Date / Shift / HOD" },
      { ser: "2", field: "Yesterday / Today Results" },
      { ser: "3", field: "Key KPI figures", hint: "Cash received; amount banked; M-Pesa; card payments; credit sales; collections; supplier payments; debtors; financial exceptions" },
      ...COMMON_FIELDS_FULL,
    ],
  },

  // ── Housekeeping ─────────────────────────────────────────────────────────
  // Housekeeping template in the image has no ser numbers
  {
    role: "housekeeping",
    label: "Housekeeping",
    kpiLabel: "Rooms cleaned; rooms inspected; dirty rooms; out-of-order rooms; laundry; linen issues; public areas; lost property; guest feedback; maintenance requests",
    fields: [
      { ser: "", field: "Date / Shift / HOD" },
      { ser: "", field: "Yesterday / Today Results" },
      { ser: "", field: "Key KPI figures", hint: "Rooms cleaned; rooms inspected; dirty rooms; out-of-order rooms; laundry; linen issues; public areas; lost property; guest feedback; maintenance requests" },
      { ser: "", field: "Revenue / Income" },
      { ser: "", field: "Cost Control / Variances" },
      { ser: "", field: "Guest Relations",         hint: "Complaints, compliments, engagement and follow-up" },
      { ser: "", field: "Staff Matters",           hint: "Attendance, deployment, productivity, training and discipline" },
      { ser: "", field: "Stocks / Supplies",       hint: "Shortages, stock-outs, receipts and unusual consumption" },
      { ser: "", field: "Equipment / Maintenance", hint: "Faults, completed repairs and pending repairs" },
      { ser: "", field: "Safety / Security",       hint: "Incidents, hazards, accidents or near misses" },
      { ser: "", field: "Tomorrow's Priorities" },
      { ser: "", field: "Management Action Required" },
    ],
  },

  // ── Maintenance ───────────────────────────────────────────────────────────
  {
    role: "maintenance",
    label: "Maintenance",
    kpiLabel: "Jobs completed; jobs outstanding; emergency repairs; preventive maintenance; electrical; plumbing; solar; lift; generator; pool plant; water supply; guest-impacting faults",
    fields: [
      { ser: "1",  field: "Date / Shift / HOD" },
      { ser: "2",  field: "Yesterday / Today Results" },
      { ser: "3",  field: "Key KPI figures", hint: "Jobs completed; jobs outstanding; emergency repairs; preventive maintenance; electrical; plumbing; solar; lift; generator; pool plant; water supply; guest-impacting faults" },
      ...COMMON_FIELDS_FULL,
    ],
  },

  // ── Wellness Centre ───────────────────────────────────────────────────────
  {
    role: "wellness_centre",
    label: "Wellness Centre",
    kpiLabel: "Pool users; gym users; sauna users; steam users; massage clients; beauty clients; barber/nails; revenue; memberships; equipment faults; guest feedback",
    fields: [
      { ser: "1",  field: "Date / Shift / HOD" },
      { ser: "2",  field: "Yesterday / Today Results" },
      { ser: "3",  field: "Key KPI figures", hint: "Pool users; gym users; sauna users; steam users; massage clients; beauty clients; barber/nails; revenue; memberships; equipment faults; guest feedback" },
      ...COMMON_FIELDS_FULL,
    ],
  },

  // ── Outdoor Centre ────────────────────────────────────────────────────────
  {
    role: "outdoor_centre",
    label: "Outdoor Centre",
    kpiLabel: "Participants; team building; school groups; forest and nature walks; mountain enquiries; equipment checks; safety observations; revenue",
    fields: [
      { ser: "1",  field: "Date / Shift / HOD" },
      { ser: "2",  field: "Yesterday / Today Results" },
      { ser: "3",  field: "Key KPI figures", hint: "Participants; team building; school groups; forest and nature walks; mountain enquiries; equipment checks; safety observations; revenue" },
      ...COMMON_FIELDS_FULL,
    ],
  },

  // ── Security & Grounds ────────────────────────────────────────────────────
  {
    role: "security",
    label: "Security & Grounds",
    kpiLabel: "Visitors; vehicle movements; patrols; incidents; CCTV; lighting; fire equipment; lost property; gardens; cleaning; perimeter issues",
    fields: [
      { ser: "1",  field: "Date / Shift / HOD" },
      { ser: "2",  field: "Yesterday / Today Results" },
      { ser: "3",  field: "Key KPI figures", hint: "Visitors; vehicle movements; patrols; incidents; CCTV; lighting; fire equipment; lost property; gardens; cleaning; perimeter issues" },
      ...COMMON_FIELDS_FULL,
    ],
  },

  // ── Marketing ─────────────────────────────────────────────────────────────
  {
    role: "marketing",
    label: "Marketing",
    kpiLabel: "Corporate visits; calls; e-mails; WhatsApp follow-up; social media; website enquiries; quotations sent; bookings confirmed; new accounts; lost opportunities; next follow-up",
    fields: [
      { ser: "1",  field: "Date / Shift / HOD" },
      { ser: "2",  field: "Yesterday / Today Results" },
      { ser: "3",  field: "Key KPI figures", hint: "Corporate visits; calls; e-mails; WhatsApp follow-up; social media; website enquiries; quotations sent; bookings confirmed; new accounts; lost opportunities; next follow-up" },
      ...COMMON_FIELDS_FULL,
    ],
  },

  // ── ICT ───────────────────────────────────────────────────────────────────
  {
    role: "ict",
    label: "ICT",
    kpiLabel: "PMS/network/Wi-Fi status; ICT faults resolved; Website updates; Social media posts; Digital enquiries; Bookings from digital channels; Reach & engagement; Photography/videography; Artwork & printing; Equipment status; Cybersecurity incidents",
    fields: [
      { ser: "1",  field: "Date / Shift / HOD" },
      { ser: "2",  field: "Yesterday / Today's Results" },
      { ser: "3",  field: "Key KPI Figures", hint: "PMS/network/Wi-Fi status; ICT faults resolved; Website updates; Social media posts; Digital enquiries; Bookings from digital channels; Reach & engagement; Photography/videography; Artwork & printing; Equipment status; Cybersecurity incidents" },
      { ser: "4",  field: "Revenue / Income" },
      { ser: "5",  field: "Cost Control / Variances" },
      { ser: "6",  field: "Guest Relations" },
      { ser: "7",  field: "Staff Matters" },
      { ser: "8",  field: "Stocks / Supplies" },
      { ser: "9",  field: "Equipment / Maintenance" },
      { ser: "10", field: "Safety / Security" },
      { ser: "11", field: "Tomorrow's Priorities" },
      { ser: "12", field: "Management Action Required" },
    ],
  },

  // ── Human Resource ────────────────────────────────────────────────────────
  {
    role: "hr",
    label: "Human Resource",
    kpiLabel: "Attendance; Recruitment; Training; Multi-skilling; Performance reviews; Disciplinary matters; Leave/overtime; Staff welfare; Vacancies; Recognition",
    fields: [
      { ser: "1",  field: "Date / Shift / HOD" },
      { ser: "2",  field: "Yesterday / Today's Results" },
      { ser: "3",  field: "Key KPI Figures", hint: "Attendance; Recruitment; Training; Multi-skilling; Performance reviews; Disciplinary matters; Leave/overtime; Staff welfare; Vacancies; Recognition" },
      { ser: "4",  field: "Revenue / Income" },
      { ser: "5",  field: "Cost Control / Variances" },
      { ser: "6",  field: "Guest Relations" },
      { ser: "7",  field: "Staff Matters" },
      { ser: "8",  field: "Stocks / Supplies" },
      { ser: "9",  field: "Equipment / Maintenance" },
      { ser: "10", field: "Safety / Security" },
      { ser: "11", field: "Tomorrow's Priorities" },
      { ser: "12", field: "Management Action Required" },
    ],
  },

  // ── Administration ────────────────────────────────────────────────────────
  {
    role: "administration",
    label: "Administration",
    kpiLabel: "Correspondence; Meetings/minutes; Licences & permits; Insurance/legal; Vehicle utilisation; Office supplies; Inter-department coordination; VIP coordination; Outstanding actions",
    fields: [
      { ser: "1",  field: "Date / Shift / HOD" },
      { ser: "2",  field: "Yesterday / Today's Results" },
      { ser: "3",  field: "Key KPI Figures", hint: "Correspondence; Meetings/minutes; Licences & permits; Insurance/legal; Vehicle utilisation; Office supplies; Inter-department coordination; VIP coordination; Outstanding actions" },
      { ser: "4",  field: "Revenue / Income" },
      { ser: "5",  field: "Cost Control / Variances" },
      { ser: "6",  field: "Guest Relations" },
      { ser: "7",  field: "Staff Matters" },
      { ser: "8",  field: "Stocks / Supplies" },
      { ser: "9",  field: "Equipment / Maintenance" },
      { ser: "10", field: "Safety / Security" },
      { ser: "11", field: "Tomorrow's Priorities" },
      { ser: "12", field: "Management Action Required" },
    ],
  },

  // ── Restaurant (alias for food_beverage role variant) ─────────────────────
  {
    role: "restaurant",
    label: "Restaurant",
    kpiLabel: "Restaurant covers; restaurant sales; bar sales; guest feedback; beverage wastage; promotions",
    fields: [
      { ser: "1",  field: "Date / Shift / HOD" },
      { ser: "2",  field: "Yesterday / Today Results" },
      { ser: "3",  field: "Key KPI figures", hint: "Restaurant covers; restaurant sales; bar sales; guest feedback; beverage wastage; promotions" },
      ...COMMON_FIELDS_FULL,
    ],
  },
];

export function getTemplateForRole(role: string): DepartmentTemplate | undefined {
  return REPORT_TEMPLATES.find(t => t.role === role);
}

export const ADMIN_ROLES = ["manager", "super_admin", "ceo"];

// ── Revenue config ────────────────────────────────────────────────────────────
// Roles allowed to fill revenue, and their sub-category fields
export const REVENUE_CONFIG: Record<string, string[]> = {
  receptionist: ["Accommodation", "Restaurant", "Conference", "Bar", "Outdoor"],
  wellness_centre: ["Swimming", "Gym", "Steam Bath", "Sauna", "Massage", "Beauty Parlour"],
  mothers_choice: ["Total Revenue"],
  kcau: ["Total Revenue"],
};

// ── Complimentary config ──────────────────────────────────────────────────────
// Roles allowed to fill complimentary (non-sale giveaways)
export const COMPLIMENTARY_ROLES = [
  "receptionist", "wellness_centre", "food_beverage", "mothers_choice", "kcau",
];

// ── Expenses ──────────────────────────────────────────────────────────────────
// Only procurement fills expenses, broken down per department
export const EXPENSES_ROLE = "procurement";
export const EXPENSE_DEPARTMENTS = [
  "Front Office", "Kitchen", "Food & Beverage", "Procurement & Stores",
  "Stock & Cost Control", "Accounts", "Housekeeping", "Maintenance",
  "Wellness Centre", "Outdoor Centre", "Security & Grounds", "Marketing",
  "ICT", "Human Resource", "Administration", "KCAU", "Mother's Choice",
];
