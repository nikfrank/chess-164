import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
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
export const db = firebase.database();

export const loginWithGithub = ()=>
  auth().signInWithPopup( new auth.GithubAuthProvider() );
