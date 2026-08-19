import React, { useState } from "react";
import { useNavigate } from "react-router-dom"
import api from "./api"

function Login() {

    //input---------------------------------------------------------------------------------------------------------------------
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")



    //fillform-------------------------------------------------------------------------------------------------------------------
    const [error, setError] = useState("")

    function fillForm(){ 
        if(!username || !password){
            setError("Please fill in username & password")
            return false
        }
        setError("")
        return true
    }        



    //post and fetch--------------------------------------------------------------------------------------------------------------
    const navigate = useNavigate()

    async function submit (event){
        event.preventDefault()

        const input = new URLSearchParams()
        input.set("username",  username)
        input.set("password", password)   //inputs store in key-value pairs
      
        if (!fillForm()) return   //if not (error = false) >> return breakcode

        try{
            const response = await api.post('/token',input,{
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }            
            })       
            const token = response.data.access_token
            localStorage.setItem("token", token)   //fill form, auth, encode have token, get return
            navigate('/protected')
        }catch(err){
            if (err.response?.data?.detail){
                const dataFailDetail = err.response.data.detail
                setError(dataFailDetail)
            }else{
                setError("An unexpecet error occur. Please try again.")
            }    
        }
    }

    return (
        <div>
            <form onSubmit={submit}>
                <span>Username:</span>
                <input type="text" value={username} onChange={(e)=>setUsername(e.target.value)}></input><br/>
                <span>Password:</span>
                <input type="text" value={password} onChange={(e)=>setPassword(e.target.value)}></input><br/>
                <button type="submit">Login</button><br/>
                {error && <span>{error}</span>}   {/*have data=true  &&  string >> string*/}
                
            </form>
        </div>
    )
}

export default Login

