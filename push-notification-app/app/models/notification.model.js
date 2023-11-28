module.exports = (sequelize, Sequelize) => {
  const Notification = sequelize.define("notification", {
    address: {
      type: Sequelize.STRING
    },
    token: {
      type: Sequelize.STRING
    },
    lang: {
      type: Sequelize.STRING
    },
    platform: {
      type: Sequelize.STRING
    }
  });

  return Notification;
};
