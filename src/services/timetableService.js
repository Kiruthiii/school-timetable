/* global PT_SUBJECT_ID */
import { supabase } from "./supabase";
export const getMappings = async () => {
  const { data, error } = await supabase
    .from("class_subject_teacher")
    .select(`
      *,
      subjects (
        priority
      )
    `);

  if (error) throw error;

  return data;
};
export const getClasses = async () => {
  const { data, error } = await supabase
    .from("classes")
    .select("*");

  if (error) throw error;

  return data;
};
export const getTimetable = async () => {
  const { data, error } = await supabase
    .from("timetable")
    .select("*");

  if (error) throw error;

  return data;
};
export const clearTimetable = async () => {
  const { error } = await supabase
    .from("timetable")
    .delete()
    .neq("id", 0);

  if (error) throw error;
};
export const saveTimetable = async (entries) => {
  const { error } = await supabase
    .from("timetable")
    .insert(entries);

  if (error) throw error;
};
export const getFixedSlots = async () => {
  const { data, error } = await supabase
    .from("fixed_slots")
    .select("*");

  if (error) throw error;

  return data;
};

export const isTeacherAvailable = (
  teacherId,
  period,
  availability
) => {
  const record = availability.find(
    (a) => a.teacher_id === teacherId
  );


  if (!record) {
    return true;
  }


  if (record.status === "Leave") {
    return false;
  }

  if (record.status === "Half Day") {
    if (
      record.session === "Morning" &&
      period <= 4
    ) {
      return false;
    }

    if (
      record.session === "Afternoon" &&
      period >= 5
    ) {
      return false;
    }
  }

  return true;
};

// Helper functions for timetable generation

/**
 * Loads all required data for timetable generation.
 * @param {string} date - The date for which the timetable is generated.
 * @returns {Promise<Object>} An object containing classes, mappings, progress, availability, and fixedSlots.
 */
const loadData = async (date) => {
  const classes = await getClasses();
  const mappings = await getMappings();
  const weekStartDate = getWeekStartDate(date);
  const progress = await getWeeklyProgress(weekStartDate);
  const availability = await getTeacherAvailability(date);
  const fixedSlots = await getFixedSlots();
  return { classes, mappings, progress, availability, fixedSlots };
};

/**
 * Calculates remaining periods for each mapping based on weekly progress.
 * @param {Array} mappings - Subject-teacher mappings.
 * @param {Array} progress - Weekly progress of completed periods.
 * @returns {Array} List of mappings with calculated remaining periods.
 */
const calculateRemainingPeriods = (mappings, progress) => {
  return mappings.map((mapping) => {
    const progressRecord = progress.find(
      (p) => p.class_id === mapping.class_id && p.subject_id === mapping.subject_id
    );

    const completed = progressRecord ? progressRecord.completed_periods : 0;

    return {
      ...mapping,
      priority: mapping.subjects.priority,
      remaining_periods: mapping.weekly_periods - completed,
    };
  });
};

/**
 * Filters and returns available subjects for a given period.
 * @param {Array} classRemainingPeriods - Remaining subjects for the class.
 * @param {Array} todaySubjects - Subjects already allocated today.
 * @param {number} period - The current period number.
 * @param {Array} availability - Teachers' availability.
 * @param {Object} teacherSchedule - The current teacher schedule.
 * @returns {Array} List of available subjects.
 */
const getAvailableSubjects = (
  classRemainingPeriods,
  todaySubjects,
  period,
  availability,
  teacherSchedule
) => {
  // Check if PT_SUBJECT_ID is defined (avoids ReferenceError if missing globally)
  const ptId = typeof PT_SUBJECT_ID !== "undefined" ? PT_SUBJECT_ID : undefined;

  return classRemainingPeriods.filter(
    (subject) =>
      subject.remaining_periods > 0 &&
      !todaySubjects.includes(subject.subject_id) &&
      isTeacherAvailable(subject.teacher_id, period, availability) &&
      (subject.subject_id === ptId || !teacherSchedule[period]?.[subject.teacher_id])
  );
};

/**
 * Sorts subjects by priority and remaining periods.
 * @param {Array} subjects - The available subjects to sort.
 * @returns {Array} The sorted subjects array.
 */
const sortSubjects = (subjects) => {
  // Mutates the copy of the array just like the original code implementation
  const sorted = [...subjects];
  sorted.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return b.remaining_periods - a.remaining_periods;
  });
  return sorted;
};

/**
 * Allocates a subject by decrementing its remaining periods and adding to today's subjects.
 * @param {Object} selectedSubject - The subject to allocate.
 * @param {Array} todaySubjects - Array tracking subjects allocated today.
 */
const allocateSubject = (selectedSubject, todaySubjects) => {
  todaySubjects.push(selectedSubject.subject_id);
  selectedSubject.remaining_periods--;
};

/**
 * Updates the teacher's schedule to mark them as busy for a period.
 * @param {Object} teacherSchedule - The current teacher schedule.
 * @param {number} period - The current period.
 * @param {Object} selectedSubject - The allocated subject.
 */
