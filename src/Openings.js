import React, { useState, useCallback } from 'react';
import './Openings.scss';

import Board from './Board';
import {
  initPieces,
  calculateLegalMoves,
  castleAsKingMove,
  isMoveLegal,
  calculateBoardAfterMove,
} from './chess-util';

function Openings(){
  const [flipped, setFlipped] = useState(false);
  const [pieces, setPieces] = useState(initPieces);
  const [turn, setTurn] = useState('w');
  const [moves, setMoves] = useState([]);
  const [selected, setSelected] = useState({});
  const [legalMovesDisplay, setLegalMovesDisplay] = useState({});
  
  const onMove = useCallback(({ rank, file }, moveFrom=selected)=>{
    const { move, enPassant, promoting } = isMoveLegal(
      { pieces, moves, turn },
      moveFrom,
      { rank, file },
    );

    setSelected({});
    setLegalMovesDisplay({});
    if( !move ) return;

    const next = calculateBoardAfterMove({
      pieces, moves, turn,
    }, moveFrom, { rank, file }, enPassant, move);
    
    setPieces(next.pieces);
    setTurn(next.turn);
    setMoves(next.moves);
    
  }, [selected, moves, pieces, turn, setMoves, setPieces, setTurn]);

  const showLegalMoves = useCallback(({ rank, file, piece })=>{
    const prefix = piece + String.fromCharCode(file+97) + (rank+1);

    setLegalMovesDisplay(
      calculateLegalMoves(pieces, turn, moves)
        .map(castleAsKingMove)
        .filter(move => move.indexOf(prefix) === 0)
        .map(move => move.slice(3) )
        .reduce((moves, move)=> ({
          ...moves, [move.slice(0,2)]: move.includes('x') ? 'x' : '.',
        }), {})
    );
  }, [pieces, turn, moves]);

  
  const onSelect = useCallback(({ rank, file, piece })=>{
    if(!selected.piece) {
      setSelected({ rank, file, piece });
      showLegalMoves({ rank, file, piece })
      
    } else if( rank === selected.rank && file === selected.file ) {
      setSelected({});
      setLegalMovesDisplay({});
      
    } else onMove({ rank, file });
  }, [selected, onMove, showLegalMoves]);

  const onClick = ({ rank, file })=> {
    if( selected.piece ) onMove({ rank, file });
  };

  const onDragEnd = (start, end)=> {
    if( start.rank === end.rank && start.file === end.file )
      onSelect({ ...start, piece: start.type });
    else
      onMove(end, { ...start, piece: start.type });
  };
  
  const onDragStart = showLegalMoves;

  
  return (
    <div className='Openings'>
      <Board
          flipped={flipped}
          pieces={pieces}
          markers={legalMovesDisplay}
          onSelect={onSelect}
          selected={selected}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onClick={onClick}
      />
    </div>
  );
}

export default Openings;
