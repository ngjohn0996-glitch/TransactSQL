import React, { useState } from "react";
import api from "./api";

function Register() {   
    const [input, setInput] = useState({username: "",
                                        password: "",
                                        occupation: "",
                                        age: 0,
                                        country: ""})
    

    function changeInput(event) {
        setInput(previnput => ({ ...previnput , [event.target.id] : event.target.value}));
    }


    async function submit (event){
        event.preventDefault()
        try{
            await api.post('/register_user',input)
            setInput({username: "",
                      password: "",
                      occupation: "",
                      age: 0,
                      country: ""})
            setInfo("User created, please log in")        
        }catch(err){
            if (err.response?.data?.detail){   //option1?option2?option3   //option1?option2?option2true:option2false
                const dataFailDetail = err.response.data.detail
                setInfo(dataFailDetail)
            }else{
                setInfo("An unexpecet error occur. Please try again.")
            }    
        }            
    }

    const [info,setInfo] = useState("");
                                                                        
    return(
      <div>
        <form onSubmit={submit}>
            <span>Username:</span>
            <input type="text" id= "username" value={input.username} onChange={changeInput}></input><br/>
            <span>Password:</span>
            <input type="text" id= "password" value={input.password} onChange={changeInput}></input><br/>
            <span>Occupation:</span>
            <input type="text" id= "occupation" value={input.occupation} onChange={changeInput}></input><br/>
            <span>Age:</span>
            <input type="number" id= "age" value={input.age} onChange={changeInput}></input><br/>
            <span>Country:</span>
            <input type="text" id= "country" value={input.country} onChange={changeInput}></input><br/>
            <h1>{input.username}{input.password}{input.occupation}{input.age}{input.country}</h1>
            <button type="submit">Submit</button><br/>
            {info && <span>{info}</span>} 
        </form>    
      </div>
    )
}
  
export default Register