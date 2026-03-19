import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function AppLayout({ user }) {
  return (
    <div className="min-h-screen bg-background text-on-background font-body">
      <Navbar user={user} />
      <main className="mx-auto max-w-screen-2xl px-6 pb-20 pt-32">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
