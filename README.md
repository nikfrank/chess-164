# chess with hooks

(part of js 133 course)


## Agenda

- create-react-app
- build a board
- svg pieces
- click to move
- drag and drop pieces
  - remove from board / add to board

- show legal moves
  - import chess.js
  - check / draw / stalemate / checkmate / illegal
- highlight previous move
- draw / remove arrows
- send position as link (with title)
- export as (format)

- game mode
- turns
- clock
- block illegal moves

- online mode
- firebase
- timestamped moves -> clock enforcement
- login with ...



## Build

### The Board & Pieces

- create-react-app

`$ npx create-react-app chess`

`$ cd chess`

`$ yarn add node-sass`

- build a board

<sub>./src/App.js</sub>
``` jsx
import React from 'react';
import './App.scss';

import Board from './Board';

function App() {
  return (
    <div className="App">
      <Board />
    </div>
  );
}

export default App;
```

`$ mv src/App.css src/App.scss`

`$ touch src/Board.js src/Board.scss`


<sub>./src/Board.js</sub>
``` jsx
import React, { useState } from 'react';
import './Board.scss';

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

function Board() {
  const [pieces, setPieces] = useState(initPieces)
  
  return (
    <div className="Board">
      {pieces.map((row, rank)=> (
         <div className='rank' key={rank}>
           {row.map((piece, file)=> (
              <div className='square' key={file}>
                {piece}
              </div>
            ))}
         </div>
       ))}
    </div>
  );
}

export default Board;
```

<sub>./src/Board.scss</sub>
``` scss
.Board {
  height: 80vh;
  width: 80vh;

  max-height: 80vw;
  max-width: 80vw;

  display: flex;
  flex-direction: column-reverse;

  margin: 10vh auto;
  
  .rank {
    display: flex;

    .square {
      flex-grow: 1;
      background-color: #c2d280;
    }

    &:nth-child(even) .square:nth-child(even),
    &:nth-child(odd) .square:nth-child(odd) {
      background-color: #319013;
    }
  }
}
```


- svg pieces


`$ yarn add react-chess-pieces`

<sub>./src/Board.js</sub>
``` jsx
//...

function Board() {
  const [pieces, setPieces] = useState(initPieces)
  
  return (
    <div className="Board">
      {pieces.map((row, rank)=> (
         <div className='rank' key={rank}>
           {row.map((piece, file)=> (
              <div className='square' key={file}>
                <Piece piece={piece}/>
              </div>
            ))}
         </div>
       ))}
    </div>
  );
}

//...
```

<sub>./src/Board.scss</sub>
``` scss
.Board .rank .square {

     svg {
        float: left;
      }
      
}
```

- click to move

[useCallback](https://reactjs.org/docs/hooks-reference.html#usecallback)


<sub>./src/Board.js</sub>
``` jsx
import React, { useState, useCallback } from 'react';
//...

function Board() {
  const [pieces, setPieces] = useState(initPieces)
  const [selected, setSelected] = useState([]);

  const select = useCallback((rank, file, piece)=>{
    if(!selected.length) setSelected([ rank, file, piece ]);

  }, [selected]);
  
  return (
    <div className="Board">

//...

              <div className='square' key={file}
                   onClick={()=> select(rank, file, piece)}>
                <Piece piece={piece}/>
              </div>
//...
```


display to the user which piece is selected

<sub>./src/Board.scss</sub>
``` scss
//...

    .square {
      flex-grow: 1;
      background-color: #c2d280;

      &.selected {
        background-color: #697140;
      }


//...

    &:nth-child(even) .square:nth-child(even),
    &:nth-child(odd) .square:nth-child(odd) {
      background-color: #319013;

      &.selected {
        background-color: #184809;
      }
    }

```


<sub>./src/Board.js</sub>
``` jsx
//...

              <div key={file}
                   className={'square '+(
                       rank === selected[0] &&
                       file === selected[1] ? 'selected' : ''
                     ) }
                   onClick={()=> select(rank, file, piece)}>
                <Piece piece={piece}/>
              </div>


//...
```


and we need to move the piece when the second click occurs

<sub>./src/Board.js</sub>
``` jsx
//...

  const select = useCallback((rank, file, piece)=>{
    if(!selected.length) setSelected([ rank, file, piece ]);
    else if( rank === selected[0] && file === selected[1] )
      setSelected([]);
    
    else {
      setPieces(pieces=> {
        pieces[rank][file] = selected[2];
        pieces[selected[0]][selected[1]] = '';

        return [...pieces];
      });
      setSelected([]);
    }
    
  }, [selected]);


//...
```


- drag and drop pieces

`$ yarn add react-dnd react-dnd-html5-backend`

<sub>./src/App.js</sub>
``` jsx
import React from 'react';
import './App.scss';

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import Board from './Board';

function App() {
  return (
    <div className="App">
      <DndProvider backend={HTML5Backend}>
        <Board />
      </DndProvider>
    </div>
  );
}

export default App;
```


<sub>./src/Board.js</sub>
``` jsx
//...
import { useDrag, useDrop, DragPreviewImage } from 'react-dnd'

//...

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


//...

                <Draggable>
                  <Piece piece={piece}/>
                </Draggable>

//...
```


<sub>./src/Board.js</sub>
``` jsx
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


//...

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

```


(( next: fix hover image to svg piece, hi-light landing place ))

- natural piece dragging

`$ yarn add react-dnd-preview`

``` jsx
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
```

``` jsx
import { usePreview } from 'react-dnd-preview';

const PiecePreview = () => {
  const {display, itemType, item, style} = usePreview();
  if (!display) return null;
  
  return <img style={{ ...style, height: 64, width: 64}}
              src={SVGPieces[itemType]}/>
};




droppable:
                  key={''+rank+''+file+''+piece}
                  
                  
  const dragMove = useCallback((start, end)=>{
    setPieces(pieces=> {
      pieces[end.rank][end.file] = start.type;
      pieces[start.rank][start.file] = '';

      return [...pieces];
    });
  });
```

- remove from board / add to board
- promotion widget




This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

