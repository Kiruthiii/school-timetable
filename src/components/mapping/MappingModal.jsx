import { Modal } from "../ui";
import MappingForm from "./MappingForm";

function MappingModal({
  isOpen,
  onClose,
  initialData,
  classes,
  subjects,
  teachers,
  preselectedClassId,
  onSubmit,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Mapping" : "Add Mapping"}
      description={
        initialData
          ? "Update class subject teacher mapping"
          : "Create a new mapping"
      }
      size="lg"
    >
      <MappingForm
        initialData={initialData}
        classes={classes}
        subjects={subjects}
        teachers={teachers}
        preselectedClassId={preselectedClassId}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
}

export default MappingModal;