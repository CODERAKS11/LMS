import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// 🔥 Separate AdminButton Component
const AdminButton = ({ children, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded ${className}`}
  >
    {children}
  </button>
);

const Input = ({ type = "text", placeholder, value, onChange, className = "" }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`border p-2 rounded w-full ${className}`}
  />
);

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:3001/api/users/login", { email, password });
      console.log(res.data);  // ✅ Log the response data for debugging
      // if (res.data.user.role === "user") {
      //   toast.error("Access denied! You are not an admin.");
      // }
      if (res.data.user.role === "admin") {
        toast.success("Admin login successful!");
        localStorage.setItem("token", res.data.token);
        navigate("/admin-dashboard");  // ✅ Redirect admin
      } else {
        toast.error("Access denied! You are not an admin.");
      }
    } catch (error) {
      toast.error("Invalid credentials!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>
        
        <Input 
          type="email" 
          placeholder="Admin Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className="mb-4"
        />
        
        <Input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          className="mb-4"
        />
        
        <AdminButton onClick={handleLogin} className="w-full">
          Admin Login
        </AdminButton>
      </div>
    </div>
  );
};

export default AdminLogin;
