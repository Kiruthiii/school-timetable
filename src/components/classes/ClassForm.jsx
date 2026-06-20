import { useEffect, useState } from "react";
import { Button } from "../ui";

function ClassForm({ initialData, onSubmit, onCancel, teachers }) {
  const [formData, setFormData] = useState({
    class_name: "",
    class_teacher_id: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        class_name: initialData.class_name || "",
        class_teacher_id: initialData.class_teacher_id || "",
      });
    } else {
      setFormData({
        class_name: "",
        class_teacher_id: "",
      });
    }
  }, [initialData]);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      <div>
        <label className="block mb-2 font-medium">
          Class Name
        </label>

        <input
          name="class_name"
          value={formData.class_name}
          onChange={handleChange}
          placeholder="Enter Class Name"
          className="w-full border rounded-xl px-4 py-3"
          required
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Class Teacher
        </label>

        <select
          name="class_teacher_id"
          value={formData.class_teacher_id}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3 bg-white"
        >
          <option value="">Select Teacher</option>
          {teachers && teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.teacher_name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">

        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>

        <Button type="submit" className="w-full sm:w-auto">
          {initialData ? "Update Class" : "Add Class"}
        </Button>

      </div>

    </form>
  );
}

export default ClassForm;
