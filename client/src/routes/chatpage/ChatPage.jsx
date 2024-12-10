import React from "react";
import "./chatpage.css";
import NewPrompt from "../../component/newPrompt/NewPrompt";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import Markdown from "react-markdown";
import { IKImage } from "imagekitio-react";

function ChatPage() {
  const path = useLocation().pathname;
  const chatId = path.split("/").pop();

  const { isLoading, error, data } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}/api/chat/${chatId}`, {
        credentials: "include",
      }).then((res) => res.json()),
  });

  return (
    <div className="chatPage">
      <div className="wrapper">
        <div className="chat">
          {/* <div className="message">Test message</div> */}
          {isLoading
            ? "Loading..."
            : error
            ? "Something went wrong!!!"
            : data?.history?.map((message, ind) => {
                return (
                  <>
                    {message.img && (
                      <IKImage
                        urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
                        path={message.img}
                        height="300"
                        width="400"
                        transformation={[{ height: 300, width: 400 }]}
                        loading="lazy"
                        lqip={{ active: true, quality: 20 }}
                      ></IKImage>
                    )}
                    <div
                      className={
                        message.role === "user" ? "message user" : "message"
                      }
                      key={ind}
                    >
                      <Markdown>{message.parts[0].text}</Markdown>
                    </div>
                  </>
                );
              })}
          {data && <NewPrompt data={data}/>}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
