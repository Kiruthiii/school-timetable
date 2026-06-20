import { Modal } from "../../components/ui";
import TeacherForm from "./TeacherForm";

function TeacherModal({
  isOpen,
  onClose,
  initialData,
  onSubmit,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Teacher" : "Add Teacher"}
      description={initialData ? "Update teacher information" : "Add a new teacher to the system"}
      size="lg"
    >
      <TeacherForm
        initialData={initialData}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
}3

export default TeacherModal;