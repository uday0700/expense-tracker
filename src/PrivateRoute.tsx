import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import LoadingSpinner from "./components/LoadingSpinner";

const PrivateRoute = () => {
  const { user, loading } = useAuth();

  const getCurrentPageName = () => {
    const currentPath = location.pathname;
    return "Checking auth...";
  };

  if (loading)
    return (
      <LoadingSpinner message={`Loading ${getCurrentPageName()} data...`} />
    );
  return user ? <Outlet /> : <Navigate to="/auth" />;
};

export default PrivateRoute;
