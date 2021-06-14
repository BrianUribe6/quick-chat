import Navbar from 'react-bootstrap/Navbar';
import {
  Link, Route, Switch
} from "react-router-dom";
import "./App.css";
import Room from './ChatRoom';
import Lobby from './Lobby';
import {ReactComponent as PageNotFound} from './assets/404.svg'


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
          <PageNotFound />
        </Route>
      </Switch>
    </>
  );
}

export default App;
