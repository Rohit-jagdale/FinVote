import React from "react";
import { useState, useEffect } from 'react';

const Finished = ({ getResult }) => {
    const [winner, setWinner] = useState({ name: "", voteCount: 0 });

    useEffect(() => {
        async function fetchResult() {
            const result = await getResult();
            setWinner(result);
        }
        fetchResult();
    }, [getResult]);
    return (
        <div className="login-container">
            <h1 className="welcome-message">Voting is Finished</h1>
            <div className="results-container">
                <h2>Results:</h2>
                <p>Winner: {winner.name}</p>
                <p>Votes: {winner.voteCount}</p>
            </div>
        </div>
    )
}

export default Finished;