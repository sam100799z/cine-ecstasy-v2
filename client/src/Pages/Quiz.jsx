import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import QuitQuiz from '../Components/QuitQuiz';
import domain from '../domain/domain.js';
const Quiz = () => {
  const navigate = useNavigate();
  const [warnings, setWarnings] = useState(0);


  useEffect(() => {
    // Define the visibility change handler
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setWarnings((prev) => {
          const newWarnings = prev + 1;

          if (newWarnings >= 3) {
            alert("You have reached max warnings count. Redirecting to dashboard...");
            navigate('/dashboard'); // Navigate after 3 warnings
          } else {
            alert(`Please don't leave the page! Otherwise you will be redirected to the dashboard. Warning Count: ${newWarnings}/3`);
          }

          // Return the updated count
          return newWarnings;
        });
      }
    };

    // Add the event listener
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup: remove the event listener when component unmounts
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);




  // Create references for sound effects
  const correctSoundRef = useRef(new Audio('./correct.mp3')); // Path to correct sound file
  const incorrectSoundRef = useRef(new Audio('./incorrect.wav')); // Path to incorrect sound file
  const playCorrectSound = () => {
    correctSoundRef.current.currentTime = 0; // Reset sound to the beginning
    correctSoundRef.current.play().catch(error => {
      console.error("Error playing correct sound:", error);
    });
  };
  const playIncorrectSound = () => {
    incorrectSoundRef.current.currentTime = 0; // Reset sound to the beginning
    incorrectSoundRef.current.play().catch(error => {
      console.error("Error playing incorrect sound:", error);
    });
  };

  const [ans, setAns] = useState([]);
  const [score, setScore] = useState(0);
  const [triviaData, setTriviaData] = useState({});
  const [options, setOptions] = useState([]);
  const [feedbackText, setFeedbackText] = useState('');
  const [qNumber, setQNumber] = useState(1); // New state for question number
  const [hint, setHint] = useState(false);


  const { userEmail } = useAuth();


  const answer = async () => {
    await fetch(`${domain}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        questionId: triviaData.questionId,
        ans: ans
      }),
      credentials: 'include'
    }).then(async (res) => {

      const data = await res.json();
      const scoreData = data.score;

      if (data.success) {
        setScore(scoreData); // Increase score if correct
        setFeedbackText('Correct!'); // Set feedback to "Correct!"
        playCorrectSound();
      } else {
        setFeedbackText('Incorrect!'); // Set feedback to "Incorrect!" if wrong
        playIncorrectSound();
      }

      // Delay for feedback display, then fetch the next question
      setTimeout(fetchTriviaData, 1500); // Wait 1.5s for feedback to show
    })
  }

  const fetchTriviaData = async () => {
    setFeedbackText(''); // Reset feedback text
    try {
      const response = await fetch(`${domain}/quiz`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            userEmail: userEmail
          }),
          credentials: 'include',
        }
      ); // Adjust this to the correct backend API endpoint
      const data = await response.json();
      if (!data) {
        throw new Error('Data not found');
      }
      if (data.error) {
        alert("Error: " + data.error); // Display error to the user
        navigate('/dashboard'); // Redirect to dashboard
        return;
      }
      if (data.message === "Quiz round complete") {
        // Navigate to the dashboard and display the score
        setScore(data.score);
        alert("Quiz round complete. Your score is: " + data.score);
        navigate('/dashboard');
      } else {
        setTriviaData(data);
        setOptions(data.choices);
        setAns('');
        setQNumber(data.qNumber); // Update the question number state
      }

    } catch (error) {
      console.error('Error fetching trivia data:', error);
      alert('Error loading quiz. Returning to dashboard.');
      navigate('/dashboard');
    }
  };



  // Fetch trivia data when the component mounts
  useEffect(() => {
    fetchTriviaData();
  }, []);

  const renderTrivia = () => {
    if (triviaData.type === 'movie') {
      return (
        <section className='mt-8 w-full max-w-[900px] mx-auto'>
          <div className="trivia-section border-0 py-8 px-6 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl shadow-lg">
            <p className="text-white text-base uppercase font-light mb-1 tracking-wider">Question {qNumber} of 10</p>
            <h2 className="mb-2 font-bungee text-sm text-white tracking-wide">Score: {score}</h2>
            <p className="text-white font-light mt-4 text-lg leading-relaxed tracking-wider mb-4">{hint ? triviaData.info : triviaData.plot}</p>
            <p className="text-customYellow cursor-pointer w-fit font-semibold mt-4 text-sm tracking-widest mb-4" onClick={() => setHint(!hint)}>
              {hint ? 'Plot' : 'Hint'}
            </p>
            <div className="inputs flex flex-col md:flex-row justify-between mt-4">
              <input
                type="text"
                className="w-full md:w-[500px] p-4 bg-gray-100 rounded-lg border border-gray-300 focus:ring-2 focus:ring-customYellow focus:outline-none mb-4 md:mb-0"
                placeholder="Enter Movie Title"
                onChange={(e) => setAns(e.target.value)}
                value={ans}
              />
              <button onClick={answer} className="w-full md:w-[200px] py-3 bg-customYellow text-gray-900 cursor-pointer font-bold rounded-lg hover:bg-yellow-300 transition duration-300">
                Action!!!
              </button>
            </div>
            {feedbackText && (
              <p className={`text-xl pl-2 mt-4 font-bold ${feedbackText === 'Correct!' ? 'text-green-500' : 'text-red-500'}`}>
                {feedbackText}
              </p>
            )}
          </div>
        </section>
      );
    } else {
      return (
        <section className='mt-8 w-full max-w-[900px] mx-auto'>
          <div className="trivia-section py-8 px-6 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl shadow-lg">
            <p className="question-number text-lg text-white font-light mb-1 tracking-wider">Question {qNumber} of 10</p>
            <h2 className="mb-2 font-bungee text-white tracking-wide">Score: {score}</h2>
            <p className="trivia-question text-lg mt-4 text-white mb-2 leading-relaxed">{triviaData.question}</p>
            <ul className="trivia-answers flex flex-col md:flex-row gap-5 max-md:gap-2 mt-4">
              {options.map((option, index) => (
                <li
                  key={index}
                  className={`text-white text-base 
                      max-md:text-sm
                    cursor-pointer ${ans === option ? 'text-yellow-200' : ''}`}
                  onClick={() => setAns(option)}
                >
                  {option}
                </li>
              ))}
            </ul>
            <button onClick={answer} className="rounded w-full md:w-[12%] h-12 mt-3 text-xs bg-customYellow font-bungee">
              Action!!!
            </button>
            {feedbackText && (
              <p className={`text-xl mt-2 font-bold ${feedbackText === 'Correct!' ? 'text-green-500' : 'text-red-500'}`}>
                {feedbackText}
              </p>
            )}
          </div>
        </section>
      );
    }
  };

  return (
    <section id='quiz-section' className='bg-hero-pattern min-h-screen pt-10 pb-5'>
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-[7rem] max-sm:text-[4rem] max-md:text-[5rem] font-bungeeShade text-customYellow leading-tight tracking-tight md:leading-[120px] max-md:leading-[75px] max-lg:text-center ">
          Cine Ecstasy
        </h1>
        <h2 className="text-4xl md:mt-5 sm:mt-3 max-sm:mt-2 max-sm:text-2xl max-md:text-3xl font-bungee text-white tracking-wide leading-tight">
          Cinephiles assemble!!
        </h2>
        {renderTrivia()}
        <QuitQuiz />
      </div>
    </section>
  );


}

export default Quiz;
