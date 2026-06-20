import { useEffect, useState } from "react";
import { Button } from "../ui";

function SubjectForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    subject_name: "",
    short_name: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        subject_name: initialData.subject_name || "",
        short_name: initialData.short_name || "",
      });
    } else {
      setFormData({
        subject_name: "",
        short_name: "",
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
          Subject Name
        </label>

        <input
          name="subject_name"
          value={formData.subject_name}
          onChange={handleChange}
          placeholder="Enter Subject Name"
          className="w-full border rounded-xl px-4 py-3"
          required
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Short Name
        </label>

        <input
          name="short_name"
          value={formData.short_name}
          onChange={handleChange}
          placeholder="MAT"
          className="w-full border rounded-xl px-4 py-3"
          required
        />
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