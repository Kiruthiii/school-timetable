import { Edit, Trash2, CalendarCheck } from "lucide-react";
import { Card, CardContent, Button } from "../../components/ui";

const getBadgeStyles = (type) => {
  switch (type) {
    case "Assembly":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "ECA":
      return "bg-green-100 text-green-700 border-green-200";
    case "Slip Test":
      return "bg-orange-100 text-orange-700 border-orange-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function FixedSlotTable({ fixedSlots, onEdit, onDelete, onAdd }) {
  return (
    <Card variant="default" padding="none">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-slate-50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider hidden sm:table-cell">
                  Day
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider hidden sm:table-cell">
                  Period
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">
                  Reserved Period
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {fixedSlots.map((slot) => (
                <tr
                  key={slot.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-100 text-indigo-600">
                        <CalendarCheck className="size-5" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">
                          {slot.classes?.class_name || "Unknown"}
                        </p>
                        <div className="flex flex-col sm:hidden mt-2 gap-1.5 text-sm text-text-muted">
                          <span>{daysOfWeek[slot.day_of_week]} - Period {slot.period}</span>
                          <div>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-md border ${getBadgeStyles(slot.type)}`}>
                              {slot.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className="text-sm font-medium text-text-primary">
                      {daysOfWeek[slot.day_of_week]}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200">
                      Period {slot.period}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-lg border ${getBadgeStyles(slot.type)}`}>
                      {slot.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(slot)}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-danger hover:bg-danger-light"
                        onClick={() => onDelete(slot.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {fixedSlots.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="text-4xl mb-2">📅</div>
                      <p className="text-lg font-medium text-text-primary">No reserved periods configured yet.</p>
                      <p className="text-text-muted max-w-md text-center">Reserve periods like Assembly, ECA and Slip Test to prevent subjects from being scheduled in those slots.</p>
                      <div className="mt-2">
                        <Button onClick={onAdd} variant="primary">
                          + Reserve Period
                        </Button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default FixedSlotTable;
