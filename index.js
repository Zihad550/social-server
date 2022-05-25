const express = require('express');
const cors = require('cors');
const {MongoClient} = require("mongodb");
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
const { ObjectID } = require('bson');
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
        const usersCollection = database.collection('users');
        const feedsCollection = database.collection('feeds');
        
        // get routes
        // get feeds
        app.get('/feeds', async(req, res) => {
            const feeds = await feedsCollection.find({}).toArray();
            res.json(feeds);
        });

        // post routes
        // add user route
        app.post('/user', async(req, res) => {
            const result = await usersCollection.insertOne(req.body);
            res.json(result);
        });
        // add feed route
        app.post('/feed', async(req, res) => {
            const result = await feedsCollection.insertOne(req.body);
            res.json(result);
        });

        // update routes
        // update user name
        app.patch('/user/:id', async(req, res) => {
            const result = await usersCollection.updateOne({_id: ObjectID(req.params.id)}, {$set: {name: req.body}});
            res.json(result);
        });

        // update feed title
        app.patch('/feed/:id', async(req, res) => {
            const result = await feedsCollection.updateOne({_id: ObjectId(req.params.id)}, {$set: {title: req.body.title}});
            res.json(result);
        });

        // update feed comments
        app.patch('/feed/comments/:id', async(req, res) => {
            const result = await feedsCollection.updateOne({_id: ObjectId(req.params.id)}, {$push: {comments: req.body} });
            res.json(result);
        });

        // update feed likes
        app.patch('/feed/likes/:id', async(req, res) => {
            const result = await feedsCollection.updateOne({_id: ObjectId(req.params.id)}, {$inc: {likes: 1}});
            res.json(result);
        });

        // update feed dislikes
        app.patch('/feed/dislikes/:id', async(req, res) => {
            const result = await feedsCollection.updateOne({_id: ObjectId(req.params.id)}, {$inc: {dislikes: 1}});
            res.json(result);
        });

        // update user to admin
        app.patch('/admin', async(req, res) => {
            const result = await usersCollection.updateOne({email: req.body}, {$set: {role: 'admin'}});
            res.json(result);
        });


        // delete routes
        // delete user
        app.delete('/user/:id', async(req, res) => {
            const result = await usersCollection.deleteOne({_id: ObjectId(req.params.id)});
            res.json(result);
        });

        // delete feed
        app.delete('/feed/:id', async(req, res) => {
            const result = await feedsCollection.deleteOne({_id: ObjectId(req.params.id)});
            res.json(result);
        });

        // auth routes
        // register route or add user route
        app.post('/register', async(req, res) => {
            const {name, email, password} = req.body;
            const user = await usersCollection.findOne({email});
            if(user){
                res.json({error: 'User Exists'});
            }
            else{
                const hashedPassword = bcrypt.hash(password, 10);
                const newUser = {
                    name,
                    email,
                    password: hashedPassword
                };
                const result = await usersCollection.insertOne(newUser);
                res.json({...result, newUser});
            }
        });

        // login route
        app.post('/login', async(req, res) => {
            const {email, password} = req.body;
            const user = await usersCollection.findOne({email});

            if(user){
                const isValidPassword = await bcrypt.compare(password, user.password);
                if(isValidPassword){
                    res.json({success: 'Authentication successful', ...user});
                }
                else{
                    res.json({error: 'Authentication failed'});
                }
            }
            else{
                res.json({error: 'Authentication failed'});
            }
        })

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