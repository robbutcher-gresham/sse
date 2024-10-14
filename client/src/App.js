import React, { useEffect, useRef, useState } from "react";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MessageIcon from "@mui/icons-material/Message";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import "./App.css";

const baseUrl = "//localhost:3001";

const App = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const eventSource = useRef();

  useEffect(() => {
    if (!eventSource.current) {
      eventSource.current = new EventSource(`${baseUrl}/events`);

      eventSource.current.onmessage = (event) => {
        setMessages((prev) => [...prev, ...JSON.parse(event.data)]);
      };

      eventSource.current.onerror = (err) => console.error(err);
    }
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const response = await fetch(`${baseUrl}/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: message }),
    });
    if (!response.ok) {
      console.error(response);
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
    </div>
  );
};

export default App;
