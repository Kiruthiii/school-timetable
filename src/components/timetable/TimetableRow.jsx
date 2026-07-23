

const TimetableRow = ({ period, entry, isMobile = false }) => {
  const isFreePeriod = !entry || (!entry.subjects && !entry.slot_type);
  const isReserved = !!entry?.slot_type;

  const getReservedBadge = (slot_type) => {
    switch (slot_type) {
      case 'Assembly':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 font-medium text-sm">Assembly</span>;
      case 'ECA':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-green-100 text-green-800 font-medium text-sm">ECA</span>;
      case 'Slip Test':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-orange-100 text-orange-800 font-medium text-sm">Slip Test</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-800 font-medium text-sm">{slot_type}</span>;
    }
  };

  if (isMobile) {
    return (
      <div className="bg-white border border-border rounded-lg p-4 shadow-sm flex flex-col gap-3">
        <div className="flex justify-between items-center border-b border-border pb-2">
          <span className="text-sm font-semibold text-text-primary">Period {period}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-text-muted uppercase">Subject</span>
          {isFreePeriod ? (
            <span className="text-text-muted italic">—</span>
          ) : isReserved ? (
            getReservedBadge(entry.slot_type)
          ) : (
            <span className="text-sm font-medium text-text-primary">{entry.subjects?.subject_name}</span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-text-muted uppercase">Teacher</span>
          {isFreePeriod || isReserved ? (
            <span className="text-text-muted">—</span>
          ) : (
            <span className="text-sm text-text-primary">{entry.teachers ? entry.teachers.teacher_name : "—"}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4 border-b border-border py-4 px-6 hover:bg-slate-50/50 transition-colors items-center">
      <div className="flex items-center text-sm font-medium text-text-primary">
        Period {period}
      </div>
      <div className="flex items-center">
        {isFreePeriod ? (
          <span className="text-text-muted italic">—</span>
        ) : isReserved ? (
          getReservedBadge(entry.slot_type)
        ) : (
          <span className="text-text-primary font-medium text-sm">
            {entry.subjects?.subject_name}
          </span>
        )}
      </div>
      <div className="flex items-center">
        {isFreePeriod || isReserved ? (
          <span className="text-text-muted">—</span>
        ) : (
          <span className="text-text-primary text-sm">
            {entry.teachers ? entry.teachers.teacher_name : "—"}
          </span>
        )}
      </div>
    </div>
  );
};

export default TimetableRow;
