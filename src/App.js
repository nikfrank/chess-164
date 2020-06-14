import React, { useEffect, useState } from 'react';
import './App.scss';

import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'

import { auth, loginWithGithub, loadGames, createGame } from './network';

import Game from './Game';

function App() {
  const [user, setUser] = useState(null);
  
  useEffect(()=>{
    auth().onAuthStateChanged((newUser) => {
      if (!newUser) return;
      
      setUser(newUser);
      loadGames().then((games)=>{
        console.log(games);

        //createGame();
      });
    })
  }, []);
    
  return (
    <div className="App">
      {!user && <button onClick={loginWithGithub}>Login</button>}
      <DndProvider backend={HTML5Backend}>
        <Game />
      </DndProvider>
    </div>
  );
}

export default App;
