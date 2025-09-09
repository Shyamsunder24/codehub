// Import necessary libraries
// You would need to install these with npm: npm install express dotenv axios cors uuid
const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");
const cors = require("cors");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0"; // Bind to all network interfaces

// In-memory data stores to simulate a database.
// In a real application, these would be a real database like Firestore or MongoDB.
const users = {};
const userProfiles = {};
const globalRankings = [
  { username: "user1", totalProblemsSolved: 750, averageContestRating: 2100 },
  { username: "user2", totalProblemsSolved: 920, averageContestRating: 2350 },
  { username: "user3", totalProblemsSolved: 510, averageContestRating: 1800 },
  { username: "user4", totalProblemsSolved: 680, averageContestRating: 2050 },
  { username: "user5", totalProblemsSolved: 850, averageContestRating: 2200 },
];

// Middleware to parse JSON bodies and enable CORS
app.use(express.json());
app.use(cors());

// --- New Endpoints for Authentication ---
app.post("/api/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }
  if (users[username]) {
    return res.status(409).json({ message: "User already exists." });
  }
  users[username] = { password };
  console.log(`User ${username} registered.`);
  res
    .status(201)
    .json({ message: "Registration successful.", userId: username });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid username or password." });
  }
  console.log(`User ${username} logged in.`);
  res.status(200).json({ message: "Login successful.", userId: username });
});

/**
 * API call handlers for each platform.
 * NOTE: These use third-party or unofficial APIs. Use with caution.
 */
//fetch codeforces profile using official api
const fetchCodeforcesProfile = async (username) => {
  try {
    // Get contests attended + rating
    const contestsRes = await axios.get(
      `https://codeforces.com/api/user.rating?handle=${username}`
    );
    const contests = contestsRes.data.result || [];
    const contestsAttended = contests.length;
    const contestRating =
      contests.length > 0 ? contests[contests.length - 1].newRating : "N/A";

    // Get submissions → count unique problems solved
    const subsRes = await axios.get(
      `https://codeforces.com/api/user.status?handle=${username}`
    );
    const submissions = subsRes.data.result || [];
    const solvedProblems = new Set();
    submissions.forEach((sub) => {
      if (sub.verdict === "OK") {
        solvedProblems.add(`${sub.problem.contestId}-${sub.problem.index}`);
      }
    });

    return {
      platform: "Codeforces",
      username: username,
      data: {
        problemsSolved: solvedProblems.size,
        contestsAttended,
        contestRating,
      },
    };
  } catch (error) {
    console.error(
      `Error fetching Codeforces profile for ${username}:`,
      error.message
    );
    return null;
  }
};

//fetch leetcode profile using unofficial api
const fetchLeetCodeProfile = async (username) => {
  try {
    const response = await axios.get(
      `https://leetcode-stats-api.herokuapp.com/${username}`
    );
    if (response.data.status === "success") {
      return {
        platform: "LeetCode",
        username: username,
        data: {
          problemsSolved: response.data.totalSolved || "N/A",
          contestsAttended: "N/A", // Unofficial API does not provide this
          contestRating: "N/A", // Unofficial API does not provide this
        },
      };
    }
    return null;
  } catch (error) {
    console.error(
      `Error fetching LeetCode profile for ${username}:`,
      error.message
    );
    return null;
  }
};

//fetch codechef profile using web scraping

const fetchCodeChefProfile = async (username) => {
  try {
    const url = `https://www.codechef.com/users/${username}`;
    const { data: html } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const $ = cheerio.load(html);

    // ---- Contest Rating ----
    const contestRating = $(".rating-number").first().text().trim() || "N/A";

    // ---- Problems Solved ----
    let problemsSolved = $("h3")
      .filter((i, el) => $(el).text().includes("Total Problems Solved"))
      .text()
      .replace("Total Problems Solved:", "")
      .trim();

    if (!problemsSolved) problemsSolved = "N/A";

    // ---- Contests Attended ----
    let contestsAttended = $(".contest-participated-count b").text().trim();
    if (!contestsAttended) contestsAttended = "N/A";

    return {
      platform: "CodeChef",
      username,
      data: {
        problemsSolved,
        contestsAttended,
        contestRating,
      },
    };
  } catch (error) {
    console.error(
      `Error fetching CodeChef profile for ${username}:`,
      error.response?.status,
      error.message
    );
    return {
      platform: "CodeChef",
      username,
      data: {
        problemsSolved: "N/A",
        contestsAttended: "N/A",
        contestRating: "N/A",
      },
    };
  }
};