const updateTeacherSchedule = (teacherSchedule, period, selectedSubject) => {
  const ptId = typeof PT_SUBJECT_ID !== "undefined" ? PT_SUBJECT_ID : undefined;

  if (selectedSubject.subject_id !== ptId) {
    if (!teacherSchedule[period]) {
      teacherSchedule[period] = {};
    }
    teacherSchedule[period][selectedSubject.teacher_id] = true;
  }
};

/**
 * Creates a standard timetable entry object.
 * @param {string} date - The date of the entry.
 * @param {Object} cls - The class object.
 * @param {number} period - The current period.
 * @param {number|string} subject_id - The subject ID.
 * @param {number|string} teacher_id - The teacher ID.
 * @returns {Object} The timetable entry.
 */
const createTimetableEntry = (date, cls, period, subject_id, teacher_id) => {
  return {
    date,
    class_id: cls.id,
    period,
    subject_id,
    teacher_id,
  };
};

export const validateGenerationDate = (date) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const todayDate = `${year}-${month}-${day}`;
  
  if (date < todayDate) {
    return {
      isValid: false,
      message: "Regenerating past days is not allowed. Only today or future dates can be generated."
    };
  }
  
  return { isValid: true };
};

export const generateTimetable = async (date, slipTestPeriods = 0, slipTestAllowedPeriod = 8) => {
  const dateValidation = validateGenerationDate(date);
  
  if (!dateValidation.isValid) {
    return {
      success: false,
      warnings: [dateValidation.message]
    };
  }

  const weekStartDate = getWeekStartDate(date);
  
  await initializeWeeklyProgress(weekStartDate);

  const existingEntries = await getTimetableForDate(date);
  if (existingEntries && existingEntries.length > 0) {
    await rollbackDailyProgress(date);
    await deleteTimetableForDate(date);
  }

  const { classes, mappings, progress, availability, fixedSlots } = await loadData(date);
  const weekSlipTests = await getSlipTestsForWeek(weekStartDate);

  const remainingPeriods = calculateRemainingPeriods(mappings, progress);

  const entries = [];
  const teacherSchedule = {};

  for (const cls of classes) {
    const classRemainingPeriods = remainingPeriods.filter(
      (r) => r.class_id === cls.id && r.remaining_periods > 0
    );

    const todaySubjects = [];
    const classEntries = [];

    const classSlipTestsCount = weekSlipTests.filter(st => st.class_id === cls.id).length;
    const assignSlipTestToday = classSlipTestsCount < slipTestPeriods;

    for (let period = 1; period <= 8; period++) {
      const currentDay = new Date(date).getDay();

      const fixedSlot = fixedSlots.find(
        (slot) =>
          slot.class_id === cls.id &&
          slot.day_of_week === currentDay &&
          slot.period === period
      );

      if (fixedSlot) {
  classEntries.push({
    date,
    class_id: cls.id,
    period,
    subject_id: null,
    teacher_id: null,
    slot_type: fixedSlot.type,
  });

  continue;
}

      if (period === slipTestAllowedPeriod && assignSlipTestToday) {
        const classTeacherId = cls.class_teacher_id;
        
        const isClassTeacherAvailable = 
          classTeacherId &&
          isTeacherAvailable(classTeacherId, period, availability) &&
          !teacherSchedule[period]?.[classTeacherId];

        if (isClassTeacherAvailable) {
          if (!teacherSchedule[period]) {
            teacherSchedule[period] = {};
          }
          teacherSchedule[period][classTeacherId] = true;
          
          classEntries.push({
            date,
            class_id: cls.id,
            period,
            subject_id: null,
            teacher_id: classTeacherId,
            slot_type: "Slip Test",
          });
          continue;
        }
      }

      const availableSubjects = getAvailableSubjects(
        classRemainingPeriods,
        todaySubjects,
        period,
        availability,
        teacherSchedule
      );

      const sortedSubjects = sortSubjects(availableSubjects);
      const selectedSubject = sortedSubjects[0];

      if (!selectedSubject) {
        continue;
      }

      updateTeacherSchedule(teacherSchedule, period, selectedSubject);
      allocateSubject(selectedSubject, todaySubjects);

      classEntries.push(
        createTimetableEntry(
          date,
          cls,
          period,
          selectedSubject.subject_id,
          selectedSubject.teacher_id
        )
      );
    }

    entries.push(...classEntries);
  }

  await saveTimetable(entries);
  const generatedCount = entries.length;
  const { updatedSubjects } = await updateWeeklyProgress(entries, weekStartDate);

  return {
    success: true,
    generatedCount,
    updatedSubjects,
    warnings: []
  };
};

export const getWeeklyProgress = async (weekStartDate) => {
  const { data, error } = await supabase
    .from("weekly_progress")
    .select("*")
    .eq("week_start_date", weekStartDate);

  if (error) throw error;

  return data;
};
export const getWeekStartDate = (date) => {
  const d = new Date(date);

  const day = d.getDay();

  const diff = day === 0 ? -6 : 1 - day;

  d.setDate(d.getDate() + diff);

  return d.toISOString().split("T")[0];
};
export const getTeacherAvailability = async (date) => {
  const { data, error } = await supabase
    .from("teacher_availability")
    .select("*")
    .eq("date", date);

  if (error) throw error;

  return data;
};

