import firebase from 'firebase';

//api detalis

const firebaseConfig = {
    apiKey: "AIzaSyCfRz6z6-V9pOF8syUBFRaItpgRSXnuEXg",
    authDomain: "friendogsce.firebaseapp.com",
    databaseURL: "https://friendogsce.firebaseio.com",
    projectId: "friendogsce",
    storageBucket: "friendogsce.appspot.com",
    messagingSenderId: "345855826222",
    appId: "1:345855826222:web:bf27e494f5d07030aa02bf",
    measurementId: "G-RCQDJTBKMG"
  };

firebase.initializeApp(firebaseConfig);
passwordReset: email => {
  return firebase.auth().sendPasswordResetEmail(email)
}



export const f = firebase;
export const database = firebase.database();
export const auth = firebase.auth();
export const storage = firebase.storage();