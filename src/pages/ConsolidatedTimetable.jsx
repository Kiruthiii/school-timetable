import { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { PageHeader, Card, CardContent, Button } from "../components/ui";
import { Download, Upload, Loader2, Calendar as CalendarIcon, FileSpreadsheet, AlertCircle } from "lucide-react";
import { getConsolidatedTimetable, getClasses } from "../services/timetableService";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Helper to get week dates based on a selected date
const getWeekDates = (currentDate) => {
  const date = new Date(currentDate);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  
  const weekDays = [];
  for (let i = 0; i < 6; i++) { // Monday to Saturday
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + i);
    weekDays.push({
      name: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i],
      date: dayDate.toISOString().split('T')[0],
      dayIndex: i + 1
    });
  }
  return weekDays;
};

function ConsolidatedTimetable() {
  const [classes, setClasses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [timetable, setTimetable] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [weekDays, setWeekDays] = useState([]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await getClasses();
        const sorted = data.sort((a, b) => {
          const numA = parseInt(a.class_name) || a.id;
          const numB = parseInt(b.class_name) || b.id;
          if (numA !== numB) return numA - numB;
          return a.class_name.localeCompare(b.class_name);
        });
        setClasses(sorted);
      } catch (error) {
        console.error("Failed to fetch classes", error);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    const days = getWeekDates(selectedDate);
    setWeekDays(days);
    loadTimetable(days[0].date, days[5].date);
  }, [selectedDate]);

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

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleTabClick = (dateStr) => {
    setSelectedDate(dateStr);
  };

  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  const getEntry = (classId, period, date) => {
    return timetable.find(entry => 
      Number(entry.class_id) === Number(classId) && 
      Number(entry.period) === Number(period) && 
      entry.date === date
    );
  };

  const currentDayEntriesCount = timetable.filter(entry => entry.date === selectedDate).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Consolidated Timetable"
          description="View the master schedule across all classes for a specific day"
          action={
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto shadow-sm hover:bg-slate-50 transition-colors">
                <FileSpreadsheet className="size-4 mr-2 text-primary" aria-hidden="true" />
                Export CSV
              </Button>
            </div>
          }
        />

        <Card className="border border-border/60 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm rounded-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="date-select" className="text-sm font-semibold text-slate-700">
                  Select Week By Date
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon className="size-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="date"
                    id="date-select"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 font-medium hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full sm:w-auto shadow-sm"
                  />
                </div>
              </div>

              {/* Day Tabs */}
              <div className="flex bg-slate-100/80 p-1.5 rounded-xl overflow-x-auto w-full lg:w-auto scrollbar-hide border border-slate-200/60 shadow-inner">
                {weekDays.map((day) => {
                  const isActive = selectedDate === day.date;
                  return (
                    <button
                      key={day.date}
                      onClick={() => handleTabClick(day.date)}
                      className={cn(
                        "whitespace-nowrap px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 flex flex-col items-center min-w-[100px]",
                        isActive 
                          ? "bg-white text-primary shadow-sm ring-1 ring-slate-200 scale-100" 
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 scale-95 hover:scale-100"
                      )}
                    >
                      <span>{day.name}</span>
                      <span className={cn(
                        "text-[10px] mt-0.5",
                        isActive ? "text-primary/70 font-medium" : "text-slate-400"
                      )}>
                        {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timetable Grid */}
        <Card className="border border-border/60 shadow-sm overflow-hidden bg-white rounded-2xl">
          <CardContent className="p-0 overflow-hidden">
            {error ? (
              <div className="flex flex-col items-center justify-center p-16 text-red-500 bg-red-50/50">
                <AlertCircle className="size-10 mb-4 text-red-400" />
                <p className="font-medium text-lg">{error}</p>
              </div>
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center p-24 text-slate-500">
                <div className="relative">
                  <Loader2 className="size-10 animate-spin text-primary/30" />
                  <Loader2 className="size-10 animate-spin text-primary absolute top-0 left-0" style={{ animationDirection: 'reverse', animationDuration: '3s' }} />
                </div>
                <p className="mt-4 font-medium animate-pulse text-slate-600">Loading master schedule...</p>
              </div>
            ) : classes.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-24 text-slate-500 bg-slate-50/50">
                <CalendarIcon className="size-12 mb-4 text-slate-300" />
                <p className="font-medium text-lg text-slate-600">No classes available.</p>
                <p className="text-sm text-slate-400 mt-1">Please ensure classes are set up in the system.</p>
              </div>
            ) : currentDayEntriesCount === 0 ? (
              <div className="flex flex-col items-center justify-center p-24 text-slate-500 bg-slate-50/50">
                <CalendarIcon className="size-12 mb-4 text-slate-300" />
                <p className="font-medium text-lg text-slate-600">No timetable generated for this date.</p>
                <p className="text-sm text-slate-400 mt-1">Go to the Class Timetable page to generate the schedule.</p>
              </div>
            ) : (
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <table className="w-full text-left border-collapse min-w-max">
                  <thead>
                    <tr className="bg-slate-50/80">
                      <th className="py-4 px-4 font-bold text-slate-700 border-b border-r border-slate-200 min-w-[100px] text-center sticky left-0 top-0 bg-slate-50/95 backdrop-blur shadow-[1px_0_0_0_#e2e8f0,0_1px_0_0_#e2e8f0] z-20">
                        Period
                      </th>
                      {classes.map((cls) => (
                        <th key={cls.id} className="py-4 px-6 font-bold text-slate-700 text-center border-b border-r border-slate-200 min-w-[220px] bg-slate-50/80 sticky top-0 z-10">
                          Class {cls.class_name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {periods.map((period) => (
                      <tr key={period} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                        <td className="py-4 px-4 font-bold text-slate-600 border-r border-slate-200 text-center sticky left-0 bg-white group-hover:bg-slate-50/95 shadow-[1px_0_0_0_#e2e8f0] z-10 transition-colors">
                          <div className="bg-slate-100 text-slate-600 size-10 rounded-full flex items-center justify-center mx-auto shadow-inner border border-slate-200/60 font-semibold">
                            {period}
                          </div>
                        </td>
                        {classes.map((cls) => {
                          const entry = getEntry(cls.id, period, selectedDate);
                          
                          if (!entry) {
                            return (
                              <td key={`${cls.id}-${period}`} className="py-4 px-6 border-r border-slate-100 text-center bg-slate-50/30">
                                <div className="flex flex-col items-center justify-center p-3 rounded-xl h-full min-h-[90px] border border-dashed border-slate-200 bg-slate-50/50">
                                  <span className="text-slate-400 text-sm font-medium">Not Allocated</span>
                                </div>
                              </td>
                            );
                          }

                          const isSlipTest = entry.slot_type === "Slip Test";
                          const isAssembly = entry.slot_type === "Assembly";
                          const isECA = entry.slot_type === "ECA";
                          const isFixed = !!entry.slot_type && !isSlipTest && !isAssembly && !isECA;

                          return (
                            <td key={`${cls.id}-${period}`} className="py-3 px-4 border-r border-slate-100 relative group/cell">
                              <div className={cn(
                                "flex flex-col items-center justify-center p-3.5 rounded-xl h-full min-h-[90px] border transition-all duration-300 shadow-sm",
                                isSlipTest ? "bg-purple-50/80 border-purple-200/60 hover:bg-purple-100/80 hover:border-purple-300" 
                                  : isAssembly ? "bg-blue-50/80 border-blue-200/60 hover:bg-blue-100/80 hover:border-blue-300"
                                  : isECA ? "bg-green-50/80 border-green-200/60 hover:bg-green-100/80 hover:border-green-300"
                                  : isFixed ? "bg-indigo-50/80 border-indigo-200/60 hover:bg-indigo-100/80 hover:border-indigo-300" 
                                  : "bg-white border-slate-200/80 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"
                              )}>
                                {isSlipTest ? (
                                  <>
                                    <span className="font-bold text-purple-700 tracking-tight">Slip Test</span>
                                    <span className="text-xs font-medium text-purple-600/80 mt-1.5 bg-purple-100/50 px-2.5 py-0.5 rounded-full">
                                      Class Teacher
                                    </span>
                                  </>
                                ) : isAssembly ? (
                                  <>
                                    <span className="font-bold text-blue-700 tracking-tight">Assembly</span>
                                  </>
                                ) : isECA ? (
                                  <>
                                    <span className="font-bold text-green-700 tracking-tight">ECA</span>
                                  </>
                                ) : isFixed ? (
                                  <>
                                    <span className="font-bold text-indigo-700 tracking-tight">{entry.slot_type}</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="font-bold text-slate-800 text-center leading-tight">
                                      {entry.subjects?.subject_name || 'Unknown Subject'}
                                    </span>
                                    <div className="flex items-center gap-1.5 mt-2">
                                      <div className="size-1.5 rounded-full bg-primary/40"></div>
                                      <span className="text-[13px] font-semibold text-slate-500">
                                        {entry.teachers?.teacher_name || 'No Teacher'}
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
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

export default ConsolidatedTimetable;
