import React, { useEffect, useState } from 'react';
import './App.scss';

import {
  Route,
  BrowserRouter as Router,
  Switch,
  Redirect
} from 'react-router-dom';

import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'

import { auth } from './network';

import Openings from './Openings';

import SideNav from './SideNav';
import Game from './Game';

const GameView = ({ user })=> {
  const [game, setGame] = useState(null);

  return (
    <>
    <SideNav user={user} onSelectGame={setGame}/>
    <Game remoteGame={game} user={user}/>
    </>
  );
};

function App() {
  const [user, setUser] = useState(null);

  useEffect(()=>{
    auth().onAuthStateChanged((newUser) => {
      if (!newUser) return;
      setUser(newUser);
    })
  }, []);
    
  return (
    <Router>
      <DndProvider backend={HTML5Backend}>
        <div className='App'>
          <Switch>
            <Route exact path='/game' render={props=> <GameView {...props} user={user}/>} />
            <Route exact path='/openings' render={props=> <Openings {...props} user={user}/>} />
            <Redirect from='/' to='/game' />
          </Switch>
        </div>
      </DndProvider>
    </Router>
  );
}

export default App;
