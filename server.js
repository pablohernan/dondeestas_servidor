// Check the configuration file for more details
var config = require('./config');

// Express.js stuff
var express = require('express');
var app = require('express')();
var server = require('http').Server(app);

// Websockets with socket.io
var io = require('socket.io')(server);

console.log("Trying to start server with config:", config.serverip + ":" + config.serverport);

// Both port and ip are needed for the OpenShift, otherwise it tries 
// to bind server on IP 0.0.0.0 (or something) and fails
server.listen(config.serverport, config.serverip, function() {
  console.log("Server running @ http://" + config.serverip + ":" + config.serverport);
});



// Allow some files to be server over HTTP
app.use(express.static(__dirname + '/'));

// Serve GET on http://domain/
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// Server GET on http://domain/api/config
// A hack to provide client the system config
app.get('/api/config', function(req, res) {
  res.send('var config = ' + JSON.stringify(config));
});
/**/

/* status constantes */
var _STATUS_DESCONECTADO = 0;
var _STATUS_CONECTADO = 1;
var _STATUS_ACTUALIZADO = 2;

var clientes = [];

// And finally some websocket stuff
io.on('connection', function (socket) { // Incoming connections from clients
  
	console.info('Cliente '+ socket.id +' conectado.');
	clientes.push({
		socket:socket ,
		id:socket.id ,
		name: null , 
		latitud: null , 
		longitud: null ,
		status: _STATUS_CONECTADO 
	});
	
    // Si desconcta lo saco de clientes 
    socket.on('disconnect', function() {
    	console.info('Cliente '+ socket.id +' desconectado.');
    	var index = clientes.ObjectIndexOf('id',socket.id);
        clientes[index].status = _STATUS_DESCONECTADO;
        clientes.splice(index, 1);
        
    });	
    
    
	// Greet the newcomer
	socket.emit('hello', { id: socket.id });
	
	socket.on('setCliente', function (data) { // setCliente -- servidor
		
		/* actualizo los datos del cliente en la posición id del array */
		var index = clientes.ObjectIndexOf('id',socket.id);
		if( index  > -1 && data.latitud && data.longitud){
			clientes[index].name = data.name;
			clientes[index].latitud = data.latitud; 
			clientes[index].longitud = data.longitud;
			clientes[index].status = _STATUS_ACTUALIZADO;
			
			/* versión para enviar ao cliente , sin algunos atributos */
			var clientesMin = clientes.map( 
							function(obj){ 
								return { 
									id : obj.id , 
									name : obj.name , 
									latitud : obj.latitud , 
									longitud : obj.longitud ,
									status : obj.status										
								} 
							});
	
			
			console.log(' socket.id ' + socket.id + ' : ' + data.name + ' : ' + data.latitud + ' , ' + data.longitud);
			if( !timerActive ){
				console.log('===== Emit =====')
				socket.emit('getClientes', { pingtime: data.pingtime , clientes: clientesMin}); 
				startTimer();
			}

		}
  });
});



/* Busca en un Array de Objetos el atributo X que tenga el valor Y y retorna la posición */
Array.prototype.ObjectIndexOf = function arrayObjectIndexOf(atributo, valor) {
    for (var i = 0, len = this.length; i < len; i++) {
        if (this[i][atributo] === valor) return i;
    }
    return -1;
}	



/* Timer para los Emit */
var t;
var timerActive=0;

function timer(){
	t=setTimeout(stopTimer, config.timeEmit );
}

function startTimer(){
if (!timerActive){
	timerActive=1;
  	timer();
  }
}

function stopTimer(){
	clearTimeout(t);
	timerActive=0;
}
/* Timer para los Emit */


