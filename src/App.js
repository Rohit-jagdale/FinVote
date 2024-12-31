import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Database from './components/Database';
import Voting from './components/Voting';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/database" element={<Database />} />
                    <Route path='/voting' element={<Voting/>}/>
                </Routes>
            </div>
        </Router>
    );
}

export default App;