export const initializeWeeklyProgress = async (weekStartDate) => {
  try {
    const existingProgress = await getWeeklyProgress(weekStartDate);

    if (existingProgress && existingProgress.length > 0) {
      return;
    }

    const mappings = await getMappings();

    if (!mappings || mappings.length === 0) {
      return;
    }

    const progressEntries = mappings.map((mapping) => ({
      week_start_date: weekStartDate,
      class_id: mapping.class_id,
      subject_id: mapping.subject_id,
      required_periods: mapping.weekly_periods,
      completed_periods: 0,
      carry_forward_periods: 0,
    }));

    const { error } = await supabase
      .from("weekly_progress")
      .insert(progressEntries);

    if (error) throw error;
  } catch (error) {
    console.error("Error initializing weekly progress:", error);
    throw error;
  }
};

export const getTimetableForDate = async (date) => {
  const { data, error } = await supabase
    .from("timetable")
    .select("*")
    .eq("date", date);
  if (error) throw error;
  return data;
};

export const deleteTimetableForDate = async (date) => {
  const { error } = await supabase
    .from("timetable")
    .delete()
    .eq("date", date);
  if (error) throw error;
};

export const rollbackDailyProgress = async (date) => {
  const entries = await getTimetableForDate(date);
  if (!entries || entries.length === 0) return { updatedSubjects: 0 };
  
  const weekStartDate = getWeekStartDate(date);
  const progress = await getWeeklyProgress(weekStartDate);
  
  let updatedSubjects = 0;
  const updatesMap = {};
  
  for (const entry of entries) {
    if (entry.slot_type || !entry.subject_id) continue;
    
    const key = `${entry.class_id}_${entry.subject_id}`;
    if (!updatesMap[key]) {
      const progressRecord = progress.find(
        (p) => p.class_id === entry.class_id && p.subject_id === entry.subject_id
      );
      if (progressRecord) {
        updatesMap[key] = { ...progressRecord };
      }
    }
    
    if (updatesMap[key] && updatesMap[key].completed_periods > 0) {
      updatesMap[key].completed_periods -= 1;
      updatedSubjects++;
    }
  }
  
  const recordsToUpdate = Object.values(updatesMap);
  if (recordsToUpdate.length > 0) {
    await Promise.all(
      recordsToUpdate.map(async (record) => {
        const { error } = await supabase
          .from("weekly_progress")
          .update({ completed_periods: record.completed_periods })
          .eq("id", record.id);
        if (error) throw error;
      })
    );
  }
  
  return { updatedSubjects };
};

export const updateWeeklyProgress = async (entries, weekStartDate) => {
  if (!entries || entries.length === 0) return { updatedSubjects: 0 };
  
  const progress = await getWeeklyProgress(weekStartDate);
  let updatedSubjects = 0;
  const updatesMap = {};
  
  for (const entry of entries) {
    if (entry.slot_type || !entry.subject_id) continue;
    
    const key = `${entry.class_id}_${entry.subject_id}`;
    if (!updatesMap[key]) {
      const progressRecord = progress.find(
        (p) => p.class_id === entry.class_id && p.subject_id === entry.subject_id
      );
      if (progressRecord) {
        updatesMap[key] = { ...progressRecord };
      }
    }
    
    if (updatesMap[key]) {
      updatesMap[key].completed_periods += 1;
      updatedSubjects++;
    }
  }
  
  const recordsToUpdate = Object.values(updatesMap);
  if (recordsToUpdate.length > 0) {
    await Promise.all(
      recordsToUpdate.map(async (record) => {
        const { error } = await supabase
          .from("weekly_progress")
          .update({ completed_periods: record.completed_periods })
          .eq("id", record.id);
        if (error) throw error;
      })
    );
  }
  
  return { updatedSubjects };
};

export const saveGeneratedTimetable = async (entries) => {
  if (!entries || entries.length === 0) return 0;
  
  const validEntries = entries.filter(e => e.date && e.class_id && e.period);
  if (validEntries.length === 0) return 0;

  const { error } = await supabase
    .from("timetable")
    .insert(validEntries);

  if (error) throw error;
  return validEntries.length;
};

export const getTimetableByDateAndClass = async (
  date,
  classId
) => {
  const { data, error } = await supabase
  .from("timetable")
  .select(`
    *,
    subjects(*),
    teachers(*)
  `)
  .eq("date", date)
  .eq("class_id", classId);

if (error) throw error;

return data;

};

export const getSlipTestsForWeek = async (weekStartDate) => {
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);
  const weekEndDateStr = weekEndDate.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("timetable")
    .select("class_id")
    .gte("date", weekStartDate)
    .lte("date", weekEndDateStr)
    .eq("slot_type", "Slip Test");

  if (error) throw error;
  return data;
};