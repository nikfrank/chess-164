import React, { useState, useCallback, useEffect } from 'react';
import Board from './Board';

import { initPieces, calculateLegalMoves } from './chess-util';
import Piece from 'react-chess-pieces';

import { db } from './network';

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

const Game = ({ remoteGame, user })=>{
  const [pieces, setPiecesLocal] = useState(initPieces);
  const [selected, setSelected] = useState({});
  const [turn, setTurnLocal] = useState('w');
  const [moves, setMovesLocal] = useState([]);
  const [promotion, setPromotion] = useState(null);
  const [legalMovesDisplay, setLegalMovesDisplay] = useState({});
  const [flipped, setFlipped] = useState(false);

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
  }, [remoteGame, user]);

  const onMove = useCallback(({ rank, file }, moveFrom=selected)=>{
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
      
    if( !legalMoves.includes(move) ) return;
    setLegalMovesDisplay({});

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

    setSelected({});

    if(!promoting){
      setTurn(turn === 'w' ? 'b' : 'w');
      setMoves([...moves, move]);
      
    } else setPromotion({ rank, file, move });
    
  }, [selected, moves, pieces, turn, setMoves, setPieces, setTurn]);


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
  }, [promotion, turn, pieces, setMoves, setPieces, setTurn]);

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
    // noop
  };

  const onDragEnd = (start, end)=> {
    if( start.rank === end.rank && start.file === end.file )
      onSelect({ ...start, piece: start.type });
    else
      onMove(end, { ...start, piece: start.type });
  };
  
  const onDragStart = showLegalMoves;
  const onDragHover = ({ start, hovering })=> console.log('drag hover');
  const onRightClick = ({ rank, file, piece })=> console.log('right click');

  return (
    <Board
        flipped={flipped}
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
};

export default Game;
