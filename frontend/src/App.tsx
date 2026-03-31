import { Routes, Route } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import DashboardPage from './pages/DashboardPage';
import SharedRoadmapPage from './pages/SharedRoadmapPage';
import BackendStatus from './components/BackendStatus';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/shared" element={<SharedRoadmapPage />} />
      </Routes>
      <BackendStatus />
    </>
  );
}

export default App;
