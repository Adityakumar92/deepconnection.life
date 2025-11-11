import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Provider, useDispatch } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import router from "./routes/AppRoutes.jsx";
import { store } from "./redux/store.js";
import { loadUserFromStorage } from "./redux/authSlice.js";

// 🔹 Run this once before router mounts
function Startup() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <Startup />
    </Provider>
  </StrictMode>
);
