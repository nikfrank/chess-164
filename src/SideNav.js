import React, { useState, useEffect } from 'react';
import './SideNav.scss';
import githubLogo from './github.svg'

import StaticBoard from './StaticBoard';

import { loginWithGithub, loadGames, loadChallenges } from './network';

function SideNav({ user, onSelectGame }) {
  const [open, setOpen] = useState(!false);
  const [nickname, setNickname] = useState(localStorage.nickname || '');
  const [myGames, setMyGames] = useState([]);
  const [currentTab, setCurrentTab] = useState('games-list');
  const [challenges, setChallenges] = useState([]);
  
  useEffect(()=>{
    if( user && (currentTab === 'games-list') )
      loadGames(user.providerData[0].uid)
      .then((games)=> setMyGames(games.filter(game => game.w && game.b)))
      .catch(e => console.error(e) )
  }, [user, currentTab]);

  useEffect(()=> {
    if( user && (currentTab === 'join-list') )
      loadChallenges()
      .then( cs=> setChallenges(cs) )
      .catch(e => console.error(e) )
  }, [user, currentTab]);

  useEffect(()=>{ localStorage.nickname = nickname }, [nickname]);
  
  const toggle = ()=> setOpen(o => !o);

  const joinGame = (id)=>{
    console.log(id);
    // call network joinGame
  };

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

      {user && (
         <div className='tabs-headers'>
           <div onClick={()=> setCurrentTab('games-list')}
                className={currentTab === 'games-list' ? 'selected' : ''}>
             Games List
           </div>
           <div onClick={()=> setCurrentTab('join-list')}
                className={currentTab === 'join-list' ? 'selected' : ''}>
             Open Challenges
           </div>
         </div>
       )}
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
                 {challenges.map((challenge)=> (
                    <div key={challenge.id} onClick={()=> joinGame(challenge.id)}>
                      {challenge.wname || 'OPEN'} v {challenge.bname || 'OPEN'}
                      <StaticBoard pieces={challenge.pieces} turn={challenge.turn}
                                   flipped={user.providerData[0].uid === challenge.b}/>
                    </div>
                  ))}
               </div>
             )}
               
    </div>
  );
}

export default SideNav;
