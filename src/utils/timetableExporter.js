import * as XLSX from "xlsx";

/**
 * Helper to extract formatted text for a cell in the Master Grid
 */
function getCellFormattedText(entry) {
  if (!entry) return "Not Allocated";
  if (entry.slot_type === "Slip Test") return "Slip Test (Class Teacher)";
  if (entry.slot_type === "Assembly") return "Assembly";
  if (entry.slot_type === "ECA") return "ECA";
  if (entry.slot_type) return entry.slot_type;

  const subject = entry.subjects?.subject_name || "Unknown Subject";
  const teacher = entry.teachers?.teacher_name || "No Teacher";
  return `${subject} (${teacher})`;
}

/**
 * Export Consolidated Timetable to Excel (.xlsx) with 3 worksheets:
 * 1. Master Timetable (Period x Class)
 * 2. Class Timetables (Class x Period)
 * 3. Teacher Timetables (Teacher x Period)
 */
export function exportToExcel({ date, classes, teachers, timetable }) {
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  const getEntry = (classId, period) => {
    return timetable.find(
      (entry) =>
        Number(entry.class_id) === Number(classId) &&
        Number(entry.period) === Number(period) &&
        entry.date === date
    );
  };

  const workbook = XLSX.utils.book_new();

  // ==========================================
  // SHEET 1: MASTER CONSOLIDATED TIMETABLE
  // ==========================================
  const masterHeaders = ["Period", ...classes.map((c) => `Class ${c.class_name}`)];
  const masterData = [masterHeaders];

  periods.forEach((period) => {
    const row = [`Period ${period}`];
    classes.forEach((cls) => {
      const entry = getEntry(cls.id, period);
      row.push(getCellFormattedText(entry));
    });
    masterData.push(row);
  });

  const masterSheet = XLSX.utils.aoa_to_sheet(masterData);
  masterSheet["!cols"] = masterHeaders.map(() => ({ wch: 24 }));
  XLSX.utils.book_append_sheet(workbook, masterSheet, "Master Timetable");

  // ==========================================
  // SHEET 2: CLASS-WISE TIMETABLES
  // ==========================================
  const classHeaders = ["Class Name", ...periods.map((p) => `Period ${p}`)];
  const classData = [classHeaders];

  classes.forEach((cls) => {
    const row = [`Class ${cls.class_name}`];
    periods.forEach((period) => {
      const entry = getEntry(cls.id, period);
      row.push(getCellFormattedText(entry));
    });
    classData.push(row);
  });

  const classSheet = XLSX.utils.aoa_to_sheet(classData);
  classSheet["!cols"] = classHeaders.map(() => ({ wch: 24 }));
  XLSX.utils.book_append_sheet(workbook, classSheet, "Class Timetables");

  // ==========================================
  // SHEET 3: TEACHER-WISE TIMETABLES
  // ==========================================
  const teacherHeaders = [
    "Teacher Name",
    ...periods.map((p) => `Period ${p}`),
    "Assigned Periods",
    "Free Periods",
  ];
  const teacherData = [teacherHeaders];

  // Derive full teacher list
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

  teacherList.forEach((teacher) => {
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
            return `${className} - ${subName}`;
          })
          .join(", ");
        row.push(details);
      } else {
        row.push("Free");
      }
    });

    row.push(assignedCount, 8 - assignedCount);
    teacherData.push(row);
  });

  const teacherSheet = XLSX.utils.aoa_to_sheet(teacherData);
  teacherSheet["!cols"] = teacherHeaders.map(() => ({ wch: 26 }));
  XLSX.utils.book_append_sheet(workbook, teacherSheet, "Teacher Timetables");

  // Save Excel file
  const filename = `Consolidated_Timetable_${date}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

/**
 * Trigger CSV file download
 */
function downloadCSV(dataArray, filename) {
  const csvContent = dataArray
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export Master Timetable to CSV
 */
export function exportMasterCSV({ date, classes, timetable }) {
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];
  const getEntry = (classId, period) =>
    timetable.find(
      (e) =>
        Number(e.class_id) === Number(classId) &&
        Number(e.period) === Number(period) &&
        e.date === date
    );

  const headers = ["Period", ...classes.map((c) => `Class ${c.class_name}`)];
  const rows = [headers];

  periods.forEach((period) => {
    const row = [`Period ${period}`];
    classes.forEach((cls) => {
      const entry = getEntry(cls.id, period);
      row.push(getCellFormattedText(entry));
    });
    rows.push(row);
  });

  downloadCSV(rows, `Master_Timetable_${date}.csv`);
}

/**
 * Export Class-wise Timetables to CSV
 */
export function exportClassesCSV({ date, classes, timetable }) {
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];
  const getEntry = (classId, period) =>
    timetable.find(
      (e) =>
        Number(e.class_id) === Number(classId) &&
        Number(e.period) === Number(period) &&
        e.date === date
    );

  const headers = ["Class Name", ...periods.map((p) => `Period ${p}`)];
  const rows = [headers];

  classes.forEach((cls) => {
    const row = [`Class ${cls.class_name}`];
    periods.forEach((period) => {
      const entry = getEntry(cls.id, period);
      row.push(getCellFormattedText(entry));
    });
    rows.push(row);
  });

  downloadCSV(rows, `Class_Wise_Timetable_${date}.csv`);
}

/**
 * Export Teacher-wise Timetables to CSV
 */
export function exportTeachersCSV({ date, teachers, timetable }) {
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

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

  const headers = [
    "Teacher Name",
    ...periods.map((p) => `Period ${p}`),
    "Assigned Periods",
    "Free Periods",
  ];
  const rows = [headers];

  teacherList.forEach((teacher) => {
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
            return `${className} - ${subName}`;
          })
          .join(", ");
        row.push(details);
      } else {
        row.push("Free");
      }
    });

    row.push(assignedCount, 8 - assignedCount);
    rows.push(row);
  });

  downloadCSV(rows, `Teacher_Wise_Timetable_${date}.csv`);
}
