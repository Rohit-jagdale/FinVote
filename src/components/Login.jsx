
import React, { useState } from "react";
import "./Login.css"; // Import your CSS file for styling

const Login = (props) => {
    const [aadhar, setAadhar] = useState("");
    const [walletAddress, setWalletAddress] = useState(""); // State for wallet address input

    const handleAadharChange = (event) => {
        setAadhar(event.target.value);
    };

    const handleWalletAddressChange = (event) => {
        setWalletAddress(event.target.value);
    };

    const handleAadharSubmit = () => {
        props.fetchCitizenData(aadhar); // Call the function passed via props
    };

    const handleLogin = () => {
        if (!props.citizenData) {
            props.setError("Please fetch citizen data first.");
            return;
        }
    
        if (!aadhar || !walletAddress) {
            props.setError("Both Aadhaar Number and Wallet Address are required.");
            return;
        }
    
        if (walletAddress !== props.citizenData.walletAddress) {
            props.setError("The entered wallet address does not match the citizen's registered wallet address.");
            return;
        }
    
        // Proceed with connecting the wallet
        props.connectWallet(aadhar, walletAddress);
        props.setError(""); 
    };

    return (
        <div className="login-container">
                       <h1 className="welcome-message">Welcome to the Decentralized Voting Application</h1>
            
            <div className="input-field">
                 <label>Aadhaar Number:</label>
                <input 
                         type="text" 
                   value={aadhar} 
                     onChange={handleAadharChange} 
                     placeholder="Enter your Aadhaar number" 
                 />
                 <button onClick={handleAadharSubmit}>Fetch Citizen Data</button>
             </div>

             {props.error && <p className="error-message">{props.error}</p>} {/* Display error if fields are empty */}
            
             {props.citizenData && (
                 <div className="citizen-data">
                     <h2>Citizen Details:</h2>
                     <p>First Name: {props.citizenData.firstName}</p>
                     <p>Last Name: {props.citizenData.lastName}</p>
                     <p>Age: {props.citizenData.age}</p>
                     <p>Aadhaar Number: {props.citizenData.adharNumber}</p>
                     <p>Fingerprint: {props.citizenData.fingerprint}</p>
                     <p>Area: {props.citizenData.area}</p>
                     {/* <p>Wallet Address: {citizenData.walletAddress}</p> */}
                 </div>
             )}

             <div className="input-field">
                 <label>Wallet Address:</label>
                 <input 
                     type="text" 
                     value={walletAddress} 
                     onChange={handleWalletAddressChange} 
                     placeholder="Enter your wallet address" 
                 />
             </div>

             <button className="login-button" onClick={handleLogin}>
                 Login with MetaMask
           </button>
       </div>
    );
};

export default Login;
