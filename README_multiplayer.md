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
        promotionWidget={promotion && <PromotionWidget turn={turn} onPromote={onPromote} flipped={flipped}/>}

  //...
  
     <Board flipped={flipped} ... />

  //...
```

then in `PromotionWidget` earlier in the file

```jsx
//...

const PromotionWidget = ({ turn, onPromote, flipped })=>{
  //...

    <div className={'promotion-widget '+turn+' '+ (flipped? 'flipped':'')}>
```

and to fix the style

<sub>./src/Board.scss</sub>
```scss
  //...

      .promotion-widget {
        //...

        top: 0;
        bottom: -300%;

        &.flipped {
          bottom: 0;
          top: -300%;
        }

        //...

        &.b.flipped {
          transform: translateY(75%);
          flex-direction: column;
        }

```

finally we can actually flip the board

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
    flex-wrap: wrap;
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

first we'll make a function to calculate if the game is over

<sub>./src/chess-util.js</sub>
```js
//...

export const isGameOver = ({ pieces, turn, moves })=> {
  //... fill this in later
};
```

now we'll use this to update the server state when the user makes a move

<sub>./src/network.js</sub>
```js
import { isGameOver } from './chess-util';

  //...
  
  if( tempMove[game].pieces && tempMove[game].moves && tempMove[game].turn )
    db.collection('games').doc(game)
      .update({
        ...tempMove[game],
        isGameOver: isGameOver(tempMove[game]),
      })
      .then(()=> tempCbs[game].forEach(c=> c()))
      .then(()=> (tempMove[game] = {}))
      .then(()=> (tempCbs[game] = []));

```

and we'll make sure we don't bother loading completed games to our list

<sub>./src/network.js</sub>
```js
//...

export const loadGames = (userId)=>
  Promise.all([
    db.collection('games')
      .where('isGameOver', '==', false)
      .where('w', '==', userId).get()
      .then(snap => snap.docs),

    db.collection('games')
      .where('isGameOver', '==', false)
      .where('b', '==', userId).get()
      .then(snap => snap.docs)
  ]).then(g => g.flat().map(game => ({ ...game.data(), id: game.id })) );

//...
```

and we'll make sure new games have the `isGameOver` field

<sub>./src/SideNav.js</sub>
```jsx
  const makeNewGame = useCallback((game)=>{
    createGame({
      ...game,
      [game.b? 'bname':'wname']: nickname,
      isGameOver: false,
    }).then(()=> setCurrentTab('join-list'));
  }, [nickname]);

```


and now that we know the pieces will be in server (array) format

<sub>./src/chess-util.js</sub>
```js
//...

export const isGameOver = ({ pieces, turn, moves })=> {
  const matrixPieces = Array(8).fill(0).map((_,i)=> pieces.slice(i*8, i*8+8));
  
  const FEN = calculateFEN(matrixPieces, turn, moves);
  
  return (new Chess(FEN)).game_over();
};
```

any games you already have in the database will need `isGameOver: false` filled in for them to show up at all!


let's add an archive view to see completed games

<sub>./src/SideView.js</sub>
```jsx
  //...

  useEffect(()=>{
    if( user && (currentTab === 'games-list') )
      loadGames(user.providerData[0].uid)
      .then((games)=> setMyGames(games.filter(game => game.w && game.b)))
      .catch(e => console.error(e) );
    
    if( user && (currentTab === 'archive-list') )
      loadGames(user.providerData[0].uid, !!'load archived')
      .then((games)=> setMyGames(games.filter(game => game.w && game.b)))
      .catch(e => console.error(e) )

  }, [user, currentTab]);


  //...


         <div onClick={()=> setCurrentTab('archive-list')}
              className={currentTab === 'new-game' ? 'selected' : ''}>
           Archive
         </div>


  //...

        : currentTab === 'archive-list' ? 
          <div className='games-list'>
            {myGames
              .map((game, i)=> (
                <div key={game.id} onClick={()=> onSelectGame(game.id)} className='static-game'>
                  {game.wname} vs {game.bname}
                  <br/>
                  {game.turn} to move
                  <StaticBoard pieces={game.pieces}
                               flipped={user.providerData[0].uid === game.b}/>
                </div>
              ))}
          </div>}

```

and we'll need to refactor our `loadGames` to load archived games when we want

and backwards compaitbly when we don't


<sub>./src/network.js</sub>
```js
//...

export const loadGames = (userId, loadArchived=false)=>
  Promise.all([
    db.collection('games')
      .where('isGameOver', '==', loadArchived)
      .where('w', '==', userId).get()
      .then(snap => snap.docs),

    db.collection('games')
      .where('isGameOver', '==', loadArchived)
      .where('b', '==', userId).get()
      .then(snap => snap.docs)
  ]).then(g => g.flat().map(game => ({ ...game.data(), id: game.id })) );

//...
```


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
