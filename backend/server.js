const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');


const scoreboardRoutes = require('./routes/scoreboardRoutes');

const app = express();

app.use(cors());
app.use(express.json());

//app.use('/api/scoreboard', scoreboardRoutes);

const PORT =  5000;
app.listen(PORT, () => {
  console.log(`🚀 Serwer działa na porcie ${PORT}`);
});
