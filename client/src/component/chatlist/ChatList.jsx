import React from "react";
import { Link } from "react-router-dom";
import "./chatlist.css";
import { useQuery } from "@tanstack/react-query";

function ChatList() {
  const { isLoading, error, data } = useQuery({
    queryKey: ["userChats"],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}/api/userchats`, {
        credentials: "include",
      }).then((res) => res.json()),
  });

  return (
    <div className="chatList">
      <span className="title">DASHBOARD</span>
      <Link to="/dashboard">Create a new chat</Link>
      <Link to="/">Explore LAMA AI</Link>
      <Link to="/">Contact</Link>
      <hr />
      <div className="title">Recent chat</div>
      <div className="list">
         {/* Conditional Rendering for API States */}
         {isLoading ? (
          "Loading..."
        ) : error ? (
          `Something went wrong: ${error.message}`
        ) : Array.isArray(data) ? (
          data.length === 0 ? (
            "No recent chats available"
          ) : (
            data.map((chat) => (
              <Link to={`/dashboard/chat/${chat._id}`} key={chat._id}>
                {chat.title || "Untitled Chat"}
              </Link>
            ))
          )
        ) : (
          "Unexpected response format"
        )}
      </div>
      <hr />
      <div className="upgrade">
        <img src="/logo.png" alt="Logo" />
        <div className="texts">
          <span>Upgrade to LAMA AI</span>
          <span>Get unlimited access to all features</span>
        </div>
      </div>
    </div>
  );
}

export default ChatList;
