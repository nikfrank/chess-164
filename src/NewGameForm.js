import React from 'react';

import StaticBoard from './StaticBoard';

import { initPositions } from './chess-util';
const initPositionKeys = Object.keys(initPositions);

function NewGameForm({ value, onChange, onSubmit, userId }){  
  return (
    <div className='NewGameForm'>
      My Color
      <select value={value.b === userId ? 'b' : 'w'}
              onChange={e=> onChange({
                  ...value,
                  [e.target.value]: userId,
                  [e.target.value === 'b' ? 'w' : 'b']: '',
                })}>
        <option value='b'>Black</option>
        <option value='w'>White</option>
      </select>

      <hr/>
      
      Initial Position
      <select value={value.initialPosition}
              onChange={e=> onChange({
                  ...value,
                  initialPosition: e.target.value,
                  ...initPositions[e.target.value],
                })}>
        {initPositionKeys.map(key=> (
           <option value={key} key={key}>{initPositions[key].name}</option>
        ))}
      </select>
      <StaticBoard pieces={value.pieces || initPositions.standard.pieces}
                   flipped={value.b === userId}/>


      <hr/>
      
      Whose Turn
      <select value={value.turn || 'w'}
              onChange={e=> onChange({ ...value, turn: e.target.value })}>
        <option value='b'>Black</option>
        <option value='w'>White</option>
      </select>

      <hr/>

      <button onClick={()=> onSubmit({
          [value.b === userId ? 'b' : 'w']: userId,
          [value.b === userId ? 'w' : 'b']: '',
          pieces: initPositions.standard.pieces,
          moves: [],
          turn: 'w',
          ...value,
        })}>Make New Game</button>

    </div>
  );
};

export default NewGameForm;
