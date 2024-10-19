const PORT = 8000;
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(cors());

console.log('hi from TOLLS-LOL server');

app.post('/completions', async (req, res) => {
  const options = {};
  try {
    const response = await fetch('https://insert.com', options);
    const data = await response.json();
    res.send(data);
  } catch (error) {
    console.error(error);
  }
});

app.listen(PORT, () => console.log('Your server is running on PORT ' + PORT));
