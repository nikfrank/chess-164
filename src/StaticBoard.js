import React from 'react';
import Piece from 'react-chess-pieces';

const RANKS = Array(8).fill(0);

function StaticBoard({ pieces, flipped }){
  return (
    <div className='Board Static'
         style={{ flexDirection: flipped ? 'column' : 'column-reverse'}}>
      {RANKS.map((_, rank)=> (
         <div className='rank' key={rank}
              style={{ flexDirection: flipped ? 'row-reverse' : 'row'}}>
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
