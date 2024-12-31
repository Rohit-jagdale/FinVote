import React, { useEffect, useMemo } from "react";
import "./connected.css";

const Connected = ({
  account,
  candidates,
  citizenData,
  remainingTime,
  number,
  handleNumberChange,
  voteFunction,
  showButton,
  onWalletAddressChange,
}) => {
  useEffect(() => {
    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0 || accounts[0] !== account) {
        onWalletAddressChange();
      }
    };

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      }
    };
  }, [account, onWalletAddressChange]);

  // Memoize filtered candidates to prevent unnecessary recalculations
  const filteredCandidates = useMemo(() => {
    if (!citizenData?.area || !candidates) return [];
    return candidates.filter(candidate => candidate.area === citizenData.area);
  }, [candidates, citizenData?.area]);

  // Calculate remaining time in minutes and seconds
  const timeDisplay = useMemo(() => {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    return `${minutes} minutes ${seconds} seconds`;
  }, [remainingTime]);

  const handleVoteClick = async () => {
    if (!number) {
      alert("Please enter a candidate index");
      return;
    }
    
    const selectedCandidate = filteredCandidates.find(c => c.index === parseInt(number));
    if (!selectedCandidate) {
      alert("Invalid candidate index. Please select from the available candidates.");
      return;
    }

    try {
      await voteFunction();
    } catch (error) {
      console.error("Voting failed:", error);
      alert("Failed to cast vote. Please try again.");
    }
  };

  return (
    <div className="connected-container">
      <h1 className="connected-header">You are Connected to Metamask</h1>
      <p className="connected-account">
        Metamask Account: {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not connected'}
      </p>
      <p className="connected-account">Remaining Time: {timeDisplay}</p>
      
      {showButton ? (
        <p className="connected-account">You have already voted</p>
      ) : (
        <div>
          <input
            type="number"
            placeholder="Enter Candidate Index"
            value={number}
            onChange={handleNumberChange}
            className="candidate-input"
            min="0"
            max={filteredCandidates.length - 1}
          />
          <button 
            className="login-button" 
            onClick={handleVoteClick}
            disabled={!number || number < 0 || number >= filteredCandidates.length}
          >
            Vote
          </button>
        </div>
      )}

      <div className="table-container">
        <table className="candidates-table">
          <thead>
            <tr>
              <th>Index</th>
              <th>Candidate Name</th>
              <th>Candidate Votes</th>
              <th>Party Name</th>
              <th>Area</th>
            </tr>
          </thead>
          <tbody className="scrollable-body">
            {filteredCandidates.length > 0 ? (
              filteredCandidates.map((candidate) => (
                <tr key={candidate.index}>
                  <td>{candidate.index}</td>
                  <td>{candidate.name}</td>
                  <td>{candidate.voteCount}</td>
                  <td>{candidate.party}</td>
                  <td>{candidate.area}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">
                  {!citizenData?.area 
                    ? "Please verify your citizenship to see available candidates" 
                    : "No candidates available for your area"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Connected;

