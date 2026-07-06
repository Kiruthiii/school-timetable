import { useEffect, useState } from "react";
import { Button } from "../../components/ui";

function FixedSlotForm({ initialData, onSubmit, onCancel, classes = [] }) {
  const [formData, setFormData] = useState({
    class_id: "",
    day_of_week: 1,
    period: 1,
    type: "Assembly",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        class_id: initialData.class_id || "",
        day_of_week: initialData.day_of_week || 1,
        period: initialData.period || 1,
        type: initialData.type || "Assembly",
      });
    } else {
      setFormData({
        class_id: classes.length > 0 ? classes[0].id : "",
        day_of_week: 1,
        period: 1,
        type: "Assembly",
      });
    }
  }, [initialData, classes]);

  useEffect(() => {
    if (formData.type === "Slip Test" && formData.period !== 8) {
      setFormData((prev) => ({ ...prev, period: 8 }));
    }
  }, [formData.type]);

  function handleChange(e) {
    const value =
      e.target.name === "period" || e.target.name === "day_of_week" ? Number(e.target.value) : e.target.value;
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
        <label className="block mb-2 font-medium" htmlFor="class_id">
          Class
        </label>
        <select
          id="class_id"
          name="class_id"
          value={formData.class_id}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          required
        >
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.class_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-2 font-medium" htmlFor="day_of_week">
          Day
        </label>
        <select
          id="day_of_week"
          name="day_of_week"
          value={formData.day_of_week}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          required
        >
          <option value={1}>Monday</option>
          <option value={2}>Tuesday</option>
          <option value={3}>Wednesday</option>
          <option value={4}>Thursday</option>
          <option value={5}>Friday</option>
          <option value={6}>Saturday</option>
        </select>
      </div>

      <div>
        <label className="block mb-2 font-medium" htmlFor="period">
          Period
        </label>
        <select
          id="period"
          name="period"
          value={formData.period}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          required
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
            <option 
              key={p} 
              value={p}
              disabled={formData.type === "Slip Test" && p !== 8}
            >
              Period {p}
            </option>
          ))}
        </select>
        {formData.type === "Slip Test" && (
          <p className="mt-1 text-sm text-amber-600">
            Slip Test can only be scheduled during the last period.
          </p>
        )}
      </div>

      <div>
        <label className="block mb-2 font-medium" htmlFor="type">
          Reserved Period
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          required
        >
          <option value="Assembly">Assembly</option>
          <option value="ECA">ECA</option>
          <option value="Slip Test">Slip Test</option>
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
          {initialData ? "Update Reserved Period" : "Reserve Period"}
        </Button>
      </div>
    </form>
  );
}

export default FixedSlotForm;
