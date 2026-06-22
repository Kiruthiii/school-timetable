
import { useEffect, useState } from "react";
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
} from "../components/ui";

import { Plus } from "lucide-react";

import SubjectModal from "../components/Subjects/SubjectModal";
import SubjectTable from "../components/Subjects/SubjectTable";

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSubject, setEditingSubject] = useState(null);
  const [showModal, setShowModal] = useState(false);
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
      alert(error.message);
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
      } else {
        await addSubject(formData);
      }

      await fetchSubjects();

      setShowModal(false);
      setEditingSubject(null);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this subject?"
    );

    if (!confirmed) return;

    try {
      await deleteSubject(id);
      await fetchSubjects();
    } catch (error) {
      console.error(error);
      alert(error.message);
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
    </AdminLayout>
  );
}

export default Subjects;
