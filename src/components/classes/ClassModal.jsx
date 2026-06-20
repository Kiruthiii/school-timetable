import { Modal } from "../../components/ui";
import ClassForm from "./ClassForm";

function ClassModal({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  teachers
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Class" : "Add Class"}
      description={
        initialData
          ? "Update class information"
          : "Add a new class to the system"
      }
      size="md"
    >
      <ClassForm
        initialData={initialData}
        onSubmit={onSubmit}
        onCancel={onClose}
        teachers={teachers}
      />
    </Modal>
  );
}

export default ClassModal;
