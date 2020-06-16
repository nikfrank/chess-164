import React, { useState, useEffect } from 'react';
import './SideNav.scss';
import githubLogo from './github.svg'

import StaticBoard from './StaticBoard';

import { loginWithGithub, loadGames } from './network';

function SideNav({ user, onSelectGame }) {
  const [open, setOpen] = useState(!false);
  const [nickname, setNickname] = useState(localStorage.nickname || '');
  const [myGames, setMyGames] = useState([]);
  const [currentTab, setCurrentTab] = useState('games-list');
  
  useEffect(()=>{
    if(user)
      loadGames(user.providerData[0].uid)
        .then((games)=> setMyGames(games))
        .catch(e => console.error(e) )
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
      
      <div className='tabs-headers'>
        <div onClick={()=> setCurrentTab('games-list')}>Games List</div>
        <div onClick={()=> setCurrentTab('join-list')}>Open Challenges</div>
      </div>

      {currentTab === 'games-list' && (
         <div className='games-list'>
           {myGames
             .map((game, i)=> (
               <div key={game.id} onClick={()=> onSelectGame(game.id)} className='static-game'>
                 {game.wname} vs {game.bname}
                 <StaticBoard pieces={game.pieces} turn={game.turn}
                              flipped={user.providerData[0].uid === game.b}/>
               </div>
             ))}
         </div>
      )}

      {currentTab === 'join-list' && (
         <div className='join-list'>
           load games with empty b / w
         </div>
      )}
      
    </div>
  );
}

export default SideNav;
