import React, { useState, useCallback, useEffect } from 'react';
import Board from './Board';
import PlayerCard from './PlayerCard';

import {
  initPieces,
  calculateLegalMoves,
  isMoveLegal,
  calculateBoardAfterMove,
} from './chess-util';
import Piece from 'react-chess-pieces';

import { db, syncMove } from './network';

const PromotionWidget = ({ turn, onPromote, flipped })=>{
  const promote = piece => e=> {
    e.stopPropagation();
    onPromote(piece);
  };
  
  return (
    <div className={'promotion-widget '+turn+' '+ (flipped? 'flipped':'')}>
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
  const [players, setPlayers] = useState([]);
  
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

        setPlayers([
          { id: g.w, nickname: g.wname },
          { id: g.b, nickname: g.bname },
        ]);
      } );
    }
  }, [remoteGame, user]);

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
      
    } else {
      setPromotion({ rank, file, move });
      setPiecesLocal(next.pieces);
    }    
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
    const nextMoves = [...moves, promotion.move.slice(0, -1) + piece.toLowerCase()];
    setMoves(nextMoves);
  }, [promotion, turn, pieces, moves, setMoves, setPieces, setTurn]);

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
    <>
    <PlayerCard player={ flipped ? players[0] : players[1]} />
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
        promotionWidget={promotion && <PromotionWidget turn={turn} onPromote={onPromote} flipped={flipped}/>}
    />
    
    <PlayerCard player={ flipped ? players[1] : players[0]} />
    </>
  );
};

export default Game;
