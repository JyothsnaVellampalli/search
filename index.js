const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const { MongoClient, mongoURI}  = require('./routes')

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/public')));
const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> {console.log('app is listening to port 4000')})

app.post('/addData', async function(req, res) {
    const client = await MongoClient.connect(mongoURI);
    const DB = await client.db('users');
    console.log(req.body, 'body');
    const response = await DB.collection('addsearch').insertMany(req.body);
    res.json({
        status: 200,
        message: 'added successfully'
    })
})

app.post('/updateData', async function(req, res) {
    const client = await MongoClient.connect(mongoURI);
    const DB = await client.db('users');
    const updateObj = new Object();
    if (req.body['newImg']) {
        console.log('img', req.body['newImg']);
        updateObj['image'] = req.body['newImg'];
        console.log(updateObj);
    }
    const response = await DB.collection('addsearch').updateOne({id: req.body.id}, {$set: updateObj});
    res.json({
        status: 200,
        message: 'updated successfully'
    })
})

app.get('/getAll', async function(req, res) {
  const client = await MongoClient.connect(mongoURI);
    const DB = await client.db('users');
    const response = await DB.collection('addsearch').find().toArray();
    if(response) {
      res.json({
          status: 200,
          adds: response,
      })
      } else {
          res.json({
              status: 404,
              message: 'could not find'
          })
      }
})

app.get('/getData/:id', async function(req, res) {
    const client = await MongoClient.connect(mongoURI);
    const DB = await client.db('users');
    const pipeline = [
        {
          '$search': {
            'index': 'searchAdds',
            'text': {
              'query': req.params.id,
              'path': {
                'wildcard': '*'
              }
            }
          }
        }
      ]
    const response = await DB.collection('addsearch').aggregate(pipeline).toArray();

    if(response) {
    res.json({
        status: 200,
        adds: response,
    })
    } else {
        res.json({
            status: 404,
            message: 'could not find'
        })
    }
})

