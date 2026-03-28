const express = require('express');
const cors = require('cors');
const documentRoutes = require('./routes/document.routes');
const matchRoutes = require('./routes/match.routes');


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes for doc
app.use('/documents', documentRoutes);
// routes for match
app.use('/match', matchRoutes);


// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).send('Something went  wrong!');
// });

module.exports = app;
