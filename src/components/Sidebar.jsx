import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="w-64 h-screen bg-blue-800 text-white p-5">

      <h1 className="text-2xl font-bold mb-8">
        Timetable
      </h1>

      <ul className="space-y-4">
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/teachers">Teachers</Link></li>
        <li><Link to="/classes">Classes</Link></li>
        <li><Link to="/subjects">Subjects</Link></li>
        <li><Link to="/timetable">Timetable</Link></li>
      </ul>

    </div>
  );
}

export default Sidebar;