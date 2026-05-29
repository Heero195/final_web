import React, { useState, useEffect } from "react";
import { Typography, Card, CardContent, Button } from "@mui/material";
import { Link, useParams } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

/**
 * Define UserDetail, a React component of Project 4.
 */
function UserDetail({ setTopBarContext }) {
    const { userId } = useParams();
    const [user, setUser] = useState(null);

    useEffect(() => {
        let isMounted = true;
        fetchModel(`/user/${userId}`)
            .then(res => {
                if (isMounted) {
                    setUser(res.data);
                    if (setTopBarContext) {
                        setTopBarContext(`${res.data.first_name} ${res.data.last_name}`);
                    }
                }
            })
            .catch(err => console.error("Error fetching user detail:", err));
        return () => { isMounted = false; };
    }, [userId, setTopBarContext]);

    if (!user) {
        return <Typography>Loading user details...</Typography>;
    }

    return (
        <Card>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              {user.first_name} {user.last_name}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Location: {user.location}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Occupation: {user.occupation}
            </Typography>
            <Typography variant="body1" paragraph style={{ marginTop: '10px' }}>
              <span dangerouslySetInnerHTML={{ __html: user.description }} />
            </Typography>
            <Button
                variant="contained"
                color="primary"
                component={Link}
                to={`/photos/${user._id}`}
            >
                View Photos
            </Button>
          </CardContent>
        </Card>
    );
}

export default UserDetail;
