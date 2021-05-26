import Navbar from 'react-bootstrap/Navbar'
import "./App.css"
import {
  Switch,
  Route,
  Link
} from "react-router-dom";

import Lobby from './Lobby'
import Room from './ChatRoom'


function App() {
  return (
    <>
      <Navbar sticky='top' bg='dark'>
        <Link className="navbar-brand text-white" to='/'>QuickChat</Link>
      </Navbar>
      <Switch>
        <Route exact path='/' component={Lobby} />
        <Route path='/r/:name' component={Room} />
        {/* <Route>
          <h1>Error 404: Page does not exist</h1>
        </Route> */}
      </Switch>
    </>
  );
}

export default App;
