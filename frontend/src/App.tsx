import { Navigate, Route, Routes } from 'react-router-dom';
import { GuestRoute, Layout, ProtectedRoute } from './components/Layout';
import { useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { BuyerQuotesPage } from './pages/buyer/BuyerQuotesPage';
import { BuyerRfqsPage } from './pages/buyer/BuyerRfqsPage';
import { CreateRfqPage } from './pages/buyer/CreateRfqPage';
import { EditRfqPage } from './pages/buyer/EditRfqPage';
import { SupplierBrowsePage } from './pages/supplier/SupplierBrowsePage';
import { SupplierQuotesPage } from './pages/supplier/SupplierQuotesPage';
import { SupplierRfqDetailPage } from './pages/supplier/SupplierRfqDetailPage';

function HomeRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="py-12 text-center text-slate-500">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === 'BUYER' ? '/buyer/rfqs' : '/supplier/rfqs'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomeRedirect />} />

        <Route element={<GuestRoute />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute role="BUYER" />}>
          <Route path="buyer/rfqs" element={<BuyerRfqsPage />} />
          <Route path="buyer/rfqs/new" element={<CreateRfqPage />} />
          <Route path="buyer/rfqs/:id/edit" element={<EditRfqPage />} />
          <Route path="buyer/rfqs/:id/quotes" element={<BuyerQuotesPage />} />
        </Route>

        <Route element={<ProtectedRoute role="SUPPLIER" />}>
          <Route path="supplier/rfqs" element={<SupplierBrowsePage />} />
          <Route path="supplier/rfqs/:id" element={<SupplierRfqDetailPage />} />
          <Route path="supplier/quotes" element={<SupplierQuotesPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
