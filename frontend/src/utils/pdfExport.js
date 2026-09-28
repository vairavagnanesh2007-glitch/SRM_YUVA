import { jsPDF } from 'jspdf';

export function exportAttendanceReportPDF({
  section,
  subject,
  calculation,
  timeline,
  studentName = "Engineering Student",
  rollNo = "RA2411003010001"
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;

  // Header Banner
  doc.setFillColor(7, 10, 19); // Dark navy
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(16, 185, 129); // Emerald
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("SRM INSTITUTE OF SCIENCE AND TECHNOLOGY — SEEE", 14, 10);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("OFFICIAL ATTENDANCE FORECAST & ELIGIBILITY REPORT", 14, 18);

  doc.setTextColor(148, 163, 184); // Slate 400
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text(`Academic Semester: Aug 29 – Nov 29, 2026   |   Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 24);

  y = 36;

  // Student & Course Information Box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, pageWidth - 28, 26, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");

  doc.text(`Student: ${studentName}`, 18, y + 7);
  doc.text(`Class/Section: ${section?.name || 'N/A'}`, 18, y + 14);
  doc.text(`Classroom Venue: ${section?.venue || 'IST 518/AN'}`, 18, y + 21);

  doc.text(`Register No: ${rollNo}`, 110, y + 7);
  doc.text(`Subject: ${subject?.code} - ${subject?.name}`, 110, y + 14);
  doc.text(`Faculty: ${subject?.faculty || 'Faculty Advisor'}`, 110, y + 21);

  y += 33;

  // Status Badge Banner
  const status = calculation?.status || "UNKNOWN";
  let statusBg = [241, 245, 249];
  let statusText = [71, 85, 105];

  if (status === "SAFE") {
    statusBg = [209, 250, 229]; // Light emerald
    statusText = [6, 95, 70];
  } else if (status === "DANGER") {
    statusBg = [254, 243, 199]; // Light amber
    statusText = [146, 64, 14];
  } else if (status === "IRREVERSIBLE_DETENTION") {
    statusBg = [254, 226, 226]; // Light red
    statusText = [153, 27, 27];
  }

  doc.setFillColor(statusBg[0], statusBg[1], statusBg[2]);
  doc.roundedRect(14, y, pageWidth - 28, 12, 1.5, 1.5, 'F');

  doc.setTextColor(statusText[0], statusText[1], statusText[2]);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.text(`OFFICIAL STATUS: ${calculation?.statusLabel || status}`, 18, y + 8);
  doc.text(`Current Attendance: ${calculation?.currentAttendance}%`, pageWidth - 65, y + 8);

  y += 18;

  // Key Decision Engine Metrics Table
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Deterministic Decision Matrix (Authoritative Math)", 14, y);

  y += 5;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 8, 'FD');

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("Metric", 18, y + 5.5);
  doc.text("Value", 90, y + 5.5);
  doc.text("Institutional Implication / Regulatory Limit", 125, y + 5.5);

  const metricsData = [
    ["Conducted Classes to Date (C)", `${calculation?.classesConducted || 0} classes`, "Verified against official timetable schedule"],
    ["Attended Classes to Date (A)", `${calculation?.classesAttended || 0} classes`, `${calculation?.currentAttendance}% current standing`],
    ["Remaining Classes in Semester (R)", `${calculation?.classesRemaining || 0} classes`, "Exact count to Nov 29, 2026"],
    ["Total Semester Classes (N = C + R)", `${calculation?.totalSemesterClasses || 0} classes`, "Total instructional periods"],
    ["Maximum Possible Attendance", `${calculation?.maximumPossibleAttendance}%`, "Ceiling achievable if 100% attended"],
    ["Required to Attend for 75% Clearance", `${calculation?.target75?.requiredToAttend || 0} classes`, calculation?.target75?.possible ? "Mandatory attendance requirement" : "UNREACHABLE (Detention Alert)"],
    ["Safe Classes to Miss (75% Threshold)", `${calculation?.target75?.safeToMiss || 0} classes`, "Budget of permissible skips before detention"],
    ["Required to Reach 90% Target", `${calculation?.target90?.requiredToAttend || 0} classes`, calculation?.target90?.possible ? "Attainable goal" : "Mathematically unreachable"]
  ];

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  metricsData.forEach(([mName, mVal, mImp], idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, pageWidth - 28, 6.5, 'F');
    }
    doc.setTextColor(30, 41, 59);
    doc.text(mName, 18, y + 4.5);
    doc.setFont("helvetica", "bold");
    doc.text(mVal, 90, y + 4.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(mImp, 125, y + 4.5);
    y += 6.5;
  });

  y += 8;

  // Actionable Advice / Strategy Section
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.text("Deterministic Recommendations & Action Plan:", 14, y);

  y += 5;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);

  (calculation?.explanations || []).forEach(exp => {
    const lines = doc.splitTextToSize(`• ${exp}`, pageWidth - 32);
    doc.text(lines, 18, y);
    y += (lines.length * 4.5);
  });

  y += 6;

  // Algorithmic Proof Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(14, y, pageWidth - 28, 20, 1.5, 1.5, 'FD');

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("ALGORITHMIC MATHEMATICAL PROOF (SRM SEEE REGULATIONS):", 18, y + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Required 75% Formula: ceil(0.75 * (${calculation?.classesConducted} + ${calculation?.classesRemaining}) - 1e-9) - ${calculation?.classesAttended} = ${calculation?.target75?.requiredToAttend} classes required.`, 18, y + 10);
  doc.text(`Safe Miss Allowance: max(0, ${calculation?.classesRemaining} - ${calculation?.target75?.requiredToAttend}) = ${calculation?.target75?.safeToMiss} classes safe to miss before detention.`, 18, y + 15);

  y += 32;

  // Signature Blocks
  doc.setDrawColor(148, 163, 184);
  doc.line(18, y, 70, y);
  doc.line(78, y, 130, y);
  doc.line(138, y, pageWidth - 18, y);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Student Signature", 26, y + 4);
  doc.text("Faculty Advisor / Class Counselor", 80, y + 4);
  doc.text("Head of the Department (SEEE)", 144, y + 4);

  // Footer Disclaimer
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text("Generated by Overworld Attendance Predictor Engine • Ground-truth timetable ingested from official SRM IST department records.", 14, 287);

  // Save PDF
  const filename = `Attendance_Report_${section?.id || 'SEEE'}_${subject?.code || 'Summary'}.pdf`;
  doc.save(filename);
}
