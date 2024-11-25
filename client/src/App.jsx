import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Home, Login, Quiz, Dashboard, AccountSettings, Leaderboard } from "./Pages";
import { useAuth, AuthProvider } from "./Context/AuthContext";
import domain from "./domain/domain.js";




function App() {
  const [loading, setLoading] = useState(true);

  // declaring the context props(states)
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userState, setUserState] = useState("");
  const [userCity, setUserCity] = useState("");
  const [userStateRank, setUserStateRank] = useState(0);
  const [userCityRank, setUserCityRank] = useState(0);
  const [userAirRank, setUserAirRank] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const location = useLocation();


  // calling the API and then populating the states
  const checkAuth = async () => {
    try {
      const response = await fetch(`${domain}/isAuthenticated`, {
        method: 'GET',
        credentials: 'include', // This ensures cookies are sent along with the request
      })
      let data = await response.json();
      console.log("Auth Res in App.jsx ", data);
      let logState = data.isAuthenticated;
      let name = data.userName;
      let email = data.userEmail;
      let state = data.userState;
      let city = data.userCity;
      setIsLoggedIn(logState);
      setUserEmail(email);
      setUserName(name);
      setUserCity(city);
      setUserState(state);
    } catch (error) {
      console.error('Error checking authentication:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }



  const fetchUserRanks = async () => {
    try {
      const cityResponse = await fetch(`${domain}/api/leaderboard?region=city&value=${userCity}`, {
        method: 'GET',
        credentials: 'include',
      });
      const cityData = await cityResponse.json();
      if (cityData.success) {
        setUserCityRank(cityData.userRank);
      } else {
        console.error('Failed to fetch city rank:', cityData.error);
        // alert(`Failed to fetch city rank: ${cityData.error}`);
      }
    } catch (error) {
      console.error('Error fetching city rank:', error);
      // alert('An error occurred while fetching city rank. Please try again later.');
    }

    try {
      const stateResponse = await fetch(`${domain}/api/leaderboard?region=state&value=${userState}`, {
        method: 'GET',
        credentials: 'include',
      });
      const stateData = await stateResponse.json();
      if (stateData.success) {
        setUserStateRank(stateData.userRank);
      } else {
        console.error('Failed to fetch state rank:', stateData.error);
        // alert(`Failed to fetch state rank: ${stateData.error}`);
      }
    } catch (error) {
      console.error('Error fetching state rank:', error);
      // alert('An error occurred while fetching state rank. Please try again later.');
    }

    try {
      const airResponse = await fetch(`${domain}/api/leaderboard?region=country&value=country`, {
        method: 'GET',
        credentials: 'include',
      });
      const airData = await airResponse.json();
      if (airData.success) {
        setUserAirRank(airData.userRank);
      } else {
        console.error('Failed to fetch All India rank:', airData.error);
        // alert(`Failed to fetch All India rank: ${airData.error}`);
      }
    } catch (error) {
      console.error('Error fetching All India rank:', error);
      // alert('An error occurred while fetching All India rank. Please try again later.');
    }
  };


  const fetchUserDetails = async () => {
    await checkAuth();
    if (userCity && userState) {
      await fetchUserRanks();
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [location, userCity, userState]);


  const refreshUserInfo = async () => {
    await fetchUserDetails();
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="loader mb-4"></div>
          <p className="text-gray-600 text-lg font-semibold">Loading, please wait...</p>
        </div>
      </div>
    );
  }



  return (
    <AuthProvider value={{ userName, userEmail, isLoggedIn, setIsLoggedIn, setUserName, setUserEmail, userState, setUserState, userCity, setUserCity, userCityRank, userStateRank, userAirRank, setUserCityRank, setUserStateRank, setUserAirRank, refreshUserInfo }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to={"/login"} />} />
        <Route path="/quiz" element={isLoggedIn ? <Quiz /> : <Navigate to={"/login"} />} />
        <Route path="/account" element={isLoggedIn ? <AccountSettings /> : <Navigate to={"/login"} />} />
        <Route path="/leaderboard" element={isLoggedIn ? <Leaderboard /> : <Navigate to={"/login"} />} />
      </Routes>
    </AuthProvider>
  );
}

function WrappedApp() {
  return (
    <>
      <Router>
        <App />
      </Router>
    </>
  );
}

export default WrappedApp;
