import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom"
import api from "./api"

function Protected() {
  const [fetch,setFetch] = useState([]);

  const navigate = useNavigate()

  async function authFetch(){
    const token = localStorage.getItem("token")
    try{
      const response = await api.get('/protected',{
        headers: {
          "Authorization": "Bearer " + token   //decode get return
        }            
      })       
      const data = response.data.Hello
      setFetch(data)
    }catch(err){
      if (err.response?.status===401){ 
        localStorage.removeItem("token")
        navigate('/authpage')
      }else{
        console.log("An unexpecet error occur. Please try again.")
      }
    }
  }

  useEffect(()=>{
    authFetch()
  },[navigate])     
    
  return (
    <div>
        <h1>{fetch}</h1>
        <h1>Protected</h1>
    </div>     
  )
}
  
  export default Protected