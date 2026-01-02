import { Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Admindashboard from "./pages/dashboard/Admin-dashboard";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin-dashboard" element={<Admindashboard/>}/>
    </Routes>
  );
};

export default App;
