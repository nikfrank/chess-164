import React from 'react';
import './Board.scss';

import SVGPieces from 'react-chess-pieces/dist/svg-index';

import Piece from 'react-chess-pieces';
import { useDrag, useDrop, DragPreviewImage } from 'react-dnd'

import { usePreview } from 'react-dnd-preview';


const blank = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==';

const Draggable = ({ rank, file, type, children }) => {
  const [dragStyle, drag, preview] = useDrag({
    item: { rank, file, type },
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0 : 1,
    }),
  });

  return (
    <div ref={drag} style={dragStyle}>
      <DragPreviewImage connect={preview} src={blank}/>
      {children}
    </div>
  )
}


const anyPiece = [
  'p', 'r', 'n', 'b', 'k', 'q',
  'P', 'R', 'N', 'B', 'K', 'Q',
];

const Droppable = ({ rank, file, hoverBg='red', onDrop, ...props })=>{
  const [{ isOver }, drop] = useDrop({
    accept: anyPiece,
    drop: (dragItem)=> onDrop(dragItem, {rank, file}),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div ref={drop} {...props} style={!isOver ? {} : { backgroundColor: hoverBg }}/>
  );
}

const PiecePreview = () => {
  const {display, itemType, style} = usePreview();

  return <img alt='' src={SVGPieces[itemType]} style={{
    ...style, height: '10vh', width: '10vh',
    display: display ? '' : 'none',
  }} />
};

const MarkerSVGS = {
  '.': (
    <svg viewBox='0 0 10 10' className='marker'>
      <circle cx={5} cy={5} r={2} fill='#0008' stroke='white' strokeWidth={0.25}/>
    </svg>
  ),
  'x': (
    <svg viewBox='0 0 16 16' className='marker'>
      <polygon points='4,6 6,4 8,6 10,4 12,6 10,8 12,10 10,12 8,10 6,12 4,10 6,8 4,6'
               fill='#5008' stroke='white' strokeWidth={0.25}/>
    </svg>
  ),
};


function Board({
  pieces, onSelect, selected, onClick, onDragEnd, onDragStart,
  promotion, promotionWidget, markers, flipped,
}) {

  const clickHandler = ({ rank, file, piece })=>{
    if( piece ) onSelect({ rank, file, piece });
    else onClick({ rank, file });
  };
  
  const startDragMove = (({ rank, file, piece })=>{
    if( piece ) onDragStart({ rank, file, piece });
  });
  
  return (
    <div className="Board" style={{ flexDirection: flipped ? 'column' : 'column-reverse' }}>
      {pieces.map((row, rank)=> (
        <div className='rank' key={rank}
             style={{ flexDirection: flipped ? 'row-reverse' : 'row'}}>
           {row.map((piece, file)=> (
              <Droppable
                  key={''+rank+''+file+''+piece}
                  rank={rank}
                  file={file}
                  className={'square '+(
                      rank === selected.rank &&
                      file === selected.file ? 'selected' : ''
                    ) }
                  onDrop={onDragEnd}
                  onDragStart={()=> startDragMove({ rank, file, piece })}
                  onClick={()=> clickHandler({ rank, file, piece })}>
                
                <Draggable rank={rank} file={file} type={piece}>
                  <Piece piece={piece}/>
                </Draggable>

                {MarkerSVGS[ markers[String.fromCharCode(file+97) + (rank+1)] ]}
                
                {promotion && promotion.rank === rank && promotion.file === file ? (
                   promotionWidget
                 ) : null}
              </Droppable>
            ))}
         </div>
       ))}
       
       <PiecePreview/>
    </div>
  );
}

export default Board;
