import { useEffect, useState } from "react";
import { Button } from "../ui";

function MappingForm({
  initialData,
  classes,
  subjects,
  teachers,
  onSubmit,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    class_id: "",
    subject_id: "",
    teacher_id: "",
    weekly_periods: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        class_id: initialData.class_id,
        subject_id: initialData.subject_id,
        teacher_id: initialData.teacher_id,
        weekly_periods: initialData.weekly_periods,
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
    
    const periods = Number(formData.weekly_periods);
    if (periods < 1 || periods > 10) {
      alert("Weekly periods must be between 1 and 10");
      return;
    }
    
    await onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      <div>
        <label className="block mb-2 font-medium">
          Class
        </label>

        <select
          name="class_id"
          value={formData.class_id}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3"
          required
        >
          <option value="">Select Class</option>

          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.class_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Subject
        </label>

        <select
          name="subject_id"
          value={formData.subject_id}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3"
          required
        >
          <option value="">Select Subject</option>

          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.subject_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Teacher
        </label>

        <select
          name="teacher_id"
          value={formData.teacher_id}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3"
          required
        >
          <option value="">Select Teacher</option>

          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.teacher_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Weekly Periods
        </label>

        <input
          type="number"
          min="1"
          max="10"
          name="weekly_periods"
          value={formData.weekly_periods}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3"
          required
        />
      </div>

      <div className="flex justify-end gap-3">

        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button type="submit">
          {initialData ? "Update Mapping" : "Add Mapping"}
        </Button>

      </div>

    </form>
  );
}

export default MappingForm;