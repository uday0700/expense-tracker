import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Receipt, Tags, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useExpense } from "@/context/ExpenseContext";
import LoadingSpinner from "./LoadingSpinner";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { state } = useExpense();

  const navItems = [
    {
      path: "/",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      path: "/transactions",
      label: "Transactions",
      icon: <Receipt className="w-5 h-5" />,
    },
    {
      path: "/categories",
      label: "Categories",
      icon: <Tags className="w-5 h-5" />,
    },
  ];
  const { logout } = useAuth()

  // Get current page name for the loading message
  const getCurrentPageName = () => {
    const currentPath = location.pathname;
    const currentItem = navItems.find((item) => item.path === currentPath);
    return currentItem ? currentItem.label : "Expense Tracker";
  };

  if (state.isLoading) {
    return (
      <LoadingSpinner message={`Loading ${getCurrentPageName()} data...`} />
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F5F5F7]">
      {/* Sidebar/Navigation */}
      <nav className="w-full fixed left-0 md:w-64 md:min-h-screen bg-white shadow-sm z-10">
        <div className="p-6">
          <h1 className="text-xl font-medium">Expense Tracker</h1>
          <p className="text-muted-foreground text-sm">Manage your finances</p>
        </div>

        <div className="px-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg mb-1 group transition-all duration-200",
                location.pathname === item.path
                  ? "bg-expense-gray text-primary font-medium"
                  : "text-muted-foreground hover:bg-expense-gray hover:text-primary"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
              <ChevronRight
                className={cn(
                  "ml-auto w-4 h-4 opacity-0 -translate-x-2 transition-all duration-200",
                  location.pathname === item.path && "opacity-100 translate-x-0"
                )}
              />
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="w-[85%] fixed top-0 right-0 bg-white h-18 p-4 flex justify-end z-10">
          <Button onClick={logout} className="group opacity-70 hover:opacity-100" size="sm" variant="ghost">
            Logout
          </Button>
        </div>
        <div className="p-4 md:p-8 max-w-6xl mt-20 ml-64 mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
