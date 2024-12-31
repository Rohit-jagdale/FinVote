
import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { contractAbi, contractAddress } from './constant';
import Login from './Login';
import Finished from './Finished';
import Connected from './Connected';

function Voting() {
    const [provider, setProvider] = useState(null);
    const [account, setAccount] = useState(null);
    const [isConnected, setIsConnected] = useState(false);  
    const [votingStatus, setVotingStatus] = useState(true);  
    const [remainingTime, setRemainingTime] = useState('');
    const [candidates, setCandidates] = useState([]);
    const [number, setNumber] = useState('');
    const [canVote, setCanVote] = useState(true);
    const [newCandidateName, setNewCandidateName] = useState('');
    const [newCandidateParty, setNewCandidateParty] = useState('');
    const [newCandidateArea, setNewCandidateArea] = useState('');
    const [error, setError] = useState("");
    const [citizenData, setCitizenData] = useState(null);

    const getContract = useCallback(async () => {
        if (!provider) return null;
        const signer = provider.getSigner();
        return new ethers.Contract(contractAddress, contractAbi, signer);
    }, [provider]);

    // const fetchInitialData = useCallback(async () => {
    //     try {
    //         const contract = await getContract();
    //         if (!contract) return;

    //         const [candidatesList, time, status] = await Promise.all([
    //             contract.getAllVotesOfCandidates(),
    //             contract.getRemainingTime(),
    //             contract.getVotingStatus()
    //         ]);

    //         if (Array.isArray(candidatesList)) {
    //             const formattedCandidates = candidatesList.map((candidate, index) => ({
    //                 index,
    //                 name: candidate.name,
    //                 voteCount: candidate.voteCount.toNumber(),
    //                 party: candidate.party,
    //                 area: candidate.area
    //             }));
    //             setCandidates(formattedCandidates);
    //         }

    //         setRemainingTime(parseInt(time.toString(), 10));
    //         setVotingStatus(status);
    //         console.log("intial data is fetched");
    //     } catch (error) {
    //         console.error('Error fetching initial data:', error);
    //     }
        
    // }, [getContract]);

    const fetchInitialData = useCallback(async () => {
        try {
            const contract = await getContract();
            if (!contract) return;
    
            const [candidatesList, time, status] = await Promise.all([
                contract.getAllVotesOfCandidates(),
                contract.getRemainingTime(),
                contract.getVotingStatus(),
            ]);
    
            if (Array.isArray(candidatesList)) {
                setCandidates(
                    candidatesList.map((candidate, index) => ({
                        index,
                        name: candidate.name,
                        voteCount: candidate.voteCount.toNumber(),
                        party: candidate.party,
                        area: candidate.area,
                    }))
                );
            }
    
            setRemainingTime(parseInt(time.toString(), 10));
            setVotingStatus(status);
        } catch (error) {
            console.error("Error fetching initial data:", error);
        }
    }, [getContract]);
    

    useEffect(() => {
        if (provider) {
            fetchInitialData();
        }
    }, [provider, fetchInitialData]);

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            }
        };
    }, []);

    const fetchCitizenData = async (aadhar) => {
        if (aadhar === "") {
            setError("Aadhaar Number is required.");
            return;
        }

        try {
            const response = await axios.get(`http://localhost:4000/users/${aadhar}`);
            setCitizenData(response.data);
            setError("");
        } catch (error) {
            console.error('Error fetching citizen data:', error);
            setError("User not found or server error.");
            setCitizenData(null);
        }
    };

    const vote = async () => {
        try {
            const contract = await getContract();
            if (!contract) return;

            const tx = await contract.vote(number);
            await tx.wait();
            await checkVotingEligibility();
            await fetchInitialData();
        } catch (error) {
            console.error("Error voting:", error);
        }
    };

    const checkVotingEligibility = async () => {
        try {
            const contract = await getContract();
            if (!contract) return;

            const voteStatus = await contract.voters(account);
            setCanVote(voteStatus);
        } catch (error) {
            console.error("Error checking eligibility:", error);
        }
    };

    const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0 && account !== accounts[0]) {
            setAccount(accounts[0]);
            checkVotingEligibility();
        } else {
            setIsConnected(false);
            setAccount(null);
        }
    };

    const connectToMetamask = async () => {
        if (!window.ethereum) {
            console.error("Metamask is not detected in the browser");
            return;
        }

        try {
            const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
            await web3Provider.send("eth_requestAccounts", []);
            const signer = web3Provider.getSigner();
            const address = await signer.getAddress();

            setProvider(web3Provider);
            setAccount(address);
            setIsConnected(true);
            
            console.log("Metamask Connected : " + address);
        } catch (err) {
            console.error("Connection error:", err);
        }
    };


    

    const addCandidate = async () => {
        try {
            const contract = await getContract();
            if (!contract) return;

            const tx = await contract.addCandidate(
                newCandidateName, 
                newCandidateParty, 
                newCandidateArea, 
                { gasLimit: 500000 }
            );
            await tx.wait();
            await fetchInitialData();
        } catch (err) {
            console.error("Error adding candidate:", err.message);
        }
    };

    const getResult = async () => {
        try {
            const contract = await getContract();
            if (!contract) return { name: '', voteCount: 0 };

            const result = await contract.getResults();
            
            if (!Array.isArray(result) || result.length < 2) {
                return { name: '', voteCount: 0 };
            }

            const [winningCandidate, winningVoteCount] = result;
            return {
                name: winningCandidate || '',
                voteCount: winningVoteCount ? winningVoteCount.toNumber() : 0
            };
        } catch (error) {
            console.error('Error getting results:', error);
            return { name: '', voteCount: 0 };
        }
    };

    return (
        <div className="App">
            {votingStatus ? (
                isConnected ? (
                    <Connected
                        account={account}
                        candidates={candidates}
                        fetchCitizenData={fetchCitizenData}
                        citizenData={citizenData}
                        remainingTime={remainingTime}
                        number={number}
                        handleNumberChange={(e) => setNumber(e.target.value)}
                        voteFunction={vote}
                        showButton={canVote}
                        addCandidate={addCandidate}
                        handleCandidateNameChange={(e) => setNewCandidateName(e.target.value)}
                        newCandidateName={newCandidateName}
                        newCandidateParty={newCandidateParty}
                        setNewCandidateParty={setNewCandidateParty}
                        newCandidateArea={newCandidateArea}
                        setNewCandidateArea={setNewCandidateArea}
                        onWalletAddressChange={() => {
                            setIsConnected(false);
                            setAccount(null);
                        }}
                    />
                ) : (
                    <Login
                        connectWallet={connectToMetamask}
                        fetchCitizenData={fetchCitizenData}
                        citizenData={citizenData} 
                        error={error} 
                        setError={setError} 
                    />
                )
            ) : (
                <Finished getResult={getResult} />
            )}
        </div>
    );
}

export default Voting;


