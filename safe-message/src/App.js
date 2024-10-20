import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';


const API_KEY = 'AIzaSyBzMk_f1U9ZTBtJspjNoDvligm3oQ5i2fc';
const DISCOVERY_URL = 'https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=' + API_KEY;
const firebaseConfig = {
  apiKey: "AIzaSyBDmaXruX5m01ZeUILvmzFmpSxISvyjoAE",
  authDomain: "safe-message-92d0c.firebaseapp.com",
  projectId: "safe-message-92d0c",
  storageBucket: "safe-message-92d0c.appspot.com",
  messagingSenderId: "624996171528",
  appId: "1:624996171528:web:8eb1b7e37670ac2fd9b6bd",
  measurementId: "G-YPSY61TH57"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Safe Message</h1>
        <SignOut />
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

const validateMessage = async (str) => {
  try {

    const requestBody = {
      comment: { text: str },
      languages: ['en'], 
      requestedAttributes: {
        TOXICITY: {},
        INSULT: {},
        PROFANITY: {},
        THREAT: {}
      }
    };

    const response = await fetch(DISCOVERY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    const scores = {
      toxicity: data.attributeScores.TOXICITY.summaryScore.value,
      insult: data.attributeScores.INSULT.summaryScore.value,
      profanity: data.attributeScores.PROFANITY.summaryScore.value,
      threat: data.attributeScores.THREAT.summaryScore.value,
    };
    console.log(scores);

    const threshold = 0.7;

    const isInappropriate = Object.values(scores).some(score => score >= threshold);

    return !isInappropriate; 
  } catch (error) {
    console.error('Error validating message:', error);
    return false; 
  }
};

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  return (
    <>
      <img src={require("./cat.jpg")} className="cat"></img>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <p>Do not violate the community guidelines! <br></br> <br></br>
      Our project was made using React and the Google PerspectiveAPI.</p>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => signOut(auth)}>
        Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = collection(firestore, 'messages');
  const q = query(messagesRef, orderBy('createdAt'), limit(25));
  
  const [messages] = useCollectionData(q, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();
  
    if (await validateMessage(formValue)) {
      const { uid, photoURL } = auth.currentUser;
  
      await addDoc(messagesRef, {
        text: formValue,
        createdAt: serverTimestamp(),
        uid,
        photoURL,
      });
  
      setFormValue('');
      dummy.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      alert('Your message contains inappropriate content. Please revise it.');
    }
  };

  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </main>
      <form onSubmit={sendMessage}>
        <input 
          value={formValue} 
          onChange={(e) => setFormValue(e.target.value)} 
          placeholder="Say something nice" 
        />
        <button type="submit" disabled={!formValue}>Send</button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="Avatar" />
      <p>{text}</p>
    </div>
  );
}

export default App;