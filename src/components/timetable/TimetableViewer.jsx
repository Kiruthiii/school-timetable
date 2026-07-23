
import { Card, CardContent } from "../ui";
import { Loader2 } from "lucide-react";
import TimetableRow from "./TimetableRow";
import TimetableHeader from "./TimetableHeader";

const periods = Array.from({ length: 8 }, (_, i) => i + 1);

const TimetableViewer = ({ timetable, isLoading }) => {
  if (isLoading) {
    return (
      <Card variant="default" padding="none">
        <CardContent className="p-0">
          <div className="flex flex-col items-center justify-center p-12 text-text-muted">
            <Loader2 className="size-8 animate-spin text-primary mb-4" />
            <p>Loading timetable...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!timetable || timetable.length === 0) {
    return (
      <Card variant="default" padding="none">
        <CardContent className="p-0">
          <div className="flex flex-col items-center justify-center p-12 text-center text-text-muted">
            <span className="text-4xl mb-4">📅</span>
            <p className="text-lg font-medium text-text-primary mb-2">No timetable generated.</p>
            <p>Generate a timetable first to view it here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getEntryForPeriod = (period) => {
    return timetable.find(entry => entry.period === period);
  };

  return (
    <Card variant="default" padding="none">
      <CardContent className="p-0">
        <div className="hidden md:block">
          <TimetableHeader />
          <div className="flex flex-col">
            {periods.map(period => (
              <TimetableRow 
                key={period} 
                period={period} 
                entry={getEntryForPeriod(period)} 
              />
            ))}
          </div>
        </div>
        <div className="md:hidden p-4 space-y-4">
          {periods.map(period => (
            <TimetableRow 
              key={period} 
              period={period} 
              entry={getEntryForPeriod(period)} 
              isMobile={true}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimetableViewer;
