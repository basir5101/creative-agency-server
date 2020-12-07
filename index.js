require ('dotenv').config();
const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra')
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;


app.use(bodyParser.json())
app.use(cors());
app.use(express.static('review'));
app.use(fileUpload())

const uri =  "mongodb://shishatola:Munny101@cluster0-shard-00-00.jo990.mongodb.net:27017,cluster0-shard-00-01.jo990.mongodb.net:27017,cluster0-shard-00-02.jo990.mongodb.net:27017/agency?ssl=true&replicaSet=atlas-ifk28h-shard-0&authSource=admin&retryWrites=true&w=majority"
//const uri = `mongodb+srv://shishatola:Munny101@cluster0.jo990.mongodb.net/agency?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const serviceCollection = client.db(`agency`).collection(`service`);
  const feedbackCollection = client.db(`agency`).collection(`reviews`);
  const messageCollection = client.db(`agency`).collection(`message`);
  const customerOrdersCollection = client.db(`agency`).collection(`order`);
  const adminCollection = client.db(`agency`).collection(`admin`);

  // add service post method
  app.post('/addService', (req, res) => {
      const file = req.files.file;
      const taskName = req.body.taskName;
      const description = req.body.description;
      const newImg = file.data;
      const encImg = newImg.toString('base64');

      const image = {
          contentType: file.mimetype,
          size: file.size,
          img: Buffer.from(encImg, 'base64')
      };
      const src = image.img;

      serviceCollection.insertOne({ taskName, description, src, image })
          .then(result => {
              res.send(result.insertedCount > 0);
          })
  })

  // fetch all service from database (get method)
  app.get('/services', (req, res) => {
      serviceCollection.find({}).limit(6)
          .toArray((err, documents) => {
              res.send(documents);
          })
  })

  // feedback post method
  app.post('/insertFeedback', (req, res) => {
    const  name = req.body.name;
    const description = req.body.description;
    const position = req.body.position;
    const file = req.files.file;
    const newImg = file.data;
    const encImg = newImg.toString('base64');
    const image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')
    }
    feedbackCollection.insertOne({name, description, image, position})
        .then(result => {
            res.send(result.insertedCount > 0)
        })
  })

  // feedback get method
  app.get('/feedbacks', (req, res) => {
      feedbackCollection.find({}).limit(6)
          .toArray((err, documents) => {
              res.send(documents);
          })
  })

  // store message in database
  app.post('/privateMessage', (req, res) => {
      message = req.body;
      messageCollection.insertOne(message)
          .then(result => {
              res.send(result.insertedCount > 0)
          })
  })

  // store customer order in database
  app.post('/placeOrder', (req, res) => {
      order = req.body;
      customerOrdersCollection.insertOne(order)
          .then(result => {
              res.send(result.insertedCount > 0)
          })
  })

  // fetch customer order from database
  app.get('/customerOrders/:email', (req, res) => {
      const email = req.params.email
      adminCollection.find({ email: email })
          .toArray((err, admin) => {
              const filter = {}
              if (admin.length === 0) {
                  filter.email = email
              }
              customerOrdersCollection.find(filter)
                  .toArray((err, documents) => {
                      res.send(documents);
                  })
          })

  })

  // make new admin
  app.post('/makeAdmin', (req, res) => {
      newAdmin = req.body
      adminCollection.insertOne(newAdmin)
          .then(result => {
              res.send(result.insertedCount > 0)
          })
  })

  // specified admin or user 
  app.get('/isAdmin', (req, res) => {
      adminCollection.find({ email: req.query.email })
          .toArray((err, documents) => {
              res.send(documents.length > 0)
          })
  })

  app.patch('/update/:id', (req, res) => {
      customerOrdersCollection.updateOne({ _id: ObjectId(req.params.id) },
          {
              $set: { status: req.body.status }
          })
          .then(result => {
              res.send(result.modifiedCount > 0)
          })
  })

  console.log('database connected');
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`App listening at 5000`)
})
