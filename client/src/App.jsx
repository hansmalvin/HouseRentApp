import { BrowserRouter as Router, Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "./modules/common/Home";
import Login from "./modules/common/Login";
import Register from "./modules/common/Register";
import ForgotPassword from "./modules/common/ForgotPassword";
import AdminHome from "./modules/admin/AdminHome";
import OwnerHome from "./modules/user/owner/OwnerHome";
import RenterHome from "./modules/user/renter/RenterHome";
import AllUsers from "./modules/admin/AllUsers";
import AddProperty from "./modules/user/owner/AddProperty";
import OwnerAllBookings from "./modules/user/owner/AllBookings";
import RenterAllProperty from "./modules/user/renter/AllProperties";
import AdminAllBookings from "./modules/admin/AllBookings";
import AdminAllProperty from "./modules/admin/AllProperty";
import OwnerAllProperties from "./modules/user/owner/AllProperties";
import AllPropertiesCards from "./modules/user/AllPropertiesCards";
import { createContext, useEffect, useState } from "react";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const stored = localStorage.getItem("user");
  if (!stored) return <Navigate to="/login" replace />;
  try {
    const user = JSON.parse(stored);
    if (!allowedRoles.includes(user.type)) return <Navigate to="/login" replace />;
    return children;
  } catch {
    return <Navigate to="/login" replace />;
  }
};

export const UserContext = createContext();

function App() {
  const [userData, setUserData] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);
        setUserLoggedIn(true);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  return (
     <UserContext.Provider value={{ userData, setUserData, userLoggedIn, setUserLoggedIn }}>
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/forgotpassword' element={<ForgotPassword />} />
          <Route path='/adminhome' element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminHome />
            </ProtectedRoute>
          } />
          <Route path='/ownerhome' element={
            <ProtectedRoute allowedRoles={["Owner", "Admin"]}>
              <OwnerHome />
            </ProtectedRoute>
          } />
          <Route path='/renterhome' element={
            <ProtectedRoute allowedRoles={["Renter", "Admin"]}>
              <RenterHome />
            </ProtectedRoute>
          } />
          <Route path='/getallbookings' element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminAllBookings />
            </ProtectedRoute>
          } />
          <Route path='/getallproperties' element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminAllProperty />
            </ProtectedRoute>
          } />
          <Route path='/getallusers' element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AllUsers />
            </ProtectedRoute>
          } />
          <Route path='/postproperty' element={
            <ProtectedRoute allowedRoles={["Owner"]}>
              <AddProperty />
            </ProtectedRoute>
          } />
          <Route path='/getAllProperties' element={
            <ProtectedRoute allowedRoles={["Renter"]}>
              <AllPropertiesCards />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </div>
    </UserContext.Provider>
  )
}

export default App
