import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-red-50 to-rose-100">
      <div className="pointer-events-none absolute -top-28 -left-20 h-80 w-80 rounded-full bg-red-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-16 h-72 w-72 rounded-full bg-rose-300/40 blur-3xl" />

      <div className="relative flex h-screen w-full items-center justify-center px-4 py-8">
        <div className="rounded-2xl w-[500px] border border-red-100 bg-white/95 p-7 shadow-xl backdrop-blur sm:p-8">
          <div className="mb-6 flex items-center gap-3 border-b border-red-100 pb-5">
            <img
              src="/logo.png"
              alt="ResQHub Logo"
              className="h-12 w-12 rounded-full object-cover ring-2 ring-red-100"
            />
            <div>
              <p className="text-base font-semibold text-slate-800">ResQHub</p>
              <p className="text-sm text-slate-500">
                Nền tảng điều phối cứu trợ
              </p>
            </div>
          </div>

          <Outlet />
        </div>
      </div>

      <div className="relative pb-6 text-center text-xs text-slate-500">
        <p>© 2026 Hệ thống Cứu trợ Lũ lụt. All rights reserved.</p>
      </div>
    </div>
  );
}
