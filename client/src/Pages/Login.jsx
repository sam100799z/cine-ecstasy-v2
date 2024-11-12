
import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import LocationDropdown from '../Components/LocationDropdown';

const Login = () => {
  const { register, handleSubmit, setValue } = useForm();
  const navigate = useNavigate();

  const [signIn, setSignIn] = useState(() => {
    const savedState = localStorage.getItem('signIn');
    return savedState ? JSON.parse(savedState) : true;
  });

  useEffect(() => {
    localStorage.setItem('signIn', JSON.stringify(signIn));
  }, [signIn]);

  const onSubmit = async (data) => {
    const endpoint = signIn ? 'register' : 'login';
    const response = await fetch(`http://localhost:3000/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(data),
      credentials: 'include'
    });

    const result = await response.json();

    if (result.success) {
      navigate('/dashboard');
    } else {
      alert(result.error);
    }



  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <form
        className="bg-white shadow-lg rounded-lg p-8 max-w-[95%] md:max-w-[50%] w-full"  // Increased widths here
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className="text-4xl font-bold text-center font-bungee mb-6 text-gray-900 leading-tight">
          {signIn ? 'Register' : 'Login'}
        </h2>

        {signIn && (
          <div>
            <div className="mb-4">
              <input
                placeholder="Name"
                type="text"
                className="w-full p-4 bg-gray-100 rounded-lg border border-gray-300 focus:ring-1 focus:ring-customYellow focus:outline-none"
                {...register("name")}
              />
            </div>
            <LocationDropdown register={register} setValue={setValue} />
          </div>
        )}

        <div className="mb-4">
          <input
            placeholder="Email"
            type="email"
            className="w-full p-4 bg-gray-100 rounded-lg border border-gray-300 focus:ring-1 focus:ring-customYellow focus:outline-none"
            {...register("email")}
          />
        </div>

        <div className="mb-6">
          <input
            placeholder="Password"
            type="password"
            className="w-full p-4 bg-gray-100 rounded-lg border border-gray-300 focus:ring-1 focus:ring-customYellow focus:outline-none"
            {...register("password")}
          />
        </div>




        <div>
          <input
            id="loginSignUpInput"
            type="submit"
            className="w-full py-3 bg-customYellow text-gray-900 cursor-pointer font-bold rounded-lg hover:bg-yellow-300 transition duration-300"
            value={signIn ? "Sign Up" : "Login"}
          />
        </div>

        <p className="text-sm text-center text-gray-600 mt-4">
          {signIn ? "Already have an account?" : "Don't have an account?"}{" "}
          <span
            onClick={() => setSignIn(!signIn)}
            className="text-blue-500 hover:underline cursor-pointer"
          >
            {signIn ? "Log in" : "Sign Up"}
          </span>
        </p>
      </form>
    </div>
  );


};

export default Login;
