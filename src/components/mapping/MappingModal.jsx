import { Modal } from "../ui";
import MappingForm from "./MappingForm";

function MappingModal({
  isOpen,
  onClose,
  initialData,
  classes,
  subjects,
  teachers,
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
      size="md"
    >
      <MappingForm
        initialData={initialData}
        classes={classes}
        subjects={subjects}
        teachers={teachers}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
}

export default MappingModal;