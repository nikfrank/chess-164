import React from 'react';

import Piece from 'react-chess-pieces';

function StaticBoard({ pieces, turn, flipped }){
  return (
    <div className='Board'
         style={{
           width: '30vw', height: '30vw',
           maxWidth: 250, maxHeight: 250,
           margin: '20px auto',
           flexDirection: flipped ? 'column' : 'column-reverse'
         }}>
      {Array(8).fill(0).map((_, rank)=> (
         <div className='rank' key={rank}>
           {pieces.slice(rank*8, rank*8+8).map((piece, file)=> (
              <div key={''+rank+''+file+''+piece} className='square'>
                <Piece piece={piece}/>
              </div>
            ))}
         </div>
       ))}
    </div>
  );
}

export default StaticBoard;
