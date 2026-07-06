import { Modal } from "../../components/ui";
import FixedSlotForm from "./FixedSlotForm";

function FixedSlotModal({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  classes,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Reserved Period" : "Reserve Period"}
      description={
        initialData
          ? "Update reserved period information"
          : "Reserve a new period for a class"
      }
      size="md"
    >
      <FixedSlotForm
        initialData={initialData}
        onSubmit={onSubmit}
        onCancel={onClose}
        classes={classes}
      />
    </Modal>
  );
}

export default FixedSlotModal;
