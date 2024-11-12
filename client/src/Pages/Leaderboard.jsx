import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import backButton from '../assets/left-arrow.png';
import { useNavigate } from 'react-router-dom';

const Leaderboard = () => {

    const navigate = useNavigate();

    const { userCity, userState, userEmail } = useAuth();
    const [leaderboard, setLeaderboard] = useState([]);

    const [userRank, setUserRank] = useState(null);
    const [userInfo, setUserInfo] = useState(null);

    const [region, setRegion] = useState('city');

    const fetchLeaderboard = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/leaderboard?region=${region}&value=${region === 'city' ? userCity : region === 'state' ? userState : 'country'}`, {
                method: 'GET',
                credentials: 'include', // To send cookies along with the request
            });

            if (!response.ok) {
                console.error('Failed to fetch leaderboard:', response.status);
                alert('Error fetching leaderboard. Please check your authentication.');
                return;
            }

            const data = await response.json();

            if (data.success) {
                setLeaderboard(data.leaderboard);
                setUserRank(data.userRank);
                setUserInfo(data.userInfo);
            } else {
                console.error('Failed to fetch leaderboard:', data.error);
                alert(data.error);
            }
        } catch (error) {
            console.error('Error parsing response as JSON:', error);
            alert('Error parsing response as JSON: ' + error);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, [region]);

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-900 py-10 px-5">
            {/* Toggle buttons */}
            <div className="flex gap-4 mb-6 text-customYellow font-bungee">
                <button className={`btn ${region === 'city' ? 'btn-active' : ''}`} onClick={() => setRegion('city')}>
                    City
                </button>
                <button className={`btn ${region === 'state' ? 'btn-active' : ''}`} onClick={() => setRegion('state')}>
                    State
                </button>
                <button className={`btn ${region === 'country' ? 'btn-active' : ''}`} onClick={() => setRegion('country')}>
                    India
                </button>
            </div>

            {/* back to dashboard */}
            <div onClick={() => navigate('/dashboard')} className='cursor-pointer flex items-center gap-2 px-3 mb-5 hover:bg-slate-800 justify-center rounded-md transition-all duration-300'>
                <div className="image">
                    <img src={backButton} alt="Back" className=" w-5" />
                </div>
                <p className=" text-white w-fit font-medium mt-4 text-base tracking-widest mb-4 underline" >Back to Dashboard</p>
            </div>

            {/* Leaderboard Table */}
            <div className="w-full max-w-[750px] bg-gray-800 p-5 rounded-lg shadow-md">
                <table className="w-full text-white">
                    <thead>
                        <tr>
                            <th className="py-2">Rank</th>
                            <th className="py-2">Name</th>
                            <th className="py-2">Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map((user, index) => (
                            <tr
                                key={user.email}
                                className={`${user.email === userEmail ? 'bg-slate-600 text-white' : ''}
                                ${user.quizCount===0 ? 'hidden' : ''} 
                                py-2`}
                            >
                                <td className="py-2 text-center">{index + 1}</td>
                                <td className="py-2 text-center">{user.name}</td>
                                <td className="py-2 text-center">{user.score.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {(userRank > 10 && userInfo.quizCount>0) && (
                    <div className="mt-4 bg-gray-800 p-4 rounded-lg text-white text-center">
                        <p>Your Rank: {userRank}</p>
                        <p>Your Score: {userInfo.score.toFixed(2)}</p>
                    </div>
                )}


            </div>

            
        </div>
    );
};

export default Leaderboard;
