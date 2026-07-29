import { useState, useRef, useEffect } from "react";
import { 
  School, 
  BookOpen, 
  UserCheck, 
  Zap, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Edit3, 
  Trash2, 
  Plus, 
  Layers, 
  ChevronRight
} from "lucide-react";
import { Button } from "../ui";

export default function N8nMappingCanvas({
  mappings = [],
  classes = [],
  // eslint-disable-next-line no-unused-vars
  subjects = [],
  teachers = [],
  onEdit,
  onDelete,
  onAdd
}) {
  const [selectedClassId, setSelectedClassId] = useState("all");
  const [zoom, setZoom] = useState(1);
  const [activeNode, setActiveNode] = useState(null);
  const [lines, setLines] = useState([]);
  const canvasRef = useRef(null);
  const nodeRefs = useRef({});

  // Helper to register DOM ports for drawing SVG lines
  const registerPortRef = (key, element) => {
    if (element) {
      nodeRefs.current[key] = element;
    }
  };

  // Filter mappings based on selected class tab
  const activeMappings = selectedClassId === "all"
    ? mappings
    : mappings.filter((m) => String(m.class_id) === String(selectedClassId));

  // Determine active class object
  const currentClass = classes.find((c) => String(c.id) === String(selectedClassId));

  // Get active teachers participating in current mappings
  const activeTeacherIds = new Set(activeMappings.map((m) => m.teacher_id));
  const activeTeachers = teachers.filter((t) => activeTeacherIds.has(t.id));

  // Recalculate SVG curves between ports
  const updateLines = () => {
    if (!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newLines = [];

    activeMappings.forEach((mapping) => {
      const classPortKey = `class-out-${mapping.class_id}`;
      const mapInPortKey = `map-in-${mapping.id}`;
      const mapOutPortKey = `map-out-${mapping.id}`;
      const teacherPortKey = `teacher-in-${mapping.teacher_id}`;

      const classPort = nodeRefs.current[classPortKey];
      const mapInPort = nodeRefs.current[mapInPortKey];
      const mapOutPort = nodeRefs.current[mapOutPortKey];
      const teacherPort = nodeRefs.current[teacherPortKey];

      // Line 1: Class -> Mapping Node
      if (classPort && mapInPort) {
        const r1 = classPort.getBoundingClientRect();
        const r2 = mapInPort.getBoundingClientRect();

        const x1 = (r1.left + r1.width / 2 - canvasRect.left) / zoom;
        const y1 = (r1.top + r1.height / 2 - canvasRect.top) / zoom;
        const x2 = (r2.left + r2.width / 2 - canvasRect.left) / zoom;
        const y2 = (r2.top + r2.height / 2 - canvasRect.top) / zoom;

        newLines.push({
          id: `line-c-${mapping.class_id}-m-${mapping.id}`,
          x1,
          y1,
          x2,
          y2,
          classId: mapping.class_id,
          teacherId: mapping.teacher_id,
          mappingId: mapping.id,
          color: "#2563EB", // Primary Blue
        });
      }

      // Line 2: Mapping Node -> Teacher
      if (mapping.teacher_id && mapOutPort && teacherPort) {
        const r1 = mapOutPort.getBoundingClientRect();
        const r2 = teacherPort.getBoundingClientRect();

        const x1 = (r1.left + r1.width / 2 - canvasRect.left) / zoom;
        const y1 = (r1.top + r1.height / 2 - canvasRect.top) / zoom;
        const x2 = (r2.left + r2.width / 2 - canvasRect.left) / zoom;
        const y2 = (r2.top + r2.height / 2 - canvasRect.top) / zoom;

        newLines.push({
          id: `line-m-${mapping.id}-t-${mapping.teacher_id}`,
          x1,
          y1,
          x2,
          y2,
          classId: mapping.class_id,
          teacherId: mapping.teacher_id,
          mappingId: mapping.id,
          color: "#10B981", // Success Emerald
        });
      }
    });

    setLines(newLines);
  };

  useEffect(() => {
    updateLines();
    const timer = setTimeout(updateLines, 100);
    const canvasEl = canvasRef.current;
    window.addEventListener("resize", updateLines);
    if (canvasEl) {
      canvasEl.addEventListener("scroll", updateLines);
    }
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateLines);
      if (canvasEl) {
        canvasEl.removeEventListener("scroll", updateLines);
      }
    };
  }, [activeMappings, zoom, activeNode, selectedClassId]);

  // Highlight check
  const isLineHighlighted = (line) => {
    if (!activeNode) return false;
    if (activeNode.type === "class" && line.classId === activeNode.id) return true;
    if (activeNode.type === "teacher" && line.teacherId === activeNode.id) return true;
    if (activeNode.type === "mapping" && line.mappingId === activeNode.id) return true;
    return false;
  };

  // Stats calculation
  const totalClassPeriods = activeMappings.reduce(
    (acc, m) => acc + (Number(m.weekly_periods) || 0),
    0
  );

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 bg-white text-slate-900 shadow-sm flex flex-col min-h-[700px]">
      {/* Sleek Canvas Control & Class Selection Bar */}
      <div className="bg-white border-b border-slate-200 p-3 flex flex-wrap items-center justify-between gap-3 z-20 shadow-xs">
        {/* CLASS TABS BAR */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin py-0.5 max-w-full">
          <button
            onClick={() => setSelectedClassId("all")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedClassId === "all"
                ? "bg-blue-600 text-white shadow-xs ring-2 ring-blue-500/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200"
            }`}
          >
            <Layers className="size-3.5" />
            <span>All Classes</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${selectedClassId === "all" ? "bg-blue-700 text-white" : "bg-slate-200 text-slate-700"}`}>
              {mappings.length}
            </span>
          </button>

          {classes.map((cls) => {
            const classMapCount = mappings.filter((m) => String(m.class_id) === String(cls.id)).length;
            const isSelected = String(selectedClassId) === String(cls.id);

            return (
              <button
                key={cls.id}
                onClick={() => setSelectedClassId(String(cls.id))}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-xs ring-2 ring-blue-500/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200"
                }`}
              >
                <School className="size-3.5" />
                <span>{cls.class_name}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${isSelected ? "bg-blue-700 text-white" : "bg-slate-200 text-slate-700"}`}>
                  {classMapCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 shrink-0">
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
            className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="size-4" />
          </button>
          <span className="px-2 text-xs font-mono text-slate-600 min-w-[45px] text-center font-medium">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
            className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="size-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 rounded-lg hover:bg-white text-slate-500 hover:text-slate-900 transition-colors border-l border-slate-200 ml-1"
            title="Reset Zoom"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
      </div>

      {/* CANVAS WORKFLOW AREA */}
      <div
        ref={canvasRef}
        className="relative flex-1 overflow-auto bg-[#F8FAFC] bg-[radial-gradient(#CBD5E1_1.2px,transparent_1.2px)] [background-size:24px_24px] p-8 min-h-[600px]"
        onMouseLeave={() => setActiveNode(null)}
      >
        {/* SVG Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {lines.map((line) => {
            const isHighlighted = isLineHighlighted(line);
            const isDimmed = activeNode && !isHighlighted;
            const curveOffset = Math.abs(line.x2 - line.x1) * 0.45;
            const pathData = `M ${line.x1} ${line.y1} C ${line.x1 + curveOffset} ${line.y1}, ${line.x2 - curveOffset} ${line.y2}, ${line.x2} ${line.y2}`;

            return (
              <g key={line.id}>
                <path
                  d={pathData}
                  fill="none"
                  stroke={isHighlighted ? "#F59E0B" : line.color}
                  strokeWidth={isHighlighted ? "4" : "2"}
                  strokeOpacity={isDimmed ? 0.15 : isHighlighted ? 0.95 : 0.5}
                  className="transition-all duration-300"
                />

                {isHighlighted && (
                  <circle r="4" fill="#F59E0B">
                    <animateMotion path={pathData} dur="1.8s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>

        {/* Scalable Node Container */}
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
          className="relative z-10 transition-transform duration-150"
        >
          {selectedClassId !== "all" ? (
            /* FOCUSED CLASS NODE CANVAS (1 CLASS AT A TIME) */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto items-start">
              {/* LEFT: CLASS HERO NODE */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 font-semibold text-xs tracking-wider uppercase shadow-sm">
                  <School className="size-4 text-blue-600" />
                  <span>Class Hero Node</span>
                </div>

                <div
                  onMouseEnter={() => setActiveNode({ type: "class", id: currentClass?.id })}
                  className="relative rounded-2xl bg-white border border-blue-200 shadow-md p-5 space-y-4 group hover:border-blue-400 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-blue-600 text-white shadow-sm">
                        <School className="size-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                          {currentClass?.class_name || "Class"}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          Class Teacher: {currentClass?.teachers?.teacher_name || "Not assigned"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Period Stats */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-medium">Total Mapped Periods:</span>
                      <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {totalClassPeriods} periods/wk
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (totalClassPeriods / 35) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => onAdd(currentClass?.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Plus className="size-3.5" /> Add Subject to {currentClass?.class_name}
                  </Button>

                  {/* Output Connection Port */}
                  <div
                    ref={(el) => registerPortRef(`class-out-${currentClass?.id}`, el)}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 size-6 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center group-hover:scale-125 transition-transform z-20 shadow-md"
                  >
                    <div className="size-2.5 rounded-full bg-blue-600 animate-ping" />
                  </div>
                </div>
              </div>

              {/* CENTER: SUBJECT MAPPING PIPELINE NODES */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 font-semibold text-xs tracking-wider uppercase shadow-sm">
                  <div className="flex items-center gap-2">
                    <BookOpen className="size-4 text-purple-600" />
                    <span>Assigned Subjects</span>
                  </div>
                  <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-[10px] font-mono">
                    {activeMappings.length}
                  </span>
                </div>

                {activeMappings.length === 0 ? (
                  <div className="p-8 rounded-2xl border border-dashed border-slate-300 text-center bg-white shadow-sm">
                    <BookOpen className="size-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-700">No Subjects Mapped Yet</p>
                    <p className="text-xs text-slate-500 mb-4">Add a subject & teacher to {currentClass?.class_name}.</p>
                    <Button size="sm" onClick={() => onAdd(currentClass?.id)} className="bg-purple-600 hover:bg-purple-700 text-white text-xs">
                      <Plus className="size-3.5 mr-1" /> Add Subject Node
                    </Button>
                  </div>
                ) : (
                  activeMappings.map((m) => {
                    const isHovered = activeNode?.type === "mapping" && activeNode?.id === m.id;

                    return (
                      <div
                        key={m.id}
                        onMouseEnter={() => setActiveNode({ type: "mapping", id: m.id })}
                        className={`group relative rounded-2xl bg-white border transition-all duration-200 shadow-sm overflow-hidden ${
                          isHovered
                            ? "border-purple-500 ring-2 ring-purple-500/20 shadow-md scale-[1.02]"
                            : "border-slate-200 hover:border-purple-300 hover:shadow-md"
                        }`}
                      >
                        {/* Left Input Port */}
                        <div
                          ref={(el) => registerPortRef(`map-in-${m.id}`, el)}
                          className="absolute -left-2.5 top-1/2 -translate-y-1/2 size-5 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center z-20 group-hover:scale-125 transition-transform shadow-sm"
                        >
                          <div className="size-2 rounded-full bg-blue-600" />
                        </div>

                        {/* Right Output Port */}
                        <div
                          ref={(el) => registerPortRef(`map-out-${m.id}`, el)}
                          className="absolute -right-2.5 top-1/2 -translate-y-1/2 size-5 rounded-full bg-white border-2 border-emerald-600 flex items-center justify-center z-20 group-hover:scale-125 transition-transform shadow-sm"
                        >
                          <div className="size-2 rounded-full bg-emerald-600" />
                        </div>

                        {/* Header */}
                        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <BookOpen className="size-4 text-purple-600" />
                            <span className="font-bold text-xs text-slate-900">
                              {m.subjects?.subject_name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onEdit(m)}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                              title="Edit Node"
                            >
                              <Edit3 className="size-3.5" />
                            </button>
                            <button
                              onClick={() => onDelete(m.id)}
                              className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete Node"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Body */}
                        <div className="p-3.5 space-y-2 text-xs">
                          <div className="flex items-center justify-between text-slate-700">
                            <span className="text-slate-500 text-[11px]">Teacher:</span>
                            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {m.teachers?.teacher_name || "Unassigned"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-1">
                            <span className="text-slate-500 flex items-center gap-1">
                              <Zap className="size-3 text-amber-500" />
                              Weekly Periods:
                            </span>
                            <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {m.weekly_periods} periods/wk
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* RIGHT: TEACHER NODES */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-xs tracking-wider uppercase shadow-sm">
                  <div className="flex items-center gap-2">
                    <UserCheck className="size-4 text-emerald-600" />
                    <span>Assigned Teachers</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-mono">
                    {activeTeachers.length}
                  </span>
                </div>

                {activeTeachers.map((t) => {
                  const isHovered = activeNode?.type === "teacher" && activeNode?.id === t.id;

                  return (
                    <div
                      key={t.id}
                      onMouseEnter={() => setActiveNode({ type: "teacher", id: t.id })}
                      className={`group relative rounded-2xl bg-white border transition-all duration-200 shadow-sm p-4 cursor-pointer ${
                        isHovered
                          ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                          : "border-slate-200 hover:border-emerald-300 hover:shadow-md"
                      }`}
                    >
                      {/* Input Port */}
                      <div
                        ref={(el) => registerPortRef(`teacher-in-${t.id}`, el)}
                        className="absolute -left-2.5 top-1/2 -translate-y-1/2 size-5 rounded-full bg-white border-2 border-emerald-600 flex items-center justify-center group-hover:scale-125 transition-transform shadow-sm"
                      >
                        <div className="size-2 rounded-full bg-emerald-600" />
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm">
                            <UserCheck className="size-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                              {t.teacher_name}
                            </h3>
                            <p className="text-[11px] text-slate-500">
                              {t.email || t.mobile || "Teaching Staff"}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          TEACHER
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* MULTI-CLASS OVERVIEW GRID (ALL CLASSES TAB) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {classes.map((cls) => {
                const classMaps = mappings.filter((m) => String(m.class_id) === String(cls.id));
                const totalPeriods = classMaps.reduce((acc, m) => acc + (Number(m.weekly_periods) || 0), 0);

                return (
                  <div
                    key={cls.id}
                    className="rounded-2xl bg-white border border-slate-200 hover:border-blue-300 transition-all p-5 space-y-4 shadow-sm hover:shadow-md flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm">
                            <School className="size-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-base text-slate-900">{cls.class_name}</h3>
                            <p className="text-xs text-slate-500">
                              {classMaps.length} subject{classMaps.length === 1 ? "" : "s"} mapped
                            </p>
                          </div>
                        </div>

                        <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                          {totalPeriods} p/wk
                        </span>
                      </div>

                      {/* Subject List Summary */}
                      <div className="space-y-1.5">
                        {classMaps.slice(0, 3).map((m) => (
                          <div key={m.id} className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-700 border border-slate-100">
                            <span className="font-medium text-slate-800">{m.subjects?.subject_name}</span>
                            <span className="text-emerald-600 font-medium text-[11px]">{m.teachers?.teacher_name || "N/A"}</span>
                          </div>
                        ))}
                        {classMaps.length > 3 && (
                          <p className="text-[11px] text-slate-500 text-center font-medium pt-1">
                            + {classMaps.length - 3} more subjects mapped
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedClassId(String(cls.id))}
                      className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-semibold transition-all flex items-center justify-center gap-1 border border-blue-100"
                    >
                      <span>Focus Class Canvas</span>
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
