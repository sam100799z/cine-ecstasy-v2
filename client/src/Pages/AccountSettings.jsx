import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import domain from '../domain/domain.js';

const AccountSettings = () => {

  const navigate = useNavigate();

  const { userName, userEmail, setUserName, setUserEmail, refreshUserInfo } = useAuth();
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${domain}/api/user`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
        credentials: 'include'
      });
      setUserName(name);  // Update local state directly
      setUserEmail(email);
      refreshUserInfo(); 
      const data = await response.json();
      if (data.success) 
        {
          alert("Profile updated successfully!");
          navigate('/dashboard');
        }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating your profile. Please try again later.");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (password === confirmPassword) return alert("You are not entering a different password.");
    try {
      const response = await fetch(`${domain}/api/user/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, confirmPassword }),
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) alert("Password changed successfully!");
      navigate('/dashboard');
    } catch (error) {
      console.error("Error changing password:", error);
      alert("An error occurred while changing your password. Please try again later.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account?")) return;
    try {
      const response = await fetch(`${domain}/api/user`, { method: 'DELETE', credentials: 'include' });
      const data = await response.json();
      if (data.success) alert("Account deleted successfully!");
      navigate('/');
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("An error occurred while deleting your account. Please try again later.");
    }
  };

  return (
    <div className="max-w-[750px] mx-auto mt-10 p-6 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-customYellow mb-6">Account Settings</h2>

      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-white font-semibold">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        <div>
          <label className="block text-white font-semibold">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" />
        </div>

        <button type="submit" className="px-3 py-2 bg-green-600 rounded text-sm text-white font-semibold">Update Profile</button>
      </form>

      <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
        <div>
          <label className="block text-white font-semibold">Old Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        <div>
          <label className="block text-white font-semibold">New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        <button type="submit" className="px-3 py-2 bg-blue-600 rounded text-sm text-white font-semibold">Change Password</button>
      </form>

      <button
        onClick={handleDeleteAccount}
        className="px-3 py-2 mt-4 border border-red-600 rounded text-sm text-white font-semibold"
      >
        Delete Account
      </button>
    </div>
  );
};

export default AccountSettings;
