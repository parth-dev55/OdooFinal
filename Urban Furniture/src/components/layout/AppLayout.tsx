import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#6D54B5] p-2 sm:p-4 md:p-8 font-sans selection:bg-purple-200 flex flex-col">
      <div className="mx-auto w-full max-w-[1400px] bg-white rounded-[40px] shadow-2xl border-8 border-white/20 flex flex-col overflow-hidden flex-1">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
