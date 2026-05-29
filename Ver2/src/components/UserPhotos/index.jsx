import React, { useState, useEffect } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  Divider,
  Button,
  TextField,
  Box,
} from "@mui/material";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

const getImageUrl = (fileName) => {
  if (typeof window !== "undefined") {
    const host = window.location.host;
    if (host.includes(".csb.app")) {
      const cleanHost = host.replace("-3000", "-8081");
      return `https://${cleanHost}/images/${fileName}`;
    }
  }
  return `http://localhost:8081/images/${fileName}`;
};

/**
 * Define UserPhotos, a React component of Project 4.
 */
function UserPhotos({ advancedFeature, setTopBarContext }) {
  const { userId, photoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [photos, setPhotos] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [newCommentTexts, setNewCommentTexts] = useState({});

  useEffect(() => {
    let isMounted = true;
    
    // Only show loading if we don't have the user or if the user changed
    if (!user || user._id !== userId) {
      setLoading(true);
    }

    Promise.all([
      fetchModel(`/user/${userId}`),
      fetchModel(`/photosOfUser/${userId}`),
    ])
      .then(([userRes, photosRes]) => {
        if (isMounted) {
          setUser(userRes.data);
          setPhotos(photosRes.data);
          if (setTopBarContext) {
            setTopBarContext(
              `Photos of ${userRes.data.first_name} ${userRes.data.last_name}`,
            );
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching user photos view data:", err);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, setTopBarContext, refreshTrigger, location.key]);

  const handleCommentChange = (photoId, text) => {
    setNewCommentTexts((prev) => ({
      ...prev,
      [photoId]: text,
    }));
  };

  const handlePostComment = (photoId) => {
    const text = newCommentTexts[photoId];
    if (!text || text.trim() === "") {
      return;
    }

    fetchModel(`/commentsOfPhoto/${photoId}`, {
      method: "POST",
      body: { comment: text.trim() },
    })
      .then(() => {
        setNewCommentTexts((prev) => ({
          ...prev,
          [photoId]: "",
        }));
        setRefreshTrigger((prev) => prev + 1);
      })
      .catch((err) => {
        console.error("Error posting comment:", err);
        alert(`Failed to add comment: ${err.message}`);
      });
  };

  if (loading || !user) {
    return <Typography>Loading photos...</Typography>;
  }

  if (photos.length === 0) {
    return <Typography>No photos found for this user.</Typography>;
  }

  const currentIndex = photoId ? photos.findIndex((p) => p._id === photoId) : 0;
  const currentPhoto = photos[currentIndex !== -1 ? currentIndex : 0];

  const goNext = () => {
    if (currentIndex < photos.length - 1) {
      navigate(`/photos/${userId}/${photos[currentIndex + 1]._id}`);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      navigate(`/photos/${userId}/${photos[currentIndex - 1]._id}`);
    }
  };

  const renderPhoto = (photo) => (
    <Card variant="outlined" key={photo._id} style={{ marginBottom: "20px" }}>
      <CardHeader
        title={new Date(photo.date_time).toLocaleString()}
        subheader={`By ${user.first_name} ${user.last_name}`}
      />
      <CardMedia
        component="img"
        image={getImageUrl(photo.file_name)}
        alt={photo.file_name}
      />
      <CardContent>
        <Typography variant="h6">Comments:</Typography>
        <Divider style={{ margin: "10px 0" }} />
        {photo.comments && photo.comments.length > 0 ? (
          photo.comments.map((c) => (
            <div key={c._id} style={{ marginBottom: "10px" }}>
              <Typography variant="body2" color="textSecondary">
                {new Date(c.date_time).toLocaleString()} -{" "}
                <Link to={`/users/${c.user._id}`}>
                  {c.user.first_name} {c.user.last_name}
                </Link>
              </Typography>
              <Typography variant="body1">{c.comment}</Typography>
            </div>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            No comments yet.
          </Typography>
        )}
        <Divider style={{ margin: "20px 0 15px 0" }} />
        <Box display="flex" gap="10px" alignItems="center">
          <TextField
            fullWidth
            size="small"
            label="Add a comment..."
            variant="outlined"
            value={newCommentTexts[photo._id] || ""}
            onChange={(e) => handleCommentChange(photo._id, e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => handlePostComment(photo._id)}
            disabled={!newCommentTexts[photo._id] || !newCommentTexts[photo._id].trim()}
          >
            Post
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <div>
      {advancedFeature ? (
        <>
          {renderPhoto(currentPhoto)}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "10px",
            }}
          >
            <Button
              variant="contained"
              disabled={currentIndex === 0}
              onClick={goPrev}
            >
              Previous
            </Button>
            <Button
              variant="contained"
              disabled={currentIndex === photos.length - 1}
              onClick={goNext}
            >
              Next
            </Button>
          </div>
        </>
      ) : (
        photos.map((p) => renderPhoto(p))
      )}
    </div>
  );
}

export default UserPhotos;
