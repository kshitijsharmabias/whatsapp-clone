 //imports
 import express from 'express'
 import  mongoose  from 'mongoose'
 import Messages from './dbMessages.js'
 import Cors from 'cors'
 import Pusher from "pusher"





 //app config
 const app= express()
 const port = process.env.PORT||9000
 const connection_url= 'mongodb+srv://admin:SRJOKxvNrfEF4QnA@cluster0.yyyus.mongodb.net/whatsappDB?retryWrites=true&w=majority'
 const pusher = new Pusher({
    appId: "1276082",
    key: "fb37f22531de60baed47",
    secret: "7eceae92a3827ca7195f",
    cluster: "ap2",
    useTLS: true
  });


 //middleware
 app.use(express.json())
 app.use(Cors())


 //Db Config
 mongoose.connect(connection_url,{
     useNewUrlParser:true,
     useUnifiedTopology:true
 })


 //api routes
//pusher code 
const db= mongoose.connection
db.once("open",()=>{
    console.log("Db Connected")
    const msgCollection =db.collection("whatsappmessages")
    const changeStream = msgCollection.watch()

    changeStream.on('change',change=>{
        console.log(change)
        if (change.operationType==="insert"){
            const messageDetails= change.fullDocument
            pusher.trigger("messages","inserted",{
                name:messageDetails.name,
                message:messageDetails.message,
                timestamp:messageDetails.timestamp,
                received:messageDetails.received

            })
        }
        else{
            console.log('Error triggering pusher')
        }
    })
})

 app.get('/',(req,res)=>{
     res.status(200).send("Whatsapp ")
 })
 app.get('/messages/sync',(req,res)=>{
    const dbMessage= req.body
    Messages.find((err,data)=>{
        if (err)
        {
            res.status(500).send(err)
        }
        else{
            res.status(200).send(data)
        }
    })  
})
 app.post('/messages/new',(req,res)=>{
     const dbMessage= req.body
     Messages.create(dbMessage,(err,data)=>{
         if (err)
         {
             res.status(500).send(err)
         }
         else{
             res.status(201).send(data)
         }
     }) 
 })

 //listen
 app.listen(port,()=>{
     console.log(`Listening on Port : ${port}`)
 })


  