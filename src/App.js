import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Switch from 'material-ui/Switch';
import { FormControlLabel, FormGroup } from 'material-ui/Form';
import Menu, { MenuItem } from 'material-ui/Menu';
import Paper from 'material-ui/Paper';
import Input, { InputLabel } from 'material-ui/Input';
import { FormControl, FormHelperText } from 'material-ui/Form';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import PouchDB from 'pouchdb-browser'
import Snackbar from 'material-ui/Snackbar';
import Fade from 'material-ui/transitions/Fade';
import DeleteIcon from '@material-ui/icons/Delete';
import CloseIcon from '@material-ui/icons/Close';

const styles = theme => ({
  root: {
    // paddingTop: 16,
    // paddingBottom: 16,
    // marginTop: theme.spacing.unit * 3
  },
  flex: {
    flex: 1,
  },
  button: {
    display: 'block',
    marginTop: theme.spacing.unit * 2,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 240,
  },
  formContent: theme.mixins.gutters({
    paddingTop: 16,
     paddingBottom: 16,
    marginTop: theme.spacing.unit * 3
  })
});




let db = new PouchDB('markers');

function addMarker(name, address) {
  var marker = {
    _id : new Date().toISOString(),
    name: name,
    address: address
  };

  return db.put(marker);
}

function removeMarker(_id) {
    db.get(_id).then(function (doc) {
      return db.remove(doc);
    }).catch(function (err) {
      console.log(err);
    });
  
}

class PouchDbApp extends React.Component {
  state = {
    auth: false,
    anchorEl: null,
    data: [],
    name: '',
    address: '',
    showNotification: false
  };
  

  loadMarkers = () => {
    var ref = this;

    db.allDocs({
      include_docs: true,
      attachments: true
    }).then(function (result) {

      var data = result.rows.map(e => {
        return e.doc;
      });
      ref.setState({ data: data });
    }).catch(function (err) {
      console.log(err);
    });
  }

  clearForm = () => {
    this.setState({ name: '' });
    this.setState({ address: '' });
  }

  handleChange = (event, checked) => {
    this.setState({ auth: checked });
  };

  handleClose = () => {
    this.setState({ showNotification: false });
  };

  handleDeleteButton = (event,id) => {
    removeMarker(id);
  }

  handleAddMarkerButton = event => {

    var newMarkName = this.state.name;
    var newMarkAddress = this.state.address;

    var ref = this;

    addMarker(newMarkName,newMarkAddress)
    .then(function (result) {
      ref.setState({ showNotification: true });
      ref.clearForm();
    }).catch(function (err) {
      console.log(err);
    });

  };

  handleMenu = event => {
    this.setState({ anchorEl: event.currentTarget });
  };


  handleChangeInput = name => event => {
    this.setState({ [name]: event.target.value });
  };
  constructor(props) {
    super(props);
    
  }

  render() {
    const { classes } = this.props;
    const { auth, anchorEl } = this.state;
    const open = Boolean(anchorEl);
    this.loadMarkers();
    return (
      <div className={classes.root}>
        {/* <FormGroup>
          <FormControlLabel
            control={
              <Switch checked={auth} onChange={this.handleChange} aria-label="LoginSwitch" />
            }
            label={auth ? 'Logout' : 'Login'}
          />
        </FormGroup> */}
        <AppBar position="static">
          <Toolbar>
            <IconButton className={classes.menuButton} color="inherit" aria-label="Menu">
              <MenuIcon />
            </IconButton>
            <Typography variant="title" color="inherit" className={classes.flex}>
              React + PouchDB
            </Typography>
            {auth ? (
              <div>
                <IconButton
                  aria-owns={open ? 'menu-appbar' : null}
                  aria-haspopup="true"
                  onClick={this.handleMenu}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={open}
                  onClose={this.handleClose}
                >
                  <MenuItem onClick={this.handleClose}>Profile</MenuItem>
                  <MenuItem onClick={this.handleClose}>My account</MenuItem>
                </Menu>
              </div>
            ) :
            (
              <Button color="inherit">Login</Button>
            )
            }
          </Toolbar>
        
        </AppBar>
        <Paper className={classes.formContent} elevation={4}>
        <Typography variant="headline" component="h3">
          Add a Marker
        </Typography>
        <Typography component="p">
          Utilize o formulário abaixo para adicionar uma novo marcador ao mapa.
        </Typography>
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="name-input">Name</InputLabel>
          <Input id="name-input" onChange={this.handleChangeInput('name')} value={this.state.name} />
        </FormControl>
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="address-input">Address</InputLabel>
          <Input id="address-input" onChange={this.handleChangeInput('address')} value={this.state.address} />
        </FormControl>
        <Button variant="raised" onClick={this.handleAddMarkerButton} className={classes.button}>
          Add
        </Button>
      </Paper> 
      <Paper className={classes.formContent} elevation={4}>
        <Typography variant="headline" component="h3">
          Marker List
        </Typography>
        <Typography component="p">
          List of all markers inserted
        </Typography>
        <Table  className={classes.table}>
        <TableHead >
          <TableRow >
          <TableCell>Id</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Address</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody >
          {this.state.data.map(n => {
            return (
              <TableRow  key={n._id}>
               <TableCell>{n._id}</TableCell>
                <TableCell>{n.name}</TableCell>
                <TableCell>{n.address}</TableCell>
                <TableCell>
                <IconButton onClick={event => this.handleDeleteButton(event, n._id)} className={classes.button} aria-label="Delete">
                  <DeleteIcon />
                </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={this.state.showNotification}
          transition={Fade}
           onClose={this.handleClose}
          SnackbarContentProps={{
            'aria-describedby': 'add-message',
          }}
          message={<span id="add-message">Added new marker</span>}
          action={
            <IconButton color="inherit" size="small" onClick={this.handleClose}>
              <CloseIcon/>
            </IconButton>
          }
        />
      </Paper> 
      </div>
    );
  }
}

PouchDbApp.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PouchDbApp);
