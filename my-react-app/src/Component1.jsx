import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom"
import api from "./api"

function Component1() {

    //insert----------------------------------------------------------------------------------------------------------------------
    const [input, setInput] = useState({transaction_id : 0,
                                        company_id : 0,
                                        transaction_date : "",
                                        cash_flow : true,
                                        cash_amount : 0,
                                        transaction_category : "" });

    function changeInput(event) {
        const value = event.target.type === "checkbox" ? event.target.checked : event.target.value
        setInput(previnput => ({ ...previnput , [event.target.id] : value}));
    }

    async function submit (event){
        event.preventDefault()
        const token = localStorage.getItem("token")

        const copyobj = {...input}
        if (!copyobj.transaction_id){
            delete copyobj.transaction_id
        }
        if (!copyobj.transaction_date){
            delete copyobj.transaction_date 
        }
        
        try{
            if(!copyobj.transaction_id){   /*if not (undefined = false)*/
                await api.post('/transaction',copyobj,{
                    headers: {
                        "Authorization": "Bearer " + token
                    }             
                })
            }else{
                await api.put(`/edittransaction/${copyobj.transaction_id}`,copyobj,{
                    headers: {
                        "Authorization": "Bearer " + token
                    }             
                })
            }

            authFetch()
            setInput({transaction_id : 0,
                      company_id : 0,
                      transaction_date : "",
                      cash_flow : true,
                      cash_amount : 0,
                      transaction_category : "" })
        }catch(err){
            if(err.response?.status===401){
                localStorage.removeItem("token")        
                navigate('/authpage')
            }
            else if (err.response?.data?.detail){ 
                const dataFailDetail = err.response.data.detail
                console.log(dataFailDetail)
            }else{
                console.log("An unexpecet error occur. Please try again.")
            }
        }                    

    }



    //fetch-----------------------------------------------------------------------------------------------------------------------
    const [fetch,setFetch] = useState([]);

    const navigate = useNavigate()

    async function authFetch(){
        const token = localStorage.getItem("token")
        try{
          const response = await api.get('/usertransaction',{
            headers: {
              "Authorization": "Bearer " + token
            }            
          })       
          const data = response.data
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



    //delete--------------------------------------------------------------------------------------------------------------------
    async function handleDelete(transaction_id){
        const token = localStorage.getItem("token")  
        try{
            await api.delete(`/deltransaction/${transaction_id}`,{
                headers: {
                    "Authorization": "Bearer " + token
                },    
            })
            authFetch()
        }catch(err){
            if(err.response?.status===401){
                localStorage.removeItem("token")        
                navigate('/authpage')
            }
            else if (err.response?.data?.detail){ 
                const dataFailDetail = err.response.data.detail
                console.log(dataFailDetail)
            }else{
                console.log("An unexpecet error occur. Please try again.")
            }
        }
    }
       


    //update--------------------------------------------------------------------------------------------------------------------
    async function handleUpdate(transaction){
        setInput({transaction_id : transaction.transaction_id,
                  company_id : transaction.company_id,
                  transaction_date : transaction.transaction_date,
                  cash_flow : transaction.cash_flow,
                  cash_amount : transaction.cash_amount,
                  transaction_category : transaction.transaction_category })
    }

    async function cancelupdate(){
        setInput({transaction_id : 0,
                  company_id : 0,
                  transaction_date : "",
                  cash_flow : true,
                  cash_amount : 0,
                  transaction_category : "" })
    }

            
    
    //return--------------------------------------------------------------------------------------------------------------------
    return (
        <div>            
            <form onSubmit={submit}>
                <span>Company_id:</span>
                <input type="number" id= "company_id" value={input.company_id} onChange={changeInput}></input><br/>
                <span>Transaction_date:</span>
                <input type="text" id= "transaction_date" value={input.transaction_date} onChange={changeInput}></input><br/>
                <span>Cash_flow:</span>
                <input type="checkbox" id= "cash_flow" checked={input.cash_flow} onChange={changeInput}></input><br/>
                <span>Cash_amount:</span>
                <input type="number" id= "cash_amount" value={input.cash_amount} onChange={changeInput}></input><br/>
                <span>Transaction_category:</span>
                <input type="text" id= "transaction_category" value={input.transaction_category} onChange={changeInput}></input><br/>
                <h1>{input.company_id}{input.transaction_date}{input.cash_flow ? "Income" : "Expense"}{input.cash_amount}{input.transaction_category}</h1>
                <button type="submit">{input.transaction_id ? "Update" : "Insert"}</button>
                {input.transaction_id >0 && (<button onClick={cancelupdate}>Cancel</button>)}
            </form>

            <table>
                <thead>
                <tr>                
                    <td>Company_id</td>
                    <td>Transaction_date</td>
                    <td>Cash_flow</td>
                    <td>Cash_amount</td>
                    <td>Transaction_category</td>
                    <td>User_id</td>
                    <td>Action_01</td>
                    <td>Action_02</td>
                </tr>
                </thead>
                <tbody>
                {fetch.map((element)=>(
                    <tr key={element.transaction_id}>                        
                        <td>{element.company_id}</td>
                        <td>{element.transaction_date}</td>
                        <td>{element.cash_flow ? "Income" : "Expense"}</td>
                        <td>{element.cash_amount}</td>
                        <td>{element.transaction_category}</td>
                        <td>{element.user_id}</td>
                        <td><button onClick={()=>handleUpdate(element)}>update</button></td> 
                        <td><button onClick={()=>handleDelete(element.transaction_id)}>delete</button></td>                               
                    </tr>  
                ))}
                </tbody>
            </table>

        </div>
    )
}

export default Component1;    