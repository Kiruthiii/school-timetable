import { useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { PageHeader, Card, CardContent, Button } from "../components/ui";
import { Plus, Download, Upload, Filter, ChevronLeft, ChevronRight } from "lucide-react";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const periods = Array.from({ length: 8 }, (_, i) => i + 1);

const timetableData = {
  "Grade 10-A": {
    Monday: { 1: "Mathematics", 2: "Physics", 3: "Chemistry", 4: "English", 5: "Biology", 6: "History", 7: "PE", 8: "Library" },
    Tuesday: { 1: "Physics", 2: "Mathematics", 3: "English", 4: "Chemistry", 5: "Computer Science", 6: "Geography", 7: "Art", 8: "Music" },
    Wednesday: { 1: "Chemistry", 2: "English", 3: "Mathematics", 4: "Physics", 5: "History", 6: "Biology", 7: "PE", 8: "Library" },
    Thursday: { 1: "English", 2: "Biology", 3: "Physics", 4: "Mathematics", 5: "Geography", 6: "Computer Science", 7: "Art", 8: "Music" },
    Friday: { 1: "Mathematics", 2: "Chemistry", 3: "History", 4: "Physics", 5: "English", 6: "Biology", 7: "PE", 8: "Assembly" },
    Saturday: { 1: "Physics", 2: "Mathematics", 3: "English", 4: "Chemistry", 5: "Sports", 6: "Club Activity", 7: "Remedial", 8: "Free" },
  }
};

function Timetable() {
  const [selectedClass, setSelectedClass] = useState("Grade 10-A");
  const [currentWeek, setCurrentWeek] = useState(0);

  const classes = ["Grade 10-A", "Grade 10-B", "Grade 11-A", "Grade 11-B", "Grade 12-A", "Grade 12-B"];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Timetable"
          description="View and manage weekly class schedules"
          action={
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                <Download className="size-4" aria-hidden="true" />
                Export
              </Button>
              <Button variant="outline" className="w-full sm:w-auto">
                <Upload className="size-4" aria-hidden="true" />
                Import
              </Button>
              <Button className="w-full sm:w-auto">
                <Plus className="size-4" aria-hidden="true" />
                Generate
              </Button>
            </div>
          }
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <label htmlFor="class-select" className="text-sm font-medium text-text-secondary whitespace-nowrap">Class:</label>
              <select
                id="class-select"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 border border-border rounded-xl bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {classes.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center justify-between sm:justify-center gap-2 border border-border rounded-xl px-4 py-2 w-full sm:w-auto">
              <Button variant="ghost" size="icon" onClick={() => setCurrentWeek(w => w - 1)} aria-label="Previous week">
                <ChevronLeft className="size-4" aria-hidden="true" />
              </Button>
              <span className="font-medium text-text-primary">Week {currentWeek + 1}</span>
              <Button variant="ghost" size="icon" onClick={() => setCurrentWeek(w => w + 1)} aria-label="Next week">
                <ChevronRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
          
          <Button variant="outline" className="w-full sm:w-auto">
            <Filter className="size-4" aria-hidden="true" />
            Filters
          </Button>
        </div>

        <Card variant="default" padding="none">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-border">
                    <th className="w-24 px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider border-r border-border sticky left-0 bg-slate-50 z-10">Period</th>
                    {days.map((day) => (
                      <th key={day} className="px-4 py-3 text-center text-xs font-semibold text-text-muted uppercase tracking-wider border-r border-border">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {periods.map((period) => (
                    <tr key={period} className="border-b border-border hover:bg-slate-50/50 transition-colors">
                      <td className="w-24 px-4 py-3 text-left text-sm font-medium text-text-primary border-r border-border sticky left-0 bg-surface z-10">
                        Period {period}
                      </td>
                      {days.map((day) => (
                        <td key={`${day}-${period}`} className="px-4 py-3 text-center align-top min-h-[80px]">
                          {timetableData[selectedClass]?.[day]?.[period] && (
                            <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-lg max-w-full truncate">
                              {timetableData[selectedClass][day][period]}
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

export default Timetable;