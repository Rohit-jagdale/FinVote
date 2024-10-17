const uri = "https://localhost:8003/mfs100/";

// Capture Fingerprint
export async function CaptureFinger(quality, timeout) {
    const MFS100Request = {
        "Quality": quality,
        "TimeOut": timeout,
    };
    const jsondata = JSON.stringify(MFS100Request);
    return await PostMFS100Client("capture", jsondata);
}

// Multi Finger Capture with Deduplication
export async function CaptureMultiFinger(quality, timeout, noOfFingers) {
    const MFS100Request = {
        "Quality": quality,
        "TimeOut": timeout,
        "NoOfFinger": noOfFingers
    };
    const jsondata = JSON.stringify(MFS100Request);
    return await PostMFS100Client("capturewithdeduplicate", jsondata);
}

// Verify Fingerprint
export async function VerifyFinger(probFMR, galleryFMR) {
    const MFS100Request = {
        "ProbTemplate": probFMR,
        "GalleryTemplate": galleryFMR,
        "BioType": "FMR" // or "ANSI" if using ANSI Template
    };
    const jsondata = JSON.stringify(MFS100Request);
    return await PostMFS100Client("verify", jsondata);
}

// Match Fingerprint
export async function MatchFinger(quality, timeout, galleryFMR) {
    const MFS100Request = {
        "Quality": quality,
        "TimeOut": timeout,
        "GalleryTemplate": galleryFMR,
        "BioType": "FMR" // or "ANSI" if using ANSI Template
    };
    const jsondata = JSON.stringify(MFS100Request);
    return await PostMFS100Client("match", jsondata);
}

// Get MFS100 Information
export async function GetMFS100Info() {
    return await GetMFS100Client("info");
}

// Get MFS100 Key Information
export async function GetMFS100KeyInfo(key) {
    const MFS100Request = {
        "Key": key,
    };
    const jsondata = JSON.stringify(MFS100Request);
    return await PostMFS100Client("keyinfo", jsondata);
}

// Get Pid Data
export async function GetPidData(biometricArray) {
    const req = new MFS100Request(biometricArray);
    const jsondata = JSON.stringify(req);
    return await PostMFS100Client("getpiddata", jsondata);
}

// Get Rbd Data
export async function GetRbdData(biometricArray) {
    const req = new MFS100Request(biometricArray);
    const jsondata = JSON.stringify(req);
    return await PostMFS100Client("getrbddata", jsondata);
}

// Helper functions for HTTP calls
async function PostMFS100Client(method, jsonData) {
    try {
        const response = await fetch(uri + method, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: jsonData,
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return { httpStatus: false, err: error.message };
    }
}

async function GetMFS100Client(method) {
    try {
        const response = await fetch(uri + method, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return { httpStatus: false, err: error.message };
    }
}

// Helper Classes
export class Biometric {
    constructor(BioType, BiometricData, Pos, Nfiq, Na) {
        this.BioType = BioType;
        this.BiometricData = BiometricData;
        this.Pos = Pos;
        this.Nfiq = Nfiq;
        this.Na = Na;
    }
}

export class MFS100Request {
    constructor(BiometricArray) {
        this.Biometrics = BiometricArray;
    }
}