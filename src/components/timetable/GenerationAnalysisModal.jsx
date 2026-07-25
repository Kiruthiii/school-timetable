import React from 'react';
import { Card, CardContent } from "../ui";
import { X, CheckCircle2, AlertCircle, TrendingUp, Users, BookOpen } from "lucide-react";

export default function GenerationAnalysisModal({ isOpen, onClose, report }) {
  if (!isOpen || !report || !report.diagnostics) return null;

  const { diagnostics } = report;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${diagnostics.summary.missing === 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {diagnostics.summary.missing === 0 ? <CheckCircle2 className="size-5" /> : <TrendingUp className="size-5" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Generation Analysis</h2>
              <p className="text-sm text-slate-500 font-medium">Diagnostic report for timetable allocation</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 space-y-8">
          
          {/* Summary Section */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <BookOpen className="size-4" /> Generation Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Classes</p>
                  <p className="text-2xl font-bold text-slate-700 mt-1">{diagnostics.summary.classes}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-white border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expected Slots</p>
                  <p className="text-2xl font-bold text-slate-700 mt-1">{diagnostics.summary.expected}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-white border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Generated</p>
                  <p className="text-2xl font-bold text-slate-700 mt-1">{diagnostics.summary.generated}</p>
                </CardContent>
              </Card>
              <Card className={`border-0 shadow-sm bg-white border-l-4 ${diagnostics.summary.missing > 0 ? 'border-l-red-500' : 'border-l-slate-200'}`}>
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Missing</p>
                  <p className="text-2xl font-bold text-slate-700 mt-1">{diagnostics.summary.missing}</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Constraint Statistics */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <AlertCircle className="size-4" /> Constraint Statistics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {Object.entries(diagnostics.constraintStats).map(([key, value]) => {
                const title = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                return (
                  <div key={key} className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase leading-tight mb-2">{title}</span>
                    <span className={`text-xl font-bold ${value > 0 ? 'text-amber-600' : 'text-slate-300'}`}>{value}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Missing Slots Table */}
          {diagnostics.missingSlots.length > 0 && (
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-red-500 mb-3">Missing Slot Report</h3>
              <div className="bg-white border border-red-100 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-red-50/50 border-b border-red-100 text-red-700">
                        <th className="px-4 py-3 font-semibold">Class</th>
                        <th className="px-4 py-3 font-semibold">Day</th>
                        <th className="px-4 py-3 font-semibold">Period</th>
                        <th className="px-4 py-3 font-semibold">Reason</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {diagnostics.missingSlots.map((slot, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-700">{slot.class_name}</td>
                          <td className="px-4 py-3 text-slate-600">{slot.day}</td>
                          <td className="px-4 py-3 text-slate-600">P{slot.period}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1 max-h-[120px] overflow-y-auto pr-2">
                              {slot.rejectedCandidates.map((rc, rIdx) => (
                                <div key={rIdx} className="text-xs">
                                  <span className="font-semibold text-slate-700">{rc.subject_name}:</span>{' '}
                                  <span className="text-slate-500">{rc.reasons.join(', ')}</span>
                                </div>
                              ))}
                              {slot.rejectedCandidates.length === 0 && (
                                <span className="text-xs text-slate-500 italic">No candidates available</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex px-2 py-1 text-[10px] font-bold uppercase rounded bg-red-100 text-red-600">
                              Not Allocated
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* Subject Coverage */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <BookOpen className="size-4" /> Subject Coverage
              </h3>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm max-h-[300px] overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-slate-50 shadow-[0_1px_0_0_#e2e8f0]">
                    <tr className="text-slate-600">
                      <th className="px-4 py-2 font-semibold">Class</th>
                      <th className="px-4 py-2 font-semibold">Subject</th>
                      <th className="px-3 py-2 font-semibold text-center">Req</th>
                      <th className="px-3 py-2 font-semibold text-center">Alloc</th>
                      <th className="px-3 py-2 font-semibold text-center">Rem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {diagnostics.subjectCoverage.map((sc, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-2 font-medium text-slate-700">{sc.class_name}</td>
                        <td className="px-4 py-2 text-slate-600">{sc.subject_name}</td>
                        <td className="px-3 py-2 text-center font-medium">{sc.required}</td>
                        <td className="px-3 py-2 text-center text-blue-600 font-medium">{sc.allocated}</td>
                        <td className="px-3 py-2 text-center text-amber-600 font-medium">{sc.remaining}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Teacher Summary */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <Users className="size-4" /> Teacher Summary
              </h3>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm max-h-[300px] overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-slate-50 shadow-[0_1px_0_0_#e2e8f0]">
                    <tr className="text-slate-600">
                      <th className="px-4 py-2 font-semibold">Teacher</th>
                      <th className="px-3 py-2 font-semibold text-center">Alloc</th>
                      <th className="px-3 py-2 font-semibold text-center">Free</th>
                      <th className="px-3 py-2 font-semibold text-center">Conflicts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {diagnostics.teacherSummary.map((ts, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-2 font-medium text-slate-700">{ts.teacher_name}</td>
                        <td className="px-3 py-2 text-center text-blue-600 font-medium">{ts.allocated}</td>
                        <td className="px-3 py-2 text-center text-green-600 font-medium">{ts.free}</td>
                        <td className="px-3 py-2 text-center text-red-500 font-medium">{ts.conflicts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Final Recommendation */}
          <section className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-800 mb-2">Final Recommendation</h3>
            <p className="text-indigo-900 font-medium">{diagnostics.recommendation}</p>
            {diagnostics.summary.missing > 0 && (
              <p className="text-sm text-indigo-700 mt-2">
                <span className="font-semibold">Most Common Reason:</span> {diagnostics.mostCommonReason || "Unknown"}
              </p>
            )}
          </section>

        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-sm"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
