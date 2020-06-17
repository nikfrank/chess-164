import React from 'react';
import './PlayerCard.scss';

function PlayerCard({ player: { id, nickname }={}}){
  if(!id) return null;
  return (
    <div className='PlayerCard'>
      <img alt='' src={'https://avatars3.githubusercontent.com/u/'+id} />
      <span>{nickname}</span>
    </div>
  );
}


export default PlayerCard;
