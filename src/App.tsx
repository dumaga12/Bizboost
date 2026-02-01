import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Home from "./pages/Home";
import DealDetail from "./pages/DealDetail";
import BrowseAll from "./pages/BrowseAll";
import CustomerLogin from "./pages/customer/CustomerLogin";
import CustomerRegister from "./pages/customer/CustomerRegister";
import SavedDeals from "./pages/customer/SavedDeals";
import MyClaims from "./pages/customer/MyClaims";
import BrowseMap from "./pages/customer/BrowseMap";
import Cart from "./pages/customer/Cart";
import BizLogin from "./pages/business/BizLogin";
import BizRegister from "./pages/business/BizRegister";
import BizDashboard from "./pages/business/BizDashboard";
import PostDealForm from "./pages/business/PostDealForm";
import EditDealForm from "./pages/business/EditDealForm";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/deals/:id" element={<DealDetail />} />
            <Route path="/browse" element={<BrowseAll />} />
            <Route path="/customer/login" element={<CustomerLogin />} />
            <Route path="/customer/register" element={<CustomerRegister />} />
            <Route path="/customer/saved" element={<SavedDeals />} />
            <Route path="/customer/claims" element={<MyClaims />} />
            <Route path="/customer/map" element={<BrowseMap />} />
            <Route path="/customer/cart" element={<Cart />} />

            {/* Business Routes */}
            <Route path="/business/login" element={<BizLogin />} />
            <Route path="/business/register" element={<BizRegister />} />
            <Route path="/business/dashboard" element={<BizDashboard />} />
            <Route path="/business/deals/new" element={<PostDealForm />} />
            <Route path="/business/deals/:id/edit" element={<EditDealForm />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            {/* 404 - Keep this last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
