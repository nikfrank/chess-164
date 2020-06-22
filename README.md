# chess with hooks

in this course, we will build a multiplayer online chess game

we wil use ReactJS (hooks) and firebase

we will code one section in TDD, implement drag-and-drop, but we will largely focus on writing terse effective code in short clear functions.

this course presumes a basic working knowledge of React with hooks - or at least a predisposition to google what you need to learn to get through the day.


## Agenda

 - [1p Build](//github.com/nikfrank/chess-164/blob/master/README_1pbuild.md#1p-build)
   - [Board & Pieces](//github.com/nikfrank/chess-164/blob/master/README_1pbuild.md#board-n-pieces)
   - [making pieces draggable](//github.com/nikfrank/chess-164/blob/master/README_1pbuild.md#making-pieces-draggable)
   - [making squares droppable](//github.com/nikfrank/chess-164/blob/master/README_1pbuild.md#making-squares-droppable)
   - [showing the piece while being dragged](//github.com/nikfrank/chess-164/blob/master/README_1pbuild.md#showing-dragged)
   - [controlled component: Game -> Board](//github.com/nikfrank/chess-164/blob/master/README_1pbuild.md#controlled-component)
   - [Quick Refactor: App -> Game](//github.com/nikfrank/chess-164/blob/master/README_1pbuild.md#quick-refcator)
   - [The Rules of Chess](//github.com/nikfrank/chess-164/blob/master/README_1pbuild.md#rules)
   - [FEN TDD](//github.com/nikfrank/chess-164/blob/master/README_1pbuild.md#fen-tdd)
   - [calculating legal moves (chess.js)](//github.com/nikfrank/chess-164/blob/master/README_1pbuild.md#calc-legal-moves)
   - [enforcing legal moves](//github.com/nikfrank/chess-164/blob/master/README_1pbuild.md#enforcing-legal-moves)
   - [Promotion Widget](//github.com/nikfrank/chess-164/blob/master/README_1pbuild.md#promotion-widget)
   - [Displaying legal moves on the Board](//github.com/nikfrank/chess-164/blob/master/README_1pbuild.md#display-legal-moves)
 - [multiplayer online](//github.com/nikfrank/chess-164/blob/master/README_multiplayer.md#multiplayer-online)
   - [firebase getting started](//github.com/nikfrank/chess-164/blob/master/README_multiplayer.md#firebase-getting-started)
   - [side nav games menu](//github.com/nikfrank/chess-164/blob/master/README_multiplayer.md#side-nav-games-menu)
   - [making data on the console](//github.com/nikfrank/chess-164/blob/master/README_multiplayer.md#making-data)
   - [SideNav to view / join / create game](//github.com/nikfrank/chess-164/blob/master/README_multiplayer.md#side-nav-tabs)
   - [StaticBoard display](//github.com/nikfrank/chess-164/blob/master/README_multiplayer.md#static-board)
   - [flipping the board](//github.com/nikfrank/chess-164/blob/master/README_multiplayer.md#flipping)
   - [joining games](//github.com/nikfrank/chess-164/blob/master/README_multiplayer.md#joining)
   - [create game](//github.com/nikfrank/chess-164/blob/master/README_multiplayer.md#creating)
   - [securing moves, joins, and creates](//github.com/nikfrank/chess-164/blob/master/README_multiplayer.md#securing)
   - [game status](//github.com/nikfrank/chess-164/blob/master/README_multiplayer.md#game-status)
   - [players display](//github.com/nikfrank/chess-164/blob/master/README_multiplayer.md#players-display)




## 1p build


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





- clock, clock security
- deep link public access any game (allow read on game always)




## Openings Trainer

Our users want to improve their chess game - and most of them don't know a Sicilian from a Bong Cloud.

Let's build a view which let's them practice and explore openings.


first we'll add client side routing

`$ yarn add react-router react-router-dom`


<sub>./src/App.js</sub>
```jsx
//...
import {
  Route,
  BrowserRouter as Router,
  Switch,
  Redirect
} from 'react-router-dom';

import Openings from './Openings';

//...

const GameView = ({ user })=> {
  const [game, setGame] = useState(null);

  return (
    <>
    <SideNav user={user} onSelectGame={setGame}/>
    <Game remoteGame={game} user={user}/>
    </>
  );
};


function App() {
  const [user, setUser] = useState(null);

  useEffect(()=>{
    auth().onAuthStateChanged((newUser) => {
      if (!newUser) return;
      setUser(newUser);
    })
  }, []);
    
  return (
    <Router>
      <DndProvider backend={HTML5Backend}>
        <div className='App'>
          <Switch>
            <Route exact path='/game' render={props=> <GameView {...props} user={user}/>} />
            <Route exact path='/openings' render={props=> <Openings {...props} user={user}/>} />
            <Redirect from='/' to='/game' />
          </Switch>
        </div>
      </DndProvider>
    </Router>
  );
}

//...
```


now we can scaffold the files for the new view

`$ touch src/Openings.js src/Openings.scss`


and copy the basic interaction bindings for a `Board` from `Game`


<sub>./src/Openings.js</sub>
```jsx
import React, { useState, useCallback } from 'react';
import './Openings.scss';

import Board from './Board';
import { initPieces, calculateLegalMoves } from './chess-util';

function Openings(){
  const [flipped, setFlipped] = useState(false);
  const [pieces, setPieces] = useState(initPieces);
  const [turn, setTurn] = useState('w');
  const [moves, setMoves] = useState([]);
  const [selected, setSelected] = useState({});
  const [legalMovesDisplay, setLegalMovesDisplay] = useState({});
  
  const onMove = ({ rank, file }, moveFrom=selected)=>{
    // if move is correct, make the move then trigger computer
    // otherwise, don't do anything
    // there are no promotions here (yet?)
  };

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
```

<sub>./src/Openings.scss</sub>
```scss
.Openings {
  .Board {
    margin: 10vh auto;
  }
}
```


now we'll want to refactor some of our movement logic from `Game` into the util so we can reuse it here


<sub>./src/chess-util.js</sub>
```js
//...

export const castleAsKingMove = move => (
  move === 'O-O' ? 'Ke1g1' :
  move === 'O-O-O' ? 'Ke1c1' :
  move === 'o-o' ? 'ke8g8' :
  move === 'o-o-o' ? 'ke8c8' :
  move
);
```

<sub>./src/Game.js</sub>
<sub>./src/Openings.js</sub>
```diff
//...

import {
  //...
+  castleAsKingMove,
} from './chess-util';

  //...

    setLegalMovesDisplay(
      calculateLegalMoves(pieces, turn, moves)
-        .map(move => (
-          move === 'O-O' ? 'Ke1g1' :
-          move === 'O-O-O' ? 'Ke1c1' :
-          move === 'o-o' ? 'ke8g8' :
-          move === 'o-o-o' ? 'ke8c8' :
-          move
-        )).filter(move => move.indexOf(prefix) === 0)
+        .map(castleAsKingMove)
+        .filter(move => move.indexOf(prefix) === 0)
        .map(move => move.slice(3) )
        .reduce((moves, move)=> ({
          ...moves, [move.slice(0,2)]: move.includes('x') ? 'x' : '.',
        }), {})
    );

  //...

```

we'll move the legal move checking to the util

<sub>./src/chess-util.js</sub>
```js
//...

export const isMoveLegal = ({ pieces, moves, turn }, moveFrom, moveTo)=>{
  const { rank, file } = moveTo;
  
  const legalMoves = calculateLegalMoves(pieces, turn, moves);

  const promoting = moveFrom.piece.match(/p/i) && (!rank || rank === 7);
  const enPassant = !pieces[rank][file] &&
                    moveFrom.piece.match(/p/i) &&
                    moveFrom.file !== file;
  
  let move = (
    turn === 'w' ? moveFrom.piece.toUpperCase() : moveFrom.piece
  ) + (
    String.fromCharCode(moveFrom.file+97) + (moveFrom.rank+1)
  ) + (
    (String.fromCharCode(file+97)) + (rank+1)
  ) + (pieces[rank][file] || enPassant ? 'x' : '') + (promoting ? 'q' : '');

  if( move === 'ke8g8' ) move = 'o-o';
  if( move === 'ke8c8' ) move = 'o-o-o';
  if( move === 'Ke1g1' ) move = 'O-O';
  if( move === 'Ke1c1' ) move = 'O-O-O';
  
  return {
    move: legalMoves.includes(move) ? move : false,
    enPassant,
    promoting,
  };
};
```

<sub>./src/Game.js</sub>
```js
//...

import {
  //...
  isMoveLegal,
} from './chess-util';

  //...


  const onMove = useCallback(({ rank, file }, moveFrom=selected)=>{
    const { move, enPassant, promoting } = isMoveLegal(
      { pieces, moves, turn },
      moveFrom,
      { rank, file },
    );

    setSelected({});
    setLegalMovesDisplay({});
    if( !move ) return;

    //...
```

and the calculation of future board positions


<sub>./src/chess-util.js</sub>
```js
//...

export const calculateBoardAfterMove = ({ pieces, moves, turn }, moveFrom, moveTo, enPassant, move)=>{
  const { rank, file } = moveTo;  

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

  const nextTurn = turn === 'w' ? 'b' : 'w';
  const nextMoves = [...moves, move];

  return {
    pieces: nextPieces,
    turn: nextTurn,
    moves: nextMoves,
  };
};
```


<sub>./src/Game.js</sub>
```jsx
import {
  //...
  calculateBoardAfterMove,
} from './chess-util';

    //...
    if( !move ) return;

    const next = calculateBoardAfterMove({
      pieces, moves, turn,
    }, moveFrom, { rank, file }, enPassant, move);
    
      if(!promoting){
      setPieces(next.pieces);
      setTurn(next.turn);
      setMoves(next.moves);
      
    } else {
      setPromotion({ rank, file, move });
      setPiecesLocal(next.pieces);
    }

  //...
```

now that we've done that refactor, we can write a simple `onMove` in `Openings`

<sub>./src/Openings.js</sub>
```jsx
  //...

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
    
    if(!promoting){
      setPieces(next.pieces);
      setTurn(next.turn);
      setMoves(next.moves);
    } else console.log('how are you promoting in the opening?');

  }, [selected, moves, pieces, turn, setMoves, setPieces, setTurn]);
```


now we just need to add a list of openings, which we'll be able to use to display book moves to the user, or test the vastness of their knowledge


### ECO




let's make a component to display the analysis notation

`$ touch src/AnalysisNotation.js src/AnalysisNotation.scss`

<sub>./src/AnalysisNotation.js</sub>
```jsx

```

<sub>./src/AnalysisNotation.scss</sub>
```scss

```

<sub>./src/Openings.js</sub>
```jsx

```

and an undo / redo button

<sub>./src/Openings.js</sub>
```jsx

```


so we can find the opening they are playing and display that back to them


<sub>./src/Openings.js</sub>
```jsx

```

### practice and explore

our openings trainer feature will have two modes

- explore

the user can make any move they want, we'll display a filtered list of openings they could be playing

we'll build an `ArrowsLayer` component on top of our `Board` which can show users which book moves remain available


- practice

the user will practice playing only theoretical moves in two ways

we can select an opening to test the user's knowledge of (either player or both player's moves)

we'll challenge the user to remain in the book (for some number of moves) against a computer player






This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

