import {Routes, Route, Link} from "react-router-dom"
import Component1 from "./Component1";
import Login from "./Login";
import Protected from "./Protected";
import Register from "./Register";
import Authpage from "./Authpage";

function App() {
  return(
    <>
      <nav>
        <ul>
          <li><Link to="/register">Register</Link></li>
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/protected">Protected</Link></li>
          <li><Link to="/transaction">Transaction</Link></li>
        </ul>  
      </nav>

      
      <Routes>
        <Route path="/register" element={<Register/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/protected" element={<Protected/>}/>
        <Route path="/transaction" element={<Component1/>}/>  
        <Route path="/authpage" element={<Authpage/>}/>      
      </Routes>
    </>
  )
}

export default App
