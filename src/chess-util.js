import eco from './eco';

import C from 'chess.js';
const Chess = C.Chess || C;

export const initPieces = [
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  [ '',  '',  '',  '',  '',  '',  '',  ''],
  [ '',  '',  '',  '',  '',  '',  '',  ''],
  [ '',  '',  '',  '',  '',  '',  '',  ''],
  [ '',  '',  '',  '',  '',  '',  '',  ''],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
];


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

  rookOdds: {
    pieces: [
      [ '', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
      ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
      [ '',  '',  '',  '',  '',  '',  '',  ''],
      [ '',  '',  '',  '',  '',  '',  '',  ''],
      [ '',  '',  '',  '',  '',  '',  '',  ''],
      [ '',  '',  '',  '',  '',  '',  '',  ''],
      ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
      ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ].flat(),
    moves: [],
    name: 'Rook Odds',
  },

  queenOdds: {
    pieces: [
      ['R', 'N', 'B',  '', 'K', 'B', 'N', 'R'],
      ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
      [ '',  '',  '',  '',  '',  '',  '',  ''],
      [ '',  '',  '',  '',  '',  '',  '',  ''],
      [ '',  '',  '',  '',  '',  '',  '',  ''],
      [ '',  '',  '',  '',  '',  '',  '',  ''],
      ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
      ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ].flat(),
    moves: [],
    name: 'Queen Odds',
  },

  evansGambit: {
    pieces: [
      ['R', 'N', 'B', 'Q', 'K',  '',  '', 'R'],
      ['P',  '', 'P', 'P',  '', 'P', 'P', 'P'],
      [ '',  '',  '',  '',  '', 'N',  '',  ''],
      [ '', 'P', 'B',  '', 'P',  '',  '',  ''],
      [ '',  '', 'b',  '', 'p',  '',  '',  ''],
      [ '',  '', 'n',  '',  '',  '',  '',  ''],
      ['p', 'p', 'p', 'p',  '', 'p', 'p', 'p'],
      ['r',  '', 'b', 'q', 'k',  '', 'n', 'r'],
    ].flat(),
    moves: ['Pe2e4', 'pe7e5', 'Ng1f3', 'nb8c6', 'Bf1c4', 'bf8c5', 'Pb2b4'],
    name: 'Evans Gambit',
    turn: 'b',
  },
};


export const calculateFEN = (pieces, turn, moves)=> {
  const fenPieces =
    pieces.reduce((fen, rank)=>
      rank.reduce((row, piece)=>
        piece ? row + piece :
          !row ? '1' :
            !row[row.length-1].match(/\d/) ? row + '1' :
              row.slice(0, -1) + (1*row[row.length-1] + 1)
                , '') + '/' + fen, '').slice(0, -1);

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

  
  const lastMove = moves[moves.length-1];
  const ept =
    !lastMove ? '-' :
    lastMove[0].toLowerCase() !== 'p' ? '-' :
    Math.abs(lastMove[4] - lastMove[2]) !== 2 ? '-' :
    (lastMove[1] + ( lastMove[2] === '2' ? 3 : 6 ));

  
  const halfmoves = moves.reduce((hm, move)=> (
    (move[0].toLowerCase() === 'p') || move.includes('x')
  ) ? 0 : hm + 1, 0);

  
  const moveNumber = Math.ceil((moves.length + 1)/2);
  
  return `${fenPieces} ${turn[0]} ${privs} ${ept} ${halfmoves} ${moveNumber}`;
};

export const calculateLegalMoves = (pieces, turn, moves, moveFrom)=> {

  const FEN = calculateFEN(pieces, turn, moves);
  
  const allMoves = new Chess(FEN).moves({ verbose: true });

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

export const isGameOver = ({ pieces, turn, moves })=> {
  const matrixPieces = Array(8).fill(0).map((_,i)=> pieces.slice(i*8, i*8+8));
  
  const FEN = calculateFEN(matrixPieces, turn, moves);
  
  return (new Chess(FEN)).game_over();
};

export const castleAsKingMove = move => (
  move === 'O-O' ? 'Ke1g1' :
  move === 'O-O-O' ? 'Ke1c1' :
  move === 'o-o' ? 'ke8g8' :
  move === 'o-o-o' ? 'ke8c8' :
  move
);

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
