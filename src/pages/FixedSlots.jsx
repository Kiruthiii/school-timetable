import { useEffect, useState } from "react";
import {
  getFixedSlots,
  addFixedSlot,
  updateFixedSlot,
  deleteFixedSlot,
} from "../services/fixedSlotService";
import { getClasses } from "../services/classService";

import AdminLayout from "../layouts/AdminLayout";

import {
  PageHeader,
  Card,
  CardContent,
  Button,
  ConfirmModal,
} from "../components/ui";

import { Plus } from "lucide-react";
import toast from "react-hot-toast";

import FixedSlotModal from "../components/FixedSlots/FixedSlotModal";
import FixedSlotTable from "../components/FixedSlots/FixedSlotTable";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function FixedSlots() {
  const [fixedSlots, setFixedSlots] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSlot, setEditingSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchClass, setSearchClass] = useState("");
  const [filterDay, setFilterDay] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("");
  const [filterSlotType, setFilterSlotType] = useState("");

  const filteredSlots = fixedSlots.filter((slot) => {
    const classNameMatch = slot.classes?.class_name
      ?.toLowerCase()
      .includes(searchClass.toLowerCase());
    const dayMatch = filterDay ? slot.day_of_week === Number(filterDay) : true;
    const periodMatch = filterPeriod ? slot.period === Number(filterPeriod) : true;
    const typeMatch = filterSlotType ? slot.type === filterSlotType : true;
    return classNameMatch && dayMatch && periodMatch && typeMatch;
  }).sort((a, b) => {
    const classA = a.classes?.class_name || "";
    const classB = b.classes?.class_name || "";
    if (classA !== classB) {
      return classA.localeCompare(classB);
    }
    const dayA = a.day_of_week;
    const dayB = b.day_of_week;
    if (dayA !== dayB) {
      return dayA - dayB;
    }
    return a.period - b.period;
  });

  async function fetchData() {
    try {
      const [slotsData, classesData] = await Promise.all([
        getFixedSlots(),
        getClasses(),
      ]);
      setFixedSlots(slotsData);
      setClasses(classesData);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleSubmit(formData) {
    try {
      if (editingSlot) {
        if (formData.class_ids.length !== 1) {
          toast.error("Please select exactly one class when editing.");
          return;
        }
        const updateData = {
          class_id: formData.class_ids[0],
          day_of_week: formData.day_of_week,
          period: formData.period,
          type: formData.type
        };
        await updateFixedSlot(editingSlot.id, updateData);
        toast.success("Reserved period updated successfully.");
      } else {
        if (formData.class_ids.length === 0) {
          toast.error("Please select at least one class.");
          return;
        }
        
        let createdCount = 0;
        let skippedCount = 0;

        for (const classId of formData.class_ids) {
          const createData = {
            class_id: classId,
            day_of_week: formData.day_of_week,
            period: formData.period,
            type: formData.type
          };
          try {
            await addFixedSlot(createData);
            createdCount++;
          } catch {
            skippedCount++;
          }
        }

        if (createdCount > 0) {
          toast.success(`Created ${createdCount} reserved periods.${skippedCount > 0 ? ` Skipped ${skippedCount} duplicate records.` : ""}`);
        } else if (skippedCount > 0) {
          toast.error(`Skipped ${skippedCount} duplicate records. No new periods created.`);
        }
      }

      await fetchData();

      setShowModal(false);
      setEditingSlot(null);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to save reserved period");
    }
  }

  function handleDelete(id) {
    setSlotToDelete(id);
  }

  async function confirmDeleteSlot() {
    if (!slotToDelete) return;
    setIsDeleting(true);
    try {
      await deleteFixedSlot(slotToDelete);
      toast.success("Reserved period deleted successfully.");
      await fetchData();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to delete reserved period");
    } finally {
      setIsDeleting(false);
      setSlotToDelete(null);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <PageHeader
            title="Reserved Periods"
            description="Configure reserved periods such as Assembly and ECA."
          />

          <Card variant="default" padding="md">
            <CardContent className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full border-4 border-primary border-t-transparent size-8" />
                <p>Loading reserved periods...</p>
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
          title="Reserved Periods"
          description="Configure reserved periods such as Assembly and ECA."
          action={
            <Button
              onClick={() => {
                setEditingSlot(null);
                setShowModal(true);
              }}
            >
              <Plus className="size-4" />
              Reserve Period
            </Button>
          }
        />

        <div className="flex flex-col md:flex-row gap-4 px-1">
          <input
            type="text"
            placeholder="Search by Class..."
            value={searchClass}
            onChange={(e) => setSearchClass(e.target.value)}
            className="w-full md:w-64 rounded-lg border border-slate-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterDay}
            onChange={(e) => setFilterDay(e.target.value)}
            className="w-full md:w-48 rounded-lg border border-slate-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Days</option>
            {daysOfWeek.map((d, index) => <option key={d} value={index + 1}>{d}</option>)}
          </select>
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="w-full md:w-48 rounded-lg border border-slate-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Periods</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(p => <option key={p} value={p}>Period {p}</option>)}
          </select>
          <select
            value={filterSlotType}
            onChange={(e) => setFilterSlotType(e.target.value)}
            className="w-full md:w-48 rounded-lg border border-slate-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Reserved Slots</option>
            <option value="Assembly">Assembly</option>
            <option value="ECA">ECA</option>
          </select>
        </div>

        <FixedSlotTable
          fixedSlots={filteredSlots}
          onEdit={(slot) => {
            setEditingSlot(slot);
            setShowModal(true);
          }}
          onDelete={handleDelete}
          onAdd={() => {
            setEditingSlot(null);
            setShowModal(true);
          }}
        />
      </div>

      <FixedSlotModal
        isOpen={showModal}
        initialData={editingSlot}
        onClose={() => {
          setShowModal(false);
          setEditingSlot(null);
        }}
        onSubmit={handleSubmit}
        classes={classes}
      />

      <ConfirmModal
        isOpen={!!slotToDelete}
        onClose={() => setSlotToDelete(null)}
        onConfirm={confirmDeleteSlot}
        title="Delete Reserved Period?"
        message="Are you sure you want to delete this reserved period slot? This action cannot be undone."
        confirmText="Delete Slot"
        loading={isDeleting}
      />
    </AdminLayout>
  );
}

export default FixedSlots;
