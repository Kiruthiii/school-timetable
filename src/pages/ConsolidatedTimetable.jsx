import { useState, useEffect, useMemo } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { PageHeader, Card, CardContent, Button } from "../components/ui";
import {
  Loader2,
  Calendar as CalendarIcon,
  AlertCircle,
  Play,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FileText,
  User,
  GraduationCap,
  LayoutGrid,
} from "lucide-react";
import {
  getConsolidatedTimetable,
  getClasses,
  getTimetableForDate,
  generateTimetable,
  generateWeeklySchedule,
  getTeacherAvailability,
} from "../services/timetableService";
import { getTeachers } from "../services/teacherService";
import { exportToPDF } from "../utils/pdfExporter";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function ConsolidatedTimetable() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [slipTestCount, setSlipTestCount] = useState(0);

  const todayDate = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayDate);

  const [timetable, setTimetable] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [error, setError] = useState(null);
  const [hasTimetable, setHasTimetable] = useState(false);
  const [dayAvailability, setDayAvailability] = useState([]);

  // View mode: 'master' | 'class' | 'teacher'
  const [viewMode, setViewMode] = useState("master");

  const checkExistingTimetable = async () => {
    setIsLoading(true);
    try {
      const existing = await getTimetableForDate(selectedDate);
      if (existing && existing.length > 0) {
        setHasTimetable(true);
      } else {
        setHasTimetable(false);
      }
    } catch (err) {
      console.error("Failed to check timetable", err);
      setHasTimetable(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTimetable = async (startDate, endDate) => {
    if (!startDate || !endDate) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getConsolidatedTimetable(startDate, endDate);
      setTimetable(data || []);
    } catch (err) {
      console.error("Failed to fetch consolidated timetable", err);
      setError("Failed to load timetable data. Please try again.");
      setTimetable([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clsData, teacherData] = await Promise.all([
          getClasses(),
          getTeachers(),
        ]);
        const sortedClasses = (clsData || []).sort((a, b) => {
          const numA = parseInt(a.class_name) || a.id;
          const numB = parseInt(b.class_name) || b.id;
          if (numA !== numB) return numA - numB;
          return a.class_name.localeCompare(b.class_name);
        });
        setClasses(sortedClasses);
        setTeachers(teacherData || []);
      } catch (error) {
        console.error("Failed to fetch initial data", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const records = await getTeacherAvailability(selectedDate);
        setDayAvailability(records || []);
      } catch (err) {
        console.error("Failed to fetch day availability", err);
      }
    };
    fetchAvailability();
    checkExistingTimetable();
  }, [selectedDate]);

  useEffect(() => {
    if (hasTimetable) {
      loadTimetable(selectedDate, selectedDate);
    } else {
      setTimetable([]);
    }
  }, [hasTimetable, selectedDate]);

  const handleGenerate = async () => {
    if (hasTimetable) {
      const confirmed = window.confirm(
        "Today's timetable already exists.\nDo you want to regenerate it?"
      );
      if (!confirmed) return;
    }

    setIsGenerating(true);
    try {
      const result = await generateTimetable(selectedDate, Number(slipTestCount), 8);
      if (result.success) {
        setHasTimetable(true);
        loadTimetable(selectedDate, selectedDate);
      } else {
        alert(
          "Generation failed: " +
            (result.warnings?.join(", ") || "Unknown error")
        );
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateWeek = async () => {
    const confirmed = window.confirm(
      "Do you want to generate/regenerate the timetable for the ENTIRE WEEK (Monday to Friday)?"
    );
    if (!confirmed) return;

    setIsGenerating(true);
    try {
      const result = await generateWeeklySchedule(selectedDate);
      if (result.success) {
        setHasTimetable(true);
        await loadTimetable(selectedDate, selectedDate);
        alert(
          `Weekly timetable generated successfully! (${result.totalGenerated} period slots created across Monday to Friday)`
        );
      } else {
        alert(
          "Weekly generation failed: " +
            (result.warnings?.join(", ") || "Unknown error")
        );
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during weekly generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviousDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next.toISOString().split("T")[0]);
  };

  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  const getEntry = (classId, period, date) => {
    return timetable.find(
      (entry) =>
        Number(entry.class_id) === Number(classId) &&
        Number(entry.period) === Number(period) &&
        entry.date === date
    );
  };

  const currentDayEntriesCount = timetable.filter(
    (entry) => entry.date === selectedDate
  ).length;

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      exportToPDF({
        date: selectedDate,
        classes,
        teachers,
        timetable,
      });
    } catch (err) {
      console.error("Failed to export PDF", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Derive unique teachers with memoization
  const teacherList = useMemo(() => {
    return teachers && teachers.length > 0
      ? teachers
      : Array.from(
          new Map(
            timetable
              .filter((t) => t.teachers)
              .map((t) => [t.teachers.id, t.teachers])
          ).values()
        ).sort((a, b) =>
          (a.teacher_name || "").localeCompare(b.teacher_name || "")
        );
  }, [teachers, timetable]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Consolidated Timetable"
          description="View, manage, and export the master schedule for classes and teachers as PDF"
        />

        {/* Date Selector & Action Buttons Card */}
        <Card className="border border-border/60 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm rounded-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="date-select"
                  className="text-sm font-semibold text-slate-700"
                >
                  Select Date
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handlePreviousDay}
                    disabled={isLoading || isGenerating}
                    className="px-3 py-2.5 shadow-sm"
                    title="Previous Day"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalendarIcon className="size-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                      type="date"
                      id="date-select"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      disabled={isLoading || isGenerating}
                      className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 font-medium hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full sm:w-auto shadow-sm"
                    />
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleNextDay}
                    disabled={isLoading || isGenerating}
                    className="px-3 py-2.5 shadow-sm"
                    title="Next Day"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
                {dayAvailability.length > 0 && (
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg max-w-md">
                    <AlertCircle className="size-3.5 shrink-0 text-red-600" />
                    <span>
                      <strong className="font-bold">Leave for this date:</strong>{" "}
                      {dayAvailability.map((a) => {
                        const t = teachers.find((teacher) => String(teacher.id) === String(a.teacher_id));
                        return `${t?.teacher_name || 'Teacher'} (${a.status}${a.session ? `-${a.session}` : ''})`;
                      }).join(", ")}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <label htmlFor="slip-test-count" className="text-sm font-semibold text-slate-700">
                  Slip Test Count
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    id="slip-test-count"
                    min="0"
                    max="5"
                    value={slipTestCount}
                    onChange={(e) => setSlipTestCount(e.target.value)}
                    disabled={isLoading || isGenerating}
                    className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 font-medium hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-24 shadow-sm"
                  />
                </div>
              </div>

              {/* View Switcher Tabs & Actions */}
              <div className="flex flex-wrap items-center gap-3">
                {hasTimetable && currentDayEntriesCount > 0 && (
                  <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200">
                    Total Generated Periods: <span className="text-primary font-bold">{currentDayEntriesCount}</span>
                  </div>
                )}

                {/* View Tabs */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setViewMode("master")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all",
                      viewMode === "master"
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <LayoutGrid className="size-3.5" />
                    Master Grid
                  </button>
                  <button
                    onClick={() => setViewMode("class")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all",
                      viewMode === "class"
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <GraduationCap className="size-3.5" />
                    Class Schedules
                  </button>
                  <button
                    onClick={() => setViewMode("teacher")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all",
                      viewMode === "teacher"
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <User className="size-3.5" />
                    Teacher Schedules
                  </button>
                </div>

                {/* Direct Export PDF Button */}
                <Button
                  variant="outline"
                  onClick={handleExportPDF}
                  disabled={!hasTimetable || currentDayEntriesCount === 0 || isLoading || isExportingPDF}
                  className="flex items-center gap-2 border-red-200 text-red-700 bg-red-50/50 hover:bg-red-100/60 shadow-sm font-semibold"
                >
                  {isExportingPDF ? (
                    <>
                      <Loader2 className="size-4 animate-spin text-red-600" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="size-4 text-red-600" />
                      <span>Export PDF</span>
                    </>
                  )}
                </Button>

                {/* Generate / Regenerate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isLoading || isGenerating}
                  className="w-full sm:w-auto"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : hasTimetable ? (
                    <>
                      <RefreshCw className="size-4 mr-2" />
                      Regenerate Day
                    </>
                  ) : (
                    <>
                      <Play className="size-4 mr-2" />
                      Generate Day
                    </>
                  )}
                </Button>

                {/* Generate Full Week Button */}
                <Button
                  variant="outline"
                  onClick={handleGenerateWeek}
                  disabled={isLoading || isGenerating}
                  className="w-full sm:w-auto border-primary/30 text-primary hover:bg-primary/5 font-semibold"
                  title="Generate timetable for Monday to Friday of this week"
                >
                  <CalendarIcon className="size-4 mr-2 text-primary" />
                  <span>Generate Full Week</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timetable Content View */}
        <Card className="border border-border/60 shadow-sm overflow-hidden bg-white rounded-2xl">
          <CardContent className="p-0 overflow-hidden" id="printable-timetable">
            {error ? (
              <div className="flex flex-col items-center justify-center p-16 text-red-500 bg-red-50/50">
                <AlertCircle className="size-10 mb-4 text-red-400" />
                <p className="font-medium text-lg">{error}</p>
              </div>
            ) : isLoading || isGenerating ? (
              <div className="flex flex-col items-center justify-center p-24 text-slate-500">
                <div className="relative">
                  <Loader2 className="size-10 animate-spin text-primary/30" />
                  <Loader2
                    className="size-10 animate-spin text-primary absolute top-0 left-0"
                    style={{
                      animationDirection: "reverse",
                      animationDuration: "3s",
                    }}
                  />
                </div>
                <p className="mt-4 font-medium animate-pulse text-slate-600">
                  {isGenerating
                    ? "Generating master schedule..."
                    : "Loading master schedule..."}
                </p>
              </div>
            ) : classes.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-24 text-slate-500 bg-slate-50/50">
                <CalendarIcon className="size-12 mb-4 text-slate-300" />
                <p className="font-medium text-lg text-slate-600">
                  No classes available.
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Please ensure classes are set up in the system.
                </p>
              </div>
            ) : !hasTimetable || currentDayEntriesCount === 0 ? (
              <div className="flex flex-col items-center justify-center p-24 text-slate-500 bg-slate-50/50">
                <CalendarIcon className="size-12 mb-4 text-slate-300" />
                <p className="font-medium text-lg text-slate-600">
                  No timetable generated for today.
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Click "Generate Timetable" to create the schedule for{" "}
                  {new Date(selectedDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                  .
                </p>
              </div>
            ) : viewMode === "master" ? (
              /* ========================================================= */
              /* MASTER GRID VIEW                                           */
              /* ========================================================= */
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <table className="w-full text-left border-collapse min-w-max">
                  <thead>
                    <tr className="bg-slate-50/80">
                      <th className="py-4 px-4 font-bold text-slate-700 border-b border-r border-slate-200 min-w-[100px] text-center sticky left-0 top-0 bg-slate-50/95 backdrop-blur shadow-[1px_0_0_0_#e2e8f0,0_1px_0_0_#e2e8f0] z-20">
                        Period
                      </th>
                      {classes.map((cls) => (
                        <th
                          key={cls.id}
                          className="py-4 px-6 font-bold text-slate-700 text-center border-b border-r border-slate-200 min-w-[220px] bg-slate-50/80 sticky top-0 z-10"
                        >
                          Class {cls.class_name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {periods.map((period) => (
                      <tr
                        key={period}
                        className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="py-4 px-4 font-bold text-slate-600 border-r border-slate-200 text-center sticky left-0 bg-white group-hover:bg-slate-50/95 shadow-[1px_0_0_0_#e2e8f0] z-10 transition-colors">
                          <div className="bg-slate-100 text-slate-600 size-10 rounded-full flex items-center justify-center mx-auto shadow-inner border border-slate-200/60 font-semibold">
                            {period}
                          </div>
                        </td>
                        {classes.map((cls) => {
                          const entry = getEntry(cls.id, period, selectedDate);

                          if (!entry) {
                            return (
                              <td
                                key={`${cls.id}-${period}`}
                                className="py-4 px-6 border-r border-slate-100 text-center bg-slate-50/30"
                              >
                                <div className="flex flex-col items-center justify-center p-3 rounded-xl h-full min-h-[90px] border border-dashed border-slate-200 bg-slate-50/50">
                                  <span className="text-slate-400 text-sm font-medium">
                                    Not Allocated
                                  </span>
                                </div>
                              </td>
                            );
                          }

                          const isSlipTest = entry.slot_type === "Slip Test";
                          const isAssembly = entry.slot_type === "Assembly";
                          const isECA = entry.slot_type === "ECA";
                          const isFixed =
                            !!entry.slot_type &&
                            !isSlipTest &&
                            !isAssembly &&
                            !isECA;

                          return (
                            <td
                              key={`${cls.id}-${period}`}
                              className="py-3 px-4 border-r border-slate-100 relative group/cell"
                            >
                              <div
                                className={cn(
                                  "flex flex-col items-center justify-center p-3.5 rounded-xl h-full min-h-[90px] border transition-all duration-300 shadow-sm",
                                  isSlipTest
                                    ? "bg-purple-50/80 border-purple-200/60 hover:bg-purple-100/80 hover:border-purple-300"
                                    : isAssembly
                                    ? "bg-blue-50/80 border-blue-200/60 hover:bg-blue-100/80 hover:border-blue-300"
                                    : isECA
                                    ? "bg-green-50/80 border-green-200/60 hover:bg-green-100/80 hover:border-green-300"
                                    : isFixed
                                    ? "bg-indigo-50/80 border-indigo-200/60 hover:bg-indigo-100/80 hover:border-indigo-300"
                                    : "bg-white border-slate-200/80 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"
                                )}
                              >
                                {isSlipTest ? (
                                  <>
                                    <span className="font-bold text-purple-700 tracking-tight">
                                      Slip Test
                                    </span>
                                    <span className="text-xs font-medium text-purple-600/80 mt-1.5 bg-purple-100/50 px-2.5 py-0.5 rounded-full">
                                      Class Teacher
                                    </span>
                                  </>
                                ) : isAssembly ? (
                                  <>
                                    <span className="font-bold text-blue-700 tracking-tight">
                                      Assembly
                                    </span>
                                  </>
                                ) : isECA ? (
                                  <>
                                    <span className="font-bold text-green-700 tracking-tight">
                                      ECA
                                    </span>
                                  </>
                                ) : isFixed ? (
                                  <>
                                    <span className="font-bold text-indigo-700 tracking-tight">
                                      {entry.slot_type}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span className="font-bold text-slate-800 text-center leading-tight">
                                      {entry.subjects?.subject_name ||
                                        "Unknown Subject"}
                                    </span>
                                    <div className="flex items-center gap-1.5 mt-2">
                                      <div className="size-1.5 rounded-full bg-primary/40"></div>
                                      <span className="text-[13px] font-semibold text-slate-500">
                                        {entry.teachers?.teacher_name ||
                                          "No Teacher"}
                                      </span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : viewMode === "class" ? (
              /* ========================================================= */
              /* CLASS-WISE VIEW                                           */
              /* ========================================================= */
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <table className="w-full text-left border-collapse min-w-max">
                  <thead>
                    <tr className="bg-slate-50/80">
                      <th className="py-4 px-6 font-bold text-slate-700 border-b border-r border-slate-200 min-w-[160px]">
                        Class Name
                      </th>
                      {periods.map((p) => (
                        <th
                          key={p}
                          className="py-4 px-4 font-bold text-slate-700 text-center border-b border-r border-slate-200 min-w-[180px]"
                        >
                          Period {p}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((cls) => (
                      <tr
                        key={cls.id}
                        className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-4 px-6 font-bold text-slate-800 border-r border-slate-200 bg-slate-50/30">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="size-4 text-primary" />
                            <span>Class {cls.class_name}</span>
                          </div>
                        </td>
                        {periods.map((period) => {
                          const entry = getEntry(cls.id, period, selectedDate);
                          if (!entry) {
                            return (
                              <td
                                key={period}
                                className="py-3 px-3 border-r border-slate-100 text-center text-xs text-slate-400 bg-slate-50/20"
                              >
                                Not Allocated
                              </td>
                            );
                          }
                          return (
                            <td
                              key={period}
                              className="py-3 px-4 border-r border-slate-100 text-center"
                            >
                              <div className="font-semibold text-sm text-slate-800">
                                {entry.slot_type || entry.subjects?.subject_name}
                              </div>
                              {entry.teachers?.teacher_name && (
                                <div className="text-xs text-slate-500 mt-0.5">
                                  {entry.teachers.teacher_name}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* ========================================================= */
              /* TEACHER-WISE VIEW                                         */
              /* ========================================================= */
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <table className="w-full text-left border-collapse min-w-max">
                  <thead>
                    <tr className="bg-slate-50/80">
                      <th className="py-4 px-6 font-bold text-slate-700 border-b border-r border-slate-200 min-w-[200px] sticky left-0 bg-slate-50/95 z-20">
                        Teacher Name
                      </th>
                      {periods.map((p) => (
                        <th
                          key={p}
                          className="py-4 px-4 font-bold text-slate-700 text-center border-b border-r border-slate-200 min-w-[170px]"
                        >
                          Period {p}
                        </th>
                      ))}
                      <th className="py-4 px-4 font-bold text-slate-700 text-center border-b border-slate-200 min-w-[120px]">
                        Load (Free/Total)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {teacherList.map((teacher) => {
                      let assignedCount = 0;

                      return (
                        <tr
                          key={teacher.id}
                          className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="py-4 px-6 font-bold text-slate-800 border-r border-slate-200 bg-white sticky left-0 z-10 shadow-[1px_0_0_0_#e2e8f0]">
                            <div className="flex items-center gap-2">
                              <User className="size-4 text-amber-500" />
                              <span>{teacher.teacher_name}</span>
                            </div>
                          </td>
                          {periods.map((period) => {
                            const teacherEntries = timetable.filter(
                              (t) =>
                                Number(t.teacher_id) === Number(teacher.id) &&
                                Number(t.period) === Number(period) &&
                                t.date === selectedDate
                            );

                            if (teacherEntries.length === 0) {
                              return (
                                <td
                                  key={period}
                                  className="py-3 px-3 border-r border-slate-100 text-center bg-slate-50/30"
                                >
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                                    Free
                                  </span>
                                </td>
                              );
                            }

                            assignedCount++;
                            return (
                              <td
                                key={period}
                                className="py-3 px-4 border-r border-slate-100 text-center bg-amber-50/30"
                              >
                                {teacherEntries.map((e) => (
                                  <div key={e.id} className="text-xs font-semibold text-slate-800">
                                    <span className="text-amber-700 font-bold">
                                      Class {e.classes?.class_name}
                                    </span>
                                    <div className="text-slate-500 font-medium mt-0.5">
                                      {e.subjects?.subject_name || e.slot_type}
                                    </div>
                                  </div>
                                ))}
                              </td>
                            );
                          })}
                          <td className="py-3 px-4 text-center font-bold text-xs text-slate-600">
                            <span className="text-emerald-600">
                              {8 - assignedCount} Free
                            </span>{" "}
                            /{" "}
                            <span className="text-amber-600">
                              {assignedCount} Assigned
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

export default ConsolidatedTimetable;
