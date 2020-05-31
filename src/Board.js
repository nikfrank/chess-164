import React, { useState, useCallback } from 'react';
import './Board.scss';

import logo from './logo.svg';

import Piece from 'react-chess-pieces';
import { useDrag, useDrop, DragPreviewImage } from 'react-dnd'

const initPieces = [
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
];


const Draggable = ({ rank, file, type='piece', isDropped, children }) => {
  const [{ opacity }, drag, preview] = useDrag({
    item: { rank, file, type },
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0.4 : 1,
    }),
  })

  return (
    <div ref={drag} style={{ opacity }}>
      <DragPreviewImage connect={preview} src={logo}/>
      {children}
    </div>
  )
}


const anyPiece = [
  'p', 'r', 'n', 'b', 'k', 'q',
  'P', 'R', 'N', 'B', 'K', 'Q',
];

const Droppable = ({ rank, file, onDrop, ...props })=>{
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: anyPiece,
    drop: (dragItem)=> onDrop(dragItem, {rank, file}),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div ref={drop} {...props}/>
  );
}

function Board() {
  const [pieces, setPieces] = useState(initPieces)
  const [selected, setSelected] = useState([]);

  const select = useCallback((rank, file, piece)=>{
    if(!selected.length) setSelected([ rank, file, piece ]);
    else if( rank === selected[0] && file === selected[1] )
      setSelected([]);
    
    else {
      // analysis board:
      // setPieces with override
      setPieces(pieces=> {
        pieces[rank][file] = selected[2];
        pieces[selected[0]][selected[1]] = '';

        return [...pieces];
      });
      setSelected([]);
      
      // game board:
      // if making a legal move, setPieces
    }
    
  }, [selected]);

  const dragMove = useCallback((...a)=>{
    console.log(a);
  });
  
  return (
    <div className="Board">
      {pieces.map((row, rank)=> (
         <div className='rank' key={rank}>
           {row.map((piece, file)=> (
              <Droppable
                  key={file}
                  rank={rank}
                  file={file}
                  className={'square '+(
                      rank === selected[0] &&
                      file === selected[1] ? 'selected' : ''
                    ) }
                  onDrop={dragMove}
                  onClick={()=> select(rank, file, piece)}>
                
                <Draggable rank={rank} file={file} type={piece}>
                  <Piece piece={piece}/>
                </Draggable>
              </Droppable>
            ))}
         </div>
       ))}
    </div>
  );
}

export default Board;
