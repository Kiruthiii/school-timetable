
import { useEffect, useState } from "react";
import {
  getClasses,
  addClass,
  updateClass,
  deleteClass,
} from "../services/classService";
import { getTeachers } from "../services/teacherService";

import AdminLayout from "../layouts/AdminLayout";

import {
  PageHeader,
  Card,
  CardContent,
  Button,
} from "../components/ui";

import { Plus } from "lucide-react";

import ClassModal from "../components/classes/ClassModal";
import ClassTable from "../components/classes/ClassTable";

function Classes() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingClass, setEditingClass] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClasses = classes.filter((cls) =>
  cls.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  (cls.teachers?.teacher_name ?? "")
    .toLowerCase()
    .includes(searchTerm.toLowerCase())
);

  async function fetchData() {
    try {
      const [classesData, teachersData] = await Promise.all([
        getClasses(),
        getTeachers(),
      ]);
      setClasses(classesData);
      setTeachers(teachersData);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

 async function handleSubmit(formData) {
  try {
    if (editingClass) {
      await updateClass(editingClass.id, formData);
    } else {
      await addClass(formData);
    }

    await fetchData();

    setShowModal(false);
    setEditingClass(null);

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this class?"
    );

    if (!confirmed) return;

    try {
      await deleteClass(id);

      await fetchData();
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
            title="Classes"
            description="Manage classes and class teachers"
          />

          <Card variant="default" padding="md">
            <CardContent className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full border-4 border-primary border-t-transparent size-8" />
                <p>Loading classes...</p>
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
          title="Classes"
          description="Manage classes and class teachers"
          action={
            <Button
              onClick={() => {
                setEditingClass(null);
                setShowModal(true);
              }}
            >
              <Plus className="size-4" />
              Add Class
            </Button>
          }
        />

        <div className="px-1">
          <input
            type="text"
            placeholder="Search Class..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80 rounded-lg border border-slate-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <ClassTable
          classes={filteredClasses}
          onEdit={(cls)=>{
            setEditingClass(cls);
            setShowModal(true);
          }}
          onDelete={handleDelete}
        />
      </div>

      <ClassModal
        isOpen={showModal}
        initialData={editingClass}
        onClose={() => {
          setShowModal(false);
          setEditingClass(null);
        }}
        onSubmit={handleSubmit}
        teachers={teachers}
      />
    </AdminLayout>
  );
}

export default Classes;
