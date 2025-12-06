import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabaseClient";

export default function AdminLayout({ children, toggleDarkMode, darkMode }) {
  const [userInitial, setUserInitial] = useState("?");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchUserInitial = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const userEmail = sessionData?.session?.user?.email;

        if (userEmail) {
          const { data: userData } = await supabase
            .from("admin_users")
            .select("display_name")
            .eq("email", userEmail.toLowerCase())
            .maybeSingle();

          if (userData?.display_name) {
            setUserInitial(userData.display_name.charAt(0).toUpperCase());
          } else {
            // Fallback to email initial
            setUserInitial(userEmail.charAt(0).toUpperCase());
          }
        }
      } catch (error) {
        console.error("Error fetching user initial:", error);
      }
    };

    fetchUserInitial();
  }, []);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 min-h-screen">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
          }`}
        >
          <Navbar
            toggleDarkMode={toggleDarkMode}
            darkMode={darkMode}
            userInitial={userInitial}
            onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />

          <main className="p-6 min-h-screen">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
