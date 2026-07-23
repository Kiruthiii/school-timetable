import { useEffect, useState } from "react";
import { Button } from "../../components/ui";

function FixedSlotForm({ initialData, onSubmit, onCancel, classes = [] }) {
  const [formData, setFormData] = useState({
    class_ids: [],
    day_of_week: 1,
    period: 1,
    type: "Assembly",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        class_ids: initialData.class_id ? [initialData.class_id] : [],
        day_of_week: initialData.day_of_week || 1,
        period: initialData.period || 1,
        type: initialData.type || "Assembly",
      });
    } else {
      setFormData({
        class_ids: [],
        day_of_week: 1,
        period: 1,
        type: "Assembly",
      });
    }
  }, [initialData, classes]);

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
    if (formData.class_ids.length === 0) {
      alert("Please select at least one class.");
      return;
    }
    await onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block mb-2 font-medium" htmlFor="type">
          Type *
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
        </select>
      </div>

      <div>
        <label className="block mb-2 font-medium" htmlFor="day_of_week">
          Day *
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
          Period *
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
            >
              Period {p}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-2 font-medium">Classes</label>
        <div className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            id="selectAll"
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            checked={formData.class_ids.length === classes.length && classes.length > 0}
            onChange={(e) => {
              if (e.target.checked) {
                setFormData({ ...formData, class_ids: classes.map((c) => c.id) });
              } else {
                setFormData({ ...formData, class_ids: [] });
              }
            }}
            disabled={!!initialData}
          />
          <label htmlFor="selectAll" className="font-medium text-sm">
            Select All Classes
          </label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border rounded-xl p-4 bg-white/50 max-h-[200px] overflow-y-auto">
          {classes.map((cls) => (
            <div key={cls.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`class-${cls.id}`}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                checked={formData.class_ids.includes(cls.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({
                      ...formData,
                      class_ids: [...formData.class_ids, cls.id],
                    });
                  } else {
                    setFormData({
                      ...formData,
                      class_ids: formData.class_ids.filter((id) => id !== cls.id),
                    });
                  }
                }}
                disabled={!!initialData}
              />
              <label htmlFor={`class-${cls.id}`} className="text-sm">
                {cls.class_name}
              </label>
            </div>
          ))}
        </div>
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
          Save
        </Button>
      </div>
    </form>
  );
}

export default FixedSlotForm;
