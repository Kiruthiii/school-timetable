function TeacherTable({ teachers, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Teacher</th>
            <th className="p-3 text-left">Short Name</th>
            <th className="p-3 text-left">Mobile</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Max Periods</th>
            <th className="p-3 text-left">Actions</th>
            
          </tr>
        </thead>

        <tbody>
          {teachers.map((teacher) => (
            <tr key={teacher.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{teacher.teacher_name}</td>
              <td className="p-3">{teacher.short_name}</td>
              <td className="p-3">{teacher.mobile}</td>
              <td className="p-3">{teacher.email}</td>
              <td className="p-3">{teacher.max_periods}</td>
            <td className="p-3">
  <div className="flex gap-2">
    <button
      onClick={() => onEdit(teacher)}
      className="bg-yellow-500 text-white px-3 py-1 rounded"
    >
      Edit
    </button>

    <button
      onClick={() => onDelete(teacher.id)}
      className="bg-red-500 text-white px-3 py-1 rounded"
    >
      Delete
    </button>
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