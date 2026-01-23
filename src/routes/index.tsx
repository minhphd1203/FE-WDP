import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import AuthGuard from "../guards/AuthGuard";
import RoleGuard from "../guards/RoleGuard";
import GuestGuard from "../guards/GuestGuard";
import { UserRole } from "../types";
import { ROUTES } from "../constants";

// Layouts
import AdminLayout from "../layouts/AdminLayout";
import StaffLayout from "../layouts/StaffLayout";
import AuthLayout from "../layouts/AuthLayout";

// Admin Pages
import AdminDashboard from "../pages/admin/Dashboard";
import CreateEvent from "../pages/admin/CreateEvent";
import UserManagement from "../pages/admin/UserManagement";
import ReliefRequests from "../pages/admin/ReliefRequests";
import Warehouse from "../pages/admin/Warehouse";

// Staff Pages
import StaffDashboard from "../pages/staff/Dashboard";
import VerifyProducts from "../pages/staff/VerifyProducts";
import DistributeProducts from "../pages/staff/DistributeProducts";

// Auth Pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

const router = createBrowserRouter([
  // Auth routes
  {
    path: "/auth",
    element: (
      <GuestGuard>
        <AuthLayout />
      </GuestGuard>
    ),
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
    ],
  },

  // Admin routes
  {
    path: "/admin",
    element: (
      <AuthGuard>
        <RoleGuard allowedRoles={[UserRole.ADMIN]}>
          <AdminLayout />
        </RoleGuard>
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />,
      },
      {
        path: "dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "events",
        children: [
          {
            index: true,
            element: <AdminDashboard />, // Or create EventsList page
          },
          {
            path: "create",
            element: <CreateEvent />,
          },
        ],
      },
      {
        path: "users",
        element: <UserManagement />,
      },
      {
        path: "relief-requests",
        element: <ReliefRequests />,
      },
      {
        path: "warehouse",
        element: <Warehouse />,
      },
    ],
  },

  // Staff routes
  {
    path: "/staff",
    element: (
      <AuthGuard>
        <RoleGuard allowedRoles={[UserRole.STAFF, UserRole.ADMIN]}>
          <StaffLayout />
        </RoleGuard>
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.STAFF_DASHBOARD} replace />,
      },
      {
        path: "dashboard",
        element: <StaffDashboard />,
      },
      {
        path: "verify-products",
        element: <VerifyProducts />,
      },
      {
        path: "distribute",
        element: <DistributeProducts />,
      },
    ],
  },

  // Root redirect
  {
    path: "/",
    element: <Navigate to={ROUTES.LOGIN} replace />,
  },

  // 404
  {
    path: "*",
    element: (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-muted-foreground">Trang không tồn tại</p>
        </div>
      </div>
    ),
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
