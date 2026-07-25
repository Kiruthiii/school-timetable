/* global PT_SUBJECT_ID */
import { supabase } from "./supabase.js";
export const getMappings = async () => {
  const { data, error } = await supabase
    .from("class_subject_teacher")
    .select(`
      *,
      subjects (
        priority,
        subject_name
      ),
      teachers (
        teacher_name
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
 * Calculates how many legal future placements remain for this subject today.
 */
const calculateFuturePlacementCount = (candidate, cls, currentPeriod, teacherSchedule, teacherAvailability, fixedSlots, currentDay) => {
  let count = 0;
  const ptId = typeof PT_SUBJECT_ID !== "undefined" ? PT_SUBJECT_ID : undefined;

  for (let p = currentPeriod + 1; p <= 8; p++) {
    const fixedSlot = fixedSlots.find(
      (slot) => slot.class_id === cls.id && slot.day_of_week === currentDay && slot.period === p
    );
    if (fixedSlot) continue;

    if (!isTeacherAvailable(candidate.teacher_id, p, teacherAvailability)) continue;

    if (candidate.subject_id !== ptId && teacherSchedule[p]?.[candidate.teacher_id]) continue;

    count++;
  }
  return count;
};

/**
 * Calculates remaining available slots for a teacher today.
 */
const calculateTeacherScarcity = (teacherId, currentPeriod, teacherSchedule, teacherAvailability) => {
  let availableSlots = 0;
  for (let p = currentPeriod + 1; p <= 8; p++) {
    if (isTeacherAvailable(teacherId, p, teacherAvailability) && !teacherSchedule[p]?.[teacherId]) {
      availableSlots++;
    }
  }
  return availableSlots;
};

/**
 * Sorts subjects using a multi-factor greedy ranking.
 */
const sortSubjects = (
  subjects,
  cls,
  currentPeriod,
  teacherSchedule,
  teacherAvailability,
  fixedSlots,
  currentDay
) => {
  const subjectsWithMetrics = subjects.map((subject) => {
    const futurePlacementCount = calculateFuturePlacementCount(
      subject,
      cls,
      currentPeriod,
      teacherSchedule,
      teacherAvailability,
      fixedSlots,
      currentDay
    );
    const teacherScarcity = calculateTeacherScarcity(
      subject.teacher_id,
      currentPeriod,
      teacherSchedule,
      teacherAvailability
    );

    const subjectName = subject.subjects?.subject_name || "Unknown";

    console.log(
      `Candidate: ${subjectName} | Priority: ${subject.priority} | Future Slots: ${futurePlacementCount} | Teacher Free Slots: ${teacherScarcity} | Remaining Weekly: ${subject.remaining_periods}`
    );

    return {
      ...subject,
      futurePlacementCount,
      teacherScarcity,
      subjectName,
    };
  });

  subjectsWithMetrics.sort((a, b) => {
    // 1. Subject Priority (Lower number = higher priority)
    if (a.priority !== b.priority) return a.priority - b.priority;
    // 2. Least Flexible Subject (Fewer future placements first)
    if (a.futurePlacementCount !== b.futurePlacementCount) return a.futurePlacementCount - b.futurePlacementCount;
    // 3. Teacher Scarcity (Fewer remaining free slots first)
    if (a.teacherScarcity !== b.teacherScarcity) return a.teacherScarcity - b.teacherScarcity;
    // 4. Remaining Weekly Periods (More remaining periods first)
    if (a.remaining_periods !== b.remaining_periods) return b.remaining_periods - a.remaining_periods;
    // 5. Stable Sort (Alphabetical by Subject Name)
    return a.subjectName.localeCompare(b.subjectName);
  });

  return subjectsWithMetrics;
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

const undoLastAllocation = (
  historyItem,
  classRemainingPeriods,
  teacherSchedule,
  todaySubjects,
  classEntries
) => {
  // 1. Restore teacherSchedule
  Object.keys(teacherSchedule).forEach(k => delete teacherSchedule[k]);
  const snapTS = historyItem.snapshotBeforeAllocation.teacherSchedule;
  Object.keys(snapTS).forEach(k => {
    teacherSchedule[k] = { ...snapTS[k] };
  });

  // 2. Restore todaySubjects
  todaySubjects.length = 0;
  todaySubjects.push(...historyItem.snapshotBeforeAllocation.todaySubjects);

  // 3. Restore remainingPeriods
  const snapRP = historyItem.snapshotBeforeAllocation.remainingPeriods;
  snapRP.forEach(snapItem => {
    const originalItem = classRemainingPeriods.find(
      r => r.class_id === snapItem.class_id && r.subject_id === snapItem.subject_id
    );
    if (originalItem) {
      originalItem.remaining_periods = snapItem.remaining_periods;
    }
  });

  // 4. Restore classEntries
  for (let i = classEntries.length - 1; i >= 0; i--) {
    if (classEntries[i].period >= historyItem.period) {
      classEntries.splice(i, 1);
    }
  }
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

    let period = 1;
    const allocationHistory = [];

    while (period <= 8) {
      const currentDay = new Date(date).getDay();

      console.log(`\n--- Evaluating Day: ${new Date(date).toLocaleDateString('en-US', {weekday:'long'})}, Period: ${period}, Class: ${cls.class_name} ---`);

      const fixedSlot = fixedSlots.find(
        (slot) =>
          slot.class_id === cls.id &&
          slot.day_of_week === currentDay &&
          slot.period === period
      );

      if (fixedSlot) {
        console.log(`Fixed slot found: ${fixedSlot.type}`);
        classEntries.push({
          date,
          class_id: cls.id,
          period,
          subject_id: null,
          teacher_id: null,
          slot_type: fixedSlot.type,
        });
        period++;
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
          
          console.log(`Assigned Slip Test with class teacher ID: ${classTeacherId}`);
          classEntries.push({
            date,
            class_id: cls.id,
            period,
            subject_id: null,
            teacher_id: classTeacherId,
            slot_type: "Slip Test",
          });
          period++;
          continue;
        }
      }

      const classAllMappings = mappings.filter(m => m.class_id === cls.id);
      
      const availableSubjects = [];
      
      const ptId = typeof PT_SUBJECT_ID !== "undefined" ? PT_SUBJECT_ID : undefined;

      for (const mapping of classAllMappings) {
        let isRejected = false;
        let reasons = [];
        
        const rem = classRemainingPeriods.find(r => r.subject_id === mapping.subject_id);
        if (!rem || rem.remaining_periods <= 0) {
          isRejected = true;
          reasons.push("Weekly requirement completed");
        }
        
        if (!isRejected && todaySubjects.includes(mapping.subject_id)) {
          isRejected = true;
          reasons.push("Already taught today");
        }
        
        if (!isRejected) {
          const availRecord = availability.find(a => a.teacher_id === mapping.teacher_id);
          if (availRecord) {
            if (availRecord.status === "Leave") {
              isRejected = true;
              reasons.push("Teacher Leave");
            } else if (availRecord.status === "Half Day") {
              if (availRecord.session === "Morning" && period <= 4) {
                isRejected = true;
                reasons.push("Half Day Restriction");
              } else if (availRecord.session === "Afternoon" && period >= 5) {
                isRejected = true;
                reasons.push("Half Day Restriction");
              }
            }
          }
        }
        
        if (!isRejected && mapping.subject_id !== ptId && teacherSchedule[period]?.[mapping.teacher_id]) {
          isRejected = true;
          reasons.push("Teacher already occupied");
        }
        
        const subjectName = mapping.subjects?.subject_name || 'Unknown';
        if (isRejected) {
          console.log(`Candidate: ${subjectName} -> REJECTED: ${reasons.join(', ')}`);
        } else {
          console.log(`Candidate: ${subjectName} -> ELIGIBLE`);
          availableSubjects.push(rem);
        }
      }

      if (availableSubjects.length === 0) {
        let restored = false;
        let localBacktracks = 0;
        
        if (allocationHistory.length > 0) {
            console.log(`\n==================================================`);
            console.log(`FAILURE: No eligible subjects for Class ${cls.class_name}, Period ${period}.`);
            console.log(`Initiating Backtracking...`);
            console.log(`==================================================`);
            
            while (allocationHistory.length > 0 && localBacktracks < 3) {
                const lastAlloc = allocationHistory.pop();
                undoLastAllocation(lastAlloc, classRemainingPeriods, teacherSchedule, todaySubjects, classEntries);
                localBacktracks++;
                
                if (lastAlloc.alternativeCandidates && lastAlloc.alternativeCandidates.length > 0) {
                    const alternative = lastAlloc.alternativeCandidates[0];
                    const remainingAlternatives = lastAlloc.alternativeCandidates.slice(1);
                    
                    console.log(`Backtracked to Period ${lastAlloc.period}. Trying alternative: ${alternative.subjects?.subject_name || 'Unknown'}`);
                    
                    const snapshotBeforeAllocation = {
                        todaySubjects: [...todaySubjects],
                        teacherSchedule: JSON.parse(JSON.stringify(teacherSchedule)),
                        remainingPeriods: classRemainingPeriods.map(r => ({ class_id: r.class_id, subject_id: r.subject_id, remaining_periods: r.remaining_periods }))
                    };
                    
                    updateTeacherSchedule(teacherSchedule, lastAlloc.period, alternative);
                    allocateSubject(alternative, todaySubjects);
                    
                    classEntries.push(
                        createTimetableEntry(
                            date,
                            cls,
                            lastAlloc.period,
                            alternative.subject_id,
                            alternative.teacher_id
                        )
                    );
                    
                    allocationHistory.push({
                        classId: cls.id,
                        day: currentDay,
                        period: lastAlloc.period,
                        chosenSubject: alternative,
                        chosenTeacher: alternative.teacher_id,
                        alternativeCandidates: remainingAlternatives,
                        snapshotBeforeAllocation
                    });
                    
                    period = lastAlloc.period + 1;
                    restored = true;
                    break;
                } else {
                    console.log(`No alternatives for Period ${lastAlloc.period}. Backtracking further...`);
                }
            }
        }
        
        if (restored) {
            continue;
        }

        console.log(`\n==================================================`);
        console.log(`FAILURE: Unresolved slot reached after backtracking (or no history).`);
        console.log(`Class: ${cls.class_name}, Period: ${period}`);
        console.log(`==================================================`);
        
        console.log(`\n1. Every mapped subject for ${cls.class_name}:`);
        for (const mapping of classAllMappings) {
          const subjectName = mapping.subjects?.subject_name || 'Unknown';
          const teacherName = mapping.teachers?.teacher_name || 'Unknown';
          const rem = classRemainingPeriods.find(r => r.subject_id === mapping.subject_id);
          const remainingPeriods = rem ? rem.remaining_periods : 0;
          
          let alreadyTaught = todaySubjects.includes(mapping.subject_id) ? "Yes" : "No";
          let teacherOccupied = (mapping.subject_id !== ptId && teacherSchedule[period]?.[mapping.teacher_id]) ? "Yes" : "No";
          
          let teacherUnavailable = "No";
          const availRecord = availability.find(a => a.teacher_id === mapping.teacher_id);
          if (availRecord) {
            if (availRecord.status === "Leave") teacherUnavailable = "Yes (Leave)";
            else if (availRecord.status === "Half Day") {
              if (availRecord.session === "Morning" && period <= 4) teacherUnavailable = "Yes (Half Day Morning)";
              else if (availRecord.session === "Afternoon" && period >= 5) teacherUnavailable = "Yes (Half Day Afternoon)";
            }
          }
          
          const fixedConflict = "No";
          const consecutive = "No";
          
          let eligible = "Yes";
          let rejectReason = "";
          
          if (remainingPeriods <= 0) { eligible = "No"; rejectReason = "Weekly Requirement Completed"; }
          else if (alreadyTaught === "Yes") { eligible = "No"; rejectReason = "Already taught today"; }
          else if (teacherUnavailable !== "No") { eligible = "No"; rejectReason = "Teacher Unavailable"; }
          else if (teacherOccupied === "Yes") { eligible = "No"; rejectReason = "Teacher already occupied"; }
          
          console.log(`\n${subjectName}`);
          console.log(`Teacher: ${teacherName} (ID: ${mapping.teacher_id})`);
          console.log(`Remaining Weekly Periods: ${remainingPeriods}`);
          console.log(`Already taught today? ${alreadyTaught}`);
          console.log(`Teacher occupied? ${teacherOccupied}`);
          console.log(`Teacher unavailable? ${teacherUnavailable}`);
          console.log(`Fixed slot conflict? ${fixedConflict}`);
          console.log(`Consecutive restriction? ${consecutive}`);
          console.log(`Eligible? ${eligible}`);
          if (eligible === "No") console.log(`Reason: ${rejectReason}`);
        }
        
        console.log(`\n4. Complete teacher schedule for Period ${period}:`);
        const scheduleForPeriod = teacherSchedule[period] || {};
        console.log(`Teacher ID      Assigned`);
        Object.keys(scheduleForPeriod).forEach(tid => {
          console.log(`${tid.padEnd(15)} Yes`);
        });
        
        console.log(`\n5. Subjects already allocated today for ${cls.class_name}:`);
        console.log(todaySubjects.map(id => {
          const m = classAllMappings.find(cm => cm.subject_id === id);
          return m ? m.subjects?.subject_name : id;
        }));
        
        console.log(`\n6. Remaining weekly periods for every subject in ${cls.class_name}:`);
        classRemainingPeriods.forEach(r => {
          console.log(`${r.subjects?.subject_name}: ${r.remaining_periods}`);
        });

        console.error(`Generation failed at Class ${cls.class_name}, Period ${period}. No eligible subjects available.`);
        return { 
            success: false, 
            warnings: [`Generation Failed: Class ${cls.class_name}, Period ${period} could not be resolved. Tried local backtracking.`] 
        };
      }

      console.log(`\n--- Ranking Candidates ---`);
      const sortedSubjects = sortSubjects(
        availableSubjects,
        cls,
        period,
        teacherSchedule,
        availability,
        fixedSlots,
        currentDay
      );
      const selectedSubject = sortedSubjects[0];
      const alternativeCandidates = sortedSubjects.slice(1);

      console.log(`SELECTED SUBJECT: ${selectedSubject.subjectName || 'Unknown'}`);

      const snapshotBeforeAllocation = {
          todaySubjects: [...todaySubjects],
          teacherSchedule: JSON.parse(JSON.stringify(teacherSchedule)),
          remainingPeriods: classRemainingPeriods.map(r => ({ class_id: r.class_id, subject_id: r.subject_id, remaining_periods: r.remaining_periods }))
      };

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

      allocationHistory.push({
          classId: cls.id,
          day: currentDay,
          period: period,
          chosenSubject: selectedSubject,
          chosenTeacher: selectedSubject.teacher_id,
          alternativeCandidates: alternativeCandidates,
          snapshotBeforeAllocation
      });

      period++;
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

export const getConsolidatedTimetable = async (startDate, endDate) => {
  const { data, error } = await supabase
    .from("timetable")
    .select(`
      *,
      classes(*),
      subjects(*),
      teachers(*)
    `)
    .gte("date", startDate)
    .lte("date", endDate);

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