const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");

admin.initializeApp(functions.config().firebase);

const app = express();

// to read request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = admin.firestore();

module.exports = functions.https.onRequest(app);

// To retreive transaction data
app.get('/api/getexpenses', async (req, res) => {
    var transactionList = [];
    await db.collection("expenses").get().then(data => {
        data.forEach(doc => {
            var newelement = 
            {
                "id": doc.id,
                "text": doc.data().expense,
                "amount": doc.data().amount
            }
            transactionList = transactionList.concat(newelement);
        });
        res.send(transactionList)
        return "";
    }).catch(error => {
        res.send(error)
    })
})

// To add new transaction data
app.post('/api/saveexpense', async (req, res) => {

    const expense = {
        id: req.body.id,
        expense: req.body.text,
        amount: req.body.amount
    };

    await db.collection("expenses").add(expense).then(data => {
        res.send({
            message: "transaction added"
        })
    }).catch(err => {
        console.error(`Error while adding transaction :: ${err}`);
        res.send({
            message: "transaction failed!"
        }).status(500)
    })
})

// To delete a transaction
app.delete('/api/deleteexpense', async (req, res) => {

    const id = req.query.id;
    await db.collection("expenses").doc(id).delete().then(data => {
        res.send({
            message: "transaction deleted"
        })
    }).catch(err => {
        console.error(`Error while deleting transaction :: ${err}`);
        res.send({
            message: "unable to delete!"
        }).status(500)
    })
})
