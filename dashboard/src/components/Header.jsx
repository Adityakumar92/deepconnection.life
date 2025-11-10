import React, { useEffect, useState } from "react";
import { img } from "../assets/img";
import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const [name, setName] = useState("User");

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setName(user.name || "User");
      }
    } catch (error) {
      console.error("Failed to parse user data:", error);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm px-6 py-3 flex items-center justify-between">
      <img src={img.logodc} alt="deepconnection" className="h-10 w-auto" />
      <div className="flex items-center gap-4 text-gray-700">
        <div className="font-medium">Hi, {name}</div>
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;
