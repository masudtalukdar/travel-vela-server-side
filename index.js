const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5fab0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log('database connected');

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db('travel-vela');
    const bookingCollection = database.collection('bookings');
    const packageCollection = database.collection('package');

    // GET API
    // app.get('/bookings', async (req, res) => {
    //   const cursor = bookingCollection.find({});
    //   const bookings = await cursor.toArray();
    //   res.send(bookings);
    // });

    //GET USER BOOKING
    app.get('/userBookings/:email', async (req, res) => {
      const email = req.params.email;
      console.log('getting specific package', email);
      const query = { user: email };
      const cursor = await bookingCollection.find(query);
      const booking = await cursor.toArray();
      console.log(booking);
      res.send(booking);
    });
    app.get('/bookings', async (req, res) => {
      const cursor = await bookingCollection.find({});
      const booking = await cursor.toArray();
      res.send(booking);
    });

    //GET SINGLE PACKAGE
    app.get('/package/:id', async (req, res) => {
      const id = req.params.id;
      console.log('getting specific package', id);
      const query = { _id: ObjectId(id) };
      const cursor = await packageCollection.find(query);
      const booking = await cursor.toArray();
      res.json(booking[0]);
    });

    //update
    app.patch('/update/:id', async (req, res) => {
      const id = req.params.id;
      const { duration, packageName, image, description } = req.body;
      console.log('getting specific package', id);
      const query = { _id: ObjectId(id) };
      const result = await packageCollection.updateOne(query, {
        $set: {
          duration: duration,
          packageName: packageName,
          image: image,
          description: description,
        },
      });

      res.json(result);
    });

    app.patch('/updateBooking/:id', async (req, res) => {
      const id = req.params.id;
      const { status } = req.body;
      console.log('getting specific package', id);
      const query = { _id: ObjectId(id) };
      const result = await bookingCollection.updateOne(query, {
        $set: {
          status: status,
        },
      });

      res.json(result);
    });

    app.get('/allPackages', async (req, res) => {
      const cursor = await packageCollection.find({});
      const packages = await cursor.toArray();
      res.send(packages);
    });

    //POST API
    app.post('/addBooking', async (req, res) => {
      const booking = req.body;
      console.log('hit the post api', booking);

      const result = await bookingCollection.insertOne(booking);
      console.log(result);
      res.send(result);
    });

    //Add Package
    app.post('/addPackage', async (req, res) => {
      const package = req.body;
      console.log('hit the post api', package);

      const result = await packageCollection.insertOne(package);
      console.log(result);
      res.send(result);
    });

    // DELETE API
    app.delete('/delete/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await packageCollection.deleteOne(query);
      res.json(result);
    });
    app.delete('/deleteBookings/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.json(result);
    });
  } finally {
    // await clint.close()
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Running travel-vela-server');
});

app.listen(port, () => {
  console.log('Running travel-vela on port', port);
});
