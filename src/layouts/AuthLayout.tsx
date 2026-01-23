import React from 'react';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            Hệ thống Cứu trợ Lũ lụt
          </h1>
          <p className="text-muted-foreground">
            Kết nối yêu thương - Chia sẻ khó khăn
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <Outlet />
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>© 2026 Hệ thống Cứu trợ Lũ lụt. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
