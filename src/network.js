import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBYmDjRwfF_N_AMLMpiGeHG8EQ0Z5XqF4g",
  authDomain: "chess-a2fd2.firebaseapp.com",
  databaseURL: "https://chess-a2fd2.firebaseio.com",
  projectId: "chess-a2fd2",
  storageBucket: "chess-a2fd2.appspot.com",
  messagingSenderId: "403764684530",
  appId: "1:403764684530:web:dd219fd536f31452c7526b",
  measurementId: "G-BC7K5Q9W4Y"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

export const auth = firebase.auth;
export const db = firebase.firestore();

export const loginWithGithub = ()=>
  auth().signInWithPopup( new auth.GithubAuthProvider() );

export const loadGames = (userId='6264797')=>
  Promise.all([
    db.collection('games')
      .where('w', '==', userId).get()
      .then(snap => snap.docs),

    db.collection('games')
      .where('b', '==', userId).get()
      .then(snap => snap.docs)
  ]).then(g => g.flat());

export const createGame = ()=>
  db.collection('games').add({
    "timeRules": "3|2",
    "stakes": "tree fiddy",
    "pieces": [
      'R','N','B','Q','K','B','N','R',
      'P','P','P','P','P','P','P','P',
      '','','','','','','','',
      '','','','','','','','',
      '','','','','','','','',
      '','','','','','','','',
      'p','p','p','p','p','p','p','p',
      'r','n','b','q','k','b','n','r',
    ],
    "moves": [],
    "b": "50657694",
    "w": "6264797",
    "bname": "dan",
    "wname": "nik"
  })
    .then(()=> console.log('Document successfully written!'))
    .catch((error)=> console.error('Error writing document: ', error));
