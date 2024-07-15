const connectToMongo = require('./config/db');
const express = require('express')
var cors = require('cors')

connectToMongo();

const app = express()
const port = 4000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello Sudhanshu!');
})

app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/notes', require('./routes/notes'));


app.listen(port, () => {
  console.log(`iNotebook API listening on port ${port}`)
})

