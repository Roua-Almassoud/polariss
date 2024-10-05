import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  useNavigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import './App.css';
import MainLayout from './components/MainLayout';
import Settings from './components/settings/Settings';
import Profile from './components/profile/Profile';
import Bike from './components/bike/Bike';
import Device from './components/device/Device';
import List from './components/list/List';
import Home from './components/Home/Home';
import LineLogin from './components/login/LineLogin';
import Utils from './components/utils/utils';
import Setup from './components/setup/Setup';

function App() {
  const [layoutKey, setLayoutKey] = useState(Utils.unique());
  // let navigate = useNavigate();
  // useEffect(() => {
  //   let location = useLocation();
  //   console.log('loca: ', location);
  //   if (localStorage.getItem('type') === 'ot-registered') {
  //     navigate('/setup');
  //   }
  // }, [location]);
  return (
    <Router>
      <MainLayout key={layoutKey}>
        <Routes>
          <Route
            exact
            path="/"
            element={<Home setLayoutKey={setLayoutKey} />}
          />
          <Route exact path="/login" element={<LineLogin />} />
          <Route exact path="/setting/:id" element={<Settings />} />
          <Route exact path="/setting" element={<Settings />} />
          <Route
            exact
            path="/setting/user-info"
            element={<Settings type={'info'} />}
          />
          <Route exact path="/setting/profile" element={<Profile />} />
          <Route exact path="/setting/bike/:id" element={<Bike />} />
          <Route exact path="/setting/bike" element={<Bike />} />
          <Route exact path="/setting/device/:id" element={<Device />} />
          <Route exact path="/setting/device" element={<Device />} />
          <Route exact path="/setting/list" element={<List />} />
          <Route exact path="/setup" element={<Setup />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
