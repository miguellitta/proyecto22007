let mysql      = require('mysql');
let connection = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASSWORD,
  database : process.env.DB_DATABASE,
});
 
connection.connect(function(error) {
    if(error) throw error
    console.log("DB conectada (ONLINE)")
});

setInterval(function () {
  connection.query('SELECT 1');
  console.log("manteniendo viva la conexion")
}, 50000);
 

module.exports = connection