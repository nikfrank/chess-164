<a name="openings"></a>
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
    margin: 10vh auto 0;
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

we'll need a resource of JSON formatted ECO standard chess openings

[here's one I found which should be pretty easy to automate into JSON](https://www.chessgames.com/chessecohelp.html)

<sub>browser console</sub?
```js
const names = [...document.querySelectorAll('tr td b')].map(el => el.innerText);

const moves = [...document.querySelectorAll('tr td font font')].map(el => el.innerText);

const codes = [...document.querySelectorAll('tr td:first-child')].map(el => el.innerText);

const ECO = Array(500).fill(0).map((_,i)=> ({
  name: names[i],
  code: codes[i],
  moves: moves[i].split(' ').filter(m=> (m != 1*m) && (m!== ','))
});

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

download('export default '+JSON.stringify(ECO)+';', 'eco.js', 'text/plain');
```

which will download the file, which we can import into our project on the command line (from the project root)

`$ mv ~/Downloads/eco.js src/eco.js`

these moves are in SAN, which is great for people to read, but as we saw earlier, having a disambiguated notation is easier to work with from javascript


so let's write a utility to convert the moves into our notation (using chess js)


<sub>./src/chess-util.js</sub>
```js
import eco from './eco';

//...

const convertSAN = (moves)=> {
  const game = new Chess();
  
  moves.forEach(move => game.move(move));
  
  const verboseMoves = game.history({ verbose: true });
  
  return verboseMoves.map(cjsMove=> (
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

which we can now use to dump out a new file with moves in our notation

```js

const allOpenings = eco.map(opening => ({
  ...opening,
  sanMoves: opening.moves,
  moves: convertSAN(opening.moves),
}));


function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

download('export default '+JSON.stringify(allOpenings)+';', 'eco.js', 'text/plain');
```

which we can move onto the old copy, replacing it

`$ mv ~/Downloads/eco.js src/eco.js`


after which, we should delete the code which runs this automatically on boot

```diff
//...

-const allOpenings = eco.map(opening => ({
-  ...opening,
-  sanMoves: opening.moves,
-  moves: convertSAN(opening.moves),
-}));
-
-function download(content, fileName, contentType) {
-    var a = document.createElement("a");
-    var file = new Blob([content], {type: contentType});
-    a.href = URL.createObjectURL(file);
-    a.download = fileName;
-    a.click();
-}
-
-download('export default '+JSON.stringify(allOpenings)+';', 'eco.js', 'text/plain');
```

great, now we can use these openings easily to compare with the moves we have in our `Openings` component


### Displaying current opening

while the user is playing moves, we can filter the list of openings and display the name if there is a match


<sub>./src/Openings.js</sub>
```jsx
import React, { useState, useCallback, useEffect } from 'react';
//...

import {
  //...
  filterOpeningsByMoves,
} from './chess-util';


  //...
  
  const [currentOpenings, setCurrentOpenings] = useState([]);

  useEffect(()=> {
    setCurrentOpenings( filterOpeningsByMoves(moves) );
  }, [moves]);

  //...
  
        {currentOpenings[0]?.name}

```

<sub>./src/chess-util.js</sub>
```js
//...

export const filterOpeningsByMoves = (moves)=>{
  if( !moves.length ) return [eco[0]];

  let rem = [...eco];
  let i = 0;
  
  while((i < moves.length) && (rem.length)){
    rem = rem.filter(opening=> opening.moves[i] === moves[i]);
    i++;
  }
  return rem;
};

```

great - we have a first feature for openings trainer.

now we'll add more features to explore mode (undo / redo / displaying book moves) before moving on to practice mode.



### Displaying book moves (explore mode)

when the user makes a move, we're calculating a list of openings they could be playing

let's also calculate a list of "next book moves" to display with a different svg


<sub>./src/Openings.js</sub>
```jsx
  //...
  
  const [bookMoves, setBookMoves] = useState([]);
  
  useEffect(()=> {
    const openings = filterOpeningsByMoves(moves);
    setCurrentOpenings( openings );

    const nextBookMoves = Array.from( new Set(
      openings.map(opening =>
        opening.moves.slice(moves.length)[0]
      )
    ));
    
    setBookMoves(nextBookMoves.map(castleAsKingMove));
  }, [moves]);

  //...

  const showLegalMoves = useCallback(({ rank, file, piece })=>{
    const prefix = piece + String.fromCharCode(file+97) + (rank+1);

    setLegalMovesDisplay(
      calculateLegalMoves(pieces, turn, moves)
        .map(castleAsKingMove)
        .filter(move => move.indexOf(prefix) === 0)
        .reduce((moves, move)=> ({
          ...moves,
          [move.slice(3,5)]: bookMoves.includes(move) ?
          move.includes('x') ? 'bx' : 'b.':
          move.includes('x') ? 'x' : '.',
        }), {})
    );
  }, [pieces, turn, moves, bookMoves]);

```

and some new markerSvgs for the `Board` (or new colors at least)

<sub>./src/Board.js</sub>
```jsx
//...


const MarkerSVGS = {
  //...

  'b.': (
    <svg viewBox='0 0 10 10' className='marker'>
      <circle cx={5} cy={5} r={2} fill='#fe28' stroke='black' strokeWidth={0.25}/>
    </svg>
  ),
  'bx': (
    <svg viewBox='0 0 16 16' className='marker'>
      <polygon points='4,6 6,4 8,6 10,4 12,6 10,8 12,10 10,12 8,10 6,12 4,10 6,8 4,6' fill='#fe28' stroke='black' strokeWidth={0.25}/>
    </svg>
  ),
};

//...
```

now the user can discover theoretical moves in openings they don't know yet.

If we only had an undo button, the user would really be able to learn



### undo / redo / display moves history


let's make a component to display the moves in analysis notation

`$ touch src/AnalysisNotation.js src/AnalysisNotation.scss`

<sub>./src/AnalysisNotation.js</sub>
```jsx
import React from 'react';
import './AnalysisNotation.scss';

function AnalysisNotation({ moves }){

  return (
    <div className='AnalysisNotation'>
      <div className='moves-container'>
        {moves.map((move, i) => (
           <div className='move' key={i}>
             {move}
           </div>
         ))}
      </div>
    </div>
  );
}

export default AnalysisNotation;

```

<sub>./src/AnalysisNotation.scss</sub>
```scss
.AnalysisNotation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  top: 85vh;
  
  .moves-container {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    height: 100%;
    align-content: flex-start;
    
    .move {
      height: calc( 50% - 12px );
      padding: 5px;
      min-width: 65px;
      border: 1px solid black;

      &:nth-child(even) {
        background-color: black;
        color: white;
        border: 1px solid white;
        border-top: 1px solid black;
      }
    }
  }
}
```

<sub>./src/Openings.scss</sub>
```scss
.Openings {
  .Board {
    margin: 7vh auto 0;
    height: 60vh;
    width: 60vh;
  }
}
```

<sub>./src/Openings.js</sub>
```jsx
//...

import AnalysisNotation from './AnalysisNotation';

  //...
  
        <AnalysisNotation moves={moves}/>
```


that's a good start, now we'll handle clicks on previous moves and reset the `pieces` to the previous position



### undo

<sub>./src/AnalysisNotation.js</sub>
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

