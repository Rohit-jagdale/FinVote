import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css'; // Importing the CSS file for styling
import logo from './logo.png'; // Import your logo image

const Home = () => {
    const [timeRemaining, setTimeRemaining] = useState(3600); // Set to 1 hour (3600 seconds)
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(prevTime => {
                if (prevTime <= 0) {
                    clearInterval(timer);
                    return 0; // Stop timer when reaching 0
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer); // Cleanup on unmount
    }, []);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        const remainingSeconds = seconds % 60;

        return `${hours}:${remainingMinutes < 10 ? '0' : ''}${remainingMinutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    // Handle vote button click to redirect to external app
    const handleVoteClick = () => {
        window.location.href = 'http://localhost:3000/'; // Replace with the external app's URL
    };

    return (
        <div>
            <div className="navbar">
                <nav className="navigation">
                    <a href="#" className="logo">
                        <img src={logo} alt="Logo" className="logo-img" /> E-VOTE
                    </a>
                    <div className="nav-links">
                        <a href="#">Home</a>
                        <a href="#">Nominees</a>
                        <a href="#">Live Results</a>
                    </div>
                    <div className="nav-buttons">
                        <button className="help-button">Need help?</button>
                        <button className="adb-button" onClick={() => navigate('/database')}>ADB</button>
                    </div>
                </nav>
            </div>

            <div className="bot">
                <div className="countdown">
                    <h2>Time Remaining for Voting</h2>
                    <p>{formatTime(timeRemaining)}</p>
                </div>

                <div className="nav-sec">
                    <p>Hello Voter</p>
                    <button className="cast" onClick={() => navigate('/voting')}>Cast Your Vote Now</button>
                </div>
            </div>
        </div>
    );
};

export default Home;