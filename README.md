# codehub
Coding Profile Tracker
This is a full-stack web application that allows you to track your coding profiles from multiple platforms in one place. It includes user authentication, profile tracking, and a global ranking system.

Features
User Authentication: Secure login and registration using Firebase Authentication.

Profile Tracking: Add and view your profiles from LeetCode, CodeChef, Codeforces, SPOJ, and InterviewBit.

Real-time Rankings: See how you rank against other users in a global ranking system based on problems solved.

Technologies Used
Frontend: HTML, Tailwind CSS, JavaScript

Backend: Node.js, Express

Database: Firebase Firestore

How to Run the Project Locally
1. Clone the Repository
First, clone this repository to your local machine using the following command:
```
git clone https://github.com/Shyamsunder24/codehub.git
cd codehub
```
2. Set Up the Backend
Navigate to the coding_tracker_backend folder and install the necessary dependencies:
```
cd codehub_backend
npm install express dotenv axios cors cheerio firebase-admin uuid
```
```
node server.js
```

3. Set Up the Frontend
Open a new terminal and navigate back to the root of your project:
```
cd ..
```
Now, you can start the frontend 
