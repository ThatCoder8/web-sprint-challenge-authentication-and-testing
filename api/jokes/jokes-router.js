// do not make changes to this file
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const jokes = [
    {
      id: 1,
      joke: "Did you hear about the guy whose whole left side was cut off? He's all right now."
    },
    {
      id: 2,
      joke: "What do you call a factory that makes okay products? A satisfactory."
    },
    {
      id: 3,
      joke: "Dear Math, grow up and solve your own problems."
    },
    {
      id: 4,
      joke: "What did the ocean say to the beach? Thanks for always being there for me."
    },
    {
      id: 5,
      joke: "I only know 25 letters of the alphabet. I don't know y."
    },
  ];
  
  res.json(jokes);
});

module.exports = router;
