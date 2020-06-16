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

