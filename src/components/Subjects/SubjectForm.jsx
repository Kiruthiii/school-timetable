import { useEffect, useState } from "react";
import { Button } from "../ui";

function SubjectForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    subject_name: "",
    short_name: "",
    priority: 1, // Default to Academic Subjects
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        subject_name: initialData.subject_name || "",
        short_name: initialData.short_name || "",
        priority: initialData.priority || 1,
      });
    } else {
      setFormData({
        subject_name: "",
        short_name: "",
        priority: 1,
      });
    }
  }, [initialData]);

  function handleChange(e) {
    const value = e.target.name === "priority" ? Number(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block mb-2 font-medium" htmlFor="subject_name">
          Subject Name
        </label>
        <input
          id="subject_name"
          name="subject_name"
          value={formData.subject_name}
          onChange={handleChange}
          placeholder="Enter Subject Name"
          className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
          required
        />
      </div>

      <div>
        <label className="block mb-2 font-medium" htmlFor="short_name">
          Short Name
        </label>
        <input
          id="short_name"
          name="short_name"
          value={formData.short_name}
          onChange={handleChange}
          placeholder="MAT"
          className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
          required
        />
      </div>

      <div>
        <label className="block mb-2 font-medium" htmlFor="priority">
          Priority
        </label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          required
        >
          <option value={1}>1 - Academic Subjects</option>
          <option value={2}>2 - Activity Subjects</option>
        </select>
        <p className="mt-2 text-sm text-gray-500">
          Priority determines the scheduling order.<br />
          Lower numbers are scheduled before higher numbers whenever possible.<br />
          Examples:<br />
          1 = Academic Subjects<br />
          2 = Activity Subjects
        </p>
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
          {initialData ? "Update Subject" : "Add Subject"}
        </Button>
      </div>
    </form>
  );
}

export default SubjectForm;