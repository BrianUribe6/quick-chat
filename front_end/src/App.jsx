import Navbar from 'react-bootstrap/Navbar';
import {
  Link, Route, Switch
} from "react-router-dom";
import "./App.css";
import Room from './ChatRoom';
import Lobby from './Lobby';



function App() {
  return (
    <>
      <Navbar sticky='top' bg='dark'>
        <Link className="navbar-brand text-white" to='/'>QuickChat</Link>
      </Navbar>
      <Switch>
        <Route exact path='/' component={Lobby} />
        <Route exact path='/r/:name' component={Room} />
        <Route>
          <h1>Error 404: Page does not exist</h1>
        </Route>
      </Switch>
    </>
  );
}

export default App;
