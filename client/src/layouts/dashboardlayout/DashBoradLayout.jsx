import React, { useEffect } from 'react'
import './dashboardlayout.css'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import ChatList from '../../component/chatlist/ChatList';
function DashBoradLayout() {
  const {useId,isLoaded} = useAuth();
  const navigate = useNavigate();
  useEffect(()=>{
    if (isLoaded && useId) {
      navigate("/sign-in");
    }
  },[isLoaded,useId,navigate]);
  if (!isLoaded) {
    return <p>Loading... </p>
  }
  return (
    <div className="dashboardlayout">
        <div className="menu"><ChatList></ChatList></div>
        <div className="content"><Outlet></Outlet></div>
    </div>
  )
}

export default DashBoradLayout