import { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { PageHeader, Card, CardContent, Button } from "../components/ui";
import { Download, Upload, Loader2 } from "lucide-react";
import GenerateTimetableCard from "../components/timetable/GenerateTimetableCard";
import TimetableViewer from "../components/timetable/TimetableViewer";
import { getTimetableByDateAndClass, getClasses } from "../services/timetableService";

function Timetable() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [timetable, setTimetable] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await getClasses();
        setClasses(data);
        if (data && data.length > 0) {
          setSelectedClass(data[0].id.toString());
        }
      } catch (error) {
        console.error("Failed to fetch classes", error);
      }
    };
    fetchClasses();
  }, []);

  const handleLoadTimetable = async () => {
    if (!selectedClass || !selectedDate) return;
    
    console.log("Loading timetable with selectedDate:", selectedDate, "and selectedClass:", selectedClass);
    setIsLoading(true);
    try {
      const parsedClassId = Number(selectedClass); // Ensure classId is a number
      console.log("Parsed class ID:", parsedClassId);
      const data = await getTimetableByDateAndClass(selectedDate, parsedClassId);
      console.log("Supabase response:", data);
      setTimetable(data || []);
    } catch (error) {
      console.error("Failed to fetch timetable", error);
      setTimetable([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Timetable"
          description="View and manage daily class schedules"
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
            </div>
          }
        />

        <GenerateTimetableCard />

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-text-primary mb-4">View Timetable</h3>
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <label htmlFor="date-select" className="text-sm font-medium text-text-secondary whitespace-nowrap">Date:</label>
                <input
                  type="date"
                  id="date-select"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2 border border-border rounded-xl bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <label htmlFor="class-select" className="text-sm font-medium text-text-secondary whitespace-nowrap">Class:</label>
                <select
                  id="class-select"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2 border border-border rounded-xl bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.class_name}</option>
                  ))}
                </select>
              </div>

              <Button onClick={handleLoadTimetable} disabled={isLoading || !selectedClass || !selectedDate} className="w-full sm:w-auto mt-4 sm:mt-0">
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load Timetable"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <TimetableViewer timetable={timetable} isLoading={isLoading} />
      </div>
    </AdminLayout>
  );
}

export default Timetable;