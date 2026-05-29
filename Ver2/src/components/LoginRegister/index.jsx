import React, { useState } from "react";
import { Card, Typography, TextField, Button, Tabs, Tab, Box } from "@mui/material";
import fetchModel from "../../lib/fetchModelData";
import "./styles.css";

function LoginRegister({ onLoginSuccess }) {
  const [tabIndex, setTabIndex] = useState(0);
  
  
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

 
  const [regLoginName, setRegLoginName] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regLocation, setRegLocation] = useState("");
  const [regDescription, setRegDescription] = useState("");
  const [regOccupation, setRegOccupation] = useState("");
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
    setError("");
    setRegError("");
    setRegSuccess("");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginName || !password) {
      setError("Please fill in both username and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetchModel("/admin/login", {
        method: "POST",
        body: {
          login_name: loginName,
          password: password
        }
      });
      
      setLoading(false);
      if (res && res.data) {
        onLoginSuccess(res.data);
      } else {
        setError("Invalid response format from server.");
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || "Login failed. Please check your credentials.");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");

    if (!regLoginName || !regPassword || !regConfirmPassword || !regFirstName || !regLastName) {
      setRegError("Please fill in all required fields.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetchModel("/user", {
        method: "POST",
        body: {
          login_name: regLoginName.trim(),
          password: regPassword,
          first_name: regFirstName.trim(),
          last_name: regLastName.trim(),
          location: regLocation.trim(),
          description: regDescription.trim(),
          occupation: regOccupation.trim()
        }
      });

      setLoading(false);
      setRegSuccess(`Registration successful! You can now log in as "${res.data.login_name}".`);
      
      // Clear all fields
      setRegLoginName("");
      setRegPassword("");
      setRegConfirmPassword("");
      setRegFirstName("");
      setRegLastName("");
      setRegLocation("");
      setRegDescription("");
      setRegOccupation("");
    } catch (err) {
      setLoading(false);
      setRegError(err.message || "Registration failed.");
    }
  };

  return (
    <div className="login-register-container">
      <Card className="login-register-card">
        <div className="login-register-header">
          <Typography variant="h4" className="login-register-title">
            Photo Sharing
          </Typography>
          <Typography variant="body2" className="login-register-subtitle">
            Connect with friends and share your moments
          </Typography>
        </div>

        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          centered
          className="login-register-tabs"
          TabIndicatorProps={{ style: { backgroundColor: "#60a5fa" } }}
        >
          <Tab label="Login" className="login-register-tab" />
          <Tab label="Register" className="login-register-tab" />
        </Tabs>

        {tabIndex === 0 ? (
          <form className="login-register-form" onSubmit={handleLoginSubmit}>
            {error && (
              <div className="login-register-error">
                <span>⚠️</span> {error}
              </div>
            )}
            
            <TextField
              label="Login Name"
              variant="outlined"
              fullWidth
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
              className="login-register-input"
              InputLabelProps={{ shrink: true }}
              placeholder="Enter your username"
              required
            />

            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-register-input"
              InputLabelProps={{ shrink: true }}
              placeholder="Enter your password"
              required
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              className="login-register-button"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        ) : (
          <form className="login-register-form" onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {regError && (
              <div className="login-register-error">
                <span>⚠️</span> {regError}
              </div>
            )}
            {regSuccess && (
              <div className="login-register-success" style={{ color: "#4ade80", backgroundColor: "rgba(74, 222, 128, 0.1)", padding: "12px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.875rem", border: "1px solid rgba(74, 222, 128, 0.3)" }}>
                <span>✅</span> {regSuccess}
              </div>
            )}

            <TextField
              label="Login Name *"
              variant="outlined"
              fullWidth
              value={regLoginName}
              onChange={(e) => setRegLoginName(e.target.value)}
              className="login-register-input"
              InputLabelProps={{ shrink: true }}
              placeholder="Username for login"
              required
            />

            <Box display="flex" gap="15px">
              <TextField
                label="First Name *"
                variant="outlined"
                fullWidth
                value={regFirstName}
                onChange={(e) => setRegFirstName(e.target.value)}
                className="login-register-input"
                InputLabelProps={{ shrink: true }}
                placeholder="First name"
                required
              />
              <TextField
                label="Last Name *"
                variant="outlined"
                fullWidth
                value={regLastName}
                onChange={(e) => setRegLastName(e.target.value)}
                className="login-register-input"
                InputLabelProps={{ shrink: true }}
                placeholder="Last name"
                required
              />
            </Box>

            <Box display="flex" gap="15px">
              <TextField
                label="Password *"
                type="password"
                variant="outlined"
                fullWidth
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="login-register-input"
                InputLabelProps={{ shrink: true }}
                placeholder="Password"
                required
              />
              <TextField
                label="Confirm Password *"
                type="password"
                variant="outlined"
                fullWidth
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                className="login-register-input"
                InputLabelProps={{ shrink: true }}
                placeholder="Confirm password"
                required
              />
            </Box>

            <TextField
              label="Location"
              variant="outlined"
              fullWidth
              value={regLocation}
              onChange={(e) => setRegLocation(e.target.value)}
              className="login-register-input"
              InputLabelProps={{ shrink: true }}
              placeholder="e.g. San Francisco, CA"
            />

            <TextField
              label="Occupation"
              variant="outlined"
              fullWidth
              value={regOccupation}
              onChange={(e) => setRegOccupation(e.target.value)}
              className="login-register-input"
              InputLabelProps={{ shrink: true }}
              placeholder="e.g. Student, Software Engineer"
            />

            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              multiline
              rows={2}
              value={regDescription}
              onChange={(e) => setRegDescription(e.target.value)}
              className="login-register-input"
              InputLabelProps={{ shrink: true }}
              placeholder="Tell us about yourself"
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              className="login-register-button"
              style={{ marginTop: "5px" }}
            >
              {loading ? "Registering..." : "Register Me"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}

export default LoginRegister;
