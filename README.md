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
 - [openings trainer](//github.com/nikfrank/chess-164/blob/master/README_openings.md#openings)




remaining ideas:


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




## openings




This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

