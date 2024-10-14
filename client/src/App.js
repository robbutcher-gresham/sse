import React, { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MessageIcon from "@mui/icons-material/Message";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import "./App.css";

const baseUrl = "//localhost:3001";

const App = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [connectionState, setConnectionState] = useState();
  const [notification, setNotification] = useState({
    show: false,
  });

  useEffect(() => {
    const eventSource = new EventSource(`${baseUrl}/events`);
    setConnectionState(eventSource.readyState);

    eventSource.onopen = () => {
      setMessages([]);
      setConnectionState(eventSource.readyState);
    };

    eventSource.onmessage = (event) =>
      setMessages((prev) => [...prev, ...JSON.parse(event.data)]);

    eventSource.onerror = () => setConnectionState(eventSource.readyState);

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    switch (connectionState) {
      case 0:
        setNotification({
          show: true,
          type: "info",
          message: "Connecting",
        });
        break;
      case 1:
        setNotification({
          show: true,
          type: "success",
          message: "Connected",
        });
        break;
      case 2:
        setNotification({
          show: true,
          type: "error",
          message: "Closed",
        });
        break;
      default:
    }
  }, [connectionState]);

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${baseUrl}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: message }),
      });
      if (response.ok) {
        setMessage("");
      } else {
        setNotification({
          show: true,
          type: "error",
          message: "Message rejected by server",
        });
      }
    } catch (_) {
      setNotification({
        show: true,
        type: "error",
        message: "Failed to send message",
      });
    }
  };

  return (
    <div className="App">
      <Card>
        <CardContent>
          <Typography variant="h4" component="h1">
            Broadcast Message
          </Typography>
          <form onSubmit={submit}>
            <TextField
              id="message"
              label="Message"
              variant="standard"
              fullWidth
              value={message}
              onChange={({ target }) => setMessage(target.value)}
            />
          </form>
        </CardContent>
      </Card>
      {messages.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h4" component="h1">
              Messages
            </Typography>
            <List>
              {messages.map(({ id, data }) => (
                <ListItem key={id}>
                  <ListItemIcon>
                    <MessageIcon />
                  </ListItemIcon>
                  <ListItemText primary={data} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        key={notification.type}
        open={notification.show}
        onClose={closeNotification}
      >
        <Alert
          severity={notification.type}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default App;
