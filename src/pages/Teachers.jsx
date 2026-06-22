import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import TeacherTable from "../components/teachers/TeacherTable";
import TeacherModal from "../components/teachers/TeacherModal";
import { PageHeader, SearchBar, Button, Card, CardContent } from "../components/ui";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  getTeachers,
  addTeacher,
  updateTeacher,
  deleteTeacher,
} from "../services/teacherService";
import {
  getTeacherAvailabilityByDate,
  setTeacherAvailability,
} from "../services/teacherAvailabilityService";

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [leaveRecords, setLeaveRecords] = useState([]);

  const filteredTeachers = teachers.filter((teacher) =>
  teacher.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
  teacher.mobile.toLowerCase().includes(searchTerm.toLowerCase())
);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    fetchLeaveRecords();
  }, [selectedDate]);

  async function fetchLeaveRecords() {
    try {
      const data = await getTeacherAvailabilityByDate(selectedDate);
      setLeaveRecords(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchTeachers() {
    try {
      const data = await getTeachers();
      setTeachers(data);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleEditClick(teacher) {
    setEditingTeacher(teacher);
    setShowModal(true);
  }

  async function handleSaveTeacher(newTeacher) {
    try {
      if (editingTeacher) {
        await updateTeacher(editingTeacher.id, newTeacher);
      } else {
        await addTeacher(newTeacher);
      }

      setEditingTeacher(null);
      setShowModal(false);
      await fetchTeachers();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  async function handleDeleteTeacher(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this teacher?"
    );

    if (!confirmDelete) return;

    try {
      await deleteTeacher(id);
      fetchTeachers();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  const handleClearSearch = () => setSearchTerm("");

  async function handleSetAvailability(teacherId, status, session = null) {
    try {
      await setTeacherAvailability(teacherId, selectedDate, status, session);
      await fetchLeaveRecords();
    } catch (error) {
      console.error(error);
      alert(error.message || "An error occurred while updating availability.");
      await fetchLeaveRecords();
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Teachers"
          description="Manage your teaching staff"
          action={
            <Button onClick={() => { setEditingTeacher(null); setShowModal(true); }}>
              <Plus className="size-4" aria-hidden="true" />
              Add Teacher
            </Button>
          }
        />

        <Card variant="default" padding="md">
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <SearchBar
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClear={handleClearSearch}
                placeholder="Search teachers by name, email, or mobile..."
              />
              <div className="flex items-center gap-2">
                <label htmlFor="date-picker" className="text-sm font-medium text-text-primary whitespace-nowrap">
                  Select Date:
                </label>
                <input
                  id="date-picker"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <Card variant="default" padding="md">
            <CardContent className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4 text-text-secondary">
                <div className="animate-spin rounded-full border-4 border-primary border-t-transparent size-8" aria-label="Loading" />
                <p>Loading teachers...</p>
              </div>
            </CardContent>
          </Card>
        ) : filteredTeachers.length === 0 ? (
          <Card variant="default" padding="md">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-slate-100 rounded-full mb-4">
                <MoreHorizontal className="size-8 text-text-muted" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-1">No teachers found</h3>
              <p className="text-text-secondary mb-6">
                {searchTerm ? "Try adjusting your search criteria" : "Get started by adding your first teacher"}
              </p>
              {!searchTerm && (
                <Button onClick={() => { setEditingTeacher(null); setShowModal(true); }}>
                  <Plus className="size-4" aria-hidden="true" />
                  Add Teacher
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card variant="default" padding="none">
            <CardContent className="p-0">
              <TeacherTable
                teachers={filteredTeachers}
                leaveRecords={leaveRecords}
                onEdit={handleEditClick}
                onDelete={handleDeleteTeacher}
                onSetAvailability={handleSetAvailability}
              />
            </CardContent>
          </Card>
        )}

        <TeacherModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingTeacher(null);
          }}
          initialData={editingTeacher}
          onSubmit={handleSaveTeacher}
        />
      </div>
    </AdminLayout>
  );
}

export default Teachers;