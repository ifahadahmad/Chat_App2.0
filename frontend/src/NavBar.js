import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {NavLink,withRouter} from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

export default withRouter(function NavBar(props) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            <Button href="/" style={{"color":"white"}}>Chat-App</Button>
          </Typography>
          {props.match.path!="/profile"&&<div>
                <Button><NavLink to={props.match.path==="/signup"?"/login":"/signup"} style={{"textDecoration":"none","color":"white"}}>{props.match.path==="/signup"?"Login":"signup"}</NavLink></Button>
          </div>}
        </Toolbar>
      </AppBar>
    </div>
  );
});
