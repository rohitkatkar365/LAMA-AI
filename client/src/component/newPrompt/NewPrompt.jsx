import React, { useEffect, useRef, useState } from "react";
import "./newprompt.css";
import Upload from "../upload/Upload";
import { IKImage } from "imagekitio-react";
import model from "./../../lib/gemini";
import Markdown from 'react-markdown';
import { useMutation, useQueryClient } from "@tanstack/react-query";

function NewPrompt({data}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const [img, setImg] = useState({ isLoading: false, error: "", dbdata: {} ,aiData:{}});

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Hello" }],
      },
      {
        role: "model",
        parts: [{ text: "Great to meet you. What would you like to know?" }],
      },
    ],
    generationConfig:{
      // maxOutputTokens:100,
    }
  });
  const endRef = useRef(null);
  const formRef = useRef(null);
  useEffect(() => {
    endRef.current.scrollIntoView({ behaviour: "smooth" });
  }, [data,question,answer,img.dbdata]);

  const queryClient = useQueryClient();
  // const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () => {
      return fetch(`${import.meta.env.VITE_API_URL}/api/chats/${data._id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question:question.length?question:undefined ,
          answer,
          img:img.dbdata?.filePath || undefined
        }),

      }).then((res) => res.json());
    },
    onSuccess:() => {
      // Invalidate and refetch user chats
      queryClient.invalidateQueries({ queryKey: ["chat",data._id] }).then(()=>{
        formRef.current.reset(); 
        setQuestion("")
        setAnswer("")
        setImg({ isLoading: false, error: "", dbdata: {} ,aiData})
      });

      // Use the actual chat ID in the URL
      const chatId = data._id; // Assuming data contains the chat object with the _id
      // navigate(`/dashboard/chat/${chatId}`); // Fixed: Removed the colon (:) before the id
    },
    onError :(error)=>{
      console.log(error);
      
    }
  });
  const add = async (prompt,isInitial) => {
    // const prompt = "Write a story about an AI and magic";
    if(!isInitial)
      setQuestion(prompt);
    try{
    const result = await chat.sendMessageStream(Object.entries(img.aiData).length?[img.aiData,prompt]: [prompt]);
    // const response = await result.response;
    let accummulatedText = '';
    for await(const chunk of result.stream)
    {
      const chunkText = chunk.text();
      accummulatedText+=chunkText;
      setAnswer(accummulatedText);

    }
    mutation.mutate();
  }
  catch(err){
    console.log(err.message);
  }
    setImg({ isLoading: false, error: "", dbdata: {} ,aiData:{}})
  };

  const handlesubmit = async (e) => {
    e.preventDefault();
    const text = e.target.text.value;
    if (!text) {
      return;
    }
    add(text,false);
  };
  const  hasRun = useRef(false);
  useEffect(()=>{
    if (!hasRun.current) {
      if (data?.history?.length == 1) {
        add(data.history[0].parts[0].text,true);
      } 
    }
    hasRun.current=true;
  },[])
  return (
    <>
      {img.isLoading && <div className="">Loading...</div>}
      {img.dbdata?.filePath && (
        <IKImage
          urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
          path={img.dbdata?.filePath}
          width="380"
          transformation={{ width: 380 }}
        />
      )}
      {question && <div className="message user">{question}</div>}
      {answer && <div className="message"><Markdown>{answer}</Markdown></div>}

      {/* <button onClick={add}>TEST AI</button> */}
      <div className="endChat" ref={endRef}></div>
      <form className="newForm" onSubmit={handlesubmit} ref={formRef}>
        {/* <label htmlFor="file">
            <img src="/attachment.png"/>
          </label> */}
        <Upload setImg={setImg}></Upload>
        <input id="file" type="file" multiple={false} hidden />
        <input type="text" name="text" placeholder="Ask me anything?" />
        <button>
          <img src="/arrow.png" />
        </button>
      </form>
    </>
  );
}

export default NewPrompt;
