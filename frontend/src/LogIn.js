import React,{Component} from 'react';
import NavBar from './NavBar';
import TextField from '@material-ui/core/TextField';
import { Button } from '@material-ui/core';
import axios from 'axios';
class LogIn extends Component{
    constructor(props){
    super(props);
    this.state={
        username:"",password:""
        };
    this.handleChange=this.handleChange.bind(this);
    this.handleSubmit=this.handleSubmit.bind(this);
    }
    handleChange(e){
        this.setState({...this.state,[e.target.name]:e.target.value});
    }
    async handleSubmit(e){
        e.preventDefault();
        await axios.post("/api/login",{...this.state});
        this.props.history.push("/");
    }
    render(){
        return (
            <div>
            <NavBar/>
            <form onSubmit={this.handleSubmit} style={{"display":"flex","flexDirection":"column","alignItems":"center","marginTop":"20px"}}>
            <TextField
            value={this.state.username}
            type="text"
            name="username"
            placeholder="Username"
            id="username"
            style={{"width":"30%"}}
            onChange={this.handleChange}
            />
            <TextField
            value={this.state.password}
            type="password" 
            name="password"
            placeholder="Password"
            style={{"width":"30%","marginTop":"10px"}}
            id="password"
            onChange={this.handleChange}
            />
            <Button type="submit" style={{"marginTop":"10px"}}>Login</Button>
        </form>
        </div>
        );
    }
}
export default LogIn;
