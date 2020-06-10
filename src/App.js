import React, { useEffect } from 'react';
import './App.scss';

import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'

import { auth, loginWithGithub } from './network';

import Game from './Game';

function App() {
  useEffect(()=>{
    auth().onAuthStateChanged((user) => {
      if (user) console.log(user);
    })
  }, []);
    
  return (
    <div className="App">
      <button onClick={loginWithGithub}>Login</button>
      <DndProvider backend={HTML5Backend}>
        <Game />
      </DndProvider>
    </div>
  );
}

export default App;
