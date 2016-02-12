// Use the Singleton pattern
// to make sure that only one Client object exists
var Client;

(function () {
  var instance;
  Client = function Client() {
    if (instance) {
      return instance;
    }

    // Set the instance variable and return it onwards
    instance = this;

    // Connect websocket to Server
    //this.connect();
    //console.log("Client started");
  };
}());

/* Nome */
Client.prototype.setName = function( name ) {
	this.name = name;
}

Client.prototype.getName = function() {
	return this.name;
}
/* Nome */

/* Id */
Client.prototype.setId = function( id ) {
	this.id = id;
}

Client.prototype.getId = function() {
	return this.id;
}
/* Id */

Client.prototype.connect = function() {
  var connString = config.protocol + config.domain + ':' + config.clientport;

  console.log("Websocket connection string:", connString, config.wsclientopts);

  var self = this;

  this.socket = io.connect(connString, config.wsclientopts);

  // Handle error event
  this.socket.on('error', function (err) {  
    console.log("Websocket 'error' event:", err);
  });

  // Handle connection event
  this.socket.on('connect', function () { 
    console.log("Websocket 'connected' event with params:", self.socket);
    document.getElementById('top').innerHTML = "Conectado!";
  });

  // Handle disconnect event
  this.socket.on('disconnect', function () {
    console.log("Websocket 'disconnect' event");
    document.getElementById('top').innerHTML = "Disconnected.";
  });

// OWN EVENTS GO HERE...

  // Listen for server event
  this.socket.on('hello', function (data) {
    console.log("Tu id ", data.id);
    self.setId( data.id ); 
    // Start heartbeat timer
    self.heartbeat(self); 
  });

  // pong to our ping
  this.socket.on('getClientes', function (data) {
    
/*

{
	socket:socket ,
	id:socket.id ,
	name: data.name, 
	latitud: data.latitud, 
	longitud: data.longitud
	status: _STATUS_ACTUALIZADO 	
			
}		
	  
*/	  
	
	  
	  if(data.pingtime == self.pingtime) {
    			  
		self.tiempoRespuesta = Date.now() - self.pingtime + " milisegundos";
		document.getElementById('ping').innerHTML = self.tiempoRespuesta; 
		var clientesFormatada = '';
		for( var i=0; i<data.clientes.length ; i++ ){
			
			clientesFormatada += '<br>--------------------------------------------<br>';
			clientesFormatada += ' - id : ' + data.clientes[i].id + '<br>';
			clientesFormatada += ' - name : ' + data.clientes[i].name + '<br>';
			clientesFormatada += ' - latitud : ' + data.clientes[i].latitud + '<br>';
			clientesFormatada += ' - longitud : ' + data.clientes[i].longitud + '<br>';
			clientesFormatada += ' - status : ' +  data.clientes[i].status + '<br>';			
		}
		  
		document.getElementById('clientes').innerHTML = clientesFormatada;
	}else {
		console.log("pong failed:", data.pingtime, self.pingtime);
	}
  });

};

// Keep pinging and ponging with server
Client.prototype.heartbeat = function (self) {
	
	function getLocation() {
	    if (navigator.geolocation) {
	        navigator.geolocation.getCurrentPosition(showPosition);
	    } else {
	    	self.location = "Geolocation is not supported by this browser.";
	    }
	}
	function showPosition(position) {
		self.latitud = position.coords.latitude;
		self.longitud = position.coords.longitude; 
	}	
	// Create heartbeat timer,
	// the third param 'self' is not supported in IE9 and earlier 
	var tmo = setTimeout(self.heartbeat, config.heartbeattmo, self); 
  	if(self.latitud && self.longitud){
  		self.pingtime = Date.now();
  		//self.socket.emit('setCliente', {pingtime: self.pingtime, location: self.location , name : self.getName() });

  		
		/* envia */
  		self.socket.emit('setCliente', {
  				pingtime: self.pingtime, 
				latitud : self.latitud ,
				longitud : self.longitud ,
				name : self.getName() 
		});  		
  		
	}
  	getLocation();
};
