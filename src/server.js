require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const monk = require('monk');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
mongoose.set('debug', true);

const {
  getAllEvents,
  listenMessages,
} = require('./youtubeMessages');

const {
  CHAT_MONGO_URI, CHAT_MONGOOSE_URI
} = process.env;

const db = monk(CHAT_MONGO_URI);
const messages = db.get('messages');

const app = express();
const server = http.Server(app);
const io = socketIO(server);

// io.set('origins', `${process.env.CHAT_URL}:443`,`${process.env.CHAT_URL}:80`)

app.use(morgan('tiny'));
app.use(cors());

// Archivos estáticos para el cliente
app.use('/overlay', express.static(__dirname + '/overlay'));

app.get('/', (req, res) => {
  res.json({
    message: '📺 YT Live Chat API - Encuentro con la Vida 📺',
  });
});

/*SCHEMA************************************************************** */
const ThumbnailSchema = mongoose.Schema({
  url: String,
  width: Number,
  height: Number,
});

const SnippetSchema = mongoose.Schema({
  publishedAt: Date,
  channelId: String,
  title: String,
  description: String,
  thumbnails: {
      default: {
          type: ThumbnailSchema,
          required: true,
      },
      medium: {
          type: ThumbnailSchema,
          required: true,
      },
      high: {
          type: ThumbnailSchema,
          required: true,
      }
  },
  channelTitle: String,
  liveBroadcastContent: String,
  publishTime: Date,
  liveChatId: String,
  });

const LiveStreamingDetailsSchema = mongoose.Schema({
  actualStartTime: Date,
  scheduledStartTime: Date,
  concurrentViewers: String,
  activeLiveChatId: String,
});

const EventSchema = mongoose.Schema({
  kind: String,
  etag: String,
  id: String,
  snippet: {
      type: SnippetSchema,
      required: true,
  },
  videoId: String,
  liveStreamingDetails: {
      type: LiveStreamingDetailsSchema,
      required: true,
  }
});

const EventModel = mongoose.model("Event", EventSchema);
/********************************************************************* */
app.get('/events', async (req, res, next) => {
  try {
    const events = await getAllEvents();
    for (const event of events) {
      EventModel.findOneAndUpdate({id: event.id}, event, {upsert: true}, function (err, r) {
        if(err) console.log('error: ',err)

      })
    }
    return res.json(events);
  } catch (error) {
      return next(error);
  }
});

app.get('/messages', async (req, res, next) => {
  try {
    const where = {};
    if (req.query.liveChatId) {
      where.liveChatId = req.query.liveChatId;
    }
    if (req.query.q) {
      where.message = { $regex: req.query.q.toString() };
    }
    const allMessages = await messages.find(where, {
      $orderby: { publishedAt: -1 },
    });
    return res.json(allMessages);
  } catch (error) {
      return next(error);
  }
});


app.get('/all-events', async (req, res, next) => {
  try {
    const where = {};
    if (req.query.q) {
      where.message = { $regex: req.query.q.toString() };
    }
    const allEvents = await messages.distinct("liveChatId");
    return res.json(allEvents);
  } catch (error) {
    return next(error);
  }
});

const converter = require('json-2-csv');

const downloadResource = (res, fileName, data) => {
  res.header('Content-Type', 'text/csv');
  res.attachment(fileName);
  return res.send(data);
}

// app.get('/messages-csv', async (req, res, next) => {
//   try {
//     const where = {};
//     if (req.query.liveChatId) {
//       where.liveChatId = req.query.liveChatId;
//     }
//     if (req.query.q) {
//       where.message = { $regex: req.query.q.toString() };
//     }
//     const allMessages = await messages.find(where, {
//       $orderby: { publishedAt: -1 }
//     });

//     // return res.json(allMessages);

