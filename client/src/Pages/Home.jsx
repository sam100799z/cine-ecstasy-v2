import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [triviaData, setTriviaData] = useState(null);
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [loading, setLoading] = useState(true); // New loading state

    useEffect(() => {
        // diff approach then local storage as we are using httpOnly cookie
        // Call the authentication check endpoint
        const checkAuthentication = async () => {
            try {
                const response = await fetch('http://localhost:3000/isAuthenticated', {
                    method: 'GET',
                    credentials: 'include', // This ensures cookies are sent along with the request
                });

                const data = await response.json();

                if (data.isAuthenticated) {
                    setIsLoggedIn(true);
                } else {
                    setIsLoggedIn(false);
                }
            } catch (error) {
                console.error('Error checking authentication:', error);
                setIsLoggedIn(false);
            }
        };

        checkAuthentication();
    }, []);

    const redirect = () => {
        if (isLoggedIn) {
            navigate('/dashboard');
        }
        else {
            navigate('/login');
        }
    }

    const fetchTriviaData = async () => {

        setLoading(true); // Set loading to true when fetching starts

        try {
            const quoteResponse = await fetch(
                "https://api.api-ninjas.com/v1/quotes?category=movies",
                {
                    headers: {
                        "X-Api-Key": "ajw96XuemSMOT+tVzGeTlw==bn9lhhIpZo3oBFfg",
                    },
                }
            );
            let data = await quoteResponse.json();
            let quoteData = data[0];

            const occupationResponse = await fetch(
                "https://api.api-ninjas.com/v1/celebrity?name=" + quoteData.author,
                {
                    headers: {
                        "X-Api-Key": "ajw96XuemSMOT+tVzGeTlw==bn9lhhIpZo3oBFfg",
                    }
                }
            );
            let data2 = await occupationResponse.json();
            const occupationData = data2[0]?.occupation[0] || null;

            const data3 =
            {
                type: 'quote',
                quote: quoteData.quote,
                author: quoteData.author,
                occupation: occupationData,
            }
            setTriviaData(data3);

            setLoading(false); // Set loading to false when data is fetched

        } catch (error) {
            console.error('Error fetching trivia data:', error);

            setLoading(false); // Set loading to false in case of an error

        }
    };

    useEffect(() => {
        fetchTriviaData();
    }, []);

    const renderTrivia = () => {
        if (!triviaData) return null;
        return (
            <div className="mt-6 max-w-[850px] border-white bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                <p className="tracking-[2.5px] italic font-serif text-sm leading-6 font-light text-white">
                    "{triviaData.quote}"
                </p>
                <p className="font-medium text-[11px] tracking-[2.5px] mt-2 text-white">
                    - {triviaData.author}, <span className="italic">{triviaData.occupation}</span>
                </p>
            </div>
        );
    };


    const renderLoadingSpinner = () => (
        <div className="flex justify-center items-center mt-6">
            <div className="w-20 h-20 border-t-4 border-blue-600 border-solid rounded-full animate-spin"></div>
        </div>
    );


    return (
        <section className="flex flex-col min-h-screen items-center py-12 bg-cover bg-hero-pattern">
            <div className="text-center">
                <h1 className="text-[5rem] md:text-[7rem] lg:text-[9rem]
                    lg:leading-[150px] md:leading-[120px] leading-[80px]
                text-customYellow font-bungeeShade">Cine Ecstasy</h1>
                <h2 className="text-xl lg:mt-4 md:mt-3 mt-3 md:text-2xl lg:text-3xl text-gray-300 font-bungee">A place for cinephiles to hang out.</h2>
            </div>

            {/* Conditionally render loading spinner or trivia */}
            {loading ? renderLoadingSpinner() : renderTrivia()}

            <button
                onClick={redirect}
                className="mt-10 w-[300px] md:w-[400px] h-[50px] md:h-[60px] bg-customYellow text-black font-semibold rounded transition duration-300 transform hover:scale-110"
            >
                Let's Go!
            </button>
        </section>
    );


};

export default Home;
