import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import TeacherTable from "../components/teachers/TeacherTable";
import TeacherModal from "../components/teachers/TeacherModal";

import {
  getTeachers,
  addTeacher,
  updateTeacher,
  deleteTeacher,
} from "../services/teacherService";

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

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
      fetchTeachers();
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

  return (
    <AdminLayout>
      <div className="p-6">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">
            Teachers
          </h1>

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            onClick={() => {
              setEditingTeacher(null);
              setShowModal(true);
            }}
          >
            + Add Teacher
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : teachers.length === 0 ? (
          <p>No teachers found.</p>
        ) : (
          <TeacherTable
            teachers={teachers}
            onEdit={handleEditClick}
            onDelete={handleDeleteTeacher}
          />
        )}

        {showModal && (
          <TeacherModal
            initialData={editingTeacher}
            onSubmit={handleSaveTeacher}
            onClose={() => {
              setShowModal(false);
              setEditingTeacher(null);
            }}
          />
        )}

      </div>
    </AdminLayout>
  );
}

export default Teachers;