import React, { useState } from 'react';
import axios from 'axios';
import { Button, Form, Container, Header, Message, Table, Dropdown } from 'semantic-ui-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Database() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [age, setAge] = useState("");
    const [adharNumber, setAdharNumber] = useState("");
    const [area, setArea] = useState("");
    const [walletAddress, setWalletAddress] = useState(""); // New state for MetaMask wallet address
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    const [submissionError, setSubmissionError] = useState(null);
    const [users, setUsers] = useState([]);
    const [showUsers, setShowUsers] = useState(false);

    const areaOptions = [
        { key: 'a', text: 'Area 1', value: 'Area 1' },
        { key: 'b', text: 'Area 2', value: 'Area 2' },
        { key: 'c', text: 'Area 3', value: 'Area 3' }
    ];

    const collectData = async (e) => {
        e.preventDefault();
        
        // try {
        //     const result = await axios.post('http://localhost:4000/', {
        //         firstName,
        //         lastName,
        //         age,
        //         adharNumber,
        //         area,
        //         walletAddress // Include wallet address in the post data
        //     });
    
        //     localStorage.setItem("user", JSON.stringify(result.data));
        //     setSubmissionSuccess(true);
        //     setSubmissionError(null);
        // } 
        try {
            const result = await axios.post('https://finvote.onrender.com', {
                firstName,
                lastName,
                age,
                adharNumber,
                area,
                walletAddress // Include wallet address in the post data
            });
    
            localStorage.setItem("user", JSON.stringify(result.data));
            setSubmissionSuccess(true);
            setSubmissionError(null);
        }catch (error) {
            console.error('Error submitting data:', error);
            setSubmissionError('Error submitting data. Please try again.');
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get('https://finvote.onrender.com');
            setUsers(response.data);
            setShowUsers(true);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    return (
        <Container text>
            <ToastContainer />

            <Button
                secondary
                onClick={fetchUsers}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    zIndex: 1000,
                }}
            >
                Fetch Users
            </Button>
            <Header as='h2' textAlign='center' style={{ margin: '20px 0' }}>
                User Registration
            </Header>
            {submissionSuccess && (
                <Message success header='Submission Successful' content="Your data has been captured!" />
            )}
            {submissionError && (
                <Message error header='Submission Error' content={submissionError} /> 
            )}
            <Form onSubmit={collectData} size='large'>
                <Form.Field>
                    <label>First Name</label>
                    <input
                        placeholder='Enter your first name'
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                </Form.Field>
                <Form.Field>
                    <label>Last Name</label>
                    <input
                        placeholder='Enter your last name'
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </Form.Field>
                <Form.Field>
                    <label>Age</label>
                    <input
                        placeholder='Enter your age'
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                    />
                </Form.Field>
                <Form.Field>
                    <label>Adhar Number</label>
                    <input
                        placeholder='Enter your Adhar number'
                        value={adharNumber}
                        onChange={(e) => setAdharNumber(e.target.value)}
                    />
                </Form.Field>
                <Form.Field>
                    <label>Select Your Area</label>
                    <Dropdown
                        placeholder='Select Area'
                        fluid
                        selection
                        options={areaOptions}
                        onChange={(e, { value }) => setArea(value)}
                    />
                </Form.Field>
                
                {/* New MetaMask Wallet Address Field */}
                <Form.Field>
                    <label>MetaMask Wallet Address</label>
                    <input
                        placeholder='Enter your wallet address'
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                    />
                </Form.Field>

                <Button primary type='submit' style={{ marginTop: '10px', borderRadius: '20px' }}>
                    Submit
                </Button>
            </Form>

            {showUsers && users.length > 0 && (
                <Table celled style={{ marginTop: '20px' }}>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>First Name</Table.HeaderCell>
                            <Table.HeaderCell>Last Name</Table.HeaderCell>
                            <Table.HeaderCell>Age</Table.HeaderCell>
                            <Table.HeaderCell>Adhar Number</Table.HeaderCell>
                            <Table.HeaderCell>Area</Table.HeaderCell>
                            <Table.HeaderCell>Wallet Address</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {users.map((user) => (
                            <Table.Row key={user._id}>
                                <Table.Cell>{user.firstName}</Table.Cell>
                                <Table.Cell>{user.lastName}</Table.Cell>
                                <Table.Cell>{user.age}</Table.Cell>
                                <Table.Cell>{user.adharNumber}</Table.Cell>
                                <Table.Cell>{user.area}</Table.Cell>
                                <Table.Cell>{user.walletAddress}</Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            )}
        </Container>
    );
}

export default Database;
