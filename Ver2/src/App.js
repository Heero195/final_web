import './App.css';

import React, { useState } from "react";
import { Grid, Paper } from "@mui/material";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import LoginRegister from "./components/LoginRegister";

const App = (props) => {
  const [advancedFeature, setAdvancedFeature] = useState(false);
  const [topBarContext, setTopBarContext] = useState("Home");
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("currentUser");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  return (
      <Router>
        <div>
          <TopBar 
            context={topBarContext} 
            advancedFeature={advancedFeature} 
            setAdvancedFeature={setAdvancedFeature} 
            currentUser={currentUser}
            onLogout={handleLogout}
          />
          <Grid container spacing={2} style={{ padding: '16px', marginTop: 0 }}>
            <Grid item xs={12} sm={3}>
              <Paper className="main-grid-item">
                <UserList currentUser={currentUser} />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={9}>
              <Paper className="main-grid-item">
                {currentUser ? (
                  <Routes>
                    <Route
                        path="/users/:userId"
                        element = {<UserDetail setTopBarContext={setTopBarContext} />}
                    />
                    <Route
                        path="/photos/:userId"
                        element = {<UserPhotos advancedFeature={advancedFeature} setTopBarContext={setTopBarContext} />}
                    />
                    <Route
                        path="/photos/:userId/:photoId"
                        element = {<UserPhotos advancedFeature={advancedFeature} setTopBarContext={setTopBarContext} />}
                    />
                    <Route path="/users" element={<UserList currentUser={currentUser} />} />
                    <Route path="*" element={<Navigate to={`/users/${currentUser._id}`} replace />} />
                  </Routes>
                ) : (
                  <Routes>
                    <Route 
                        path="/login-register" 
                        element={<LoginRegister onLoginSuccess={handleLoginSuccess} />} 
                    />
                    <Route path="*" element={<Navigate to="/login-register" replace />} />
                  </Routes>
                )}
              </Paper>
            </Grid>
          </Grid>
        </div>
      </Router>
  );
}

export default App;
