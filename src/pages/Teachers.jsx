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
  getTeacherAvailability,
  addTeacherAvailability,
  updateTeacherAvailability,
  deleteTeacherAvailability,
} from "../services/teacherAvailabilityService";
import TeacherAvailabilityModal from "../components/teachers/TeacherAvailabilityModal";

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [availabilityRecords, setAvailabilityRecords] = useState([]);
  const [editingAvailability, setEditingAvailability] = useState(null);

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
    fetchAvailability();
  }, []);

  async function fetchAvailability() {
    try {
      const data = await getTeacherAvailability();
      setAvailabilityRecords(data);
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

  function handleLeaveClick(teacher) {
    setSelectedTeacher(teacher);
    setEditingAvailability(null);
    setShowAvailabilityModal(true);
  }

  function handleEditAvailability(record) {
    setSelectedTeacher(record.teachers);
    setEditingAvailability(record);
    setShowAvailabilityModal(true);
  }

  async function handleDeleteAvailability(id) {
    if (!window.confirm("Are you sure you want to delete this leave record?")) return;
    try {
      await deleteTeacherAvailability(id);
      await fetchAvailability();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  async function handleSaveAvailability(recordData) {
    try {
      if (editingAvailability) {
        await updateTeacherAvailability(editingAvailability.id, recordData);
      } else {
        await addTeacherAvailability(recordData);
      }
      setEditingAvailability(null);
      setShowAvailabilityModal(false);
      await fetchAvailability();
    } catch (error) {
      console.error(error);
      if (error?.code === '23505' || error?.message?.includes('duplicate') || error?.message?.includes('unique_teacher_date')) {
        alert("Leave already marked for this date.");
      } else {
        alert(error.message);
      }
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
                onEdit={handleEditClick}
                onDelete={handleDeleteTeacher}
                onLeave={handleLeaveClick}
              />
            </CardContent>
          </Card>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-text-primary">Leave History</h2>
          <Card variant="default" padding="none">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-slate-50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">
                        Teacher
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {availabilityRecords.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-text-secondary">
                          No leave records found.
                        </td>
                      </tr>
                    ) : (
                      availabilityRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="md:hidden">
                              <p className="font-medium text-text-primary mb-1">{formatDate(record.date)}</p>
                              <p className="text-sm text-text-secondary">Teacher: {record.teachers?.teacher_name}</p>
                              <p className="text-sm text-text-secondary">Status: {record.status}</p>
                            </div>
                            <span className="hidden md:inline font-medium text-text-primary">
                              {formatDate(record.date)}
                            </span>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            {record.teachers?.teacher_name}
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <span className={`px-2 py-1 text-xs font-medium rounded-lg ${record.status === 'Leave' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditAvailability(record)}
                                aria-label="Edit Leave"
                              >
                                <Pencil className="size-4" aria-hidden="true" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-danger hover:bg-danger-light"
                                onClick={() => handleDeleteAvailability(record.id)}
                                aria-label="Delete Leave"
                              >
                                <Trash2 className="size-4" aria-hidden="true" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <TeacherModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingTeacher(null);
          }}
          initialData={editingTeacher}
          onSubmit={handleSaveTeacher}
        />

        <TeacherAvailabilityModal
          isOpen={showAvailabilityModal}
          onClose={() => {
            setShowAvailabilityModal(false);
            setEditingAvailability(null);
          }}
          initialData={editingAvailability}
          selectedTeacher={selectedTeacher}
          onSubmit={handleSaveAvailability}
        />
      </div>
    </AdminLayout>
  );
}

export default Teachers;