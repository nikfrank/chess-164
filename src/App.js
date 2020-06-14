import React, { useEffect, useState } from 'react';
import './App.scss';

import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'

import { auth, loginWithGithub, createGame } from './network';

import SideNav from './SideNav';
import Game from './Game';

function App() {
  const [user, setUser] = useState(null);
  
  useEffect(()=>{
    auth().onAuthStateChanged((newUser) => {
      if (!newUser) return;
      
      setUser(newUser);
    })
  }, []);
    
  return (
    <div className="App">
      <SideNav user={user} onSelectGame={g=> console.log(g)}/>
      <DndProvider backend={HTML5Backend}>
        <Game />
      </DndProvider>
    </div>
  );
}

export default App;
