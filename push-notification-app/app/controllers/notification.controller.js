const db = require("../models");
const Notification = db.notification;
const Op = db.Sequelize.Op;

// Create and Save a new Tutorial
exports.create = (req, res) => {
  // Validate request
  if (!req.body.address) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a Tutorial
  const notification = {
    address: req.body.address,
    token: req.body.token,
    lang: req.body.lang ? req.body.lang : 'kr',
    platform: req.body.platform
  };

  // Save Tutorial in the database
  Notification.create(notification)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Notification."
      });
    });
};

exports.send = (req, res) => {
  // Validate request
  if (!req.body.address) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  const address = req.body.address
  var condition = address ? { address: { [Op.iLike]: `%${address}%` } } : null;

  Notification.findAll({ where: condition , raw: true})
      .then(data => {
        console.log('retriever data :', data);
        console.log('retriever data len:', data.length);
        console.log('retriever data 0:', data[0]);
        const tokens = [];
        for(var i=0; i<data.length; i++){
          const token = data[i].token;
          console.log('token')
          tokens.push(token)
        }
        sendPush(tokens)
        res.send('ok');
      })
      .catch(err => {
        res.status(500).send({
          message:
              err.message || "Some error occurred while send Notification."
        });
      });
};


// Retrieve all Tutorials from the database.
exports.findAll = (req, res) => {
  const address = req.query.address;
  var condition = address ? { address: { [Op.iLike]: `%${address}%` } } : null;

  Notification.findAll({ where: condition })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Notification."
      });
    });
};

// Find a single Tutorial with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Notification.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Notification with id=" + id
      });
    });
};

// Update a Tutorial by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Notification.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Tutorial was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Notification with id=${id}. Maybe Notification was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Notification with id=" + id
      });
    });
};

// Delete a Tutorial with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Notification.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Tutorial was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Notification with id=${id}. Maybe Notification was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Tutorial with id=" + id
      });
    });
};

// Delete all Tutorials from the database.
exports.deleteAll = (req, res) => {
  Notification.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Notification were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all Notification."
      });
    });
};


const { Expo } = require('expo-server-sdk');

const sendPush = (somePushTokens)=> {

  // https://github.com/expo/expo-server-sdk-node
  console.log('send Push : ', somePushTokens)
  let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

  // Create the messages that you want to send to clients
  let messages = [];
  for (let pushToken of somePushTokens) {
    // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
    messages.push({
      to: pushToken,
      sound: 'default',
      body: 'This is a test notification',
      data: { withSome: 'data' },
    })
  }


  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  (async () => {
    // Send the chunks to the Expo push notification service. There are
    // different strategies you could use. A simple one is to send one chunk at a
    // time, which nicely spreads the load out over time:
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
        // NOTE: If a ticket contains an error code in ticket.details.error, you
        // must handle it appropriately. The error codes are listed in the Expo
        // documentation:
        // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
      } catch (error) {
        console.error(error);
      }
    }
  })();
}