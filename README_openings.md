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
  
  const verboaseMoves = game.history({ verbose: true });
  
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

