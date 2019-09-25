 
/*importar las dependencias*/
const sls = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express')
const app = express()
const AWS = require('aws-sdk');
/*Swagger*/
var swaggerUi = require('swagger-ui-express'), swaggerDocument = require('./swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const USERS_TABLE = process.env.USERS_TABLE;
const dynamoDb = new AWS.DynamoDB.DocumentClient();

app.use(bodyParser.json({ strict: false }));

/*Metodo parar crear el usuario*/
app.post('/usuario', function (req, res) {
  const { userId, name } = req.body;

  const params = {
    TableName: USERS_TABLE,
    Item: {
      userId: userId,
      name: name,
    },
  };

  dynamoDb.put(params, (error) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: `Could not create user ${userId}` });
    }
    res.json({ userId, name });
  });
})


/*Metodo parar obtener el usuario*/
app.get('/usuario/:userId', function (req, res) {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      userId: req.params.userId,
    },
  }

  dynamoDb.get(params, (error, result) => {
    if (error) {
      console.log("Ingreso al metodo (obtener usuario) ");
      console.log("Error en la llamada  descripcion : "+error);
      res.status(400).json({ error: `No puede optener el usuario ${userId}` });
    }
    if (result.Item) {
      console.log("Se obtiene el usuario correctamente");
      const { userId, name } = result.Item;
      res.json({ userId, name });
    } else {
      console.log("Url no encontrada");
      res.status(404).json({ error: `Usuario ${userId} No encontrado` });
    }
  });
})

module.exports.server = sls(app)