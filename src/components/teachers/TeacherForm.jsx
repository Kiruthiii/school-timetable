import { useEffect, useState } from "react";
import { Button } from "../../components/ui";
import { User, Mail, Phone, Hash } from "lucide-react";
function TeacherForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    teacher_name: "",
    short_name: "",
    mobile: "",
    email: "",
    max_periods: 8,
  });
  const [errors, setErrors] = useState({});

  /* eslint-disable react-hooks/set-state-in-effect */
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
    setErrors({});
  }, [initialData]);

  function validateForm() {
    const newErrors = {};
    if (!formData.teacher_name.trim()) {
      newErrors.teacher_name = "Teacher name is required";
    }
    if (!formData.short_name.trim()) {
      newErrors.short_name = "Short name is required";
    }
    if (formData.mobile && !/^[\d\s\-+()]{10,}$/.test(formData.mobile)) {
      newErrors.mobile = "Please enter a valid mobile number";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;
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

  const fields = [
    { name: "teacher_name", label: "Teacher Name", placeholder: "Enter full name", icon: User, required: true },
    { name: "short_name", label: "Short Name", placeholder: "e.g., SMJ", icon: Hash, required: true },
    { name: "mobile", label: "Mobile Number", placeholder: "+1 (555) 123-4567", icon: Phone, type: "tel" },
    { name: "email", label: "Email Address", placeholder: "teacher@school.edu", icon: Mail, type: "email" },
    { name: "max_periods", label: "Max Periods/Day", placeholder: "8", icon: Hash, type: "number", min: 1, max: 12 },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field) => {
          const Icon = field.icon;
          const error = errors[field.name];
          return (
            <div key={field.name} className={field.name === "max_periods" ? "md:col-span-2" : ""}>
              <label htmlFor={field.name} className="block text-sm font-medium text-text-primary mb-2">
                {field.label} {field.required && <span className="text-danger">*</span>}
              </label>
              <div className="relative">
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted size-5" aria-hidden="true" />
                {field.type === "number" ? (
                  <input
                    type="number"
                    id={field.name}
                    name={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={handleChange}
                    min={field.min}
                    max={field.max}
                    className={`w-full pl-11 pr-4 py-3 border rounded-xl bg-surface text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${
                      error ? "border-danger focus:ring-danger/20" : "border-border hover:border-border-hover"
                    }`}
                    required={field.required}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${field.name}-error` : undefined}
                  />
                ) : (
                  <input
                    type={field.type || "text"}
                    id={field.name}
                    name={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 border rounded-xl bg-surface text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${
                      error ? "border-danger focus:ring-danger/20" : "border-border hover:border-border-hover"
                    }`}
                    required={field.required}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${field.name}-error` : undefined}
                  />
                )}
              </div>
              {error && (
                <p id={`${field.name}-error`} className="mt-1.5 text-sm text-danger flex items-center gap-1" role="alert">
                  <svg className="size-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="secondary" onClick={onCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" loading={false} className="w-full sm:w-auto">
          {initialData ? "Update Teacher" : "Add Teacher"}
        </Button>
      </div>
    </form>
  );
}

export default TeacherForm;