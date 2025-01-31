import { useContext, useEffect, useState } from "react"
import Home from "./pages/home/home"
import Login from "./pages/login/Login"
import Profile from "./pages/profile/Profile"
import Register from "./pages/register/Register"
import Messenger from "./pages/messenger/Messenger"
import { BrowserRouter as Router , Route ,Routes,  Navigate} from "react-router-dom"
import { AuthContext } from "./context/AuthContext"
import ProtectedRoute from "./utils/protectedRoutes"

function App() {


         const {user} =  useContext(AuthContext);
         
  return (
     <Router>
         <Routes>
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/login" element={user ? <Navigate to="/"/>: <Login />} />
            <Route path="/register" element={user ? <Navigate to="/"/> : <Register/>} />            
            <Route path="/messenger" element={<ProtectedRoute><Messenger /></ProtectedRoute>} />            
         </Routes>
     </Router>
      
    
  )
}

export default App
