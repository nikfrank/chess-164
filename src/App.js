import React from 'react';
import './App.scss';

import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'

import Game from './Game';

function App() {
  return (
    <div className="App">
      <DndProvider backend={HTML5Backend}>
        <Game />
      </DndProvider>
    </div>
  );
}

export default App;
