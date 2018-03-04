const app = require('express')();
const path = require('path');

// Route / to that
app.get('/', (req, res) => res.sendFile(__dirname + '/static/index.html'));

app.listen(3000);
