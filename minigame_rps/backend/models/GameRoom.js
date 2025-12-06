module.exports = (sequelize, DataTypes) => {
  const GameRoom = sequelize.define('GameRoom', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    player1Id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    player2Id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('waiting', 'playing', 'finished'),
      defaultValue: 'waiting'
    },
    result: {
      type: DataTypes.JSON, // Store round results or final result
      allowNull: true
    }
  });
  return GameRoom;
};
