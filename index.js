const express = require('express');
const cors = require('cors');
const {MongoClient} = require("mongodb");
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
const app = express();
const port = process.env.PORT || 8000;


// middle wares
app.use(cors());
app.use(express.json());

// mongo client
const client = new MongoClient(process.env.URI);

async function run(){
    try{
        await client.connect();
        const database = client.db('social');
    }
    finally{}
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Welcome to social server');
});

app.listen(port, () => {
    console.log("Port running at:", port)
})