import React, { useState, useEffect } from "react";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

/**
 * Define UserList, a React component of Project 4.
 */
function UserList ({ currentUser }) {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (currentUser) {
            fetchModel("/user/list")
                .then(res => setUsers(res.data))
                .catch(err => console.error("Error fetching user list:", err));
        } else {
            setUsers([]);
        }
    }, [currentUser]);

    return (
      <div>
        <Typography variant="body1">
          User List:
        </Typography>
        <List component="nav">
          {users.map((item) => (
            <React.Fragment key={item._id}>
              <ListItem button component={Link} to={`/users/${item._id}`}>
                <ListItemText primary={`${item.first_name} ${item.last_name}`} />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </div>
    );
}

export default UserList;
