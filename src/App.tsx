import './App.css';
import {Login} from "./user/Login";
import {Route, BrowserRouter as Router, Routes} from "react-router-dom";
import {Home} from "./pages/Home";
import {Profile} from "./pages/Profile";
import {AuthInitializer} from "./components/AuthInitializer";
import {Dashboard} from "./pages/Dashboard";
import {Register} from "./user/Register";
import {Messaging} from "./components/chat/Messaging";

function App() {

  return (
      <Router>
          <div className="App">
              <AuthInitializer />

              <main style={{ padding: '2rem' }}>
                  <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/messages/user/:userId" element={<Messaging />} />
                      <Route path="/messages" element={<Messaging />} />

                      <Route path="*" element={<div>Page non trouvée</div>} />
                  </Routes>
              </main>
          </div>
      </Router>
  );
}

export default App;
