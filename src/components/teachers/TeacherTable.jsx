import { Pencil, Trash2, Mail, Phone, User } from "lucide-react";
import { Button } from "../../components/ui";

function TeacherTable({ teachers, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-slate-50">
            <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
              Teacher
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">
              Short Name
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider hidden lg:table-cell">
              Contact
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider hidden xl:table-cell">
              Max Periods
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {teachers.map((teacher) => (
            <tr key={teacher.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <User className="size-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{teacher.teacher_name}</p>
                    <p className="text-sm text-text-secondary">{teacher.short_name}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 hidden md:table-cell">
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-lg">
                  {teacher.short_name}
                </span>
              </td>
              <td className="px-6 py-4 hidden lg:table-cell">
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Phone className="size-4 text-text-muted flex-shrink-0" aria-hidden="true" />
                    <span>{teacher.mobile}</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Mail className="size-4 text-text-muted flex-shrink-0" aria-hidden="true" />
                    <span className="truncate max-w-xs">{teacher.email}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 hidden xl:table-cell">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-text-secondary text-sm font-medium rounded-lg">
                  {teacher.max_periods} periods
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(teacher)}
                    aria-label={`Edit ${teacher.teacher_name}`}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(teacher.id)}
                    aria-label={`Delete ${teacher.teacher_name}`}
                    className="text-danger hover:bg-danger-light"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TeacherTable;