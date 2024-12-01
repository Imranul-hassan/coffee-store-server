
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER)


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1iyz9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    
    await client.connect();
    
    const coffeeCollection = client.db('coffeeDB').collection('coffee');
    const userCollection = client.db('coffeeDB').collection('users')

    app.get('/coffee', async(req, res)=>{
      const cursor = coffeeCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    app.get('/coffee/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await coffeeCollection.findOne(query)
      res.send(result)
    })

    app.post('/coffee', async(req, res)=>{
      const newCoffee = req.body;
      console.log(newCoffee)
      const result =await coffeeCollection.insertOne(newCoffee)
      res.send(result)
    })

    app.put('/coffee/:id', async(req, res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options ={upsert: true};
      const updateCoffee =req.body;
      const coffee = {
        $set:{
          name:updateCoffee.name,
          quantity:updateCoffee.quantity,
          supplier:updateCoffee.supplier,
          taste:updateCoffee.taste,
          category:updateCoffee.category,
          details:updateCoffee.details,
          photo:updateCoffee.photo,
        }
      }
      const result = await coffeeCollection.updateOne(filter, coffee, options)
      res.send(result)
    })

    app.delete('/coffee/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await coffeeCollection.deleteOne(query)
      res.send(result)
    })

    // user related apis
    app.get('/users', async(req, res)=>{
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    app.post('/users', async(req, res)=>{
        const newUser = req.body;

        const result = await userCollection.insertOne(newUser)
        res.send(result)
    })

    app.patch('/users', async(req, res)=>{
      const email = req.body.email;
      const filter= {email}
      const updateDoc = {
        $set:{
          lastSignInTime: req.body?.lastSignInTime
        }
      }
      const result = await userCollection.updateOne(filter, updateDoc)
      res.send(result);
    })

    app.delete('/users/:id', async(req, res)=>{
      const id = req.params.id; 
      const query = {_id: new ObjectId(id )}
      const result = await userCollection.deleteOne(query)
      res.send(result)
    })


    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res)=>{
    res.send('Coffee server is runing')
})

app.listen(port, ()=>{
    console.log(`coffee server port: ${port}`)
})