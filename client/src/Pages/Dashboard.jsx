import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import Logout from '../Components/Logout';
import user from '../assets/user.png'
import leaderboard from '../assets/podium.png'

const Dashboard = () => {
    const navigate = useNavigate();
    const [quizHistory, setQuizHistory] = useState([]);
    const [averageScore, setAverageScore] = useState(0);
    const [showFullHistory, setShowFullHistory] = useState(false);

    const { userEmail, userName, userCity, userState, userCityRank, userStateRank, userAirRank, refreshUserInfo} = useAuth();

    console.log(userName)


    const fetchQuizHistory = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/quiz-history',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json'
                    },
                    body: JSON.stringify({
                        userEmail: userEmail
                    }),
                    credentials: 'include'
                }
            );
            if (response.ok) {
                const data = await response.json();
                // console.log(data.quizHistory);
                setQuizHistory(data.quizHistory);
            } else {
                console.error('Failed to fetch data:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error fetching quiz history:', error);
        }
    };

    // Calculate the average score based on quiz history
    const calculateAverageScore = () => {
        if (quizHistory.length === 0) return 0;
        const totalScore = quizHistory.reduce((acc, quiz) => acc + quiz.score, 0);
        return (totalScore / quizHistory.length).toFixed(1);
    };

    // Fetch quiz history when component mounts
    useEffect(() => {
        fetchQuizHistory();
        refreshUserInfo();
    }, []);

    // Toggle between showing full history and top 5 only
    const toggleHistoryView = () => {
        setShowFullHistory(!showFullHistory);
    };

    // Recalculate the average score when quiz history updates
    useEffect(() => {
        if (quizHistory.length > 0) {
            setAverageScore(calculateAverageScore());
        }
    }, [quizHistory]);



    return (
        <div className="flex flex-col min-h-screen items-center bg-gray-900 py-6 px-5">
            {/* nav menu */}
            <div className="user mb-6 flex max-md:w-[100%] md:flex-row w-full max-w-[750px] justify-between items-center">
                <div onClick={() => navigate('/account')} className='cursor-pointer flex justify-center items-center gap-1'>
                    <img className='w-[16px]' src={user} alt="" />
                    <p className='text-customYellow text-sm'>{userEmail}</p>
                </div>
                <div onClick={() => navigate('/leaderboard')} className='cursor-pointer flex justify-center items-center gap-1'>
                    <img className='w-[16px]' src={leaderboard} alt="" />
                    <p className='text-customYellow text-sm cursor-pointer' >Leaderboard</p>
                </div>

                <Logout />
            </div>
            {/* Welcome Message */}
            <div className="welcome flex max-md:w-[100%] md:flex-row w-full max-w-[750px] justify-between items-center">
                <div className="heading flex flex-col">
                    <h1 className="text-xl md:text-2xl font-bold text-white">Hello,</h1>
                    <h1 className="text-xl md:text-2xl font-bold text-white">{userName}</h1>
                </div>
                <div className="average-score text-left mb-4 md:mb-0">
                    <h1 className="text-xl text-right md:text-2xl font-bold text-white">{quizHistory.length === 0 ? "NA" : averageScore}</h1>
                    <h1 className="text-xl md:text-2xl font-bold text-white">Avg. Score</h1>
                </div>
                <div className="heading flex flex-col">
                    <h1 className="text-xl text-right md:text-2xl font-bold text-white">{userCity},</h1>
                    <h1 className="text-xl md:text-2xl text-right font-bold text-white">{userState}</h1>
                </div>
            </div>


            <div className="score-category flex md:flex-row items-center justify-between w-full max-w-[750px] mx-auto mt-10 mb-6 max-md:w-[100%] tracking-widest">
                <div className="average-score text-left mb-4 md:mb-0">
                    <p className="text-2xl font-bungee font-semibold text-customYellow">
                        {quizHistory.length === 0 ? "NA" : userCityRank}
                    </p>
                    <h2 className="text-sm font-light tracking-widest text-white uppercase">City Rank</h2>
                </div>
                <div className="category text-right">
                    <p className="text-2xl font-bungee font-semibold text-customYellow">
                        {quizHistory.length === 0 ? "NA" : userStateRank}
                    </p>
                    <h2 className="text-sm font-light tracking-widest text-white uppercase">State Rank</h2>
                </div>
                <div className="category text-right">
                    <p className="text-2xl font-bungee font-semibold text-customYellow">
                        {quizHistory.length === 0 ? "NA" : userAirRank}
                    </p>
                    <h2 className="text-sm font-light tracking-widest text-white uppercase">AIR</h2>
                </div>
            </div>


            {/* Quiz History */}
            {quizHistory.length > 0 ? (
                <div className="mb-10 mx-auto w-full max-w-[750px]">
                    <h2 className="text-2xl mb-2 text-white font-semibold">Your Quiz History</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left bg-white shadow-lg">
                            <thead className="text-gray-800">
                                <tr>
                                    <th className="py-3 px-6 font-bold uppercase">Date</th>
                                    <th className="py-3 px-6 font-bold uppercase">Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(showFullHistory ? quizHistory : quizHistory.slice(0, 5)).map((quiz, index) => (
                                    <tr key={index} className="bg-gray-200 hover:bg-white">
                                        <td className="py-4 px-6 border-b">{new Date(quiz.date).toLocaleDateString()}</td>
                                        <td className="py-4 px-6 border-b">{quiz.score}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button
                        onClick={toggleHistoryView}
                        className={`mt-4 text-customYellow hover:text-yellow-400 transition duration-200
                        ${quizHistory.length <= 5 ? 'hidden' : ''}`}
                    >
                        {showFullHistory ? 'View Less' : 'View All'}
                    </button>
                </div>
            ) : (
                <div className="text-center mt-5">
                    <p className="text-white font-medium text-xl">
                        Click the button below and start your cinephile adventure!
                    </p>
                </div>
            )}

            {/* Start New Quiz Button */}
            <button
                onClick={async () => {
                    const isConfirmed = window.confirm("Do not switch any tabs or windows or open any new ones.");

                    if (isConfirmed) {
                        await fetch('http://localhost:3000/reset-session', { method: 'POST', credentials: 'include' });
                        navigate('/quiz', { replace: true });
                    } else {
                        alert("You are still in the dashboard.");
                    }
                }}
                className="mt-4 mb-10 w-full max-w-[300px] bg-customYellow text-gray-900 font-semibold py-3 rounded-lg hover:scale-105 transition transform duration-300"
            >
                Let's Play!
            </button>

        </div>
    );

};

export default Dashboard;
