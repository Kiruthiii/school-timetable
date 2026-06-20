import { Modal } from "../../components/ui";
import SubjectForm from "./SubjectForm";

function SubjectModal({
  isOpen,
  onClose,
  initialData,
  onSubmit,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Subject" : "Add Subject"}
      description={
        initialData
          ? "Update subject information"
          : "Add a new subject to the system"
      }
      size="md"
    >
      <SubjectForm
        initialData={initialData}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
}

export default SubjectModal;