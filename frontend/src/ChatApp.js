import React,{useEffect,useState,useRef } from 'react';
import axios from 'axios';
import { useHistory,NavLink } from 'react-router-dom';
import SocketIoClient from 'socket.io-client';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import DeleteIcon from '@material-ui/icons/Delete';
import List from '@material-ui/core/List';
import Input from '@material-ui/core/Input';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import useForm from './hooks/useForm';
import Blue from '@material-ui/core/colors/blue';
import BlueGrey from '@material-ui/core/colors/blueGrey';
import { Button } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
const ENDPOINT ="http://127.0.0.1:3001";
const socket = SocketIoClient(ENDPOINT,{transports:['websocket']});
const drawerWidth = 20;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    width: `calc(100% - ${drawerWidth}%)`,
    marginLeft: `${drawerWidth}%`,
  },
  drawer: {
    width: `${drawerWidth}%`,
    flexShrink: 0,
  },
  typography: {
    padding: theme.spacing(1),
  },
  drawerPaper: {
    width: `${drawerWidth}%`,
  },
  delIcon: {
    opacity: 0,
    marginLeft: "5px",
    transition: "opacity 0.3s ease",
    '&:hover':{
      opacity: 1
    }
  },
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
  }
}));
function ChatApp(){
    const myRef=useRef(null);
    const [currentUser,setCurrentUser] = useState({});
    const [friends,setFriends] = useState([]);
    const [isTemp,setIsTemp] = useState(false);
    const [friendRequest,setFriendRequest] = useState([]);
    const [searchBar,setSearchBar] = useState("");
    const [formData,handleFormChange,resetForm] = useForm({message:""});
    const [users,setUsers] = useState([{}]);
    const [temp,setTemp] = useState([{}]);
    const [isShowing,setIsShowing] = useState(false);
    const [to,setTo] = useState({username:"",userId:""});
    const [messages,setMessages] = useState([]);
    const classes = useStyles();
    const history = useHistory();
    const [anchorEl, setAnchorEl] = useState(null);
    const [anchorE2, setAnchorE2] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const openMenu = Boolean(anchorE2);
    const handleMenu = (event) => {
      setAnchorE2(event.currentTarget);
    };
    const handleMenuClose = () => {
      setAnchorE2(null);
    };
    const handlePopClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
    const handlePopClose = () => {
      setAnchorEl(null);
    };
    const handleDialogOpen = () => {
      setOpenDialog(true);
    };
    const handleDialogClose = () => {
      setOpenDialog(false);
    };
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
    useEffect(()=>{
        async function assehi(){
        const resp = await axios("/api",{withCredentials:true});
        setUsers(resp.data.allUsers);
        setCurrentUser(resp.data.user);
        setFriends(resp.data.friends);
        setFriendRequest(resp.data.friendRequest);
        if(resp.data.msg=="signfirst"){
            history.push("/signup");
        }
    }
    assehi();
    },[]);
    const handleClick = async (toUser,index)=>{
      var inx="";
      var newUsers =friends.slice();
      if(isTemp){
        friends.forEach(function(usr,idx){
          if(usr.username===toUser.username){
            inx=idx;
          }
        });
        for(var i=inx;i>0;i--){
          newUsers[i]=newUsers[i-1];
        }
        newUsers[0]=toUser;
        setSearchBar("");
      } else {
        for(var i=index;i>0;i--){
          newUsers[i]=newUsers[i-1];
        }
        newUsers[0]=toUser;
      }
      setFriends(newUsers);
      setIsTemp(false);
      const resp = await axios(`/api/${currentUser.userId}/${toUser._id}`,{withCredentials:true});
      setTo({username:toUser.username,userId:toUser._id});
      setIsShowing(true);
      setMessages(resp.data.messages);
      toBottom();
    }
    const handleFormSubmit = async e=>{
      e.preventDefault();
      const resp = await axios.post(`/api/${currentUser.userId}/${to.userId}`,{text:formData.message,from:currentUser.userId,to:to.userId});
      resetForm();
    }
    const handleDelete = async (id,from,to)=>{
      await axios.delete(`/api/${id}/${from}/${to}`);
    }
    const handleRequestClick = async toUser=>{
      const resp = await axios(`/api/request/${currentUser.userId}/${toUser._id}`,{withCredentials:true});
    }
    const handleAcceptClick = async toUser => {
      const resp = await axios(`api/accept/${currentUser.userId}/${toUser._id}`,{withCredentials: true});
      setFriendRequest(friendRequest.filter(fr=>fr.username!==toUser.username));
    }
    const handleSearchChange = e =>{
      var newFriends = friends;
      var updatedFriends =[];
      setSearchBar(e.target.value);
      if(e.target.value.length>0){
      for(var i=0;i<newFriends.length;i++){
        if(newFriends[i].username.indexOf(e.target.value)!=-1){
            updatedFriends.push(newFriends[i]);
        }
      }
    } else {
      setIsTemp(false);
    }
      if(updatedFriends.length>0){
        setTemp(updatedFriends);
        setIsTemp(true);
      }
    }
    const handleLogout = async () => {
      await axios("/api/logout");
      history.push("/signup");
    }
    const handleDeleteAccount = async ()=> {
      await axios(`/api/delete/${currentUser.userId}`);
      setOpenDialog(false);
      history.push("/signup");
 
    }
    socket.on("friendRequest",request=>{
      if(request.to===currentUser.userId){
        setFriendRequest(request.friendRequest);
      }
    });
    socket.on("message",msg=>{
      setMessages([...messages,msg]);
      toBottom();
    });
    socket.on("delete-message",msg=>{
      setMessages(msg);
      toBottom();
    });
    socket.on("acceptRequest",accept=>{
        if(accept.firstUser===currentUser.userId){
          setFriends(accept.firstFriends);
        }
        else if(accept.secondUser===currentUser.userId){
          setFriends(accept.secondFriends);
        }
    });
    const toBottom = ()=>{
        window.scrollTo(0,document.body.scrollHeight);
    }
    return (
        <div className={classes.root}>
            <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h6" noWrap style={{"flexGrow":"1"}}>
            Chat-App
          </Typography>
          <div>
      <Button aria-describedby={id} color="inherit" onClick={handlePopClick}>
        Friend Request
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <List>
          {friendRequest && friendRequest.length>0?(friendRequest.map((user, index) => {
              return (
            <ListItem button key={user.username}>
              <ListItemIcon onClick={(e)=>handleAcceptClick(user)}><CheckCircleIcon/></ListItemIcon>
              <ListItemText primary={user.username} />
            </ListItem>
              );
          })):(<Typography className={classes.typography}>No Friend Requests</Typography>)}
        </List>
      </Popover>
      <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorE2}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={openMenu}
                onClose={handleMenuClose}
              >
                <MenuItem><span>{currentUser&&`Logged in as ${currentUser.username}`}</span></MenuItem>
                <MenuItem onClick={handleMenuClose}><NavLink style={{"textDecoration":"none","color":"inherit"}} to="/profile">Profile</NavLink></MenuItem>               
                <MenuItem onClick={handleMenuClose}><span onClick={handleLogout}>Logout</span></MenuItem>
                <MenuItem onClick={handleMenuClose}><span onClick={handleDialogOpen}>
        Delete Account
      </span>
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Account"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you Sure. You want to delete your account.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
              Cancel
          </Button>
          <Button onClick={handleDeleteAccount} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog></MenuItem>
              </Menu>
    </div>
        </Toolbar>
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
        anchor="left"
      >
        <div className={classes.toolbar} />
        <Input type="text" placeholder="Search Friends..." onChange={handleSearchChange} value={searchBar}/>
        <Divider />
        <List>
          {isTemp?(temp.map((friend,index)=>{
            return (
              <ListItem button key={friend.username} onClick={(e)=>handleClick(friend,index)}>
              <ListItemIcon>{<img style={{width:`20px`}} src={`${friend.imageUrl}`} />}</ListItemIcon>
              <ListItemText primary={friend.username} />
              </ListItem>
            );})):(friends && friends.map((friend,index)=>{
            return (
              <ListItem button key={friend.username} style={{"backgroundColor":isShowing&&index===0?`${BlueGrey[50]}`:"white"}} onClick={(e)=>handleClick(friend,index)}>
              <ListItemIcon>{<img style={{width:`20px`}} src={`${friend.imageUrl}`} />}</ListItemIcon>
              <ListItemText primary={friend.username} />
              </ListItem>
            );
          }))}
          {users && users.map((user, index) => {
            if(user.username!==currentUser.username&&friends.every(friend=>friend.username!==user.username)){
              if(friendRequest.find(fr=>fr.username===user.username)){
                return (
                <ListItem button key={user.username}>
                <ListItemIcon>{<img style={{width:`20px`}} src={`${user.imageUrl}`} />}</ListItemIcon>
                <ListItemText primary={user.username} />
                <ListItemIcon onClick={(e)=>handleAcceptClick(user)}><CheckCircleIcon/></ListItemIcon>
                </ListItem>
                );
              }
              else {
              return (
            <ListItem button key={user.username}>
              <ListItemIcon>{<img style={{width:`20px`}} src={`${user.imageUrl}`} />}</ListItemIcon>
              <ListItemText primary={user.username} />
              <ListItemIcon onClick={(e)=>handleRequestClick(user)}>+</ListItemIcon>
            </ListItem>
              );
              }
            }
          })}
        </List>
        <Divider />
      </Drawer>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        {isShowing&&<>
        <div ref={myRef}>
        {messages.map(message=>{
          if(message.from===currentUser.userId){
            return (
              <Typography paragraph style={{"textAlign":"right"}} key={message._id}>
                <Typography component="span" style={{"backgroundColor":`${Blue[800]}`,"color":`${BlueGrey[50]}`,"padding":".5em","borderRadius":"10%"}}>
                {message.text}
                <DeleteIcon fontSize="small" className={classes.delIcon} onClick={()=>handleDelete(message._id,message.from,message.to)}/>
                </Typography>
              </Typography>
            )
          }
          else{
            return (
          <Typography paragraph key={message._id}>
            <Typography component="span" style={{"backgroundColor":`${BlueGrey[50]}`,"padding":".5em","borderRadius":"10%"}}>
            {message.text}
            </Typography>
          </Typography>
            )
          }
})}</div>
    <form onSubmit={handleFormSubmit} style={{"position":"fixed","bottom":"10px","width":"60%"}}>
        <Input margin="dense" autoFocus type="text" name="message" id="message" value={formData.message} onChange={handleFormChange} fullWidth/>
      </form> </>}
      </main>
        </div>
    );
}
export default ChatApp;