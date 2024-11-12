import { createContext, useContext } from "react";


// making a context 
const AuthContext = createContext(
    {
        userName: "sam",
        userEmail: "Rr5BZ@example.com",
        userCity: "Pune",
        userState: "Maharashtra",
        isLoggedIn: false,
        userCityRank: 0,
        userStateRank: 0,
        userAirRank: 0,

        setUserName: () => {},
        setUserEmail: () => {},
        setUserCity: () => {},
        setUserState: () => {},
        setIsLoggedIn: () => {},
        setUserCityRank: () => {},
        setUserStateRank: () => {},
        setUserAirRank: () => {},
        refreshUserInfo : () => {}
    }
);


// context provider
const AuthProvider = AuthContext.Provider;

// custom hook
const useAuth = () => useContext(AuthContext);

export { useAuth, AuthProvider }