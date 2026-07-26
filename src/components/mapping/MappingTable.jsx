import { Card, CardContent, Button } from "../ui";
import { Edit, Trash2 } from "lucide-react";

function MappingTable({ mappings, onEdit, onDelete }) {
  return (
    <Card variant="default" padding="none">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-slate-50">
                <th className="px-6 py-4 text-left">Class</th>
                <th className="px-6 py-4 text-left hidden md:table-cell">Subject</th>
                <th className="px-6 py-4 text-left hidden md:table-cell">
                  Teacher
                </th>
                <th className="px-6 py-4 text-left hidden md:table-cell">
                  Weekly Periods
                </th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {mappings.map((mapping) => (
                <tr
                  key={mapping.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">
                        {mapping.classes?.class_name}
                      </p>

                      <p className="text-sm text-slate-500 md:hidden">
                        Subject: {mapping.subjects?.subject_name}
                      </p>

                      <p className="text-sm text-slate-500 md:hidden">
                        Teacher: {mapping.teachers?.teacher_name || "Not Assigned"}
                      </p>

                      <p className="text-sm text-slate-500 md:hidden">
                        Weekly Periods: {mapping.weekly_periods}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4 hidden md:table-cell">
                    {mapping.subjects?.subject_name}
                  </td>

                  <td className="px-6 py-4 hidden md:table-cell">
                    {mapping.teachers?.teacher_name ? (
                      <span className="font-medium text-slate-900">
                        {mapping.teachers.teacher_name}
                      </span>
                    ) : (
                      <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 text-xs font-semibold inline-flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-amber-500"></span>
                        Not Assigned
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 hidden md:table-cell">
                    {mapping.weekly_periods}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(mapping)}
                      >
                        <Edit className="size-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-danger"
                        onClick={() => onDelete(mapping.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default MappingTable;