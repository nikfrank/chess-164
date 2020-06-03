import React, { useState, useCallback } from 'react';
import Board from './Board';

import { initPieces, calculateLegalMoves } from './chess-util';


const Game = ()=>{
  const [pieces, setPieces] = useState(initPieces);
  const [selected, setSelected] = useState({});
  const [turn, setTurn] = useState('w');
  const [moves, setMoves] = useState([]);

  const onMove = useCallback(({ rank, file }, moveFrom=selected)=>{
    const legalMoves = calculateLegalMoves(pieces, turn, moveFrom);
    // include castling if relevant based on turn, moves

    // if move is in list, continue : otherwise return
    // if move is O-O or O-O-O, recalculate pieces thusly
    // otherwise
    setPieces(pieces => {
      pieces[rank][file] = moveFrom.piece;
      pieces[moveFrom.rank][moveFrom.file] = '';

      return [...pieces];
    });
    setSelected({});
    setTurn(turn => turn === 'w' ? 'b' : 'w');

    // push move in unambiguous notation (eg Nb4c6)
    
  }, [setPieces, selected]);
  
  const onSelect = useCallback(({ rank, file, piece })=>{
    if(!selected.piece) setSelected({ rank, file, piece });
    else if( rank === selected.rank && file === selected.file )
      setSelected({});
    else onMove({ rank, file }); // capture?
  }, [selected, onMove]);

  const onClick = ({ rank, file })=> {
    if( selected.piece ) onMove({ rank, file });
    // noop
  };

  const onDragEnd = (start, end)=> {
    if( start.rank === end.rank && start.file === end.file ) return;
    onMove(end, { ...start, piece: start.type });
  };
  
  const onDragStart = ({ rank, file, piece })=> console.log('drag start');
  const onDragHover = ({ start, hovering })=> console.log('drag hover');
  const onRightClick = ({ rank, file, piece })=> console.log('right click');
  
  return (
    <Board
        pieces={pieces}
        onSelect={onSelect}
        selected={selected}
        onDragStart={onDragStart}
        onDragHover={onDragHover}
        onDragEnd={onDragEnd}
        onClick={onClick}
        onRightClick={onRightClick}
    />
  );
};

export default Game;
