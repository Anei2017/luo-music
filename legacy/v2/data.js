// ===== Song Catalog =====
// All paths relative to the parent directory (../)

const SONGS = [
  // Luo / African music (1-8)
  {
    id: 1,
    name: "Baton Baton Mein",
    artist: "Awilo Longomba",
    category: "luo",
    poster: "../img/1.jpg",
    audio: "../audio/1.mp3",
    duration: "3:45"
  },
  {
    id: 2,
    name: "Kelele",
    artist: "Makuei Michael",
    category: "luo",
    poster: "../img/2.jpg",
    audio: "../audio/2.mp3",
    duration: "4:12"
  },
  {
    id: 3,
    name: "Ngiro",
    artist: "Free Bob",
    category: "luo",
    poster: "../img/3.jpg",
    audio: "../audio/3.mp3",
    duration: "3:58"
  },
  {
    id: 4,
    name: "My Queen",
    artist: "George Ubeiu",
    category: "luo",
    poster: "../img/4.jpg",
    audio: "../audio/4.mp3",
    duration: "4:30"
  },
  {
    id: 5,
    name: "Peace Song",
    artist: "Gabriel Apia",
    category: "luo",
    poster: "../img/5.jpg",
    audio: "../audio/5.mp3",
    duration: "3:22"
  },
  {
    id: 6,
    name: "Lual",
    artist: "George Kuach",
    category: "luo",
    poster: "../img/6.jpg",
    audio: "../audio/6.mp3",
    duration: "4:05"
  },
  {
    id: 7,
    name: "Yau",
    artist: "Deng Deng",
    category: "luo",
    poster: "../img/7.jpg",
    audio: "../audio/7.mp3",
    duration: "3:40"
  },
  {
    id: 8,
    name: "Chido",
    artist: "Deng Deng",
    category: "luo",
    poster: "../img/8.jpg",
    audio: "../audio/8.mp3",
    duration: "3:55"
  },

  // Bollywood / Punjabi (9-20)
  {
    id: 9,
    name: "Dilber",
    artist: "Atif Aslam",
    category: "bollywood",
    poster: "../img/9.jpg",
    audio: "../audio/9.mp3",
    duration: "4:18"
  },
  {
    id: 10,
    name: "Duniya",
    artist: "Akhil",
    category: "bollywood",
    poster: "../img/10.jpg",
    audio: "../audio/10.mp3",
    duration: "3:33"
  },
  {
    id: 11,
    name: "Lagdi Lahore Di",
    artist: "Guru Randhawa",
    category: "bollywood",
    poster: "../img/11.jpg",
    audio: "../audio/11.mp3",
    duration: "3:48"
  },
  {
    id: 12,
    name: "Filhall",
    artist: "B Praak",
    category: "bollywood",
    poster: "../img/12.jpg",
    audio: "../audio/12.mp3",
    duration: "4:22"
  },
  {
    id: 13,
    name: "Kheench Te Nach",
    artist: "Diljit Dosanjh",
    category: "bollywood",
    poster: "../img/13.jpg",
    audio: "../audio/13.mp3",
    duration: "3:15"
  },
  {
    id: 14,
    name: "Leja Re",
    artist: "Dhvani Bhanushali",
    category: "bollywood",
    poster: "../img/14.jpg",
    audio: "../audio/14.mp3",
    duration: "3:42"
  },
  {
    id: 15,
    name: "Vaaste",
    artist: "Dhvani Bhanushali",
    category: "bollywood",
    poster: "../img/15.jpg",
    audio: "../audio/15.mp3",
    duration: "3:50"
  },
  {
    id: 16,
    name: "Lut Gaye",
    artist: "Jubin Nautiyal",
    category: "bollywood",
    poster: "../img/16.jpg",
    audio: "../audio/16.mp3",
    duration: "4:10"
  },
  {
    id: 17,
    name: "Tera Ban Jaunga",
    artist: "Akhil",
    category: "bollywood",
    poster: "../img/17.jpg",
    audio: "../audio/17.mp3",
    duration: "3:55"
  },
  {
    id: 18,
    name: "High Rated Gabru",
    artist: "Guru Randhawa",
    category: "bollywood",
    poster: "../img/18.jpg",
    audio: "../audio/18.mp3",
    duration: "3:28"
  },
  {
    id: 19,
    name: "Naina",
    artist: "Neha Kakkar",
    category: "bollywood",
    poster: "../img/19.jpg",
    audio: "../audio/19.mp3",
    duration: "3:38"
  },
  {
    id: 20,
    name: "Coka",
    artist: "Honey Singh",
    category: "bollywood",
    poster: "../img/20.jpg",
    audio: "../audio/20.mp3",
    duration: "3:20"
  },

  // Arijit Singh / Extra (21-35)
  {
    id: 21,
    name: "Tum Hi Ho",
    artist: "Arijit Singh",
    category: "bollywood",
    poster: "../img/arjit/1.jpg",
    audio: "../audio/arjit/1.mp3",
    duration: "4:22"
  },
  {
    id: 22,
    name: "Channa Mereya",
    artist: "Arijit Singh",
    category: "bollywood",
    poster: "../img/arjit/2.jpg",
    audio: "../audio/arjit/2.mp3",
    duration: "4:48"
  },
  {
    id: 23,
    name: "Ae Dil Hai Mushkil",
    artist: "Arijit Singh",
    category: "bollywood",
    poster: "../img/arjit/3.jpg",
    audio: "../audio/arjit/3.mp3",
    duration: "4:30"
  },
  {
    id: 24,
    name: "Kabira",
    artist: "Arijit Singh",
    category: "bollywood",
    poster: "../img/arjit/4.jpg",
    audio: "../audio/arjit/4.mp3",
    duration: "3:55"
  },
  {
    id: 25,
    name: "Raabta",
    artist: "Arijit Singh",
    category: "bollywood",
    poster: "../img/arjit/5.jpg",
    audio: "../audio/arjit/5.mp3",
    duration: "4:05"
  },
  {
    id: 26,
    name: "Janam Janam",
    artist: "Arijit Singh",
    category: "bollywood",
    poster: "../img/arjit/6.jpg",
    audio: "../audio/arjit/6.mp3",
    duration: "4:15"
  },
  {
    id: 27,
    name: "Gerua",
    artist: "Arijit Singh",
    category: "bollywood",
    poster: "../img/arjit/7.jpg",
    audio: "../audio/arjit/7.mp3",
    duration: "4:40"
  },
  {
    id: 28,
    name: "Hamari Adhuri Kahani",
    artist: "Arijit Singh",
    category: "bollywood",
    poster: "../img/arjit/8.jpg",
    audio: "../audio/arjit/8.mp3",
    duration: "5:10"
  },
  {
    id: 29,
    name: "Darkside",
    artist: "Alan Walker",
    category: "bollywood",
    poster: "../img/arjit/9.jpg",
    audio: "../audio/arjit/9.mp3",
    duration: "3:32"
  },
  {
    id: 30,
    name: "On My Way",
    artist: "Alan Walker",
    category: "bollywood",
    poster: "../img/arjit/10.jpg",
    audio: "../audio/arjit/10.mp3",
    duration: "3:18"
  },
  {
    id: 31,
    name: "Faded",
    artist: "Alan Walker",
    category: "bollywood",
    poster: "../img/arjit/11.jpg",
    audio: "../audio/arjit/11.mp3",
    duration: "3:33"
  },
  {
    id: 32,
    name: "Mortals",
    artist: "Warriyo",
    category: "bollywood",
    poster: "../img/arjit/12.jpg",
    audio: "../audio/arjit/12.mp3",
    duration: "3:50"
  },
  {
    id: 33,
    name: "Why We Lose",
    artist: "Cartoon ft. Coleman Trapp",
    category: "bollywood",
    poster: "../img/arjit/13.jpg",
    audio: "../audio/arjit/13.mp3",
    duration: "3:25"
  },
  {
    id: 34,
    name: "Sky High",
    artist: "Elektronomia",
    category: "bollywood",
    poster: "../img/arjit/14.jpg",
    audio: "../audio/arjit/14.mp3",
    duration: "3:42"
  },
  {
    id: 35,
    name: "Different World",
    artist: "Alan Walker",
    category: "bollywood",
    poster: "../img/arjit/15.jpg",
    audio: "../audio/arjit/15.mp3",
    duration: "3:48"
  }
];

// Artists data
const ARTISTS = [
  { name: "Arijit Singh", role: "Singer", image: "../img/arjit.jpg" },
  { name: "Alan Walker", role: "DJ / Producer", image: "../img/alan.jpg" },
  { name: "Diljit Dosanjh", role: "Singer / Actor", image: "../img/Diljit_Dosanjh.jpg" },
  { name: "Guru Randhawa", role: "Singer", image: "../img/guru.jpg" },
  { name: "Honey Singh", role: "Rapper / Producer", image: "../img/honey.jpg" },
  { name: "Neha Kakkar", role: "Singer", image: "../img/neha.jpg" },
  { name: "Jubin Nautiyal", role: "Singer", image: "../img/jubin Nautiyal.jpg" },
  { name: "Dhvani Bhanushali", role: "Singer", image: "../img/dhvani.jpg" },
  { name: "Atif Aslam", role: "Singer", image: "../img/atif.jpg" },
  { name: "Akhil", role: "Singer", image: "../img/akhil.jpg" }
];
