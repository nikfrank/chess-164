import React, { useState, useCallback } from 'react';
import './Board.scss';

import SVGPieces from 'react-chess-pieces/dist/svg-index';

import Piece from 'react-chess-pieces';
import { useDrag, useDrop, DragPreviewImage } from 'react-dnd'

import { usePreview } from 'react-dnd-preview';

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
  const [dragStyle, drag, preview] = useDrag({
    item: { rank, file, type },
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0 : 1,
    }),
  })
  
  return (
    <div ref={drag} style={dragStyle}>
      <DragPreviewImage connect={preview} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg=="/>
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

const PiecePreview = () => {
  const {display, itemType, item, style} = usePreview();
  if (!display) return null;
  
  return <img style={{ ...style, height: '10vh', width: '10vh'}}
              src={SVGPieces[itemType]}/>
};

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

  const dragMove = useCallback((start, end)=>{
    console.log(start.type, String.fromCharCode(end.file+97), end.rank+1);
    
    setPieces(pieces=> {
      pieces[end.rank][end.file] = start.type;
      pieces[start.rank][start.file] = '';

      return [...pieces];
    });
  });
  
  return (
    <div className="Board">
      {pieces.map((row, rank)=> (
         <div className='rank' key={rank}>
           {row.map((piece, file)=> (
              <Droppable
                  key={''+rank+''+file+''+piece}
                  rank={rank}
                  file={file}
                  className={'square '+(
                      rank === selected[0] &&
                      file === selected[1] ? 'selected' : ''
                    ) }
                  onDrop={dragMove}
                  onDragStart={()=> console.log(piece, String.fromCharCode(file+97), rank+1)}
                  onClick={()=> select(rank, file, piece)}>
                
                <Draggable rank={rank} file={file} type={piece}>
                  <Piece piece={piece}/>
                </Draggable>

              </Droppable>
            ))}
         </div>
       ))}
         
         <PiecePreview/>
    </div>
  );
}

export default Board;
