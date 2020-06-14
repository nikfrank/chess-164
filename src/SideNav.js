import React, { useState, useEffect } from 'react';
import './SideNav.scss';

import { loginWithGithub, loadGames } from './network';

function SideNav({ user, onSelectGame }) {

  const [open, setOpen] = useState(false);
  const [myGames, setMyGames] = useState([]);
  
  useEffect(()=>{
    loadGames().then((games)=>{
      setMyGames(games);

      //createGame();
    }).catch(e => console.error(e) );
  }, [user]);

  const toggle = ()=> setOpen(o => !o);
  
  return (
    <div className={'SideNav '+(open ? 'open' : 'closed')}>
      <div className='toggle' onClick={toggle}/>
      {!user && <button onClick={loginWithGithub}>Login</button>}
      <div>
        {myGames
          .map(g => g.data())
          .map((game, i)=> (
            <div key={i} onClick={()=> onSelectGame(myGames[i])}>
              {game.wname} vs {game.bname}
            </div>
          ))}
      </div>
    </div>
  );
}

export default SideNav;
