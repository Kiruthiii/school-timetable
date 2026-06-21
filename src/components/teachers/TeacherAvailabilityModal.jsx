import { useState, useEffect } from "react";
import { Modal, Button } from "../../components/ui";

function TeacherAvailabilityModal({
  isOpen,
  onClose,
  initialData,
  selectedTeacher,
  onSubmit,
}) {
  const [formData, setFormData] = useState({
    date: "",
    status: "Leave",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date,
        status: initialData.status,
      });
    } else {
      setFormData({
        date: "",
        status: "Leave",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({
      teacher_id: selectedTeacher?.id || initialData?.teacher_id,
      date: formData.date,
      status: formData.status,
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Leave Record" : "Add Leave Record"}
      description={
        initialData
          ? "Update the leave record details"
          : "Mark availability for the teacher"
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-2 font-medium">Teacher Name</label>
          <input
            type="text"
            value={selectedTeacher?.teacher_name || initialData?.teachers?.teacher_name || ""}
            readOnly
            className="w-full border rounded-xl px-4 py-3 bg-slate-100 text-text-secondary outline-none cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          >
            <option value="Present">Present</option>
            <option value="Leave">Leave</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  );
}

export default TeacherAvailabilityModal;
