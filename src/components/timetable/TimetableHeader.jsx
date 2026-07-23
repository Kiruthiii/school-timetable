

const TimetableHeader = () => {
  return (
    <div className="grid grid-cols-3 gap-4 bg-slate-50 border-b border-border px-6 py-4">
      <div className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
        Period
      </div>
      <div className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
        Subject / Reserved Period
      </div>
      <div className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
        Teacher
      </div>
    </div>
  );
};

export default TimetableHeader;
