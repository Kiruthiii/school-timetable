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
  // Common state
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");

  // Edit mode state
  const [classId, setClassId] = useState("");
  const [weeklyPeriods, setWeeklyPeriods] = useState("");

  // Add mode state
  const [selectedClasses, setSelectedClasses] = useState({});

  useEffect(() => {
    if (initialData) {
      setClassId(initialData.class_id || "");
      setSubjectId(initialData.subject_id || "");
      setTeacherId(initialData.teacher_id || "");
      setWeeklyPeriods(initialData.weekly_periods || "");
    } else {
      // Initialize selectedClasses
      const initialSelected = {};
      classes.forEach((cls) => {
        initialSelected[cls.id] = { selected: false, periods: "" };
      });
      setSelectedClasses(initialSelected);
    }
  }, [initialData, classes]);

  const handleClassToggle = (id) => {
    setSelectedClasses((prev) => ({
      ...prev,
      [id]: { ...prev[id], selected: !prev[id].selected },
    }));
  };

  const handlePeriodsChange = (id, value) => {
    setSelectedClasses((prev) => ({
      ...prev,
      [id]: { ...prev[id], periods: value },
    }));
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (initialData) {
      const periods = Number(weeklyPeriods);
      if (periods < 1 || periods > 10) {
        alert("Weekly periods must be between 1 and 10");
        return;
      }
      await onSubmit({
        class_id: classId,
        subject_id: subjectId,
        teacher_id: teacherId,
        weekly_periods: weeklyPeriods,
      });
    } else {
      const mappingsToCreate = [];
      for (const cls of classes) {
        const data = selectedClasses[cls.id];
        if (data && data.selected) {
          const periods = Number(data.periods);
          if (periods < 1 || periods > 10) {
            alert(`Weekly periods for ${cls.class_name} must be between 1 and 10`);
            return;
          }
          mappingsToCreate.push({
            class_id: cls.id,
            subject_id: subjectId,
            teacher_id: teacherId,
            weekly_periods: data.periods,
          });
        }
      }

      if (mappingsToCreate.length === 0) {
        alert("Please select at least one class.");
        return;
      }

      await onSubmit(mappingsToCreate);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block mb-2 font-medium">Teacher *</label>
        <select
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
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
        <label className="block mb-2 font-medium">Subject *</label>
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
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

      {initialData ? (
        <>
          <div>
            <label className="block mb-2 font-medium">Class *</label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
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
            <label className="block mb-2 font-medium">Weekly Periods *</label>
            <input
              type="number"
              min="1"
              max="10"
              value={weeklyPeriods}
              onChange={(e) => setWeeklyPeriods(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
              required
            />
          </div>
        </>
      ) : (
        <div className="border rounded-xl overflow-hidden max-h-[40vh] overflow-y-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b sticky top-0">
              <tr>
                <th className="px-4 py-3 font-medium w-16">Select</th>
                <th className="px-4 py-3 font-medium">Class</th>
                <th className="px-4 py-3 font-medium">Weekly Periods</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {classes.map((cls) => (
                <tr key={cls.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedClasses[cls.id]?.selected || false}
                      onChange={() => handleClassToggle(cls.id)}
                      className="size-4 rounded border-slate-300"
                    />
                  </td>
                  <td className="px-4 py-3">{cls.class_name}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={selectedClasses[cls.id]?.periods || ""}
                      onChange={(e) => handlePeriodsChange(cls.id, e.target.value)}
                      disabled={!selectedClasses[cls.id]?.selected}
                      className="w-full border rounded-lg px-3 py-2 disabled:bg-slate-100 disabled:cursor-not-allowed"
                      required={selectedClasses[cls.id]?.selected}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t mt-6">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? "Update Mapping" : "Save All"}
        </Button>
      </div>
    </form>
  );
}

export default MappingForm;