import jsPDF from "jspdf";

export function generateInvoicePdf(b: any) {
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.text("Peaks Hotel Nanyuki", 14, 20);
  doc.setFontSize(10);
  doc.text("Mt Kenya, Nanyuki, Kenya", 14, 26);
  doc.text("info@peakshotelnanyuki.com", 14, 31);

  doc.setFontSize(14);
  doc.text("INVOICE / RECEIPT", 14, 46);
  doc.setFontSize(10);
  doc.text(`Reference: ${b.reference}`, 14, 54);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 60);
  doc.text(`Status: ${String(b.status).toUpperCase()}`, 14, 66);

  doc.setFontSize(12);
  doc.text("Guest", 14, 80);
  doc.setFontSize(10);
  doc.text(b.guest_name ?? "", 14, 86);
  if (b.guest_phone) doc.text(b.guest_phone, 14, 92);
  if (b.guest_email) doc.text(b.guest_email, 14, 98);

  doc.setFontSize(12);
  doc.text("Stay", 14, 114);
  doc.setFontSize(10);
  doc.text(`Room: ${b.rooms?.name ?? ""} #${b.rooms?.room_number ?? ""}`, 14, 120);
  doc.text(`Check-in: ${b.check_in}`, 14, 126);
  doc.text(`Check-out: ${b.check_out}`, 14, 132);
  doc.text(`Guests: ${b.num_guests}`, 14, 138);

  doc.line(14, 150, 196, 150);
  doc.setFontSize(14);
  doc.text("TOTAL", 14, 160);
  doc.text(`KES ${Number(b.total_amount).toLocaleString()}`, 196, 160, { align: "right" });

  doc.setFontSize(9);
  doc.text("Thank you for choosing Peaks Hotel Nanyuki.", 14, 280);

  doc.save(`invoice-${b.reference}.pdf`);
}
