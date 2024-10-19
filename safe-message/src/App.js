import React, { useRef, useState } from 'react';
import './App.css';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBDmaXruX5m01ZeUILvmzFmpSxISvyjoAE",
  authDomain: "safe-message-92d0c.firebaseapp.com",
  projectId: "safe-message-92d0c",
  storageBucket: "safe-message-92d0c.appspot.com",
  messagingSenderId: "624996171528",
  appId: "1:624996171528:web:8eb1b7e37670ac2fd9b6bd",
  measurementId: "G-YPSY61TH57"
};
const app = initializeApp(firebaseConfig);
const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();

function App() {
  return (
    <div className="App">
      {user ? <ChatRoom></ChatRoom> : <SignIn></SignIn>}
    </div>
  );
}

function SignIn() {
  SignInWIthGoogle = () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider);
  }
  return (
      <button onClick={useSignInWithGoogle()}>Sign In With Google</button>
  )
}

export default App;
