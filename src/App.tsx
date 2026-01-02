import { Routes, Route } from "react-router-dom";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Login from "@/pages/auth/Login";
import AdminDashboard from "@/pages/dashboard/Admin-dashboard";
import DriverDashboard from "@/pages/dashboard/Driver-dashboard";
import FleetManagerDashboard from "@/pages/dashboard/Fleet-manager-dashboard";
import MechanicDashboard from "@/pages/dashboard/Mechanic-dashboard";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fleet-manager-dashboard"
        element={
          <ProtectedRoute allowedRoles={["FLEET_MANAGER"]}>
            <FleetManagerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mechanic-dashboard"
        element={
          <ProtectedRoute allowedRoles={["MECHANIC"]}>
            <MechanicDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/driver-dashboard"
        element={
          <ProtectedRoute allowedRoles={["DRIVER"]}>
            <DriverDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
