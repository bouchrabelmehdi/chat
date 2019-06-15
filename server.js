var bodyParser = require('body-parser')
var express = require('express');
var app = express();
var http = require('http').Server(app);
var mongoose = require('mongoose');
var io = require('socket.io')(http);

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

var Message = mongoose.model('Message',{
  name : String,
  message : String
})

var url = 'mongodb://127.0.0.1/chat'

app.get('/messages', (req, res) => {
  Message.find({},(err, messages)=> {
    res.send(messages);
  }).limit(100)
})

app.get('/messages/:user', (req, res) => {
  var user = req.params.user
  Message.find({name: user},(err, messages)=> {
    res.send(messages);
  })
})

app.post('/messages', async (req, res) => {
  try{
    var message = new Message(req.body);
    var savedMessage = await message.save()
      console.log('message saved');
    var censored = await Message.findOne({message:'notallowedword'});
      if(censored)
        await Message.remove({_id: censored.id})
      else
        io.emit('message', req.body);
      res.sendStatus(200);
  }
  catch (error){
    res.sendStatus(500);
    return console.log('error',error);
  }
  finally{
    console.log('message posted')
  }
})

mongoose.connect(url ,{useNewUrlParser : true} ,(err) => {
  console.log('mongodb connected',err);
})

io.on('connection', () =>{
  console.log('user connected')
})

var server = http.listen(3000, () => {
  console.log('server connected on port', server.address().port);
});