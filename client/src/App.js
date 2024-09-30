// import React, { useEffect, useState } from 'react';
// import axios from 'axios'; // Optional if you use axios, or use fetch instead

// function App() {
//     const [profiles, setProfiles] = useState([]);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         // Fetch data from your Express server
//         axios.get('http://localhost:8080/user-profiles')  // Point this to your server's API endpoint
//         .then((response) => {
//             setProfiles(response.data);  // Store the response data in profiles state
//         })
//         .catch((error) => {
//             setError('Failed to fetch user profiles');
//             console.error('There was an error fetching the user profiles!', error);
//         });
//     }, []);  // Empty dependency array to ensure it runs once

//     return (
//         <div className="App">
//             <h1>User Profiles</h1>
//             {error && <p>{error}</p>}
//             <ul>
//                 {profiles.map(profile => (
//                     <li key={profile.user_id}>
//                         {profile.name} - {profile.email} 
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// }

// export default App;
