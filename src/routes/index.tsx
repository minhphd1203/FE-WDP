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

import UserManagement from "../pages/admin/UserManagement";
import UpdateProfile from "../pages/admin/UpdateProfile";
import ReliefRequests from "../pages/admin/ReliefRequests";
import Warehouse from "../pages/admin/Warehouse";
import ReplenishmentRequests from "../pages/admin/ReplenishmentRequests";
import WarehouseTransactions from "../pages/admin/WarehouseTransactions";

// Staff Pages
import StaffDashboard from "../pages/staff/Dashboard";
import ProductManagement from "../pages/staff/ProductManagement";
import VolunteerList from "../pages/staff/VolunteerList";
import CommonWarehouse from "../pages/staff/CommonWarehouse";
import TeamWarehouse from "../pages/staff/TeamWarehouse";
import RescueRequests from "../pages/staff/RescueRequests";

// Auth Pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import AdminDashboard from "@/pages/admin/Dashboard";
import EventLayout from "@/pages/admin/EventManagement/eventLayout";

import EventsList from "../pages/admin/EventManagement/eventComponent/EventList";

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
        element: <EventLayout />,
        children: [
          {
            index: true,
            element: <EventsList />,
          },
          {
            path: "create",
            element: <Navigate to={ROUTES.ADMIN_EVENTS} replace />,
          },
          {
            path: ":id/edit",
            element: <Navigate to={ROUTES.ADMIN_EVENTS} replace />,
          },
        ],
      },
      {
        path: "users",
        element: <UserManagement />,
      },
      {
        path: "update-profile",
        element: <UpdateProfile />,
      },
      {
        path: "relief-requests",
        element: <ReliefRequests />,
      },
      {
        path: "replenishment-requests",
        element: <ReplenishmentRequests />,
      },
      {
        path: "warehouse",
        element: <Warehouse />,
      },
      {
        path: "warehouse-transactions",
        element: <WarehouseTransactions />,
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
        path: "products",
        element: <ProductManagement />,
      },
      {
        path: "volunteers",
        element: <VolunteerList />,
      },
      {
        path: "rescue-requests",
        element: <RescueRequests />,
      },
      {
        path: "update-profile",
        element: <UpdateProfile />,
      },
      {
        path: "warehouse",
        children: [
          {
            index: true,
            element: <Navigate to={ROUTES.STAFF_WAREHOUSE_COMMON} replace />,
          },
          {
            path: "common",
            element: <CommonWarehouse />,
          },
          {
            path: "team",
            element: <TeamWarehouse />,
          },
        ],
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
