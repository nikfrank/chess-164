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
