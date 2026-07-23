import { useState } from "react";
import { Card, CardContent, Button } from "../ui";
import { Calendar, Play, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { generateTimetable } from "../../services/timetableService";

export default function GenerateTimetableCard() {
  const [date, setDate] = useState("");
  const [slipTestPeriods, setSlipTestPeriods] = useState(0);
  const [slipTestAllowedPeriod, setSlipTestAllowedPeriod] = useState(8);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState(null);

  const handleGenerate = async () => {
    if (!date) return;
    setIsLoading(true);
    setReport(null);
    try {
      const result = await generateTimetable(date, slipTestPeriods, slipTestAllowedPeriod);
      setReport(result);
    } catch (error) {
      setReport({
        success: false,
        warnings: [error.message || "An unexpected error occurred."]
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Calendar className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">Generate Timetable</h3>
              <p className="text-sm text-text-secondary">Select a date to generate classes for that week</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex flex-col gap-1">
              <label htmlFor="slip-tests" className="text-xs text-text-secondary">Slip Tests/Week</label>
              <input
                id="slip-tests"
                type="number"
                min="0"
                max="5"
                value={slipTestPeriods}
                onChange={(e) => setSlipTestPeriods(Number(e.target.value))}
                disabled={isLoading}
                className="w-24 px-3 py-2 border border-border rounded-xl bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="slip-test-period" className="text-xs text-text-secondary">Allowed Period</label>
              <input
                id="slip-test-period"
                type="number"
                min="1"
                max="8"
                value={slipTestAllowedPeriod}
                onChange={(e) => setSlipTestAllowedPeriod(Number(e.target.value))}
                disabled={isLoading}
                className="w-24 px-3 py-2 border border-border rounded-xl bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="generate-date" className="text-xs text-text-secondary">Date</label>
              <input
                id="generate-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={isLoading}
                className="px-3 py-2 border border-border rounded-xl bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button 
              onClick={handleGenerate} 
              disabled={isLoading || !date}
              className="min-w-[120px] self-end mb-[2px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="size-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {report && (
        <Card className={`border-l-4 ${report.success ? 'border-l-green-500' : 'border-l-red-500'}`}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {report.success ? (
                <div className="p-2 bg-green-50 rounded-full">
                  <CheckCircle2 className="size-6 text-green-600" />
                </div>
              ) : (
                <div className="p-2 bg-red-50 rounded-full">
                  <AlertCircle className="size-6 text-red-600" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-text-primary mb-1">
                  {report.success ? "Generation Successful" : "Generation Failed"}
                </h3>
                
                {report.success && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-slate-50 p-3 rounded-lg border border-border">
                      <p className="text-sm text-text-secondary">Generated Periods</p>
                      <p className="text-2xl font-bold text-text-primary mt-1">{report.generatedCount || 0}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-border">
                      <p className="text-sm text-text-secondary">Updated Subjects</p>
                      <p className="text-2xl font-bold text-text-primary mt-1">{report.updatedSubjects || 0}</p>
                    </div>
                  </div>
                )}

                {report.warnings && report.warnings.length > 0 && (
                  <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="text-sm font-semibold text-amber-800 mb-2">Warnings</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {report.warnings.map((warning, idx) => (
                        <li key={idx} className="text-sm text-amber-700">{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
