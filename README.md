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

```git clone [https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git](https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git)```
```cd YOUR_REPOSITORY_NAME```

2. Set Up the Backend
Navigate to the coding_tracker_backend folder and install the necessary dependencies:

```cd coding_tracker_backend```
```npm install express dotenv axios cors cheerio firebase-admin uuid```

Next, you'll need to set up your Firebase project. This is crucial for the application to work.

Go to the Firebase Console and create a new project.

In your project settings, go to the "Service accounts" tab and click "Generate new private key." This will download a JSON file.

Open the server.js file and replace the placeholder serviceAccount object with the contents of the JSON file you just downloaded. This file contains sensitive data, so do not push it to a public repository.

Once the credentials are in place, you can start the backend server:

```node server.js```

3. Set Up the Frontend
Open a new terminal and navigate back to the root of your project:

```cd ..```

In your Firebase Console, navigate to Project settings > General.

Find the "Your apps" section and select your web app.

Copy the firebaseConfig object from the SDK setup snippet.

Open the index.html file and replace the placeholder firebaseConfig object with the one you copied.

Now, you can start the frontend 
