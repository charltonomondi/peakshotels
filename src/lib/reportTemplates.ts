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

const COMMON_FIELDS: ReportField[] = [
  { ser: "4", field: "Revenue / Income", hint: "Sales, bookings, collections or income generated" },
  { ser: "5", field: "Cost Control / Variances", hint: "Wastage, losses, variances, savings or control concerns" },
  { ser: "6", field: "Guest Relations", hint: "Complaints, compliments, engagement and follow-up" },
  { ser: "7", field: "Staff Matters", hint: "Attendance, deployment, productivity, training and discipline" },
  { ser: "8", field: "Stocks / Supplies", hint: "Shortages, stock-outs, receipts and unusual consumption" },
  { ser: "9", field: "Equipment / Maintenance", hint: "Faults, completed repairs and pending repairs" },
  { ser: "10", field: "Safety / Security", hint: "Incidents, hazards, accidents or near misses" },
  { ser: "11", field: "Tomorrow's Priorities", hint: "Arrivals, events, VIPs, production needs, marketing follow-up" },
  { ser: "12", field: "Management Action Required", hint: "Clear decisions, approvals or interventions required from Management" },
];

export const REPORT_TEMPLATES: DepartmentTemplate[] = [
  {
    role: "receptionist",
    label: "Front Office",
    kpiLabel: "Rooms occupied; occupancy %; arrivals; departures; reservations; walk-ins; calls; e-mails; WhatsApp enquiries; conference enquiries; complaints; compliments; VIPs; guest engagement",
    fields: [
      { ser: "1", field: "Date / Shift / HOD" },
      { ser: "2", field: "Yesterday / Today's Results" },
      { ser: "3", field: "Key KPI Figures", hint: "Rooms occupied; occupancy %; arrivals; departures; reservations; walk-ins; calls; e-mails; WhatsApp enquiries; conference enquiries; complaints; compliments; VIPs; guest engagement" },
      ...COMMON_FIELDS,
    ],
  },
  {
    role: "kitchen",
    label: "Kitchen",
    kpiLabel: "Breakfast covers; lunch covers; dinner covers; conference meals; buffet production; special diets; wastage; food returns; hygiene issues; portion control; equipment faults",
    fields: [
      { ser: "1", field: "Date / Shift / HOD" },
      { ser: "2", field: "Yesterday / Today's Results" },
      { ser: "3", field: "Key KPI Figures", hint: "Breakfast covers; lunch covers; dinner covers; conference meals; buffet production; special diets; wastage; food returns; hygiene issues; portion control; equipment faults" },
      ...COMMON_FIELDS,
    ],
  },
  {
    role: "food_beverage",
    label: "Food & Beverage",
    kpiLabel: "Restaurant covers; restaurant sales; bar sales; Summit sales; Wellness Eatery sales; outdoor dining; guest feedback; beverage wastage; promotions",
    fields: [
      { ser: "1", field: "Date / Shift / HOD" },
      { ser: "2", field: "Yesterday / Today's Results" },
      { ser: "3", field: "Key KPI Figures", hint: "Restaurant covers; restaurant sales; bar sales; Summit sales; Wellness Eatery sales; outdoor dining; guest feedback; beverage wastage; promotions" },
      ...COMMON_FIELDS,
    ],
  },
  {
    role: "procurement",
    label: "Procurement & Stores",
    kpiLabel: "Purchase requests; purchase orders; goods received; supplier issues; stock-outs; emergency purchases; price changes; items awaiting approval",
    fields: [
      { ser: "1", field: "Date / Shift / HOD" },
      { ser: "2", field: "Yesterday / Today's Results" },
      { ser: "3", field: "Key KPI Figures", hint: "Purchase requests; purchase orders; goods received; supplier issues; stock-outs; emergency purchases; price changes; items awaiting approval" },
      ...COMMON_FIELDS,
    ],
  },
  {
    role: "stock_control",
    label: "Stock & Cost Control",
    kpiLabel: "Food cost; beverage cost; kitchen variance; bar variance; wastage; expired stock; slow-moving stock; inventory adjustments; high-cost items",
    fields: [
      { ser: "1", field: "Date / Shift / HOD" },
      { ser: "2", field: "Yesterday / Today's Results" },
      { ser: "3", field: "Key KPI Figures", hint: "Food cost; beverage cost; kitchen variance; bar variance; wastage; expired stock; slow-moving stock; inventory adjustments; high-cost items" },
      ...COMMON_FIELDS,
    ],
  },
  {
    role: "accounts",
    label: "Accounts",
    kpiLabel: "Cash received; amount banked; M-Pesa; card payments; credit sales; collections; supplier payments; debtors; financial exceptions",
    fields: [
      { ser: "1", field: "Date / Shift / HOD" },
      { ser: "2", field: "Yesterday / Today's Results" },
      { ser: "3", field: "Key KPI Figures", hint: "Cash received; amount banked; M-Pesa; card payments; credit sales; collections; supplier payments; debtors; financial exceptions" },
      ...COMMON_FIELDS,
    ],
  },
  {
    role: "housekeeping",
    label: "Housekeeping",
    kpiLabel: "Rooms cleaned; rooms inspected; dirty rooms; out-of-order rooms; laundry; linen issues; public areas; lost property; guest feedback; maintenance requests",
    fields: [
      { ser: "1", field: "Date / Shift / HOD" },
      { ser: "2", field: "Yesterday / Today's Results" },
      { ser: "3", field: "Key KPI Figures", hint: "Rooms cleaned; rooms inspected; dirty rooms; out-of-order rooms; laundry; linen issues; public areas; lost property; guest feedback; maintenance requests" },
      ...COMMON_FIELDS,
    ],
  },
  {
    role: "maintenance",
    label: "Maintenance",
    kpiLabel: "Jobs completed; jobs outstanding; emergency repairs; preventive maintenance; electrical; plumbing; solar; lift; generator; pool plant; water supply; guest-impacting faults",
    fields: [
      { ser: "1", field: "Date / Shift / HOD" },
      { ser: "2", field: "Yesterday / Today's Results" },
      { ser: "3", field: "Key KPI Figures", hint: "Jobs completed; jobs outstanding; emergency repairs; preventive maintenance; electrical; plumbing; solar; lift; generator; pool plant; water supply; guest-impacting faults" },
      ...COMMON_FIELDS,
    ],
  },
  {
    role: "wellness_centre",
    label: "Wellness Centre",
    kpiLabel: "Pool users; gym users; sauna users; steam users; massage clients; beauty clients; barber/nails; revenue; memberships; equipment faults; guest feedback",
    fields: [
      { ser: "1", field: "Date / Shift / HOD" },
      { ser: "2", field: "Yesterday / Today's Results" },
      { ser: "3", field: "Key KPI Figures", hint: "Pool users; gym users; sauna users; steam users; massage clients; beauty clients; barber/nails; revenue; memberships; equipment faults; guest feedback" },
      ...COMMON_FIELDS,
    ],
  },
  {
    role: "outdoor_centre",
    label: "Outdoor Centre",
    kpiLabel: "Participants; team building; school groups; forest and nature walks; mountain enquiries; equipment checks; safety observations; revenue",
    fields: [
      { ser: "1", field: "Date / Shift / HOD" },
      { ser: "2", field: "Yesterday / Today's Results" },
      { ser: "3", field: "Key KPI Figures", hint: "Participants; team building; school groups; forest and nature walks; mountain enquiries; equipment checks; safety observations; revenue" },
      ...COMMON_FIELDS,
    ],
  },
  {
    role: "security",
    label: "Security & Grounds",
    kpiLabel: "Visitors; vehicle movements; patrols; incidents; CCTV; lighting; fire equipment; lost property; gardens; cleaning; perimeter issues",
    fields: [
      { ser: "1", field: "Date / Shift / HOD" },
      { ser: "2", field: "Yesterday / Today's Results" },
      { ser: "3", field: "Key KPI Figures", hint: "Visitors; vehicle movements; patrols; incidents; CCTV; lighting; fire equipment; lost property; gardens; cleaning; perimeter issues" },
      ...COMMON_FIELDS,
    ],
  },
  {
    role: "marketing",
    label: "Marketing",
    kpiLabel: "Corporate visits; calls; e-mails; WhatsApp follow-up; social media; website enquiries; quotations sent; bookings confirmed; new accounts; lost opportunities; next follow-up",
    fields: [
      { ser: "1", field: "Date / Shift / HOD" },
      { ser: "2", field: "Yesterday / Today's Results" },
      { ser: "3", field: "Key KPI Figures", hint: "Corporate visits; calls; e-mails; WhatsApp follow-up; social media; website enquiries; quotations sent; bookings confirmed; new accounts; lost opportunities; next follow-up" },
      ...COMMON_FIELDS,
    ],
  },
  {
    role: "ict",
    label: "ICT",
    kpiLabel: "PMS/network/Wi-Fi status; ICT faults resolved; website updates; social media posts; digital enquiries; bookings from digital channels; reach & engagement; photography/videography; artwork & printing; equipment status; cybersecurity incidents",
    fields: [
      { ser: "1", field: "Date / Shift / HOD" },
      { ser: "2", field: "Yesterday / Today's Results" },
      { ser: "3", field: "Key KPI Figures", hint: "PMS/network/Wi-Fi status; ICT faults resolved; website updates; social media posts; digital enquiries; bookings from digital channels; reach & engagement; photography/videography; artwork & printing; equipment status; cybersecurity incidents" },
      ...COMMON_FIELDS,
    ],
  },
  {
    role: "hr",
    label: "Human Resource",
    kpiLabel: "Attendance; recruitment; training; multi-skilling; performance reviews; disciplinary matters; leave/overtime; staff welfare; vacancies; recognition",
    fields: [
      { ser: "1", field: "Date / Shift / HOD" },
      { ser: "2", field: "Yesterday / Today's Results" },
      { ser: "3", field: "Key KPI Figures", hint: "Attendance; recruitment; training; multi-skilling; performance reviews; disciplinary matters; leave/overtime; staff welfare; vacancies; recognition" },
      ...COMMON_FIELDS,
    ],
  },
  {
    role: "administration",
    label: "Administration",
    kpiLabel: "Correspondence; meetings/minutes; licences & permits; insurance/legal; vehicle utilisation; office supplies; inter-department coordination; VIP coordination; outstanding actions",
    fields: [
      { ser: "1", field: "Date / Shift / HOD" },
      { ser: "2", field: "Yesterday / Today's Results" },
      { ser: "3", field: "Key KPI Figures", hint: "Correspondence; meetings/minutes; licences & permits; insurance/legal; vehicle utilisation; office supplies; inter-department coordination; VIP coordination; outstanding actions" },
      ...COMMON_FIELDS,
    ],
  },
  // manager / super_admin / ceo see all departments — handled in component
  {
    role: "restaurant",
    label: "Restaurant",
    kpiLabel: "Restaurant covers; restaurant sales; bar sales; guest feedback; beverage wastage; promotions",
    fields: [
      { ser: "1", field: "Date / Shift / HOD" },
      { ser: "2", field: "Yesterday / Today's Results" },
      { ser: "3", field: "Key KPI Figures", hint: "Restaurant covers; restaurant sales; bar sales; guest feedback; beverage wastage; promotions" },
      ...COMMON_FIELDS,
    ],
  },
];

export function getTemplateForRole(role: string): DepartmentTemplate | undefined {
  return REPORT_TEMPLATES.find(t => t.role === role);
}

export const ADMIN_ROLES = ["manager", "super_admin", "ceo"];
