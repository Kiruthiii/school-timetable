import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getMappings,
  addMapping,
  updateMapping,
  deleteMapping,
} from "../services/mappingService";
import AdminLayout from "../layouts/AdminLayout";
import { PageHeader, Card, CardContent, SearchBar, ConfirmModal } from "../components/ui";
import { Plus, Loader2, X, LayoutGrid, Table as TableIcon, Network } from "lucide-react";
import { Button } from "../components/ui";
import MappingModal from "../components/mapping/MappingModal";
import N8nMappingCanvas from "../components/mapping/N8nMappingCanvas";

import { getClasses } from "../services/classService";
import { getSubjects } from "../services/subjectService";
import { getTeachers } from "../services/teacherService";
import MappingTable from "../components/mapping/MappingTable";

function Mapping() {
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMapping, setEditingMapping] = useState(null);
  const [mappingToDelete, setMappingToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("canvas"); // 'canvas' | 'table'

const [classes, setClasses] = useState([]);
const [subjects, setSubjects] = useState([]);
const [teachers, setTeachers] = useState([]);

const [selectedClassId, setSelectedClassId] = useState("all");
const [selectedTeacherId, setSelectedTeacherId] = useState("all");
const [selectedSubjectId, setSelectedSubjectId] = useState("all");
const [selectedPriority, setSelectedPriority] = useState("all");


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
        await updateMapping(editingMapping.id, {
          class_id: formData.class_id,
          subject_id: formData.subject_id,
          teacher_id: formData.teacher_id,
          weekly_periods: formData.weekly_periods,
        });

        await fetchMappings();
        setShowModal(false);
        setEditingMapping(null);
        toast.success("Mapping updated successfully");
      } else {
        let successCount = 0;
        let duplicateCount = 0;

        for (const classId of formData.class_ids) {
          const isDuplicate = mappings.some(
            (m) => m.class_id === classId && m.subject_id === formData.subject_id
          );

          if (isDuplicate) {
            duplicateCount++;
          } else {
            await addMapping({
              class_id: classId,
              subject_id: formData.subject_id,
              teacher_id: formData.teacher_id,
              weekly_periods: formData.weekly_periods,
            });
            successCount++;
          }
        }

        await fetchMappings();
        setShowModal(false);
        setEditingMapping(null);
        
        if (duplicateCount > 0) {
          toast.success(`Created ${successCount} mappings (${duplicateCount} skipped as duplicates)`);
        } else {
          toast.success(`Successfully created ${successCount} mappings`);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to save mapping");
    }
  }

  function handleDelete(id) {
    setMappingToDelete(id);
  }

  async function confirmDeleteMapping() {
    if (!mappingToDelete) return;
    setIsDeleting(true);
    try {
      await deleteMapping(mappingToDelete);
      toast.success("Mapping deleted successfully");
      await fetchMappings();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to delete mapping");
    } finally {
      setIsDeleting(false);
      setMappingToDelete(null);
    }
  }

  async function fetchMappings() {
    try {
      const data = await getMappings();
      setMappings(data);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to fetch mappings");
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
    
    const matchesSearch =
      className.includes(search) ||
      subjectName.includes(search) ||
      teacherName.includes(search);

    const matchesClass = selectedClassId === "all" || String(mapping.class_id) === String(selectedClassId);
    const matchesTeacher = selectedTeacherId === "all" || String(mapping.teacher_id) === String(selectedTeacherId);
    const matchesSubject = selectedSubjectId === "all" || String(mapping.subject_id) === String(selectedSubjectId);
    const matchesPriority = selectedPriority === "all" || String(mapping.subjects?.priority) === String(selectedPriority);

    return matchesSearch && matchesClass && matchesTeacher && matchesSubject && matchesPriority;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedClassId("all");
    setSelectedTeacherId("all");
    setSelectedSubjectId("all");
    setSelectedPriority("all");
  };

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
          description="Manage class-subject-teacher mappings via visual workflow nodes or table list"
          action={
            <div className="flex items-center gap-3">
              {/* View Switcher Controls */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
                <button
                  type="button"
                  onClick={() => setViewMode("canvas")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === "canvas"
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  <Network className="size-4 text-indigo-400" />
                  <span>n8n Canvas Node View</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === "table"
                      ? "bg-white text-slate-900 shadow-md"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  <TableIcon className="size-4 text-slate-500" />
                  <span>Table View</span>
                </button>
              </div>

              <Button
                onClick={() => {
                  setEditingMapping(null);
                  setShowModal(true);
                }}
              >
                <Plus className="size-4 mr-1" />
                Add Mapping Node
              </Button>
            </div>
          }
        />

        {viewMode === "canvas" ? (
          <N8nMappingCanvas
            mappings={filteredMappings}
            classes={classes}
            subjects={subjects}
            teachers={teachers}
            onEdit={(mapping) => {
              setEditingMapping(mapping);
              setShowModal(true);
            }}
            onDelete={handleDelete}
            onAdd={() => {
              setEditingMapping(null);
              setShowModal(true);
            }}
          />
        ) : (
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
                  <div className="flex flex-col gap-4 mb-4">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                      <div className="w-full md:w-1/4">
                        <SearchBar
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onClear={() => setSearchQuery("")}
                          placeholder="Search mappings..."
                        />
                      </div>
                      
                      <div className="w-full md:w-1/6 flex flex-col gap-1">
                        <label className="text-xs text-slate-500 font-medium">Class</label>
                        <select
                          value={selectedClassId}
                          onChange={(e) => setSelectedClassId(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                        >
                          <option value="all">All Classes</option>
                          {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.class_name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="w-full md:w-1/6 flex flex-col gap-1">
                        <label className="text-xs text-slate-500 font-medium">Teacher</label>
                        <select
                          value={selectedTeacherId}
                          onChange={(e) => setSelectedTeacherId(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                        >
                          <option value="all">All Teachers</option>
                          {teachers.map(t => (
                            <option key={t.id} value={t.id}>{t.teacher_name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="w-full md:w-1/6 flex flex-col gap-1">
                        <label className="text-xs text-slate-500 font-medium">Subject</label>
                        <select
                          value={selectedSubjectId}
                          onChange={(e) => setSelectedSubjectId(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                        >
                          <option value="all">All Subjects</option>
                          {subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.subject_name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="w-full md:w-1/6 flex flex-col gap-1">
                        <label className="text-xs text-slate-500 font-medium">Priority</label>
                        <select
                          value={selectedPriority}
                          onChange={(e) => setSelectedPriority(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                        >
                          <option value="all">All Priorities</option>
                          <option value="1">1 (High)</option>
                          <option value="2">2 (Medium)</option>
                          <option value="3">3 (Low)</option>
                          <option value="4">4 (Lowest)</option>
                        </select>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        className="w-full md:w-auto h-[38px] px-4"
                        onClick={clearFilters}
                      >
                        <X className="size-4 mr-2" />
                        Clear Filters
                      </Button>
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-500 border-t border-slate-100 pt-3">
                      <span>Showing {filteredMappings.length} of {mappings.length} mappings</span>
                    </div>
                  </div>
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
        )}
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

      <ConfirmModal
        isOpen={!!mappingToDelete}
        onClose={() => setMappingToDelete(null)}
        onConfirm={confirmDeleteMapping}
        title="Delete Mapping?"
        message="Are you sure you want to delete this class-subject-teacher mapping?"
        confirmText="Delete Mapping"
        loading={isDeleting}
      />
    </AdminLayout>
  );
}

export default Mapping;