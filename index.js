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


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jo990.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const userCollection = client.db("agency").collection("order");
  const reviewCollection = client.db("agency").collection("reviews");
  const serviceCollection = client.db("agency").collection("service");
  const adminCollection = client.db("agency").collection("admin");
  console.log('db-connected')



//adding admin into database
app.post('/addAdmin', (req, res) =>{
  const admin = req.body
  adminCollection.insertOne(admin)
  .then(result =>{ 
    res.send(result.insertedCount > 0)
  })
})
 
// get all admins
app.get('/admins', (req, res) =>{
  adminCollection.find({})
  .toArray((err, documents) =>{
    res.send(documents)
  })
})

// adding service into database
  app.post('/addService', (req, res) =>{
    const service = req.body
    serviceCollection.insertOne(service)
    .then(result =>{ 
      res.send(result.insertedCount > 0)
    })
})

// get all services
 app.get('/services', (req, res) =>{
   serviceCollection.find({})
   .toArray((err, documents) =>{
     res.send(documents)
   })
 })

 //adding reviews into database
//  app.post('/addReview', (req, res) =>{
//   const review = req.body
//   reviewCollection.insertOne(review)
//   .then(result =>{ 
//     res.send(result.insertedCount > 0)
//   })
// })

// adding reviews into database
app.post('/addReview', (req, res) =>{
  const file = req.files.file;
  const name = req.body.name;
  const Designation = req.body.Designation
  const description = req.body.description;
  const filePath = `${__dirname}/review/${file.name}`;

  file.mv(filePath, err =>{
    if(err){
      console.log(err);
      return res.status(500).send({msg: 'fail to load image'})
    }
    const newImg = fs.readFileSync(filePath);
    const encImg = newImg.toString('base64');

    var image = {
      contentType: req.files.file.mimetype,
      size: req.files.size,
      img: Buffer(encImg, 'base64')
    }

    reviewCollection.insertOne({name, description, Designation, image})
      .then(result =>{ 
        fs.remove(filePath, error =>{
          if(error){console.log(error)}
          res.send(result.insertedCount > 0)
        })
      })
  })
})



//get all reviews 
app.get('/reviews', (req, res) =>{
  reviewCollection.find({})
  .toArray((err, documents) =>{
    res.send(documents)
  })
})

//adding order into database
  app.post('/order', (req, res) =>{
      const order = req.body
      userCollection.insertOne(order)
      .then(result =>{ 
        res.send(result.insertedCount > 0)
      })
  })

  // get all orderList
 app.get('/allOrders', (req, res) =>{
  userCollection.find({})
  .toArray((err, documents) =>{
    res.send(documents)
  })
})

  // get all orderList by email
  app.get('/orderList/:email', (req, res) =>{
      userCollection.find({email: req.params.email})
    .toArray((err, documents) =>{
      res.send(documents)
    })
  })
  
  app.get('/', function (req, res) {
    res.send('Hello World')
  })

});



app.listen(process.env.PORT || 5000)