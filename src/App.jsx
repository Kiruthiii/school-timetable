
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Teachers from "./pages/Teachers";
import Classes from "./pages/Classes";
import Subjects from "./pages/Subjects";
import ConsolidatedTimetable from "./pages/ConsolidatedTimetable";
import Mapping from "./pages/Mapping";
import FixedSlots from "./pages/FixedSlots";

import ProtectedRoute from "./components/ProtectedRoute";

import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teachers"
          element={
            <ProtectedRoute>
              <Teachers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/classes"
          element={
            <ProtectedRoute>
              <Classes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/subjects"
          element={
            <ProtectedRoute>
              <Subjects />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mapping"
          element={
            <ProtectedRoute>
              <Mapping />
            </ProtectedRoute>
          }
        />


        <Route
          path="/consolidated-timetable"
          element={
            <ProtectedRoute>
              <ConsolidatedTimetable />
            </ProtectedRoute>
          }
        />

        <Route
          path="/fixed-slots"
          element={
            <ProtectedRoute>
              <FixedSlots />
            </ProtectedRoute>
          }
        />
      </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;