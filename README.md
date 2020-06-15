# chess with hooks


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
  - load from link
- export as (format)

- game mode
  - turns, moves
  - clock
  - block illegal moves

- analysis mode
  - branching moves

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
  [ '',  '',  '',  '',  '',  '',  '',  ''],
  [ '',  '',  '',  '',  '',  '',  '',  ''],
  [ '',  '',  '',  '',  '',  '',  '',  ''],
  [ '',  '',  '',  '',  '',  '',  '',  ''],
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
  const [selected, setSelected] = useState({});

  const select = useCallback(({ rank, file, piece })=>{
    if(!selected.piece) setSelected({ rank, file, piece });

  }, [selected]);
  
  return (
    <div className="Board">

//...

              <div className='square' key={file}
                   onClick={()=> select({ rank, file, piece })}>
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
                       rank === selected.rank &&
                       file === selected.file ? 'selected' : ''
                     ) }
                   onClick={()=> select({ rank, file, piece })}>
                <Piece piece={piece}/>
              </div>


//...
```


and we need to move the piece when the second click occurs

<sub>./src/Board.js</sub>
``` jsx
//...

  const select = useCallback(({ rank, file, piece })=>{
    if(!selected.piece) setSelected({ rank, file, piece });
    else if( rank === selected.rank && file === selected.file )
      setSelected({});
    
    else {
      const nextPieces = JSON.parse(JSON.stringify(pieces));
      
      nextPieces[rank][file] = selected.piece;
      nextPieces[selected.rank][selected.file] = '';
    
      setPieces(nextPieces);

      setSelected({});
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


### making pieces draggable

we need to make the original piece invisible, and override the module's preview by passing a blank image to a `<DragPreviewImage/>`

to do this, we'll wrap our `<Piece/>` with a new `Draggable` mixin component.

later, we'll use a different module for preview which will give us more control of how we display the preview image (aka the piece while we're dragging it)


<sub>./src/Board.js</sub>
``` jsx
//...
import { useDrag, useDrop, DragPreviewImage } from 'react-dnd'

const blank = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==';

//...

const Draggable = ({ rank, file, type, children }) => {
  const [dragStyle, drag, preview] = useDrag({
    item: { rank, file, type },
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0 : 1,
    }),
  })

  return (
    <div ref={drag} style={dragStyle}>
      <DragPreviewImage connect={preview} src={blank}/>
      {children}
    </div>
  )
}


//...

                <Draggable rank={rank} file={file} type={piece}>
                  <Piece piece={piece}/>
                </Draggable>

//...
```

### making squares droppable


similarly, we'll need to make the board squares `Droppable`

<sub>./src/Board.js</sub>
``` jsx
const anyPiece = [
  'p', 'r', 'n', 'b', 'k', 'q',
  'P', 'R', 'N', 'B', 'K', 'Q',
];

const Droppable = ({ rank, file, hoverBg='red', onDrop, ...props })=>{
  const [{ isOver }, drop] = useDrop({
    accept: anyPiece,
    drop: (dragItem)=> onDrop(dragItem, {rank, file}),
    collect: (monitor)=> ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div ref={drop} {...props} style={!isOver ? {} : { backgroundColor: hoverBg }}/>
  );
}
```

which, for now, will let any piece land anywhere any time. We will use the `isOver` variable to trigger the `onHoverDrag` effects later.

this will change once we convert our board to a controlled component and program a `Game` or `Analysis` view to control it (in the next section).


to use `Droppable`, we'll replace the `div.sqaure` we have earlier with it

```jsx

//...
  const endDragMove = ((start, end)=>{
    console.log(start.type, String.fromCharCode(end.file+97), end.rank+1);
  });

  const startDragMove = (({ rank, file, piece })=>{
    console.log(piece, String.fromCharCode(file+97), rank+1)
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
                      rank === selected.rank &&
                      file === selected.file ? 'selected' : ''
                    ) }
                  onDrop={endDragMove}
                  onDragStart={()=> startDragMove({ rank, file, piece })}
                  onClick={()=> select({ rank, file, piece })}>
                
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

we'll also set the key to update whenever the piece updates, in order to trigger a render (we need to render prop values to the `Draggable` for it to work on the next move(s)) while still being sufficiently unique.

this key trick (seen here)[https://stackoverflow.com/questions/30626030/can-you-force-a-react-component-to-rerender-without-calling-setstate] is necessary because internally `react-dnd` uses `React.memo` for some of the values we pass it (to its hooks).


### showing the piece while being dragged (preview image)

lastly, we'll want the user to feel like they're moving a real piece around, blundering just the same.

to do this, we'll use a drag-preview add on module for `react-dnd`


`$ yarn add react-dnd-preview`


``` jsx
import { usePreview } from 'react-dnd-preview';

const PiecePreview = () => {
  const {display, itemType, item, style} = usePreview();

  return <img alt='' src={SVGPieces[itemType]} style={{
    ...style, height: '10vh', width: '10vh',
    display: display ? '' : 'none',
  }} />
};


//... before the last </div> tag

      <PiecePreview/>

//...

```

we could use the `onDrop` callback prop to trigger piece moves like with clicks before (feel free to do so as an exercise); now it just logs what move the user is trying to make.

however, our next section will move the logic for handling `pieceMove` events into the `App` to follow the controlled component pattern

the `Board` will show the user pieces and spaces, and allow the user to interact with the pieces (click / dnd), triggering callbacks for events (move, droppedOffBoard, dragStart, dragHover, onClick)


the `App` will maintain state of the game (`pieces`) and respond to events by updating the state and rendering it back to the `Board`.


later, when we build arrows or hi-lighting features, they will work the same way.


### controlled component: Game / Analysis -> Board

Before we build or import the logic for the game of chess (how the pieces move, is it stalemate?, etc) we want to build a decision hierarchy so we can change the rules later if we want.

For instance, we may want to build an analysis board which connects to an online chess engine - and so we want to suspend enforcement for users to construct a position. We would still want the same `Board`, but we'll use it in a different view (one that allows illegal positions / movements).

Or perhaps we'll want to have multiple `Board`s at a time. Anything is possible!


We'll start by moving the `pieces` state up to `App` in a `Game` Component

<sub>./src/App.js</sub>
``` jsx
//...

const initPieces = [
  //...
];


const Game = ()=>{
  const [pieces, setPieces] = useState(initPieces);

  return (
    <Board pieces={pieces}/>
  );
}

function App() {
  return (
    <div className="App">
      <DndProvider backend={HTML5Backend}>
        <Game />
      </DndProvider>
    </div>
  );
}

//...
```

and refactoring it in `Board` from a state variable to a prop

<sub>./src/Board.js</sub>
``` diff
//...

-const initPieces = [
-  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
-  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
-  ['', '', '', '', '', '', '', ''],
-  ['', '', '', '', '', '', '', ''],
-  ['', '', '', '', '', '', '', ''],
-  ['', '', '', '', '', '', '', ''],
-  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
-  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
-];

//...

+function Board({ pieces }) {
-function Board() {
-  const [pieces, setPieces] = useState(initPieces)

```

and (for now) removing the state updates

``` diff
//... select

-      const nextPieces = JSON.parse(JSON.stringify(pieces));
-      
-      nextPieces[rank][file] = selected.piece;
-      nextPieces[selected.rank][selected.file] = '';
-    
-      setPieces(nextPieces);

//...
```

now we'll rewrite these functions to call the props callbacks appropriately

this will allow the `Board` to trigger state changes when the user interacts with it

first, we can make placeholder functions in `Game` to pass to `Board`

<sub>./src/App.js</sub>
``` jsx
import React, { useState } from 'react';

//...

const Game = ()=>{
  const [pieces, setPieces] = useState(initPieces);

  const onSelect = ({ rank, file, piece })=> console.log('select');
  const onDragStart = ({ rank, file, piece })=> console.log('drag start');
  const onDragHover = ({ start, hovering })=> console.log('drag hover');
  const onDragEnd = (start, end)=> console.log('drag end');
  const onClick = ({ rank, file })=> console.log('click');
  const onRightClick = ({ rank, file, piece })=> console.log('right click');
  
  return (
    <Board
        pieces={pieces}
        onSelect={onSelect}
        onDragStart={onDragStart}
        onDragHover={onDragHover}
        onDragEnd={onDragEnd}
        onClick={onClick}
        onRightClick={onRightClick}
    />
  );
}

//...
```

now we can refactor our selection and movement logic from `Board` into `Game`

<sub>./src/Board.js</sub>
``` diff
//...

-  const [selected, setSelected] = useState({});
-
-  const select = useCallback(({ rank, file, piece })=>{
-    if(!selected.piece) setSelected({ rank, file, piece });
-    else if( rank === selected.rank && file === selected.file )
-      setSelected({});
-
-    else {
-      const nextPieces = JSON.parse(JSON.stringify(pieces));
-
-      nextPieces[rank][file] = selected.piece;
-      nextPieces[selected.rank][selected.file] = '';
-      setPieces(nextPieces);
-
-      setSelected({});
-    }
-
-  }, [selected]);

//...
```

our data now comes from props, and our click handler can call move or select

``` jsx
//...

function Board({ pieces, onSelect, selected, onClick }) {

  const clickHandler = ({ rank, file, piece })=>{
    if( piece ) onSelect({ rank, file, piece });
    else onClick({ rank, file });
  };

  //...
  
              <Droppable
                  key={''+rank+''+file+''+piece}
                  rank={rank}
                  file={file}
                  className={'square '+(
                      rank === selected.rank &&
                      file === selected.file ? 'selected' : ''
                    ) }
                  onDrop={endDragMove}
                  onDragStart={()=> startDragMove({ rank, file, piece })}
                  onClick={()=> clickHandler({ rank, file, piece })}>

  //...

}

//...
```

<sub>./src/App.js</sub>

``` jsx
import React, { useState, useCallback } from 'react';

//...

const Game = ()=>{
  const [pieces, setPieces] = useState(initPieces);
  const [selected, setSelected] = useState({});

  const onMove = useCallback(({ rank, file })=>{
    const nextPieces = JSON.parse(JSON.stringify(pieces));

    nextPieces[rank][file] = selected.piece;
    nextPieces[selected.rank][selected.file] = '';
    setPieces(nextPieces);

    setSelected({});
  }, [setPieces, selected]);
  
  const onSelect = useCallback(({ rank, file, piece })=>{
    if(!selected.piece) setSelected({ rank, file, piece });
    else if( rank === selected.rank && file === selected.file )
      setSelected({});
    else onMove({ rank, file }); // capture?
  }, [selected]);

  const onClick = ({ rank, file })=> {
    if( selected.piece ) onMove({ rank, file });
    // noop
  };
  
  //... (the jsx)
}

//...
```

now we can finally get the drag-n-drop to play the move

<sub>./src/Board.js</sub>
``` jsx
//...

function Board({ pieces, onSelect, selected, onClick, onDragEnd }) {

//...

                  onDrop={onDragEnd}
                  
//...
```

with a bit of shimming to deal with the `react-dnd` behaviour, and a refactor to reuse our `onMove` function

<sub>./src/App.js</sub>
``` jsx
//...

  const onMove = useCallback(({ rank, file }, moveFrom=selected)=>{
    const nextPieces = JSON.parse(JSON.stringify(pieces));

    nextPieces[rank][file] = moveFrom.piece;
    nextPieces[moveFrom.rank][moveFrom.file] = '';
    setPieces(nextPieces);
        
    setSelected({});

  }, [setPieces, seleted]);
  
  //...

  const onDragEnd = (start, end)=> {
    if( start.rank === end.rank && start.file === end.file )
      onSelect({ ...start, piece: start.type });
    else
      onMove(end, { ...start, piece: start.type });
  };

//...
```

fantastic. We should take a break now to defeat whoever is nearby at chess on our minimally compliant `Board` (almost minimally compliant... we'll need promotion to play a full game)

---

### Quick Refactor

It'll be more convenient now to think of our application structure (before it's too late!)

We'll have two main views: Game and Analysis (both with `Board`s), which should each be in their own files

`App` should manage the view-routing and not much else

We should put our chess utility functions into one file (chess-util.js) so that they can be used from either view

`$ touch src/chess-util.js src/Game.js`


<sub>./src/chess-util.js</sub>
``` js
// placeholder for now

export const calculateLegalMoves = (pieces, turn, moves)=> [];

export const initPieces = [
  //...
];
```

<sub>./src/Game.js</sub>
``` jsx
import React, { useState, useCallback } from 'react';
import Board from './Board';

import { initPieces } from './chess-util';


const Game = ()=>{
  //...
};

export default Game;
```

<sub>./src/App.js</sub>
``` jsx
import React from 'react';
import './App.scss';

import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'

import Game from './Game';

function App() {
  //...
}

export default App;
```

now we have a place for our chess game logic, and a first draft ontology for our files.


---

### The Rules of Chess


Now that we have one single function which manages making a requested move and one to calculate legal moves, we can apply the rules to the game.

[chess.js](https://github.com/jhlywa/chess.js/blob/master/README.md) is a widely used available library which will do most of the computations for us.


`$ yarn add chess.js`


we'll need to track more information to have a complete game

<sub>./src/Game.js</sub>
``` jsx
//...

import { initPieces, calculateLegalMoves } from './chess-util';

const Game = ()=>{
  const [pieces, setPieces] = useState(initPieces);
  const [selected, setSelected] = useState({});
  const [turn, setTurn] = useState('w');
  const [moves, setMoves] = useState([]);

  const onMove = useCallback(({ rank, file }, moveFrom=selected)=>{
    const legalMoves = calculateLegalMoves(pieces, turn, moves);
    // if move is in list, continue : otherwise return
    // if move is O-O or O-O-O, recalculate pieces thusly
    // otherwise
    const nextPieces = JSON.parse(JSON.stringify(pieces));

    nextPieces[rank][file] = moveFrom.piece;
    nextPieces[moveFrom.rank][moveFrom.file] = '';
    
    setPieces(nextPieces);
    
    setSelected({});
    setTurn(turn === 'w' ? 'b' : 'w');

    // push move
    
  }, [setPieces, selected]);

  //...
  
}

//...
```

for now, pseudocoding the solution will suffice.


<sub>./src/chess-util.js</sub>
``` js
import C from 'chess.js';
const Chess = C.Chess || C;

export const calculateLegalMoves = (pieces, turn, moves)=> {
  // convert pieces + turn + moves into FEN
  // new Chess(FEN).moves()
};

//...
```

we're going to use `chess.js` to answer questions about our game, not to manage it entirely. To do so, we'll have to code a utility function to convert our state into FEN.

Our goal in doing this is to maintain our own state to allow any feature, to write good code in a relevant module interface style, and to prepare for replacing `chess.js` with our own module in a later course.

`chess.js` is a bit ferkakte regarding imports - it imports itself differently in node and the browser, and since our tests run in node, we have to make a little shim to make sure it works in both places correctly.

[see relevant github issue here](https://github.com/jhlywa/chess.js/issues/196)

### FEN

to get chess.js to tell us what we want to know, we'll need to pass it the current board state. This can be achieved via the [FEN](https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation) constructor API.


we'll need to convert our `pieces` matrix into proper FEN to use `chess.js`'s `.moves()` method

<sub>./src/chess-util.js</sub>
``` js
export const calculateFEN = (pieces, turn, moves)=> {...};
```
this will be a good opportunity to practice TDD

`$ touch ./src/chess-util.test.js`

`$ yarn test`

<sub>./src/chess-util.test.js</sub>
``` js
import React from 'react';
import { initPieces, calculateFEN } from './chess-util';

describe('calculateFEN', ()=>{
  it('calculates correctly the initPieces', ()=>{
    const startingFEN =
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    
    const output = calculateFEN(initPieces, 'w', []);
    
    expect(output).toEqual(startingFEN);
  });
});
```

we should see now our test output failing


(to ignore the <sub>App.test.js</sub> which is not relevant right now

<sub>./src/App.test.js</sub>
``` jsx
import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test.skip('renders learn react link', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
```

we can skip the test for now)

now that we see our test is failing, we can bother to code a solution

<sub>./src/chess-util.js</sub>
``` js
//...

export const calculateFEN = (pieces, turn, moves)=> {
  // FEN parts:
  // pieces on board
  // turn
  // castling privs
  // en passant target
  // halfmove count
  // move number
};

//...
```

to make the first test pass, we really only need to solve the pieces step

``` js
//...

export const calculateFEN = (pieces, turn, moves)=> {
  const fenPieces =
    pieces.reduce((fen, rank)=>
      rank.reduce((row, piece)=>
        piece ? row + piece :
          !row ? '1' :
            !row[row.length-1].match(/\d/) ? row + '1' :
              row.slice(0, -1) + (1*row[row.length-1] + 1)
                , '') + '/' + fen, '').slice(0, -1);

  const privs = 'KQkq';

  const ept = '-';

  const halfmoves = 0;

  const moveNumber = 1;
  
  return `${fenPieces} ${turn[0]} ${privs} ${ept} ${halfmoves} ${moveNumber}`;

};

//...
```


we can solve the rest once we have test cases for them.

I recommend at this point coding a solution that you understand and like. I've written mine how I prefer, but the value in this course is to help make sense of the world - so dig deep and find the way you want to be able to code this solution! As long as you write good test cases, you can be confident your utility is correct.


now let's write more test cases to cover every feature of FEN:

(for submitted work, play a different game!)

<sub>./src/chess-util.test.js</sub>
``` js
//... e4
  it('calculates correctly after e4, c5, Nf3', ()=>{
    const e4FEN =
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';

    let e4Pieces = JSON.parse(JSON.stringify(initPieces));
    e4Pieces[1][4] = '';
    e4Pieces[3][4] = 'P';
    
    const output = calculateFEN(e4Pieces, 'b', ['Pe2e4']);
    
    expect(output).toEqual(e4FEN);


//... c5 (B20: Sicilian)

    const c5FEN =
      'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2';

    let c5Pieces = copy(e4Pieces);
    c5Pieces[6][2] = '';
    c5Pieces[4][2] = 'p';
    
    const c5Output = calculateFEN(c5Pieces, 'w', ['Pe2e4', 'pc7c5']);
    expect(c5Output).toEqual(c5FEN);


//... Nf3 (main line)

    const nf3FEN =
      'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2';

    let nf3Pieces = copy(c5Pieces);
    nf3Pieces[0][6] = '';
    nf3Pieces[2][5] = 'N';
    
    const nf3Output = calculateFEN(nf3Pieces, 'b', ['Pe2e4', 'pc7c5', 'Ng1f3']);
    expect(nf3Output).toEqual(nf3FEN);

```

one more for halfmoves resetting on capture by not-pawn

```js
    const capFEN =
      'rnb1kbnr/pp2pppp/8/2pq4/8/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 4';

    let capPieces = copy(nf3Pieces);

    // ... d5
    capPieces[6][3] = '';
    capPieces[4][3] = 'p';

    // exd5
    capPieces[3][4] = '';
    capPieces[4][3] = 'P';

    // ... Qxd5
    capPieces[7][3] = '';
    capPieces[4][3] = 'q';

    const capOutput = calculateFEN(capPieces, 'w', [
      'Pe2e4', 'pc7c5', 'Ng1f3', 'pd7d5', 'Pe4d5x', 'qd8d5x',
    ]);
    expect(capOutput).toEqual(capFEN);

});
```

and another test for castling (castled, moved Rook, moved King, played without Rook)

```js
  it('calculates correctly for castling', ()=>{
    
    // castled
    const castledFEN =
      'rnbq1rk1/pppp1ppp/4bn2/4p3/4P3/4BN2/PPPP1PPP/RNBQ1RK1 w - - 6 5';
    
    const castledPieces = [
      ['R', 'N', 'B', 'Q',  '', 'R', 'K',  ''],
      ['P', 'P', 'P', 'P',  '', 'P', 'P', 'P'],
      [ '',  '',  '',  '', 'B', 'N',  '',  ''],
      [ '',  '',  '',  '', 'P',  '',  '',  ''],
      [ '',  '',  '',  '', 'p',  '',  '',  ''],
      [ '',  '',  '',  '', 'b', 'n',  '',  ''],
      ['p', 'p', 'p', 'p',  '', 'p', 'p', 'p'],
      ['r', 'n', 'b', 'q',  '', 'r', 'k',  ''],
    ];

    const castledMoves = [
      'Pe2e4', 'pe7e5', 'Ng1f3', 'ng8f6', 'Bf1d3', 'bf8d6', 'O-O', 'o-o',
    ];

    const castledOutput = calculateFEN(castledPieces, 'w', castledMoves);
    expect(castledOutput).toEqual(castledFEN);

    
    // moved Rook / King

    const movedFEN =
      'rnbq1bnr/ppppkppp/8/4p3/7P/7R/PPPPPPP1/RNBQKBN1 w Q - 2 3';
    
    const movedPieces = [
      ['R', 'N', 'B', 'Q', 'K', 'B', 'N',  ''],
      ['P', 'P', 'P', 'P', 'P', 'P', 'P',  ''],
      [ '',  '',  '',  '',  '',  '',  '', 'R'],
      [ '',  '',  '',  '',  '',  '',  '', 'P'],
      [ '',  '',  '',  '', 'p',  '',  '',  ''],
      [ '',  '',  '',  '',  '',  '',  '',  ''],
      ['p', 'p', 'p', 'p', 'k', 'p', 'p', 'p'],
      ['r', 'n', 'b', 'q',  '', 'b', 'n', 'r'],
    ];

    const movedMoves = [
      'Ph2h4', 'pe7e5', 'Rh1h3', 'ke8e7',
    ];

    const movedOutput = calculateFEN(movedPieces, 'w', movedMoves);
    expect(movedOutput).toEqual(movedFEN);

    
    // played without Rook

    const oddsFEN =
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBN1 w Qkq - 0 1';
    
    const oddsPieces = [
      ['R', 'N', 'B', 'Q', 'K', 'B', 'N',  ''],
      ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
      [ '',  '',  '',  '',  '',  '',  '',  ''],
      [ '',  '',  '',  '',  '',  '',  '',  ''],
      [ '',  '',  '',  '',  '',  '',  '',  ''],
      [ '',  '',  '',  '',  '',  '',  '',  ''],
      ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
      ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ];

    const oddsMoves = [];

    const oddsOutput = calculateFEN(oddsPieces, 'w', oddsMoves);
    expect(oddsOutput).toEqual(oddsFEN);
    
  });
```


now we can make our tests turn green!

our first failing test is the "en passant target" field - when a pawn moves 2 squares from init, the 3rd or 7th rank square it crosses becomes for one turn the en passant target

again, I'll suggest to you the student to solve these on your own in your own style - I'm providing solutions for completeness and any interest you may have in my style.


<sub>./src/chess-util.js</sub>
```js
//... en passant target (eg lastMove = 'Pc2c4')

  const lastMove = moves[moves.length-1];
  const ept =
    !lastMove ? '-' :
    lastMove[0].toLowerCase() !== 'p' ? '-' :
    Math.abs(lastMove[4] - lastMove[2]) !== 2 ? '-' :
    (lastMove[1] + ( lastMove[2] === '2' ? 3 : 6 ));

```

moveNumber only increments after black has moved

```js
//... moveNumber

  const moveNumber = Math.ceil((moves.length + 1)/2);

```

and halfmove counter resets any time a pawn moves or a capture is made


```js
//... halfmoves count

  const halfmoves = moves.reduce((hm, move)=> (
    (move[0].toLowerCase() === 'p') || move.includes('x')
  ) ? 0 : hm + 1, 0);

```


castling privilege entails and rook and king that haven't moved, and that the rook has never been captured (and then replaced)


```js
//... castling

  // FEN doesn't work for chess960
  
  const privs = moves.reduce((privs, move)=> (
    ['K', 'O'].includes(move[0]) ? privs.replace(/[KQ]/g, '') :
    ['k', 'o'].includes(move[0]) ? privs.replace(/[kq]/g, '') :

    move.slice(0,3) === 'Ra1' ? privs.replace('Q', '') :
    move.slice(0,3) === 'Rh1' ? privs.replace('K', '') :
    move.slice(0,3) === 'ra8' ? privs.replace('q', '') :
    move.slice(0,3) === 'rh8' ? privs.replace('k', '') :

    move.slice(3,6) === 'a1x' ? privs.replace('Q', '') :
    move.slice(3,6) === 'h1x' ? privs.replace('K', '') :
    move.slice(3,6) === 'a8x' ? privs.replace('q', '') :
    move.slice(3,6) === 'h8x' ? privs.replace('k', '') :

    privs
  ), (
    (pieces[0][4] === 'K' && pieces[0][7] === 'R' ? 'K' : '') +
    (pieces[0][4] === 'K' && pieces[0][0] === 'R' ? 'Q' : '') +
    (pieces[7][4] === 'k' && pieces[7][7] === 'r' ? 'k' : '') +
    (pieces[7][4] === 'k' && pieces[7][0] === 'r' ? 'q' : '')
  )) || '-';

```

our tests should pass now! what a relief.


we've also invented a notation for chess moves which is a little different than standard:

 - black moves are all lowercase (including o-o, o-o-o)
 - pawn moves have a p / P for the piece character
 - all moves use redundant / unambiguous notation for moveFrom + moveTo
   - eg: e4 is written Pe2e4
 - the x goes at the end for captures
 - checks and checkmates are not annotated

this was to improve the notation's use by program - standard notation is convenient for humans, which is simply not our concern.


### legal moves

having calculated the FEN, we can now ask for a list of legal moves from `chess.js`

it will be useful in furthering our understanding of the `chess.js` library - and specifically its format for moves - to write a test for `calculateLegalMoves`.



<sub>./src/chess-util.test.js</sub>
``` js
//...
import { initPieces, calculateFEN, calculateLegalMoves } from './chess-util';

//...


describe('calculateLegalMoves', ()=>{
  it('returns moves in our own format', ()=>{
    const legalMoves = calculateLegalMoves(initPieces, 'w', []);

    console.log(legalMoves);
  });
});
```


<sub>./src/chess-util.js</sub>
``` js
//...

export const calculateLegalMoves = (pieces, turn, moves)=> {

  const FEN = calculateFEN(pieces, turn, moves);
  
  const allMoves = new Chess(FEN).moves();

  console.log(allMoves);
};
```

we'll see from the logs that `chess.js` is returning standard notation moves. We want more information than that, so digging a bit deeper into the examples on there github readme, [we find](https://github.com/jhlywa/chess.js/blob/master/README.md#moves-options-)

```js
  //...
  const allMoves = new Chess(FEN).moves({ verbose: true });

//...
```

we now see their format

<sub>console</sub>
```json
{
  "color": "w",
  "from": "g1",
  "to": "f3",
  "flags": "n",
  "piece": "n",
  "san": "Nf3"
}
```

so we can define our format with

<sub>./src/chess-util.js</sub>
```js
  //...
  return allMoves.map(cjsMove=> (
    cjsMove.flags === 'q' ? cjsMove.color === 'w' ? 'O-O-O' : 'o-o-o' :
    cjsMove.flags === 'k' ? cjsMove.color === 'w' ? 'O-O' : 'o-o' :
     
    (cjsMove.color === 'w' ? cjsMove.piece.toUpperCase() : cjsMove.piece) +
    cjsMove.from + cjsMove.to +
    (cjsMove.flags.includes('c') ? 'x' : '') +
    (cjsMove.flags.includes('e') ? 'x' : '') +
    (cjsMove.promotion || '')
  ));

};
```

where this mapping function constitutes a type conversion from `chess js verbose move {}` to our own string notation.

now we can finish writing this test backwards, by taking a snapshot of the output and using that as the expectation


<sub>./src/chess-util.test.js</sub>
```js
//...

describe('calculateLegalMoves', ()=>{
  it('returns moves in our own format', ()=>{
    const output = calculateLegalMoves(initPieces, 'w', []);

    const legalMoves = [
      'Pa2a3', 'Pa2a4', 'Pb2b3',
      'Pb2b4', 'Pc2c3', 'Pc2c4',
      'Pd2d3', 'Pd2d4', 'Pe2e3',
      'Pe2e4', 'Pf2f3', 'Pf2f4',
      'Pg2g3', 'Pg2g4', 'Ph2h3',
      'Ph2h4', 'Nb1a3', 'Nb1c3',
      'Ng1f3', 'Ng1h3',
    ];


    expect( output ).toEqual( legalMoves );
  });
});

```

we can worry about test coverage for calculating legal moves when we code it ourself!




#### legal moves on the board


we now have to keep track of moves in our notation to pass as a parameter

<sub>./src/Game.js</sub>
```jsx
    // in onMove function as noted before "push move"

    const move = (
      turn === 'w' ? moveFrom.piece.toUpperCase() : moveFrom.piece
    ) + (
      String.fromCharCode(moveFrom.file+97) + (moveFrom.rank+1)
    ) + (
      (String.fromCharCode(file+97)) + (rank+1)
    ) + (pieces[rank][file] ? 'x' : '') + (
      
      // autopromote... should send JSX to portal and get callback first
      moveFrom.piece.match(/p/i) && (!rank || rank === 7) ? 'q' : ''
    );

    setMoves([...moves, move]);

```



we can now use them to calculate `legalMoves` correctly, 

<sub>./src/Game.js</sub>
``` jsx
  //...
  
  const onMove = useCallback(({ rank, file }, moveFrom=selected)=>{
    const legalMoves = calculateLegalMoves(pieces, turn, moves);

    const promoting = moveFrom.piece.match(/p/i) && (!rank || rank === 7);
    const enPassant = !pieces[rank][file] &&
                      moveFrom.piece.match(/p/i) &&
                      moveFrom.file !== file;

    const move = (
      turn === 'w' ? moveFrom.piece.toUpperCase() : moveFrom.piece
    ) + (
      String.fromCharCode(moveFrom.file+97) + (moveFrom.rank+1)
    ) + (
      (String.fromCharCode(file+97)) + (rank+1)
    ) + (pieces[rank][file] || enPassant ? 'x' : '') + (promoting ? 'q' : '');

```

and block illegal moves

``` jsx
    if( move === 'ke8g8' ) move = 'o-o';
    if( move === 'ke8c8' ) move = 'o-o-o';
    if( move === 'Ke1g1' ) move = 'O-O';
    if( move === 'Ke1c1' ) move = 'O-O-O';

    if( !legalMoves.includes(move) ) return;

    //... setPieces etc.
```


now we can fix the movements for castling and en passant

```jsx
    const nextPieces = JSON.parse(JSON.stringify(pieces));

    nextPieces[rank][file] = moveFrom.piece;
    nextPieces[moveFrom.rank][moveFrom.file] = '';
    
    if( move.includes('-') ){
      if( file === 6 ){
        nextPieces[rank][5] = nextPieces[rank][7];
        nextPieces[rank][7] = '';
      } else if( file === 2 ) {
        nextPieces[rank][3] = nextPieces[rank][0];
        nextPieces[rank][0] = '';
      }
    }
    if( enPassant ) nextPieces[rank === 2 ? 3 : 4][file] = '';
    
    setPieces(nextPieces);
```


once our promotion widget works, we'll have a real chessboard!



### Promotion Widget

When a pawn attempts to land on the end of the board, we need to show the user a widget and wait for their choice. They may choose to promote to Q, or underpromote to N / B / R.


<sub>./src/Game.js</sub>
```jsx
  //...
  
  const [promotion, setPromotion] = useState(null);

  const onMove = useCallback(({ rank, file }, moveFrom=selected)=>{
    const legalMoves = calculateLegalMoves(pieces, turn, moves);

    const promoting = moveFrom.piece.match(/p/i) && (!rank || rank === 7);

    //...

    setPieces(...);
    setSelected({});

    if(!promoting){
      setTurn(turn === 'w' ? 'b' : 'w');
      setMoves([...moves, move]);
      
    } else setPromotion({ rank, file, move });

```

now we allow the pawn to move to the last rank, but we do not have the turn finish

instead, we will use the `promotion` state variable to trigger a widget be rendered on the `Board`


```jsx
  //...

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
        promotion={promotion}
        promotionWidget={
          promotion && (
            <PromotionWidget turn={turn} onPromote={onPromote}/>
          )}
    />
  );
```

and we'll need a `PromotionWidget` component of course, and later - our `onPromote` function

```jsx
//...

import Piece from 'react-chess-pieces';

const PromotionWidget = ({ turn, onPromote })=>{
  const promote = piece => e=> {
    e.stopPropagation();
    onPromote(piece);
  };
  
  return (
    <div className={'promotion-widget '+turn}>
      <div onClick={promote('q')}><Piece piece={turn === 'w' ? 'Q' : 'q'} /></div>
      <div onClick={promote('r')}><Piece piece={turn === 'w' ? 'R' : 'r'} /></div>
      <div onClick={promote('n')}><Piece piece={turn === 'w' ? 'N' : 'n'} /></div>
      <div onClick={promote('b')}><Piece piece={turn === 'w' ? 'B' : 'b'} /></div>
    </div>
  );
};

//...
```

which we'll need to render and style from the `Board`

<sub>./src/Board.js</sub>
```jsx
//...

function Board({
  pieces, onSelect, selected, onClick, onDragEnd,
  promotion, promotionWidget,
}) {

  //...

              <Droppable ... >
                
                <Draggable ... />
                
                {promotion && promotion.rank === rank && promotion.file === file ? (
                   promotionWidget
                 ) : null}
              </Droppable>

```

we can draw the widget on top of the board, while indicating clearly it is something different, while also not blocking the view of pieces (that may factor into the underpromotion choice!)


<sub>./src/Board.scss</sub>
```scss
//...

    .square {
      flex-grow: 1;
      background-color: #c2d280;
      position: relative;

      .promotion-widget {
        display: flex;
        position: absolute;
        z-index: 1000;
        left: 0;
        right: 0;
        background: repeating-linear-gradient(
                        45deg,
                        #bccd3080,
                        #bccd3080 10px,
                        #fff5 10px,
                        #fff5 20px
                      );
        
        &.w {
          top: 0;
          bottom: -300%;
          flex-direction: column;
        }

        &.b {
          top: 0;
          bottom: -300%;
          transform: translateY(-75%);
          flex-direction: column-reverse;
        }
        
        svg {
          transform: scale(0.625, 0.625) translate(25%, 25%);
        }
      }

//...
```


back in the `Game`, we still need to write our `onPromote` callback function


```jsx
  const onPromote = useCallback((piece)=> {    
    if(!promotion) return;
    
    const nextPieces = JSON.parse(JSON.stringify(pieces));
    nextPieces[promotion.rank][promotion.file] =
      turn === 'w' ? piece.toUpperCase() : piece.toLowerCase();

    setPieces(nextPieces);

    setPromotion(null);
    setTurn(turn === 'w' ? 'b' : 'w');
    setSelected({});
    setMoves(moves => [...moves, promotion.move.slice(0, -1) + piece.toLowerCase()]);
  }, [promotion, turn, pieces]);

```

which completes the move, pushes it to the list of moves, and ends the turn.



### Displaying legal moves on the Board

now that we can calculate the legal moves whenever we want, we should show the user legal moves for a piece when it is selected or dragged.


first let's make a state variable to store the legalMoves we'll be displaying to the user

<sub>./src/Game.js</sub>
```jsx
//...

const Game = ()=>{
  //...
  const [legalMovesDisplay, setLegalMovesDisplay] = useState([]);

  //...
```

and a function to trigger the calculation

```jsx
  //...

  const showLegalMoves = useCallback(({ rank, file, piece })=>{
    const prefix = piece + String.fromCharCode(file+97) + (rank+1);

    setLegalMovesDisplay(
      calculateLegalMoves(pieces, turn, moves)
        .map(move => (
          move === 'O-O' ? 'Ke1g1' :
          move === 'O-O-O' ? 'Ke1c1' :
          move === 'o-o' ? 'ke8g8' :
          move === 'o-o-o' ? 'ke8c8' :
          move
        )).filter(move => move.indexOf(prefix) === 0)
        .map(move => move.slice(3) )
        .reduce((moves, move)=> ({
          ...moves, [move.slice(0,2)]: move.includes('x') ? 'x' : '.',
        }), {})
    );
  }, [pieces, turn, moves]);

  //...
```

here, we're receiving the moves in our notation, so we have to convert castling back to an naive King move to avoid fooling the filter

also note our output format is an index JSON with structure `{ [move]: marker }`, and with null value `{}`

`move` is like 'e4' and marker is some string which will represent which SVG we wish to draw (this is an expandable format)


now we should call this function when the user selects a piece or starts dragging


```jsx
  //...

  const onSelect = useCallback(({ rank, file, piece })=>{
    if(!selected.piece) {
      setSelected({ rank, file, piece });
      showLegalMoves({ rank, file, piece })
      
    } else if( rank === selected.rank && file === selected.file ) {
      setSelected({});
      setLegalMovesDisplay({});
      
    } else onMove({ rank, file });
  }, [selected, onMove, showLegalMoves]);

  //...

  const onDragStart = showLegalMoves;

```

``` jsx
  return (
    <Board
        pieces={pieces}
        markers={legalMovesDisplay}
        onSelect={onSelect}
        selected={selected}
        onDragStart={onDragStart}
        onDragHover={onDragHover}
        onDragEnd={onDragEnd}
        onClick={onClick}
        onRightClick={onRightClick}
        promotion={promotion}
        promotionWidget={
          promotion && (
            <PromotionWidget turn={turn} onPromote={onPromote}/>
          )}
    />
  );
```

now, inside the `Board`, we'll have to render these markers

<sub>./src/Board.js</sub>
```jsx
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

//...

                
                <Draggable rank={rank} file={file} type={piece}>
                  <Piece piece={piece}/>
                </Draggable>

                {MarkerSVGS[ markers[String.fromCharCode(file+97) + (rank+1)] ]}

//...
```


<sub>./src/Board.scss</sub>
```scss
      svg {
        float: left;

        &.marker {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }
      }

```





remaining ideas for front end:

- check / draw / stalemate / checkmate / illegal
- sounds
- highlight previous move
- draw / remove arrows

- analysis board: connect to engine (api?), add / remove pieces, show eval / moves
- opening trainer: compile ECO moves and evaluations, draw arrows
- endgame trainer: connect to engine (api?), generate legal playable endgames

- improve drag and drop?
- more testing, automate testing on mobile?
- automate turning PGN into gif? FEN -> image api?









## multiplayer online

### firebase getting started

You'll need a Google account to follow along here, as we'll be building a firebase application to share the game state between two users.

[check out the firebase console](https://console.firebase.google.com/)

create an app

add authentication

[create oauth github app](https://developer.github.com/apps/building-oauth-apps/creating-an-oauth-app/)

copy over clientId, secret into firebase console from github app page (dev settings)

I also made sure that my custom domain would work with heroku, github and firebase.

firebase will allow localhost requests

`$ yarn add firebase`

find the credentials and copy paste

`$ touch src/network.js`


<sub>./src/network.js</sub>
```js
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/analytics';

const firebaseConfig = {
  //... copypasta
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

export const auth = firebase.auth;
export const db = firebase.firestore();


export const loginWithGithub = ()=>
  auth().signInWithPopup( new auth.GithubAuthProvider() );

```

this code is all available in the [quickstart firestore guide](https://firebase.google.com/docs/firestore/quickstart)

the `docs` that we're resolving are firebase documents, so we'll be able to use all the realtime methods built in.


### side nav games menu


let's make a `SideNav` to trigger the login, but leave the `user` in the top level component

`$ touch src/SideNav.js src/SideNav.scss`

<sub>./src/SideNav.js</sub>
```jsx
import React, { useState, useEffect } from 'react';
import './SideNav.scss';

import { loginWithGithub } from './network';

function SideNav({ user, onSelectGame }) {

  const [open, setOpen] = useState(false);
    
  const toggle = ()=> setOpen(o => !o);
  
  return (
    <div className={'SideNav '+(open ? 'open' : 'closed')}>
      <div className='toggle' onClick={toggle}/>
      {!user && <button onClick={loginWithGithub}>Login</button>}
    </div>
  );
}

export default SideNav;
```

this is made easier because `firebase`'s `auth` acts as a convenient global identity scope.

<sub>./src/App.js</sub>
```jsx
//...
import { auth } from './network';

import SideNav from './SideNav';
import Game from './Game';

function App() {
  const [user, setUser] = useState(null);
  
  useEffect(()=>{
    auth().onAuthStateChanged((newUser) => {
      if (!newUser) return;
      
      setUser(newUser);
    })
  }, []);
    
  return (
    <div className="App">
      <SideNav user={user} onSelectGame={g=> console.log(g)}/>
      <DndProvider backend={HTML5Backend}>
        <Game />
      </DndProvider>
    </div>
  );
}
//...
```

and of course we'll need to style our `SideNav` to actually appear as a togglable sidenav


<sub>./src/SideNav.scss</sub>
```scss
.SideNav {
  position: fixed;
  left: -50vw;
  right: 100vw;
  top: 0;
  bottom: 0;
  background-color: #3161a1;
  z-index: 10;
  transition: all 1s;
  
  &.open {
    left: 0;
    right: 50vw;
  }

  &.closed {
    left: -50vw;
    right: 100vw;
  }

  .toggle {
    position: fixed;
    top: 10px;
    left: 10px;
    height: 35px;
    width: 25px;
  }

  &.open .toggle::before {
    content: "\2039";
    font-size: 3rem;
    line-height: 0.5;
  }
  
  &.closed .toggle::before {
    content: "\203A";
    font-size: 3rem;
    line-height: 0.5;
  }
}
```


now that we have users logging in with github, we can start our firebase (server side)


### making data on the console

first we need to make a `games` collection in firebase

now we should put a sample game in to start coding against

```json
{
  "w": "555555",
  "pieces": [
    "R","N","B","Q","K","B","N","R",
    "P","P","P","P","P","P","P","P",
    "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "",
    "p","p","p","p","p","p","p","p",
    "r","n","b","q","k","b","n","r"
  ],
  "bname": "nik",
  "b": "666666",
  "moves": [],
  "wname": "dan",
  "turn": "w"
}
```

please use your own real github id(s) for `b` and `w` - or else you won't be allowed to play (later when we build tighter security)

also note that we have to store our pieces as a 1-D 64 length array, as nested arrays aren't possible in one firestore document. We'll have to convert back and forth on network calls.


now we can test loading the game once we logged in with

```js
  db.collection('games')
    .where('w', '==', userId).get()
    .then(snap => snap.forEach(doc=> console.log(doc.data)));
```

we'll be using this as a starting point for the `loadGames` function later, so don't worry about it too much yet. What's important now is that we can load a game from the server.



### sideNav to view / join / create game


we'll style our login button / status into the `SideNav`

<sub>./src/App.js</sub>
```jsx
//...

import githubLogo from './github.svg'

  //...
  const [nickname, setNickname] = useState(localStorage.nickname || '');

  //...

  useEffect(()=>{ localStorage.nickname = nickname }, [nickname]);

  //...
  
      <div className='login-container'>
        {!user? (
           <button className='login' onClick={loginWithGithub}>
             Login with <img src={githubLogo}/>
           </button>
         ) : (
           <>
             <img src={user.photoURL} />
             <input placeholder='Set Nickname'
                    value={nickname} onChange={e=> setNickname(e.target.value)}/>
           </>
         )}
      </div>
```

<sub>./src/src/SideNav.scss</sub>
```scss
  //...

  .login-container {
    button {
      border-radius: 5px;
      border-style: solid;
      outline: none;
      margin: 10px;

      &:active {
        background-color: #555;
        border-color: #555;
      }

      img {
        user-select: none;
      }
    }

    & > img {
      margin: 10px 0 0 50px;
      height: 50px;
      width: auto;
    }

    & > input {
      padding: 4px;
      border-radius: 3px;
      font-weight: 800;
      font-size: 1.125rem;
      background-color: transparent;
      color: white;
      max-width: 30vw;
      border: 1px dashed white;
      outline: none;
      margin-top: 5px;

      &::placeholder {
        color: #ffd;
      }
    }
  }

  //...
```


and now that we have some games in the database, we can load them and show them in a sidenav

<sub>./src/network.js</sub>
```js
//...

export const loadGames = (userId)=>
  db.collection('games')
    .where('w', '==', userId)
    .get()
    .then(snap => snap.docs);

```


<sub>./src/SideNav.js</sub>
```jsx
//...

import { loginWithGithub, loadGames } from './network';

//...

  const [myGames, setMyGames] = useState([]);
  
  useEffect(()=>{
    if(user) loadGames(user.providerData[0].uid).then((games)=>{
      setMyGames(games);
    }).catch(e => console.error(e) );
  }, [user]);

  //...

      <div>
        {myGames
          .map(g => g.data())
          .map((game, i)=> (
            <div key={i} onClick={()=> onSelectGame(myGames[i].id)}>
              {game.wname} vs {game.bname}
            </div>
          ))}
      </div>

//...
```

(take note of how we're managing the firebase objects and their data)

in the next section, we'll build a `StaticBoard` component to display games.

If you made yourself the black player in any games, you'll notice we have a bug! (if you haven't, got make one)

we need to load games where the user is white OR black

<sub>./src/network.js</sub>
```js
//...

export const loadGames = (userId)=>
  Promise.all([
    db.collection('games')
      .where('w', '==', userId).get()
      .then(snap => snap.docs),

    db.collection('games')
      .where('b', '==', userId).get()
      .then(snap => snap.docs)
  ]).then(g => g.flat());
```

much better.


so now when the user selects a game, it should load to the `Game`'s `Board`

<sub>./src/App.js</sub>
```jsx
  //...

  const [game, setGame] = useState(null);

  //...

      <SideNav user={user} onSelectGame={setGame}/>
      
      //...

        <Game remoteGame={game}/>
        
  //...
```

and the `Game` should keep out local state in sync with the firsabase game.

<sub>./src/Game.js</sub>
```jsx
//...

const Game = ({ remoteGame })=>{
  const [pieces, setPiecesLocal] = useState(initPieces);
  const [turn, setTurnLocal] = useState('w');
  const [moves, setMovesLocal] = useState([]);
  //...

  const setPieces = useCallback((p)=>{
    if(remoteGame)
      db.collection('games').doc(remoteGame).update({ pieces: p.flat() })
        .then(()=> setPiecesLocal(p) );
    
    else setPiecesLocal(p);
    
  }, [setPiecesLocal, remoteGame]);

  const setTurn = useCallback((t)=>{
    if(remoteGame)
      db.collection('games').doc(remoteGame).update({ turn: t })
        .then(()=> setTurnLocal(t) );

    else setTurnLocal(t);
  }, [setTurnLocal, remoteGame]);

  const setMoves = useCallback((m)=>{
    if(remoteGame)
      db.collection('games').doc(remoteGame).update({ moves: m })
        .then(()=> setMovesLocal(m) );

    else setMovesLocal(m);
  }, [setMovesLocal, remoteGame]);
  
  useEffect(()=>{
    if(remoteGame) {
      db.collection('games').doc(remoteGame).onSnapshot(doc => {
        const g = doc.data();
        setPiecesLocal(
          Array(8).fill(0).map((_,i)=> g.pieces.slice(i*8, 8+ i*8))
        );
        setTurnLocal(g.turn);
      } );
    }
  }, [remoteGame]);

  //...
```

that's all great for now because we can add data on the firebase console - later we'll need to give the user the choice to make a new game.



### StaticBoard display

Here we'll redo some of the work from `Board`, or our first attaempt at a board

`$ touch src/StaticBoard.js`

<sub>./src/StaticBoard.js</sub>
```jsx

```



### creating / joining games

let's split our `SideNav` into two tabs

<sub>./src/SideNav.js</sub>
```jsx

```

one for "My Games" and one for "Open Challenges"

```jsx

```


we'll need a "Create Game" button

<sub>./src/SideNav.js</sub>
```jsx

```

and a fullscreen view to fill in the details for the new game

```jsx

```

and a network call to actually create the new game.

<sub>./src/network.js</sub>
```js

```


### realtime gameplay

now that we can load the game we want, let's make sure our moves are sent to the database

<sub>./src/Game.js</sub>
```jsx
// send data to firebase, .onSnapshot => setState -> Game.props
```



### game status

when the game is over, we should give the user a chance to offer a rematch

...




- join game (with second github account)
- make moves (update), load moves (realtime)
- update game status (function?)
- show game preview with StaticBoard component

- improve security rules (only can move my pieces on my turn)

- rematch button
- clock, clock security
- deep link public access any game (client routing finally)
















https://firebase.google.com/docs/rules/get-started

https://firebase.google.com/docs/rules/rules-language

https://firebase.google.com/docs/firestore/quickstart



- userid from avatar image

put api key in env (make new api key)

- join table, display opponent
- start game, end game, switch sides
- start game from position


#### firestore security rules

we need to put the white_id and black_id in the <<path>> in order to limit write to players

we can write a rule function which will only allow players to play if it's their turn (and to make sure the turn value updates)


(( this is wrong... ))
```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow only authenticated participants access
    match /games/{uid}/{document} {
      allow read, write: if request.auth != null && request.auth.uid == uid
    }
    match /games/{uid1}/{uid2}/{document} {
      allow read, write: if request.auth != null &&
        (request.auth.uid == uid1 || request.auth.uid == uid2)
    }
  }
}

```


https://firebase.google.com/docs/firestore/data-model

https://firebase.google.com/docs/firestore/quickstart

that way users will be able to make games with an open slot, and other users will be able to make a game fulfilling the posted challenge (and make the first move if relevant)











https://firebase.google.com/docs/firestore/query-data/queries

https://firebase.google.com/docs/firestore/manage-data/add-data

https://firebase.google.com/docs/firestore/query-data/listen






This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

