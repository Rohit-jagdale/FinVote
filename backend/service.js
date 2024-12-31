const {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse
  } = require("@simplewebauthn/server")
  
  const crypto = require("node:crypto");
  global.crypto = crypto.webcrypto;

const express = require('express');
const cookieParser = require("cookie-parser")
const mongoose = require('mongoose');
const cors = require('cors');
const { error } = require("node:console");

const app = express();
const PORT = 4000;



// MongoDB connection
mongoose.connect("mongodb://localhost:27017/Aadhar-database", {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('Could not connect to MongoDB', error));


//user: 
// Define a Mongoose schema for user
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    age: Number,
    adharNumber: String,
    area: String,        
    walletAddress: String,
    passKey: Object  
});

const User = mongoose.model('User', userSchema);

// Middleware
app.use(cors({
    origin:  ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser())



const RP_ID = "localhost"
const CLIENT_URL = "http://localhost:3000"
const challengeStore = {}
const loginChallengeStore = {}

app.get('/init-register', async(req, res) => {
    const walletAddress = req.query.walletAddress
    if(!walletAddress){
        return res.status(400).json({error: "wallet Address required"})
    }
    const options = await generateRegistrationOptions({
        rpID: RP_ID,
        rpName: 'finVote',
        userName: walletAddress,
        userID: "123",
        userDisplayName: "finvote",
    })

    challengeStore[walletAddress] = options.challenge

    res.cookie(
        "regInfo",
        JSON.stringify({
          userId: options.user.id,
          walletAddress: walletAddress,
          challenge: options.challenge,
        }),
        { httpOnly: false, maxAge: 60000, secure: true }
      )

    res.json(options)
})

app.post('/', async (req, res) => {
  // console.log('Input to JSON.parse:', req.cookies.regInfo);
  // console.log('Cookies received:', req.cookies); 
  // const regInfo = JSON.parse(req.cookies.regInfo)
    const { firstName, lastName, age, adharNumber, area, walletAddress, passKey } = req.body;

    const challenge = challengeStore[walletAddress]

  const verification = await verifyRegistrationResponse({
    response: passKey,
    expectedChallenge: challenge,
    expectedOrigin: CLIENT_URL,
    expectedRPID: RP_ID,
  })
   console.log("verified: "+verification.verified)
  if(verification.verified){
    try {
        const newUser = new User({ firstName, lastName, age, adharNumber, area, walletAddress, passKey });
        await newUser.save();
        res.clearCookie("regInfo")
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).send('Server error');
    }

  }else {
    return res
      .status(400)
      .json({ verified: false, error: "Verification failed" })
  }
});








app.get("/init-auth", async (req, res) => {
    const walletAddress = req.query.walletAddress
    if (!walletAddress) {
      return res.status(400).json({ error: "wallet address is required" })
    }
  
    const user = await User.findOne({ walletAddress })
    if (user == null) {
      return res.status(400).json({ error: "No user for this wallet address" })
    }
  
    // const options = await generateAuthenticationOptions({
    //   rpID: RP_ID,
    //   allowCredentials: [
    //     {
    //         id: user.passKey.id,
    //       type: "public-key",
    //       transports: user.passKey.transports,
    //     },
    //   ],
    // })

    const options = await generateAuthenticationOptions({
      rpID: 'localhost',
  })

    loginChallengeStore[walletAddress] = options.challenge
  
    res.json(options)
  })

  app.post("/verify-auth", async (req, res) => {

    const { walletAddress, passKey } = req.body;
  
    const user = await User.findOne({ walletAddress })
  if (user == null || user.passKey.id != passKey.id) {
    return res.status(400).json({ error: "Invalid user" })
  }


  const challenge = loginChallengeStore[walletAddress]

  

  const verification = await verifyAuthenticationResponse({
    response: passKey,
    expectedChallenge: challenge,
    expectedOrigin: 'http://localhost:3001',
    expectedRPID: RP_ID,
    authenticator: {
      credentialID: user.passKey.id,
      credentialPublicKey: user.passKey.publicKey,
      counter: user.passKey.counter,
      transports: user.passKey.transports,
    },
  })

  if (verification.verified) {
    updateUserCounter(user.id, verification.authenticationInfo.newCounter)
    // res.clearCookie("authInfo")
    // Save user in a session cookie
    return res.json({ verified: verification.verified })
  } else {
    return res
      .status(400)
      .json({ verified: false, error: "Verification failed" })
  }
})







// API Endpoint to get all users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

// API Endpoint to get a user by Aadhaar number
app.get('/users/:adharNumber', async (req, res) => {
    const { adharNumber } = req.params;

    try {
        const user = await User.findOne({ adharNumber });
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).send('Server error');
    }
});


// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});



