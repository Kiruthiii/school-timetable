import { useEffect, useState } from "react";
import {
  getMappings,
  addMapping,
  updateMapping,
  deleteMapping,
} from "../services/mappingService";
import AdminLayout from "../layouts/AdminLayout";
import { PageHeader, Card, CardContent, SearchBar } from "../components/ui";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "../components/ui";
import MappingModal from "../components/mapping/MappingModal";

import { getClasses } from "../services/classService";
import { getSubjects } from "../services/subjectService";
import { getTeachers } from "../services/teacherService";
import MappingTable from "../components/mapping/MappingTable";

function Mapping() {
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMapping, setEditingMapping] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

const [classes, setClasses] = useState([]);
const [subjects, setSubjects] = useState([]);
const [teachers, setTeachers] = useState([]);


async function fetchDropdownData() {
  try {
    const [classData, subjectData, teacherData] =
      await Promise.all([
        getClasses(),
        getSubjects(),
        getTeachers(),
      ]);

    setClasses(classData);
    setSubjects(subjectData);
    setTeachers(teacherData);
  } catch (error) {
    console.error(error);
  }
}

async function handleSubmit(formData) {
  try {
    if (editingMapping) {
      await updateMapping(editingMapping.id, formData);
    } else {
      await addMapping(formData);
    }

    await fetchMappings();

    setShowModal(false);
    setEditingMapping(null);

  } catch (error) {
    console.error(error);
    if (error?.code === '23505' || error?.message?.includes('duplicate')) {
      alert("Mapping already exists");
    } else {
      alert(error.message);
    }
  }
}

  async function handleDelete(id) {
    if (window.confirm("Are you sure you want to delete this mapping?")) {
      try {
        await deleteMapping(id);
        await fetchMappings();
      } catch (error) {
        console.error(error);
        alert(error.message);
      }
    }
  }

  async function fetchMappings() {
    try {
      const data = await getMappings();
      setMappings(data);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  fetchMappings();
  fetchDropdownData();
}, []);

  const filteredMappings = mappings.filter((mapping) => {
    const search = searchQuery.toLowerCase();
    const className = mapping.classes?.class_name?.toLowerCase() || "";
    const subjectName = mapping.subjects?.subject_name?.toLowerCase() || "";
    const teacherName = mapping.teachers?.teacher_name?.toLowerCase() || "";
    
    return (
      className.includes(search) ||
      subjectName.includes(search) ||
      teacherName.includes(search)
    );
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <PageHeader
            title="Mapping"
            description="Manage class subject teacher mappings"
          />

          <Card variant="default" padding="md">
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-primary" />
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
  title="Mapping"
  description="Manage class subject teacher mappings"
  action={
    <Button
      onClick={() => {
        setEditingMapping(null);
        setShowModal(true);
      }}
    >
      <Plus className="size-4" />
      Add Mapping
    </Button>
  }
/>
        <Card variant="default" padding="md">
          <CardContent>
            {mappings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 mb-4">No mappings found</p>
                <Button
                  onClick={() => {
                    setEditingMapping(null);
                    setShowModal(true);
                  }}
                >
                  <Plus className="size-4 mr-2" />
                  Add Mapping
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <SearchBar
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClear={() => setSearchQuery("")}
                  placeholder="Search mappings..."
                />
                <MappingTable
                  mappings={filteredMappings}
                  onEdit={(mapping) => {
                    setEditingMapping(mapping);
                    setShowModal(true);
                  }}
                  onDelete={handleDelete}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <MappingModal
  isOpen={showModal}
  initialData={editingMapping}
  classes={classes}
  subjects={subjects}
  teachers={teachers}
  onSubmit={handleSubmit}
  onClose={() => {
    setShowModal(false);
    setEditingMapping(null);
    
  }}
/>
    </AdminLayout>
  );
}

export default Mapping;