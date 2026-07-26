
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getSubjects,
  addSubject,
  updateSubject,
  deleteSubject,
} from "../services/subjectService";

import AdminLayout from "../layouts/AdminLayout";

import {
  PageHeader,
  Card,
  CardContent,
  Button,
  ConfirmModal,
} from "../components/ui";

import { Plus } from "lucide-react";

import SubjectModal from "../components/Subjects/SubjectModal";
import SubjectTable from "../components/Subjects/SubjectTable";

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSubject, setEditingSubject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.subject_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      subject.short_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  async function fetchSubjects() {
    try {
      const data = await getSubjects();
      setSubjects(data);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to fetch subjects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSubjects();
  }, []);

  async function handleSubmit(formData) {
    try {
      if (editingSubject) {
        await updateSubject(editingSubject.id, formData);
        toast.success("Subject updated successfully");
      } else {
        await addSubject(formData);
        toast.success("Subject added successfully");
      }

      await fetchSubjects();

      setShowModal(false);
      setEditingSubject(null);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to save subject");
    }
  }

  function handleDelete(id) {
    setSubjectToDelete(id);
  }

  async function confirmDeleteSubject() {
    if (!subjectToDelete) return;
    setIsDeleting(true);
    try {
      await deleteSubject(subjectToDelete);
      toast.success("Subject deleted successfully");
      await fetchSubjects();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to delete subject");
    } finally {
      setIsDeleting(false);
      setSubjectToDelete(null);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <PageHeader
            title="Subjects"
            description="Manage academic subjects and assignments"
          />

          <Card variant="default" padding="md">
            <CardContent className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full border-4 border-primary border-t-transparent size-8" />
                <p>Loading subjects...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Subjects"
          description="Manage academic subjects and assignments"
          action={
            <Button
              onClick={() => {
                setEditingSubject(null);
                setShowModal(true);
              }}
            >
              <Plus className="size-4" />
              Add Subject
            </Button>
          }
        />

        <div className="px-1">
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80 rounded-lg border border-slate-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <SubjectTable
          subjects={filteredSubjects}
          onEdit={(subject) => {
            setEditingSubject(subject);
            setShowModal(true);
          }}
          onDelete={handleDelete}
        />
      </div>

      <SubjectModal
        isOpen={showModal}
        initialData={editingSubject}
        onClose={() => {
          setShowModal(false);
          setEditingSubject(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        isOpen={!!subjectToDelete}
        onClose={() => setSubjectToDelete(null)}
        onConfirm={confirmDeleteSubject}
        title="Delete Subject?"
        message="Are you sure you want to delete this subject? All associated teacher-class mappings and fixed slot rules for this subject will also be deleted."
        confirmText="Delete Subject"
        loading={isDeleting}
      />
    </AdminLayout>
  );
}

export default Subjects;
