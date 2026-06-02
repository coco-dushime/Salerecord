import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const links = [{"to":"/","label":"Customer"},{"to":"/products","label":"Product"},{"to":"/sales","label":"Sales"},{"to":"/reports","label":"Reports"}];

export default function AppLayout() {
  const { logout } = useAuth();
  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100 md:grid md:grid-cols-[280px_1fr]">

    {/* Sidebar */}
    <aside className="bg-slate-900 text-white flex flex-col shadow-2xl">
      <div className="px-6 py-8 border-b border-slate-700">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
          <span className="text-2xl font-bold">S</span>
        </div>

        <p className="text-blue-400 text-sm uppercase tracking-widest">
          SRMS
        </p>

        <h1 className="text-xl font-bold mt-2">
          Sales Record
        </h1>

        <p className="text-slate-400 text-sm">
          Management System
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              `block px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-700">
        <button
          type="button"
          onClick={logout}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition duration-300"
        >
          Logout
        </button>
      </div>
    </aside>

    {/* Main Content */}
    <main className="p-6 md:p-10 overflow-auto">
      <Outlet />
    </main>

  </div>
);
}
