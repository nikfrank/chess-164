import React, { useState, useCallback } from 'react';
import Board from './Board';

import { initPieces, calculateLegalMoves } from './chess-util';


const Game = ()=>{
  const [pieces, setPieces] = useState(initPieces);
  const [selected, setSelected] = useState({});
  const [turn, setTurn] = useState('w');
  const [moves, setMoves] = useState([]);

  const onMove = useCallback(({ rank, file }, moveFrom=selected)=>{
    const legalMoves = calculateLegalMoves(pieces, turn, moves);
    
    let move = (
      turn === 'w' ? moveFrom.piece.toUpperCase() : moveFrom.piece
    ) + (
      String.fromCharCode(moveFrom.file+97) + (moveFrom.rank+1)
    ) + (
      (String.fromCharCode(file+97)) + (rank+1)
    ) + (pieces[rank][file] ? 'x' : '') + (
      
      // autopromote... should send JSX to portal and get callback first
      moveFrom.piece.match(/p/i) && (!rank || rank === 7) ? 'q' : ''
    );

    if( move === 'ke8g8' ) move = 'o-o';
    if( move === 'ke8c8' ) move = 'o-o-o';
    if( move === 'Ke1g1' ) move = 'O-O';
    if( move === 'Ke1c1' ) move = 'O-O-O';

    if( !legalMoves.includes(move) ) return;
    
    setPieces(pieces => {
      pieces[rank][file] = moveFrom.piece; // unless promotion
      pieces[moveFrom.rank][moveFrom.file] = '';

      if( move.includes('-') ){
        if( file === 6 ){
          pieces[rank][5] = pieces[rank][7];
          pieces[rank][7] = '';
        } else if( file === 2 ) {
          pieces[rank][3] = pieces[rank][0];
          pieces[rank][0] = '';
        }
      }
        
      return [...pieces];
    });
    setSelected({});
    setTurn(turn => turn === 'w' ? 'b' : 'w');

    setMoves([...moves, move]);
    
  }, [setPieces, selected, moves, pieces, turn]);
  
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
