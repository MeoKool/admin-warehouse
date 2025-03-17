import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Users, CheckSquare, ArrowUpCircle, User } from "lucide-react";

const menuItems = [
  {
    title: "Quản lí Account",
    path: "/admin/accounts",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Xét duyệt Account",
    path: "/admin/approve",
    icon: <CheckSquare className="h-5 w-5" />,
  },
  {
    title: "Chuyển cấp Đại lý",
    path: "/admin/upgrade",
    icon: <ArrowUpCircle className="h-5 w-5" />,
  },
  {
    title: "Profile",
    path: "/admin/profile",
    icon: <User className="h-5 w-5" />,
  },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="h-screen w-64 bg-slate-800 text-white p-4">
      <div className="text-xl font-bold mb-6 p-2">Admin Dashboard</div>
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-slate-700",
              location.pathname === item.path
                ? "bg-slate-700 text-white"
                : "text-slate-200"
            )}
          >
            {item.icon}
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
