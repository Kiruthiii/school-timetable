import { BookOpen, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, Button } from "../ui";

function ClassTable({ classes, onEdit, onDelete }) {
  return (
    <Card variant="default" padding="none">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-slate-50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Class Name
                </th>

                <th className="hidden px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider md:table-cell">
                  Class Teacher
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {classes.map((cls) => (
                <tr
                  key={cls.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600">
                        <BookOpen className="size-5" />
                      </div>

                      <div>
                        <p className="font-medium text-text-primary">
                          {cls.class_name}
                        </p>
                        <p className="text-xs text-text-muted mt-1 md:hidden">
                          {cls.teachers?.teacher_name || "Not Assigned"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="px-2 py-1 bg-slate-100 text-text-secondary text-xs font-medium rounded-lg">
                      {cls.teachers?.teacher_name || "Not Assigned"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(cls)}
                      >
                        <Edit className="size-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-danger hover:bg-danger-light"
                        onClick={() => onDelete(cls.id)}
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

export default ClassTable;
