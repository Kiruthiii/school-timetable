import { useEffect, useState } from "react";

function TeacherForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    teacher_name: "",
    short_name: "",
    mobile: "",
    email: "",
    max_periods: 8,
  });

  useEffect(() => {
    if (initialData) {
        setFormData({
            teacher_name: initialData.teacher_name || "",
            short_name: initialData.short_name || "",
            mobile: initialData.mobile || "",
            email: initialData.email || "",
            max_periods: initialData.max_periods || 8,
        });
    } else {
        setFormData({
            teacher_name: "",
            short_name: "",
            mobile: "",
            email: "",
            max_periods: 8,
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

    if (!initialData) {
      setFormData({
        teacher_name: "",
        short_name: "",
        mobile: "",
        email: "",
        max_periods: 8,
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <input
        name="teacher_name"
        placeholder="Teacher Name"
        value={formData.teacher_name}
        onChange={handleChange}
        className="border p-2 rounded"
        required
      />

      <input
        name="short_name"
        placeholder="Short Name"
        value={formData.short_name}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      <input
        name="mobile"
        placeholder="Mobile"
        value={formData.mobile}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      <input
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      <input
        type="number"
        name="max_periods"
        placeholder="Max Periods"
        value={formData.max_periods}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      <div className="md:col-span-2 flex justify-end gap-3 mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-400 text-white rounded"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {initialData ? "Update Teacher" : "Add Teacher"}
        </button>
      </div>
    </form>
  );
}

export default TeacherForm;