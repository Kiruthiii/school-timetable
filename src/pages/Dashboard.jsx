import { useEffect } from "react";
import { supabase } from "../services/supabase";
import AdminLayout from "../layouts/AdminLayout";

function Dashboard() {

  useEffect(() => {
    console.log("Supabase Client:", supabase);
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

        <div className="bg-white shadow rounded-lg p-5">
          <h2 className="text-gray-500">Teachers</h2>
          <p className="text-3xl font-bold">20</p>
        </div>

        <div className="bg-white shadow rounded-lg p-5">
          <h2 className="text-gray-500">Classes</h2>
          <p className="text-3xl font-bold">6</p>
        </div>

        <div className="bg-white shadow rounded-lg p-5">
          <h2 className="text-gray-500">Subjects</h2>
          <p className="text-3xl font-bold">9</p>
        </div>

        <div className="bg-white shadow rounded-lg p-5">
          <h2 className="text-gray-500">Timetables</h2>
          <p className="text-3xl font-bold">1</p>
        </div>

      </div>
    </AdminLayout>
  );
}

export default Dashboard;