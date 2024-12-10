import React, { useRef } from 'react'
import './upload.css'
import { IKContext, IKImage, IKUpload } from 'imagekitio-react';

const urlEndpoint = import.meta.env.VITE_IMAGE_KIT_ENDPOINT;
const publicKey = import.meta.env.VITE_IMAGE_KIT_PUBLIC_KEY; 
const authenticator =  async () => {
    try {
        const response = await fetch('http://localhost:3000/api/upload');

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Request failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const { signature, expire, token } = data;
        return { signature, expire, token };
    } catch (error) {
        throw new Error(`Authentication request failed: ${error.message}`);
    }
};
function Upload({setImg}) {

    const upload = useRef(null);
    
    const onError = err => {
        console.log("Error", err);
      };
      
      const onSuccess = res => {
        console.log("Success", res);
        setImg((prev)=>({...prev,isLoading:false,dbdata:res}))

      };
      
      const onUploadProgress = progress => {
        console.log("Progress", progress);
      };
      
      const onUploadStart = evt => {
        // console.log("Start", evt);
        const file = evt.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () =>{
          setImg((prev)=>({...prev,isLoading:true,aiData:{
            inlineData : {
              data:reader.result.split(",")[1],
              mimeType:file.type,
            }
          }}))
        }
        reader.readAsDataURL(file);
      };

  return (
    <IKContext
        urlEndpoint={urlEndpoint}
        publicKey={publicKey}
        authenticator={authenticator}
      >
         <IKUpload
          fileName="test-upload.png"
          onError={onError}
          onSuccess={onSuccess}
          useUniqueFileName={true}
          onUploadProgress={onUploadProgress}
          onUploadStart={onUploadStart}
          style={{display:"none"}}
          ref={upload}
        />
        {<label onClick={()=>upload.current.click()}><img src="/attachment.png"/></label>}
      </IKContext>
  )
}

export default Upload