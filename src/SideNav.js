import React, { useState, useEffect } from 'react';

import { loginWithGithub, loadGames } from './network';

function SideNav({ user, onSelectGame }) {

  const [open, setOpen] = useState(false);
  
  useEffect(()=>{
    loadGames().then((games)=>{
      console.log(games);

      //createGame();
    });
  }, [user])
  
  return (
    <div className={'SideNav '+(open ? 'open' : 'closed'}>
      {!user && <button onClick={loginWithGithub}>Login</button>}
    </div>
  );
}

export default SideNav;
