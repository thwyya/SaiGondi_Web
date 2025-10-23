"use client";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { usePathname } from "next/navigation";
import { Inter } from "next/font/google";
import SideBar from "./SideBar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Menu } from "lucide-react";
import "@/styles/globals.css";
import { FiX } from "react-icons/fi";
import { useAdminData } from "./hooks/useAdminData";
import AdminHeader from "@/components/AdminHeader";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-inter",
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [queryClient] = useState(() => new QueryClient());
  const isLoginPage = pathname === "/admin/login";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const data = useAdminData();
  if (isLoginPage) return <>{children}</>;

  return (
    <Provider store={store}>
      <div className={`relative min-h-screen overflow-hidden flex ${inter.variable}`}>
        <div className="absolute w-[500px] h-[450px] bg-[var(--secondary)] opacity-50 blur-[250px]" style={{ top: "400px", left: "-420px" }} />
        <div className="absolute w-[500px] h-[550px] bg-[var(--primary)] opacity-50 blur-[250px]" style={{ top: "770px", left: "1470px" }} />
        <div className="absolute w-[400px] h-[300px] bg-[var(--primary)] opacity-50 blur-[250px]" style={{ top: "1350px", left: "-300px" }} />
        <div className="absolute w-[500px] h-[450px] bg-[var(--secondary)] opacity-50 blur-[250px]" style={{ top: "2050px", left: "1470px" }} />
        <div className="absolute w-[400px] h-[300px] bg-[var(--primary)] opacity-50 blur-[250px]" style={{ top: "2980px", left: "-150px" }} />
        <div className="absolute w-[500px] h-[550px] bg-[var(--secondary)] opacity-50 blur-[250px]" style={{ top: "4750px", left: "1470px" }} />

        <div className="relative hidden xl:block w-64 border-r border-[rgba(0,0,0,0.1)] z-20 shrink-0">
          <SideBar />
        </div>

        {sidebarOpen && (
          <div className="fixed inset-0 z-30 flex">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative w-64 bg-white border-r border-gray-200 z-40 p-4">
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
              <SideBar />
            </div>
          </div>
        )}

        <QueryClientProvider client={queryClient}>
          <main className="relative flex-1 w-full flex flex-col p-4 md:p-6 z-10">
            <div className="flex justify-between items-center mb-4 lg:mb-6">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 xl:hidden"
              >
                <Menu size={24} />
              </button>

              <div className="hidden lg:block flex-1" />

              <AdminHeader
                firstName={data.firstName}
                avatarUrl={data.avatarUrl}
                avatarOpen={data.avatarOpen}
                setAvatarOpen={data.setAvatarOpen}
                avatarRef={data.avatarRef}
                handleLogout={data.handleLogout}
              />
            </div>

            <div className="flex-1">{children}</div>
          </main>
        </QueryClientProvider>
      </div>
    </Provider>
  );
}
