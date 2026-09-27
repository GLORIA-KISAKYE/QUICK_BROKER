import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import VerifyOtp from './pages/VerifyOtp';
import ListingDetail from './pages/ListingDetail';
import Saved from './pages/Saved';
import Compare from './pages/Compare';
import MyInspections from './pages/MyInspections';
import InspectionCode from './pages/InspectionCode';
import AdminDashboard from './pages/AdminDashboard';
import AdminListings from './pages/AdminListings';
import AdminInspections from './pages/AdminInspections';
import AdminReports from './pages/AdminReports';
import BottomNav from './components/BottomNav';

export default function App() {
  return (
    <div className="min-h-screen bg-accent">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/verify" element={<VerifyOtp />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/inspections" element={<MyInspections />} />
        <Route path="/inspections/:id/code" element={<InspectionCode />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/listings" element={<AdminListings />} />
        <Route path="/admin/inspections" element={<AdminInspections />} />
        <Route path="/admin/reports" element={<AdminReports />} />
      </Routes>
      <BottomNav />
    </div>
  );
}
