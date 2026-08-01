import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function getCellFormattedText(entry) {
  if (!entry) return "Not Allocated";
  if (entry.slot_type === "Slip Test") return "Slip Test (Class Teacher)";
  if (entry.slot_type === "Assembly") return "Assembly";
  if (entry.slot_type === "ECA") return "ECA";
  if (entry.slot_type) return entry.slot_type;

  const subject = entry.subjects?.subject_name || "Unknown Subject";
  const teacher = entry.teachers?.teacher_name || "No Teacher";
  return `${subject}\n(${teacher})`;
}

/**
 * Export Consolidated Timetable to PDF document:
 * Page 1: Master Consolidated Timetable
 * Page 2: Class-Wise Timetables
 * Page 3: Teacher-Wise Timetables
 */
export function exportToPDF({ date, classes, teachers, timetable }) {
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  const getEntry = (classId, period) => {
    return timetable.find(
      (entry) =>
        Number(entry.class_id) === Number(classId) &&
        Number(entry.period) === Number(period) &&
        entry.date === date
    );
  };

  // Create landscape A4 PDF document
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Header / Title
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59);
  doc.text("School Master Timetable", 14, 15);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Date: ${formattedDate} (${date})`, 14, 21);

  // ============================================================
  // PAGE 1: MASTER CONSOLIDATED TIMETABLE
  // ============================================================
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text("1. Master Consolidated Timetable", 14, 30);

  const masterHeaders = [["Period", ...classes.map((c) => `Class ${c.class_name}`)]];
  const masterRows = periods.map((period) => {
    const row = [`Period ${period}`];
    classes.forEach((cls) => {
      const entry = getEntry(cls.id, period);
      row.push(getCellFormattedText(entry));
    });
    return row;
  });

  autoTable(doc, {
    startY: 34,
    head: masterHeaders,
    body: masterRows,
    theme: "grid",
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
    },
    bodyStyles: {
      fontSize: 7.5,
      halign: "center",
      valign: "middle",
    },
    columnStyles: {
      0: { fontStyle: "bold", fillColor: [241, 245, 249], cellWidth: 20 },
    },
    margin: { left: 14, right: 14 },
  });

  // ============================================================
  // PAGE 2: CLASS-WISE TIMETABLES
  // ============================================================
  doc.addPage("a4", "landscape");

  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text("2. Class-Wise Timetables", 14, 15);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Date: ${formattedDate}`, 14, 21);

  const classHeaders = [["Class Name", ...periods.map((p) => `Period ${p}`)]];
  const classRows = classes.map((cls) => {
    const row = [`Class ${cls.class_name}`];
    periods.forEach((period) => {
      const entry = getEntry(cls.id, period);
      row.push(getCellFormattedText(entry));
    });
    return row;
  });

  autoTable(doc, {
    startY: 26,
    head: classHeaders,
    body: classRows,
    theme: "grid",
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
    },
    bodyStyles: {
      fontSize: 7.5,
      halign: "center",
      valign: "middle",
    },
    columnStyles: {
      0: { fontStyle: "bold", fillColor: [238, 242, 255], cellWidth: 26 },
    },
    margin: { left: 14, right: 14 },
  });

  // ============================================================
  // PAGE 3: TEACHER-WISE TIMETABLES
  // ============================================================
  doc.addPage("a4", "landscape");

  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text("3. Teacher-Wise Timetables", 14, 15);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Date: ${formattedDate}`, 14, 21);

  const teacherList =
    teachers && teachers.length > 0
      ? [...teachers]
      : Array.from(
          new Map(
            timetable
              .filter((t) => t.teachers)
              .map((t) => [t.teachers.id, t.teachers])
          ).values()
        );

  teacherList.sort((a, b) =>
    (a.teacher_name || "").localeCompare(b.teacher_name || "")
  );

  const teacherHeaders = [
    [
      "Teacher Name",
      ...periods.map((p) => `Period ${p}`),
      "Assigned",
      "Free",
    ],
  ];

  const teacherRows = teacherList.map((teacher) => {
    const row = [teacher.teacher_name];
    let assignedCount = 0;

    periods.forEach((period) => {
      const teacherEntries = timetable.filter(
        (t) =>
          Number(t.teacher_id) === Number(teacher.id) &&
          Number(t.period) === Number(period) &&
          t.date === date
      );

      if (teacherEntries.length > 0) {
        assignedCount++;
        const details = teacherEntries
          .map((e) => {
            const className = e.classes?.class_name
              ? `Class ${e.classes.class_name}`
              : "Class";
            const subName =
              e.subjects?.subject_name || e.slot_type || "Assigned";
            return `${className}\n(${subName})`;
          })
          .join("\n");
        row.push(details);
      } else {
        row.push("Free");
      }
    });

    row.push(`${assignedCount}`, `${8 - assignedCount}`);
    return row;
  });

  autoTable(doc, {
    startY: 26,
    head: teacherHeaders,
    body: teacherRows,
    theme: "grid",
    headStyles: {
      fillColor: [217, 119, 6],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
    },
    bodyStyles: {
      fontSize: 7.5,
      halign: "center",
      valign: "middle",
    },
    columnStyles: {
      0: { fontStyle: "bold", fillColor: [254, 243, 199], cellWidth: 32 },
    },
    margin: { left: 14, right: 14 },
  });

  // Add Footer with Page Numbers to all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Generated by School Timetable System | Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" }
    );
  }

  // Save generated PDF file
  doc.save(`Consolidated_Timetable_${date}.pdf`);
}
