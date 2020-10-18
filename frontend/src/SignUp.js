import React,{ useState } from 'react';
import {withRouter}  from 'react-router-dom';
import Input from '@material-ui/core/Input';
import { Button } from '@material-ui/core';
import NavBar from './NavBar';
import axios from 'axios';

axios.defaults.baseUrl="http://localhost:3001";
function SignUp(props){
    const [name,setName] = useState({username:"",password:""});
    const handleChange= e=>{
        setName({...name,[e.target.name]:e.target.value});
    }
    const handleSubmit = async e=>{
        e.preventDefault();
        const resp = await axios.post("/api/signup",{...name});
        console.log(resp.data.msg);
        if(resp.data.msg==="Success"){
            props.history.push("/");
        }
    }
    return (
        <div>
        <NavBar/>
        <form onSubmit={handleSubmit} style={{"display":"flex","flexDirection":"column","alignItems":"center","marginTop":"20px"}}>
            <Input
            value={name.username}
            type="text"
            name="username"
            placeholder="Username"
            id="username"
            style={{"width":"30%"}}
            onChange={handleChange}
            />
            <Input
            value={name.password}
            type="password" 
            name="password" 
            placeholder="Password"
            style={{"width":"30%","marginTop":"10px"}}
            id="password"
            onChange={handleChange}
            />
            <Button type="submit" style={{"marginTop":"10px"}}>Signup</Button>
        </form>
        </div>
    );
}
export default withRouter(SignUp);
