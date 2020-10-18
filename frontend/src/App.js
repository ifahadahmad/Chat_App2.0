import React from 'react';
import {Route, Switch} from 'react-router-dom';
import './App.css';
import ChatApp from './ChatApp';
import SignUp from './SignUp';
import LogIn from './LogIn';
import Profile from './Profile';
function App(){
  return (
    <div>
      <Switch>
        <Route exact path="/signup" render={SignUp}/>
        <Route exact path="/login" render={(routeProps)=><LogIn {...routeProps}/>}/>
        <Route exact path="/profile" render={Profile}/>
        <Route path="/" render={()=><ChatApp/>}/>
      </Switch>
    </div>
  );
}
export default App;
