require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const monk = require('monk');
const socketIO = require('socket.io');

const {
  getAllEvents,
  listenMessages,
} = require('./youtubeMessages');

const {
  CHAT_MONGO_URI,
} = process.env;

const db = monk(CHAT_MONGO_URI);
const messages = db.get('messages');

const app = express();
const server = http.Server(app);
const io = socketIO(server, {secure: true});

io.set('origins', `${process.env.CHAT_URL}:443`,`${process.env.CHAT_URL}:80`)

app.use(morgan('tiny'));
app.use(cors());

// Archivos estáticos para el cliente
app.use('/overlay', express.static(__dirname + '/overlay'));

app.get('/', (req, res) => {
  res.json({
    message: '📺 YT Live Chat API - Encuentro con la Vida 📺',
  });
});

app.get('/events', async (req, res, next) => {
  try {
    const events = await getAllEvents();
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


const converter = require('json-2-csv');

const downloadResource = (res, fileName, data) => {
  res.header('Content-Type', 'text/csv');
  res.attachment(fileName);
  return res.send(data);
}

app.get('/messages-csv', async (req, res, next) => {
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

    // return res.json(allMessages);

    const fields = [
      'message_id',
      'liveChatId',
      'message',
      'publishedAt',
      'channelId',
      'author.channelId',
      'author.channelUrl',
      'author.displayName',
      'author.profileImageUrl',
      'author.isVerified',
      'author.isChatOwner',
      'author.isChatSponsor',
      'author.isChatModerator'
    ]

    converter.json2csv(allMessages, fields, (err, csv) => {
      if (err) {
          throw err;
      }
  
      // print CSV string
      console.log(csv);
      // return res.json({'csv': csv})
      
      return downloadResource(res, 'test.csv', csv);

    });

  } catch (error) {
    return next(error);
  }
});



let listening = false;
async function listenChat() {
  if (listening) {
    return {
      listening: true,
      // channelId: process.env.CHAT_YOUTUBE_CHANNEL_ID
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
});
