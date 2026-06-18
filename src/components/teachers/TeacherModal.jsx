import TeacherForm from "./TeacherForm";

function TeacherModal({
  onClose,
  initialData,
  onSubmit,
}) {

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">

      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">

        <div className="flex justify-between items-center mb-5">

          <h2 className="text-2xl font-bold">
            {initialData ? "Edit Teacher" : "Add Teacher"}
          </h2>

          <button
            onClick={onClose}
            className="text-xl"
          >
            ✖
          </button>

        </div>

        <TeacherForm
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={onClose}
        />

      </div>

    </div>
  );
}

export default TeacherModal;