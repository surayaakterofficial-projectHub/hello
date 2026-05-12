require("dotenv").config();
const { ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const SSLCommerzPayment = require("sslcommerz-lts");
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// middleware

app.use(express.json());
app.use(cookieParser());

// mongodb uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.s8htxhw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// mongodb client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.use(cors({
  origin: [
     "http://localhost:5174",
    "http://localhost:5173",
    "https://zesty-blancmange-111055.netlify.app"
  ],
  credentials: true
}));
async function run() {

  try {

    // mongodb connect
    await client.connect();

    console.log("✅ MongoDB Connected");

    // database
    const database = client.db("ecomarsDB");

    // collections
    const usersCollection =
      database.collection("users");

    const productCollection =
      database.collection("products");

    const cartCollection =
      database.collection("cart");

const ordersCollection =
  database.collection("orders");
  
      const paymentCollection =
  database.collection("payments");



app.get("/products/:id", async (req, res) => {

  const id = req.params.id;

  const query = {
    _id: new ObjectId(id)
  };

  const result =
    await productCollection.findOne(query);

  res.send(result);

});


app.delete("/products/:id", async (req, res) => {

  const id = req.params.id;

  const query = {
    _id: new ObjectId(id)
  };

  const result =
    await productCollection.deleteOne(query);

  res.send(result);

});

app.patch("/products/:id", async (req, res) => {

  const id = req.params.id;

  const updatedData = req.body;

  const query = {
    _id: new ObjectId(id)
  };

  const updateDoc = {

    $set: updatedData

  };

  const result =
    await productCollection.updateOne(
      query,
      updateDoc
    );

  res.send(result);

});


    // =========================
    // Add Product API
    // =========================

    app.post("/products",
      async (req, res) => {

        const product = req.body;

        const result =
          await productCollection
          .insertOne(product);

        res.send(result);

    });



    // =========================
    // Get All Products
    // =========================

    app.get("/products",
      async (req, res) => {

        const result =
          await productCollection
          .find()
          .toArray();

        res.send(result);

    });



    // =========================
    // Category Wise Products
    // =========================

    app.get("/products/category/:category",
      async (req, res) => {

        const category =
          req.params.category;

        const query = {
          category: category
        };

        const result =
          await productCollection
          .find(query)
          .toArray();

        res.send(result);

    });



    // =========================
    // Add To Cart API
    // =========================

    app.post("/cart",
      async (req, res) => {

        const cartData = req.body;

        const result =
          await cartCollection
          .insertOne(cartData);

        res.send(result);

    });



    // =========================
    // Get Cart API
    // =========================

    app.get("/cart",
      async (req, res) => {

        const result =
          await cartCollection
          .find()
          .toArray();

        res.send(result);

    });
app.post("/orders", async (req, res) => {

  const orderData = req.body;

  const result =
    await ordersCollection.insertOne(
      orderData
    );

  res.send(result);

});
// =========================
// SSL PAYMENT API
// =========================

app.post("/payment", async (req, res) => {
console.log(req.body);
  const { totalAmount, email } = req.body;

  const tran_id =
    new ObjectId().toString();

 const data = {

  total_amount: totalAmount,

  currency: "BDT",

  tran_id: tran_id,

  success_url:
`https://bazarhub.onrender.com/payment/success/${tran_id}`,

 fail_url:`https://bazarhub.onrender.com/payment/fail/${tran_id}`,

 cancel_url:`https://bazarhub.onrender.com/payment/cancel/${tran_id}`,
 ipn_url:"https://bazarhub.onrender.com/ipn",

  shipping_method: "Courier",

  product_name: "Ecommerce Product",

  product_category: "General",

  product_profile: "general",

  cus_name: "Customer",

  cus_email: email,

  cus_add1: "Dhaka",

  cus_city: "Dhaka",

  cus_country: "Bangladesh",

  cus_phone: "01711111111",

  ship_name: "Customer Name",

  ship_add1: "Dhaka",

  ship_add2: "Dhaka",

  ship_city: "Dhaka",

  ship_state: "Dhaka",

  ship_postcode: 1000,

  ship_country: "Bangladesh",

};

  const sslcz = new SSLCommerzPayment(

    process.env.STORE_ID,

    process.env.STORE_PASSWORD,

    false

  );

  const apiResponse =
    await sslcz.init(data);
console.log(apiResponse);
  const paymentData = {

    email,

    transactionId: tran_id,

    amount: totalAmount,

    status: "pending",

    createdAt: new Date(),

  };

  await paymentCollection.insertOne(
    paymentData
  );

  res.send({
    url: apiResponse.GatewayPageURL,
  });

});


app.post(
  "/payment/success/:tranId",

  async (req, res) => {

    const tranId =
      req.params.tranId;

    await paymentCollection.updateOne(

      {
        transactionId: tranId
      },

      {
        $set: {
          status: "paid"
        }
      }

    );

    res.redirect(
      "https://zesty-blancmange-111055.netlify.app/payment-success"
    );

});

app.post(
  "/payment/fail/:tranId",

  async (req, res) => {

    const tranId =
      req.params.tranId;

    await paymentCollection.deleteOne({

      transactionId: tranId

    });

    res.redirect(
      "https://zesty-blancmange-111055.netlify.app/payment-fail"
    );

});

app.post(
  "/payment/cancel/:tranId",

  async (req, res) => {

    const tranId =
      req.params.tranId;

    await paymentCollection.deleteOne({

      transactionId: tranId

    });

    res.redirect(
      "https://zesty-blancmange-111055.netlify.app/payment-cancel"
    );

});




    // test route
    app.get("/", (req, res) => {
      res.send("Server Running");
    });

  }

  finally {

  }

}

run().catch(console.dir);


// server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});