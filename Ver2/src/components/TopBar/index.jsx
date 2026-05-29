import React, { useRef } from "react";
import { AppBar, Toolbar, Typography, FormControlLabel, Checkbox, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";

import "./styles.css";

/**
 * Define TopBar, a React component of Project 4.
 */
function TopBar({ context, advancedFeature, setAdvancedFeature, currentUser, onLogout }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleLogoutClick = async () => {
    try {
      await fetchModel("/admin/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout failed:", err);
    }
    onLogout();
  };

  const handleAddPhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("uploadedphoto", file);

    const backendBase = window.location.host.includes(".csb.app")
      ? `https://${window.location.host.replace("-3000", "-8081")}`
      : "http://localhost:8081";

    try {
      const response = await fetch(`${backendBase}/photos/new`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        alert("Photo uploaded successfully!");
        navigate(`/photos/${currentUser._id}`);
      } else {
        const errorData = await response.json();
        alert(`Failed to upload photo: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert(`Error uploading photo: ${err.message}`);
    }
  };

  return (
    <AppBar className="topbar-appBar" position="static">
      <Toolbar className="topbar-toolbar">
        <Typography variant="h6" className="topbar-title">
          Photo Sharing App
        </Typography>
        <div className="topbar-right">
          {currentUser ? (
            <>
              <Typography variant="body1" className="topbar-greeting">
                Hi {currentUser.first_name}
              </Typography>
              <Button
                variant="contained"
                size="small"
                color="secondary"
                style={{ marginRight: "10px" }}
                onClick={handleAddPhotoClick}
              >
                Add Photo
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleFileChange}
              />
              <Button 
                variant="outlined" 
                size="small" 
                className="topbar-logout-btn" 
                onClick={handleLogoutClick}
              >
                Logout
              </Button>
            </>
          ) : (
            <Typography variant="body1" className="topbar-greeting">
              Please Login
            </Typography>
          )}
          {currentUser && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={advancedFeature}
                  onChange={(e) => setAdvancedFeature(e.target.checked)}
                  className="topbar-checkbox"
                  style={{ color: "white" }}
                />
              }
              label="Advanced"
              className="topbar-label"
            />
          )}
          {currentUser && (
            <Typography variant="body1" className="topbar-context">
              {context}
            </Typography>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
