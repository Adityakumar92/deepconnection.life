import React, { useEffect, useState } from "react";
import { img } from "../assets/img";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [name, setName] = useState(user?.name || "User");

  // ✅ Load user name from Redux or localStorage on mount
  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    } else {
      const savedData = localStorage.getItem("authData");
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setName(parsed?.user?.name || "User");
      }
    }
  }, [user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
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
