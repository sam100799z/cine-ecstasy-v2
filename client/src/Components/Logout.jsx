import React from 'react'
import { useAuth } from '../Context/AuthContext'
import { useNavigate } from 'react-router-dom';

const Logout = () => {

    const { setIsLoggedIn, setUserEmail, setUserName } = useAuth();
    const navigate = useNavigate();

    const logout = async () => {
        try {
            const response = await fetch('http://localhost:3000/logout', {
                method: 'POST',
                credentials: 'include' // ensures cookies are sent with the request
            });

            if (response.ok) {
                // Clear any client-side authentication state if needed
                setIsLoggedIn(false); // Example state update
                setUserName("");
                setUserEmail("");
                alert("Logout successful"); 
                navigate('/');
            } else {
                alert("Logout failed");
            }
        } catch (error) {
            alert("An error occurred during logout: " + error);
        }
    }

    return (
        <div>
            <button onClick={logout} className='text-customYellow border-customYellow text-sm border-2 px-2 rounded-md py-1
        hover:bg-yellow-200 hover:text-black transition-all duration-300'>
                Logout</button>
        </div>
    )
}

export default Logout
