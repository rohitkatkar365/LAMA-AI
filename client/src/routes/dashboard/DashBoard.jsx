import React from "react";
import "./dashboard.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

function DashBoard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (text) => {
      return fetch(`${import.meta.env.VITE_API_URL}/api/chats`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      }).then((res) => res.json());
    },
    onSuccess: (data) => {
      // Invalidate and refetch user chats
      queryClient.invalidateQueries({ queryKey: ["userChats"] });

      // Use the actual chat ID in the URL
      const chatId = data._id; // Assuming data contains the chat object with the _id
      navigate(`/dashboard/chat/${chatId}`); // Fixed: Removed the colon (:) before the id
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = e.target.text.value;
    if (!text) {
      return; 
    }
    mutation.mutate(text);
  };

  return (
    <div className="dashboard">
      <div className="texts">
        <div className="logo">
          <img src="/logo.png" alt="Logo" />
          <h1>LAMA AI</h1>
        </div>
        <div className="options">
          <div className="option">
            <img src="/chat.png" alt="Create Chat" />
            <span>Create a New Chat</span>
          </div>
          <div className="option">
            <img src="/image.png" alt="Analyze Image" />
            <span>Analyze Image</span>
          </div>
          <div className="option">
            <img src="/code.png" alt="Code Help" />
            <span>Help me with my Code</span>
          </div>
        </div>
      </div>
      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="text"
            placeholder="Ask me anything?"
            required 
          />
          <button type="submit">
            <img src="/arrow.png" alt="Submit" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default DashBoard;
