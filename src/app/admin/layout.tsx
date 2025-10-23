"use client";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { usePathname } from "next/navigation";
import { Inter } from "next/font/google";
import SideBar from "./SideBar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import "@/styles/globals.css";

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
            ></div>
            <div className="relative w-64 bg-white dark:bg-gray-900 border-r border-gray-200 z-40 p-4">
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 text-gray-600 dark:text-gray-300"
              >
                <X size={24} />
              </button>
              <SideBar />
            </div>
          </div>
        )}

        <QueryClientProvider client={queryClient}>
          <main className="relative flex-1 w-full p-4 md:p-6 z-10">
            <button
              onClick={() => setSidebarOpen(true)}
              className="xl:hidden mb-4 p-2 rounded-lg border border-gray-300 dark:border-gray-700"
            >
              <Menu size={24} />
            </button>
            {children}
          </main>
        </QueryClientProvider>
      </div>
    </Provider>
  );
}
