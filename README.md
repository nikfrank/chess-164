# chess with hooks

in this course, we will build a multiplayer online chess game

we wil use ReactJS (hooks) and firebase

we will code one section in TDD, implement drag-and-drop, but we will largely focus on writing terse effective code in short clear functions.

this course presumes a basic working knowledge of React with hooks - or at least a predisposition to google what you need to learn to get through the day.


## Agenda

 - [1p Build](#1p-build)
   - [Board & Pieces](#board-n-pieces)
   - [making pieces draggable](#making-pieces-draggable)
   - [making squares droppable](#making-squares-droppable)
   - [showing the piece while being dragged](#showing-dragged)
   - [controlled component: Game -> Board](#controlled-component)
   - [Quick Refactor: App -> Game](#quick-refcator)
   - [The Rules of Chess](#rules)
   - [FEN TDD](#fen-tdd)
   - [calculating legal moves (chess.js)](#calc-legal-moves)
   - [enforcing legal moves](#enforcing-legal-moves)
   - [Promotion Widget](#promotion-widget)
   - [Displaying legal moves on the Board](#display-legal-moves)
 - [multiplayer online](#multiplayer-online)
   - [firebase getting started](#firebase-getting-started)
   - [side nav games menu](#side-nav-games-menu)
   - [making data on the console](#making-data)
   - [SideNav to view / join / create game](#side-nav-tabs)
   - [StaticBoard display](#static-board)
   - [flipping the board](#flipping)
   - [joining games](#joining)
   - [create game](#creating)
   - [securing moves, joins, and creates](#securing)
   - [game status](#game-status)
   - [players display](#players-display)


<a name="1p-build"></a>
## 1p Build

<a name="board-n-pieces"></a>
### Board & Pieces

create-react-app

`$ npx create-react-app chess`

`$ cd chess`

`$ yarn add node-sass`

we'll be building a board with mostly flexbox

and by using my `react-chess-pieces` library


<sub>./src/App.js</sub>
``` jsx
import React from 'react';
import './App.scss';

import Board from './Board';

function App() {
  return (
    <div className='App'>
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
    <div className='Board'>
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


svg pieces


`$ yarn add react-chess-pieces`

<sub>./src/Board.js</sub>
``` jsx
//...

function Board() {
  const [pieces, setPieces] = useState(initPieces)
  
  return (
    <div className='Board'>
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

click to move

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
    <div className='Board'>

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

<a name="making-pieces-draggable"></a>
### making pieces draggable

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
    <div className='App'>
      <DndProvider backend={HTML5Backend}>
        <Board />
      </DndProvider>
    </div>
  );
}

export default App;
```


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

<a name="making-squares-droppable"></a>
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
    <div className='Board'>
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

this key trick [seen here](https://stackoverflow.com/questions/30626030/can-you-force-a-react-component-to-rerender-without-calling-setstate) is necessary because internally `react-dnd` uses `React.memo` for some of the values we pass it (to its hooks).


<a name="showing-dragged"></a>
### showing the piece while being dragged

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


<a name="controlled-component"></a>
### controlled component: Game -> Board

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
    <div className='App'>
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

<a name="quick-refactor"></a>
### Quick Refactor: App -> Game

It'll be more convenient now to think of our application structure (before it's too late!)

We'll have two main views: Game and Training (both with `Board`s), which should each be in their own files

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

<a name="rules"></a>
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

<a name="fen-tdd"></a>
### FEN TDD

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


<a name="calc-legal-moves"></a>
### calculating legal moves

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


<a name="enforcing-legal-moves"></a>
### enforcing legal moves


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
      
      moveFrom.piece.match(/p/i) && (!rank || rank === 7) ? 'q' : ''
    );

    setMoves([...moves, move]);

```



we can now use them to calculate `legalMoves` correctly, as well as remembering to treat en-passant as a capture


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


<a name="promotion-widget"></a>
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
        
        top: 0;
        bottom: -300%;

        &.w {
          flex-direction: column;
        }

        &.b {
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
    const nextMoves = [...moves, promotion.move.slice(0, -1) + piece.toLowerCase()];
    setMoves(nextMoves);
  }, [promotion, turn, pieces, moves, setMoves, setPieces, setTurn]);

```

which completes the move, pushes it to the list of moves, and ends the turn.


<a name="display-legal-moves"></a>
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








<a name="multiplayer-online"></a>
## multiplayer online

<a name="firebase-getting-started"></a>
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

go ahead and read a bit of the docs to familiarize yourself before we start coding

https://firebase.google.com/docs/firestore/data-model

https://firebase.google.com/docs/firestore/query-data/queries

https://firebase.google.com/docs/firestore/manage-data/add-data

https://firebase.google.com/docs/firestore/query-data/listen

https://firebase.google.com/docs/rules/get-started

https://firebase.google.com/docs/rules/rules-language


<a name="side-nav-games-menu"></a>
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
    <div className='App'>
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


<a name="making-data"></a>
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


<a name="side-nav-tabs"></a>
### SideNav to view / join / create game


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

go ahead and take the github svg from this repo - it is provided by github with some fair conditions of use (here as an integration).


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
    .then(snap => snap.docs)
    .then(games=> games.map(game => ({ ...game.data(), id: game.id })));

```


<sub>./src/SideNav.js</sub>
```jsx
//...

import { loginWithGithub, loadGames } from './network';

//...

  const [myGames, setMyGames] = useState([]);
  
  useEffect(()=>{
    if(user)
      loadGames(user.providerData[0].uid)
        .then((games)=> setMyGames(games))
        .catch(e => console.error(e) );
  }, [user]);

  //...

      <div>
        {myGames
          .map((game, i)=> (
            <div key={game.id} onClick={()=> onSelectGame(game.id)}>
              {game.wname} vs {game.bname}
            </div>
          ))}
      </div>

//...
```

(take note of how we're managing the firebase objects and their data)

in the next section, we'll build a `StaticBoard` component to display games.

If you made yourself the black player in any games, you'll notice we have a bug! (if you haven't, go make one)

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
  ]).then(g => g.flat().map(game => ({ ...game.data(), id: game.id })));
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
      return db.collection('games').doc(remoteGame).onSnapshot(doc => {
        const g = doc.data();
        setPiecesLocal(
          Array(8).fill(0).map((_,i)=> g.pieces.slice(i*8, 8+ i*8))
        );
        setTurnLocal(g.turn);
        setMovesLocal(g.moves);
        setFlipped(g.b === user?.providerData[0].uid);
      } );
    }
  }, [remoteGame]);

  //...
```

in the `useEffect`, we return the `unsubscribe` callback provided by firebase's `onSnapshot` in order to remove the listener if the user selects a different game.


that's all great for now because we can add data on the firebase console - later we'll need to give the user the choice to make a new game.

note that we've assumed the `SideNav` will send along the firebase document id as the selection, as we coded that earlier.



<a name="static-board"></a>
### StaticBoard display

Here we'll reuse some of the work from `Board` to make a heads-up static display of the game

`$ touch src/StaticBoard.js`

<sub>./src/StaticBoard.js</sub>
```jsx
import React from 'react';
import Piece from 'react-chess-pieces';

const RANKS = Array(8).fill(0);

function StaticBoard({ pieces, flipped }){
  return (
    <div className='Board Static'
         style={{ flexDirection: flipped ? 'column' : 'column-reverse'}}>
      {RANKS.map((_, rank)=> (
         <div className='rank' key={rank}
              style={{ flexDirection: flipped ? 'row-reverse' : 'row'}}>>
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
```

remember that now our pieces are going to be from firebase, and are `[64]` not `[8][8]`

so we have to `slice` them apart when rendering


<sub>./src/Board.scss</sub>
```scss
.Board {
  //...

  &.Static {
    width: 30vw;
    height: 30vw;
    max-width: 250px;
    max-height: 250px;
    margin: 30px auto;
  }
}
```

and we'll render it from `SideNav`


<sub>./src/SideNav.js</sub>
```jsx
  //...

      <div className='games-list'>
        {myGames
          .map((game, i)=> (
            <div key={game.id} onClick={()=> onSelectGame(game.id)}
                 className='static-game'>
              {game.wname} vs {game.bname}
              <StaticBoard pieces={game.pieces}
                           flipped={user.providerData[0].uid === game.b}/>
            </div>
          ))}
      </div>

  //...
```

<sub>./src/SideNav.scss</sub>
```scss
.SideNav {
  //...

  .games-list {
    display: flex;
    flex-direction: column;
    overflow-y: auto;

    .static-game {
      max-height: 320px;
      cursor: pointer;
    }
  }
}
```

these games only update when the user changes (on login) - if you want them all to sync update, you can use what you learned about `.onSnapshot` from the `Game` sync section - or code an occasional poll as an exercise.


when you have too many games and need to scroll, you can wrap the tabs JSX with

<sub>./src/SideNav.js</sub>
```jsx
  <div className='active-tab'>
    <div className='games-list'>...</div>
  </div>
```

and style it to scroll with

<sub>./src/SideNav.scss</sub>
```scss
.SideNav {
  //...

  display: flex;
  flex-direction: column;

  .active-tab {
    overflow-y: auto;
    flex-grow: 1;
  }

  //...

}
```


<a name="flipping"></a>
### flipping the board

when the user is playing as black, we should change the `flex-direction` on the `Board`


<sub>./src/App.js</sub>
```jsx
        <Game remoteGame={game} user={user}/>
```

<sub>./src/Game.js</sub>
```jsx
const Game = ({ remoteGame, user })=>{

  const [flipped, setFlipped] = useState(false);


     //... onSnapshot
     
        setFlipped(g.b === user?.providerData[0].uid);

  }, [remoteGame, user]);


  //...
  
     <Board flipped={flipped} ... />

  //...
```

<sub>./src/Board.js</sub>
```jsx
//...

function Board({
  pieces, onSelect, selected, onClick, onDragEnd, onDragStart,
  promotion, promotionWidget, markers, flipped,
}) {

  //...

    <div className='Board' style={{ flexDirection: flipped ? 'column' : 'column-reverse' }}>
      {pieces.map((row, rank)=> (
        <div className='rank' key={rank}
             style={{ flexDirection: flipped ? 'row-reverse' : 'row'}}>

  //...
```



<a name="joining"></a>
### joining games

let's split our `SideNav` into two tabs

<sub>./src/SideNav.js</sub>
```jsx
  //...

  const [currentTab, setCurrentTab] = useState('games-list');

  //...

    <div className='active-tab'>
      {user && (
         <div className='tabs-headers'>
           <div onClick={()=> setCurrentTab('games-list')}
                className={currentTab === 'games-list' ? 'selected' : ''}>
             Games List
           </div>
           <div onClick={()=> setCurrentTab('join-list')}
                className={currentTab === 'join-list' ? 'selected' : ''}>
             Open Challenges
           </div>
         </div>
      )}

      {currentTab === 'games-list' && (
         <div className='games-list'>
           ...
         </div>
      )}
      {currentTab === 'join-list' && (
         <div className='join-list'>
           load games with empty b / w
         </div>
      )}
    </div>
    
  //...

```

one for "My Games" and one for "Open Challenges"

<sub>./src/SideNav.scss</sub>
```scss
.SideNav {
  //...

  .tabs-headers {
    width: 100%;
    display: flex;
    justify-content: space-around;
    margin-top: 10px;
    
    & > div {
      margin: 5px;
      padding: 5px;

      border: 1px solid white;
      border-radius: 3px;
      background-color: #fff8;
      cursor: pointer;

      &:hover {
        background-color: #0008;
      }
      &.selected {
        background-color: #8888;
      }
    }
  }
}
```

and we'll need to load games with an empty player field

<sub>./src/network.js</sub>
```js
//...

export const loadChallenges = ()=>
  Promise.all([
    db.collection('games').where('b', '==', '').get(),
    db.collection('games').where('w', '==', '').get()
  ]).then( snaps=>
    snaps.map(snap => snap.docs).flat()
         .map(game => ({ ...game.data(), id: game.id }))
  );
```

which we will need a sample of in the collection (go ahead and make one from the firebase console)


so now we can load them when the `join-list` tab is entered

<sub>./src/SideNav.js</sub>
```jsx
//...

import { loadChallenges } from './network';

  //...
  
  const [challenges, setChallenges] = useState([]);
  
  //...

  useEffect(()=> {
    if( user && (currentTab === 'join-list') )
      loadChallenges()
      .then( cs=> setChallenges(cs) )
      .catch(e => console.error(e) )
  }, [user, currentTab]);

  //...

        {currentTab === 'join-list' && (
           <div className='join-list'>
             {challenges.map((challenge)=> (
                <div key={challenge.id} onClick={()=> acceptChallenge(challenge)}>
                  {challenge.wname || 'OPEN'} v {challenge.bname || 'OPEN'}
                  <StaticBoard pieces={challenge.pieces}
                               flipped={user.providerData[0].uid === challenge.b}/>
                </div>
              ))}
           </div>
         )}
  //...
```

which we need to be able to join


<sub>./src/network.js</sub>
```js
//...

export const joinGame = ({ gameId, userId, asPlayer, nickname })=>
  db.collection('games')
    .doc(gameId)
    .update({ [asPlayer]: userId, [asPlayer+'name']: nickname });
```

<sub>./src/SideNav.js</sub>
```jsx
//...

import { loginWithGithub, loadGames, loadChallenges, joinGame } from './network';

  //...

  const acceptChallenge = useCallback(challenge=> {
    const asPlayer = challenge.b ? 'w' : 'b';
    joinGame({
      gameId: challenge.id,
      userId: user.providerData[0].uid,
      asPlayer,
      nickname,
    });
  }, [user, nickname]);

  //...
```

and we can also trigger a refresh on the `games-list` tab when entered the same way we did with the open challenges, but now also filtering the open games


```jsx
  //...

  useEffect(()=>{
    if( user && (currentTab === 'games-list') )
      loadGames(user.providerData[0].uid)
      .then((games)=> setMyGames(games.filter(game => game.w && game.b)))
      .catch(e => console.error(e) )
  }, [user, currentTab]);

  //...
```

and move the user back to the `games-list` when they join a game

```jsx
  //...

  const acceptChallenge = useCallback(challenge=> {
    const asPlayer = challenge.b ? 'w' : 'b';
    joinGame({
      gameId: challenge.id,
      userId: user.providerData[0].uid,
      asPlayer,
      nickname,
    }).then(()=> setCurrentTab('games-list'));
  }, [user, nickname]);

  //...
```

so they can see their newly joined game!


now if our users could only create a game, we'd have a fully functional online chess app.


Also, as an exercise, let's indicate to the user somehow whose turn it will be when they join the game (be creative!)



<a name="creating"></a>
### create game


we'll need a "Create Game" tab as well - this tab is complex enough to warrant a component

<sub>./src/SideNav.js</sub>
```jsx
//...

import NewGameForm from './NewGameForm';

  //...

  const [newGame, setNewGame] = useState({});

  //...

  const makeNewGame = useCallback(()=>{
    console.log(newGame);
    // createGame
  }, [newGame]);
  
  //...

         <div onClick={()=> setCurrentTab('new-game')}
              className={currentTab === 'new-game' ? 'selected' : ''}>
           New Game
         </div>

  //...


        currentTab === 'new-game' &&
          <NewGameForm value={newGame} user={user}
                       onChange={setNewGame} onSubmit={makeNewGame} />

  //...
```

`$ touch src/NewGameForm.js src/NewGameForm.scss`

<sub>./src/NewGameForm.js</sub>
```jsx
import React from 'react';

import StaticBoard from './StaticBoard';

import { initPositions } from './chess-util';
const initPositionKeys = Object.keys(initPositions);

function NewGameForm({ value, onChange, onSubmit, userId }){  
  return (
    <div className='NewGameForm'>
      My Color
      <select value={value.b === userId ? 'b' : 'w'}
              onChange={e=> onChange({
                  ...value,
                  [e.target.value]: userId,
                  [e.target.value === 'b' ? 'w' : 'b']: '',
                })}>
        <option value='b'>Black</option>
        <option value='w'>White</option>
      </select>

      <hr/>
      
      Initial Position
      <select value={value.initialPosition}
              onChange={e=> onChange({
                  ...value,
                  initialPosition: e.target.value,
                  ...initPositions[e.target.value],
                })}>
        {initPositionKeys.map(key=> (
           <option value={key} key={key}>{initPositions[key].name}</option>
        ))}
      </select>
      <StaticBoard pieces={value.pieces || initPositions.standard.pieces}
                   flipped={value.b === userId}/>


      <hr/>
      
      Whose Turn
      <select value={value.turn || 'w'}
              onChange={e=> onChange({ ...value, turn: e.target.value })}>
        <option value='b'>Black</option>
        <option value='w'>White</option>
      </select>

      <hr/>

      <button onClick={()=> onSubmit({
          [value.b === userId ? 'b' : 'w']: userId,
          [value.b === userId ? 'w' : 'b']: '',
          pieces: initPositions.standard.pieces,
          moves: [],
          turn: 'w',
          ...value,
        })}>Make New Game</button>

    </div>
  );
};

export default NewGameForm;
```


<sub>./src/NewGameForm.scss</sub>
```scss
/* style is all about the CSS rules you don't use */
```


we can write in some initial positions our users will want to create games in

<sub>./src/chess-util.js</sub>
```js
//...

export const initPositions = {
  standard: {
    pieces: initPieces.flat(),
    moves: [],
    name: 'Standard',
    turn: 'w',
  },
  
  knightOdds: {
    pieces: [
      ['R',  '', 'B', 'Q', 'K', 'B', 'N', 'R'],
      ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
      [ '',  '',  '',  '',  '',  '',  '',  ''],
      [ '',  '',  '',  '',  '',  '',  '',  ''],
      [ '',  '',  '',  '',  '',  '',  '',  ''],
      [ '',  '',  '',  '',  '',  '',  '',  ''],
      ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
      ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ].flat(),
    moves: [],
    name: 'Knight Odds',
  },

  //...
```

here I'm flattening the `pieces` to work with `StaticBoard` and to send to the firebase

(only our live `Game` `Board` really has any use for the nested version)



and a network call to actually create the new game.

<sub>./src/network.js</sub>
```js
//...

export const createGame = (game)=> db.collection('games').add(game);
```

which we can use to finish our `makeNewGame` callback and forward the user to the "Open Challenges" tab where that new game should show up.


<sub>./src/SideNav.js</sub>
```jsx
//...

import { loginWithGithub, loadGames, loadChallenges, joinGame, createGame } from './network';

  //...

  const makeNewGame = useCallback((game)=>{
    createGame({
      ...game,
      [game.b? 'bname':'wname']: nickname,
    }).then(()=> setCurrentTab('join-list'));
  }, [nickname]);

  //...
```

of course we also have to graft on the user's `nickname`!


precocious students may try joining their own game and getting a React duplicate key bug - perhaps the more precocious of them will solve it as well.



<a name="securing"></a>
### securing moves, joins, and creates

... we can move for the wrong player

we need to check the right things from our security rules

<sub>console.firebase.google.com/project/<PROJECT_SLUG>/database/firestore/rules</sub>
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isMyTurn(){
      return 'turn' in resource.data &&
             'turn' in request.resource.data &&
             resource.data.turn in resource.data &&
             (request.auth.token.firebase.identities["github.com"][0] == resource.data[resource.data.turn]) &&
             request.resource.data.turn != resource.data.turn;
    }
    function joiningGame(){
      let color = request.resource.data.w == request.auth.token.firebase.identities["github.com"][0] ? 'w' : 'b';
      return (request.auth.token.firebase.identities["github.com"][0] == request.resource.data[color]) &&
             (resource.data[color] == '' || !(color in resource.data));
    }
    match /{document=**} {
      allow read, create: if request.auth != null;
      allow write: if joiningGame() || isMyTurn();
    }
  }
}
```

this solution was a lot of work (debugging rules in the cloud is always hard, and there aren't so many examples online... I had bugs that stackoverflow had no answer for!) - so in a way it is provided here to be studied as an example and referred back to as needed


we also need to refactor our move updates to be all at once (prviously we had synced `moves`, `pieces`, and `turn` separately), so the security rule can properly evaluate if your move is legal

<sub>./src/chess-util.js</sub>
```js
//...

const tempMove = {};
const tempCbs = {};
export const syncMove = ({ pieces, turn, moves }, game, cb)=>{
  tempMove[game] = tempMove[game] || {};
  if( pieces ) tempMove[game].pieces = pieces;
  if( moves ) tempMove[game].moves = moves;
  if( turn ) tempMove[game].turn = turn;

  tempCbs[game] = tempCbs[game] || [];
  tempCbs[game].push(cb);

  if( tempMove[game].pieces && tempMove[game].moves && tempMove[game].turn )
    db.collection('games').doc(game)
      .update(tempMove[game])
      .then(()=> tempCbs[game].forEach(c=> c()))
      .then(()=> (tempMove[game] = {}))
      .then(()=> (tempCbs[game] = []));
};
```

<sub>./src/Game.js</sub>
```jsx
import { db, syncMove } from './network';

//...

  const setPieces = useCallback((p)=>{
    if(remoteGame) syncMove({ pieces: p.flat() }, remoteGame, ()=> setPiecesLocal(p));
    else setPiecesLocal(p);   
  }, [setPiecesLocal, remoteGame]);

  const setTurn = useCallback((t)=>{
    if(remoteGame) syncMove({ turn: t }, remoteGame, ()=> setTurnLocal(t));
    else setTurnLocal(t);
  }, [setTurnLocal, remoteGame]);

  const setMoves = useCallback((m)=>{
    if(remoteGame) syncMove({ moves: m }, remoteGame, ()=> setMovesLocal(m));
    else setMovesLocal(m);
  }, [setMovesLocal, remoteGame]);

  //... and in onMove

    if( enPassant ) nextPieces[rank === 2 ? 3 : 4][file] = '';

    setSelected({});

    if(!promoting){
      setPieces(nextPieces);
      setTurn(turn === 'w' ? 'b' : 'w');
      setMoves([...moves, move]);
      
    } else {
      setPromotion({ rank, file, move });
      setPiecesLocal(nextPieces);
    }

```


read more about testing rules

https://firebase.google.com/docs/rules/emulator-setup

https://firebase.google.com/docs/emulator-suite/install_and_configure

https://github.com/firebase/quickstart-nodejs/tree/master/firestore-emulator/javascript-quickstart

...



<a name="game-status"></a>
### game status

when the game is over, we should give the user a chance to offer a rematch

we should also stop showing it in the games list

...


<a name="players-display"></a>
### players display

when users are playing, they'll be closing the `SideNav`... so we'll probably still want to show them who they're playing against

`$ touch src/PlayerCard.js src/PlayerCard.scss`

<sub>./src/Game.js</sub>
```jsx
import PlayerCard from './PlayerCard';

  //...

  const [players, setPlayers] = useState([]);

  //...

  useEffect(()=>{
    if(remoteGame) {
      return db.collection('games').doc(remoteGame).onSnapshot(doc => {
        const g = doc.data();
        
        //.. other setStates

        setPlayers([
          { id: g.w, nickname: g.wname },
          { id: g.b, nickname: g.bname },
        ]);
      } );
    }
  }, [remoteGame, user]);


    <>
      <PlayerCard player={ flipped ? players[0] : players[1]} />
      <Board ...  />
      <PlayerCard player={ flipped ? players[1] : players[0]} />
    </>


```

<sub>./src/PlayerCard.js</sub>
```jsx
import React from 'react';
import './PlayerCard.scss';

function PlayerCard({ player: { id, nickname }={}}){
  if(!id) return <div className='PlayerCard'/>;
  return (
    <div className='PlayerCard'>
      <img alt='' src={'https://avatars3.githubusercontent.com/u/'+id} />
      <span>{nickname}</span>
    </div>
  );
}

export default PlayerCard;
```

<sub>./src/PlayerCard.scss</sub>
```scss
.PlayerCard {
  height: 10vh;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    height: 50px;
    max-height: 6vh;
    margin: 2vh;
  }

  span {
    display: inline-block;
    min-width: 100px;
  }
}
```


<sub>./src/Board.scss</sub>
```scss
.Board {
  //...

  margin: 0 auto;

  //...
}
```


- clock, clock security
- deep link public access any game (client routing finally)







This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

