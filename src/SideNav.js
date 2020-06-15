import React, { useState, useEffect } from 'react';
import './SideNav.scss';
import githubLogo from './github.svg'

import { loginWithGithub, loadGames } from './network';

function SideNav({ user, onSelectGame }) {

  const [open, setOpen] = useState(!false);
  const [nickname, setNickname] = useState(localStorage.nickname || '');
  const [myGames, setMyGames] = useState([]);
  
  useEffect(()=>{
    loadGames().then((games)=>{
      setMyGames(games);

      //createGame();
    }).catch(e => console.error(e) );
  }, [user]);

  useEffect(()=>{ localStorage.nickname = nickname }, [nickname]);
  
  const toggle = ()=> setOpen(o => !o);

  return (
    <div className={'SideNav '+(open ? 'open' : 'closed')}>
      <div className='toggle' onClick={toggle}/>
      <div className='login-container'>
        {!user? (
           <button className='login' onClick={loginWithGithub}>
             Login with <img src={githubLogo} draggable='false' alt=''/>
           </button>
         ) : (
           <>
             <img src={user.photoURL} alt='' />
             <input placeholder='Set Nickname'
                    value={nickname} onChange={e=> setNickname(e.target.value)}/>
           </>
         )}
      </div>
      <div>
        {myGames
          .map(g => g.data())
          .map((game, i)=> (
            <div key={i} onClick={()=> onSelectGame(myGames[i].id)}>
              {game.wname} vs {game.bname}
            </div>
          ))}
      </div>
    </div>
  );
}

export default SideNav;
