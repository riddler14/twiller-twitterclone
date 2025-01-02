import { createContext, useContext, useEffect, useState } from "react";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";
import { auth } from "./firebase";

 const userAuthContext = createContext();

export function UserAuthContextProvider({children} ) {
    const [user, SetUser] = useState({});

    function logIn(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }
    function signin(email, password) {
        return createUserWithEmailAndPassword(auth, email, password)
        
        //  createUserWithEmailAndPassword(auth, email, password)
        //  .then((userCredential) => {
        //     // Signed up 
        //     const user = userCredential.user;
        //     // ...
        //   })
        //   .catch((error) => {
        //     const errorCode = error.code;
        //     const errorMessage = error.message;
        //     console.log(errorCode,errorMessage)
        //     // ..
        //   });
    }
    function logOut() {
        return signOut(auth);
    }
    function googleSignin() {
        const googleAuthProvider = new GoogleAuthProvider();
        return signInWithPopup(auth, googleAuthProvider);
    }

    useEffect(() => {
        const Unsubscribe = onAuthStateChanged(auth, (currentuser) => {
            console.log("Auth", currentuser);
            SetUser(currentuser);
        });

        return () => {
            Unsubscribe();
        };
    }, []);

    return (
        <userAuthContext.Provider
            value={{ user, logIn, signin, logOut, googleSignin }}
        >
            {children}
        </userAuthContext.Provider>
    );
}
// export default UserAuthContextProvider
export function useUserAuth() {
    return useContext(userAuthContext);
}