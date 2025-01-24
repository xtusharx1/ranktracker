import React from "react";
import { MdOutlineCancel } from "react-icons/md";
import { Button } from ".";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const navigate = useNavigate();

  // Get user details from localStorage
  const name = localStorage.getItem('name');
  const email = localStorage.getItem('email');
  const role = localStorage.getItem('role');

  // Logout function
  const handleLogout = () => {
    // Clear the localStorage or sessionStorage
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('email');

    // Redirect to the login page
    navigate('/login');
  };

  return (
    <div className="nav-item absolute right-1 top-16 bg-white dark:bg-[#42464D] p-8 rounded-lg w-96">
      <div className="flex justify-between items-center">
        <p className="font-semibold text-lg dark:text-gray-200">User Profile</p>
        <Button
          icon={<MdOutlineCancel />}
          color="rgb(153, 171, 180)"
          bgHoverColor="light-gray"
          size="2xl"
          borderRadius="50%"
          opt="userProfile"
        />
      </div>
      <div className="mt-6">
        {/* Display user's name and email */}
        <p className="font-semibold text-xl dark:text-gray-200">{name}</p>
        <p className="text-gray-500 text-sm dark:text-gray-400">{email}</p>
        <p className="text-gray-500 text-sm dark:text-gray-400">{role}</p>
      </div>
      <div className="mt-5">
        {/* Logout button */}
        <Button
          color="white"
          bgColor="#ff4d4d"
          text="Logout"
          borderRadius="10px"
          width="full"
          onClick={handleLogout} // Bind the logout function to the button
        />
      </div>
    </div>
  );
};

export default UserProfile;
