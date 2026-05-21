import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import About from './pages/About';
import Assessment from './pages/Assessment';
import CancerDetail from './pages/CancerDetail';
import Guide from './pages/Guide';
import Guidelines from './pages/Guidelines';
import Home from './pages/Home';
import Initiatives from './pages/Initiatives';
import Locator from './pages/Locator';
import Research from './pages/Research';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="assessment" element={<Assessment />} />
          <Route path="eligibility" element={<Navigate to="/assessment" replace />} />
          <Route path="guide" element={<Guide />} />
          <Route path="guide/:cancer" element={<CancerDetail />} />
          <Route path="locate" element={<Locator />} />
          <Route path="locate/:cancer" element={<Locator />} />
          <Route path="locator" element={<Navigate to="/locate" replace />} />
          <Route path="guidelines" element={<Guidelines />} />
          <Route path="explore" element={<Navigate to="/guidelines" replace />} />
          <Route path="research" element={<Research />} />
          <Route path="initiatives" element={<Initiatives />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