//     const fields = [
//       'message_id',
//       'liveChatId',
//       'message',
//       'publishedAt',
//       'channelId',
//       'author.channelId',
//       'author.channelUrl',
//       'author.displayName',
//       'author.profileImageUrl',
//       'author.isVerified',
//       'author.isChatOwner',
//       'author.isChatSponsor',
//       'author.isChatModerator'
//     ]

//     converter.json2csv(allMessages, fields, (err, csv) => {
//       if (err) {
//         throw err;
//       }

//       // print CSV string
//       console.log(csv);
//       // return res.json({'csv': csv})

//       return downloadResource(res, 'test.csv', csv);

//     });

//   } catch (error) {
//     return next(error);
//   }
// });



app.get('/asitentes/:liveChatId', async (req, res, next) => {
  try {
    // return res.json(allMessages);

    const aggregate = messages.aggregate([
      {$match: {liveChatId: req.params.liveChatId }},
      {$group: {_id:"$author.displayName"} }
    ]);

    console.log(await aggregate);

    /*** TESTED ON MONGO ATLAS, OK
     * 
     * db.messages.aggregate([
          {$match: {liveChatId: "Cg0KC05kMG1LdG1vSWJZKicKGFVDMEllUVhKbmwzN29OUGhRV3hEZUgydxILTmQwbUt0bW9JYlk"}},
          {$group: {_id:"$author.displayName", total: {$sum: "$author.displayName"}} }
        ])
     */

    const fields = [
      'nombre'
    ]

    converter.json2csv(await aggregate, fields, (err, csv) => {
      if (err) {
        throw err;
      }

      // print CSV string
      console.log(csv);
      // return res.json({'csv': csv})

      return downloadResource(res, 'agregateTest.csv', csv);

    });

  } catch (error) {
    return next(error);
  }
});

/*SCHEMA************************************************************** */
const AuthorSchema = mongoose.Schema({
  channelId: String,
  channelUrl: String,
  displayName: String,
  profileImageUrl: String,
  isVerified: Boolean,
  isChatOwner: Boolean,
  isChatSponsor: Boolean,
  isChatModerator: Boolean
});

const MessageSchema = mongoose.Schema({
  message_id: String,
  liveChatId: String,
  message: String,
  publishedAt: String,
  channelId: String,
  author: {
      type: AuthorSchema,
      required: true,
  },
});

const MessageModel = mongoose.model("Message", MessageSchema);
/********************************************************************** */

let listening = false;
async function listenChat() {
  if (listening) {
    return {
      listening: true
    };
  }
  const liveEvent = (await getAllEvents())
    .find((event) => event.liveStreamingDetails.concurrentViewers);
  if (liveEvent) {
    listening = true;
    const {
      snippet: {
        liveChatId,
      },
    } = liveEvent;
    const listener = listenMessages(liveChatId);
    listener.on('messages', async (newMessages) => {
      newMessages = newMessages.sort((a, b) => a.publishedAt - b.publishedAt);
      io.emit('messages', newMessages);
     
     // Save the messages using mongoose....
      for (const message of newMessages) {
        // console.log('receiving this message: ', message);
        MessageModel.findOneAndUpdate({message_id: message.message_id},message, {upsert: true}, function (err, r) {
          if(err) console.log('error: ',err)
        })
      }  

      // Save the messages using monk.
      newMessages.forEach((message) => messages.update({
        message_id: message.message_id,
      }, message, {
        replaceOne: true,
        upsert: true,
      }));
      
    });
    listener.on('event-end', (data) => {
      io.emit('event-end', data);
      listening = false;
    });
    return {
      listening: true,
    };
  }
  return {
    listening: false,
  };
}

app.get('/listen', async (req, res) => {
  const result = await listenChat();
  return res.json(result);
});



function notFound(req, res, next) {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

// eslint-disable-next-line
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  res.status(status);
  res.json({
    status,
    message: err.message,
  });
}

app.use(notFound);
app.use(errorHandler);



const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
  mongoose
    .connect(CHAT_MONGOOSE_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log(`Conneted to mongoDB with mongoose`);
      });
});
