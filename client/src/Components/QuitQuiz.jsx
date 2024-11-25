import React from 'react'
import { useNavigate } from 'react-router-dom';
import domain from '../domain/domain.js';

const QuitQuiz = () => {

    const navigate = useNavigate();

    const reset = async () => {
        const isConfirmed = window.confirm("Are you sure you want to quit the quiz? This will reset your session.");

        if (!isConfirmed) return; // Exit if the user cancels the dialog
        try {
            const response = await fetch(`${domain}/reset-session`, {
                method: 'POST',
                credentials: 'include'
            })
            let data = await response.json();
            if (data.message === "Session reset successfully.") {
                alert("Session reset successfully.");
                navigate('/dashboard', { replace: true });
            }
            else {
                alert("Session reset failed." + data.error);
            }
        } catch (error) {
            alert("An error occurred during logout: " + error);
        }
    }

    return (
        <div>
            <button onClick={reset} className='text-white px-4 rounded-md py-2
        hover:underline transition-all duration-300
        mt-4 w-[200px]'>
                Quit the Quiz</button>
        </div>
    )
}

export default QuitQuiz
