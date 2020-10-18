import React,{useState,Component} from 'react';
import {withRouter} from 'react-router-dom';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import NavBar from './NavBar';
import axios from 'axios';

class Profile extends Component{
    constructor(props){
        super(props);
        this.state={
            file:""
        }
        this.handleChange=this.handleChange.bind(this);
        this.handleSubmit=this.handleSubmit.bind(this);
    }
    handleChange(e){
        const file = e.target.files[0];
        this.setState({file});
    }
    async handleSubmit(e){
        e.preventDefault();
        var Data = new FormData();
        Data.append("file",this.state.file);
        await axios.post("/api/upload",Data);
        this.props.history.push("/");
    }
    render(){
        return(
            <div>
            <NavBar/>
            <form onSubmit={this.handleSubmit} style={{"display":"flex","flexDirection":"column","alignItems":"center","marginTop":"20px"}}>
            <Input type="file" id="fileUpload" name="fileUpload" onChange={this.handleChange}/>
            <Button style={{"marginTop":"10px"}}>Set Profile</Button>
            </form>
            </div>
        )
    }
}
export default withRouter(Profile);