// const fetchHackerRankProfile = async (username) => {
//   try {
//     // This is a placeholder as HackerRank's API is not public for user profiles
//     // A real solution would involve web scraping
//     return {
//       platform: "HackerRank",
//       username: username,
//       data: {
//         problemsSolved: "N/A",
//         contestsAttended: "N/A",
//         contestRating: "N/A",
//       },
//     };
//   } catch (error) {
//     console.error(
//       `Error fetching HackerRank profile for ${username}:`,
//       error.message
//     );
//     return null;
//   }
// };

//fetch spoj profile using unofficial api

const fetchSpojProfile = async (username) => {
  try {
    const url = `https://www.spoj.com/users/${username}/`;
    const { data: html } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const $ = cheerio.load(html);

    // Updated: Problems Solved
    let problemsSolved = $("h5:contains('Problems solved')")
      .next("section")
      .find("a").length;
    if (!problemsSolved) problemsSolved = "N/A";

    // Updated: Global Rank (World Rank)
    let worldRank = $("h5:contains('Rank')").next("section").text().trim();
    if (!worldRank) worldRank = "N/A";

    // Contest Rating (SPOJ doesn't provide this)
    const contestRating = "N/A";

    return {
      platform: "SPOJ",
      username,
      data: {
        problemsSolved,
        contestsAttended: worldRank,
        contestRating,
      },
    };
  } catch (error) {
    console.error(
      `Error fetching SPOJ profile for ${username}:`,
      error.message
    );
    return {
      platform: "SPOJ",
      username,
      data: {
        problemsSolved: "N/A",
        contestsAttended: "N/A",
        contestRating: "N/A",
      },
    };
  }
};

const fetchInterviewBitProfile = async (username) => {
  try {
    const response = await axios.get(
      `https://competitive-coding-api.herokuapp.com/api/interviewbit/${username}`
    );
    if (response.data && !response.data.error) {
      return {
        platform: "InterviewBit",
        username: username,
        data: {
          problemsSolved: "N/A", // InterviewBit API does not provide this data
          contestsAttended: "N/A", // InterviewBit API does not provide this data
          contestRating: response.data.rank || "N/A",
        },
      };
    }
    return null;
  } catch (error) {
    console.error(
      `Error fetching InterviewBit profile for ${username}:`,
      error.message
    );
    return null;
  }
};

// --- API Endpoint: Get Profile Data for a User ---
app.get("/api/profiles/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!userProfiles[userId]) {
    return res.status(200).json([]);
  }

  // Simulate fetching detailed data for each profile
  const profilesWithData = await Promise.all(
    userProfiles[userId].map(async (profile) => {
      let fetchedData = null;
      switch (profile.platform.toLowerCase()) {
        case "leetcode":
          fetchedData = await fetchLeetCodeProfile(profile.username);
          break;
        case "codeforces":
          fetchedData = await fetchCodeforcesProfile(profile.username);
          break;
        case "codechef":
          fetchedData = await fetchCodeChefProfile(profile.username);
          break;
        case "hackerrank":
          // Placeholder fetch call
          fetchedData = await fetchHackerRankProfile(profile.username);
          break;
      }

      return fetchedData || { ...profile, data: {} };
    })
  );

  res.status(200).json(profilesWithData.filter((p) => p !== null));
});

// --- API Endpoint: Add a New Profile ---
app.post("/api/profiles", async (req, res) => {
  const { userId, platform, username } = req.body;

  if (!userId || !platform || !username) {
    return res
      .status(400)
      .json({ message: "Missing userId, platform, or username." });
  }

  if (!userProfiles[userId]) {
    userProfiles[userId] = [];
  }

  // Dynamically import the uuid library to avoid ERR_REQUIRE_ESM
  const { v4: uuidv4 } = await import("uuid");

  const newProfile = { id: uuidv4(), platform, username };
  userProfiles[userId].push(newProfile);

  res.status(201).json(newProfile);
});

// --- API Endpoint: Delete a Profile ---
app.delete("/api/profiles/:userId/:profileId", async (req, res) => {
  const { userId, profileId } = req.params;

  if (!userProfiles[userId]) {
    return res.status(404).json({ message: "User not found." });
  }

  const initialLength = userProfiles[userId].length;
  userProfiles[userId] = userProfiles[userId].filter((p) => p.id !== profileId);

  if (userProfiles[userId].length === initialLength) {
    return res.status(404).json({ message: "Profile not found." });
  }

  res.status(200).json({ message: "Profile deleted successfully." });
});

// --- API Endpoint: Get Global Rankings ---
app.get("/api/rankings", async (req, res) => {
  res.status(200).json(globalRankings);
});

// Start the server
app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
