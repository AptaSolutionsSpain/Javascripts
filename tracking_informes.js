registrarTrackingUsoInformes();
function registrarTrackingUsoInformes(){
	// Se define el objeto con el cual mas tarde se asignarán los registros según los informes consultados por el usuario en la página visitada
	var informesConsultados = [];

	// Función para pasando un número que devuelva siempre 2 dígitos (inserta 1 zero al principio si es menor a 10)
	function padNumber(num) {
	  return num.toString().padStart(2, '0');
	}

	// Obtener nombre, apellidos y username
	if(window.parent.userFirstName && window.parent.userFirstName != null
	&& window.parent.userLastName && window.parent.userLastName != null
	&& window.parent.userName && window.parent.userName != null
	&& window.parent.RALLY && window.parent.RALLY.context && window.parent.RALLY.context != null){
		var contexto = window.parent.getCurrentNavState();
		if(contexto != null){
			var nombreEquipo = window.parent.RALLY.context.projectName;
			var flagScopeUp = window.parent.RALLY.context.projectScopingUp;
			var flagScopeDown = window.parent.RALLY.context.projectScopingDown;
			var navegacion = contexto._navPath.path[2].name + " > " + contexto._navPath.path[3].name;
			var usuario = window.parent.userFirstName + " " + window.parent.userLastName + " (" + window.parent.userName + ")";
			var fechaActual = new Date();
			var fechaFormateadaActual = 
				fechaActual.getFullYear() + "/"
				+ padNumber(fechaActual.getMonth() + 1)
				+ "/" + padNumber(fechaActual.getDate())
				+ " " + padNumber(fechaActual.getHours())
				+ "-" + padNumber(fechaActual.getMinutes())
				+ "-" + padNumber(fechaActual.getSeconds());
			
			// Obtener APPs mostradas en página actual
			var APPs = window.parent.document.getElementsByClassName("chr-Dashboard-col")[0];
			for(var a = 0; a < APPs.childElementCount; a++){ var APP=APPs.childNodes[a]; var nombreAPP=APP.getElementsByClassName("smb-HeaderGroup-title" ); if(nombreAPP && nombreAPP.length> 0){
					nombreAPP = nombreAPP[0].innerHTML;
					informesConsultados.push({
						'usuario' : usuario
						, 'fecha' : fechaFormateadaActual
						, 'equipo' : nombreEquipo
						, 'navegacion' : navegacion
						, 'scopeUp' : flagScopeUp
						, 'scopeDown' : flagScopeDown
						, 'APP' : nombreAPP
					});
				}
			}
		}	
	}
	console.log(informesConsultados);
	// Se procede a actualizar el Hito Tracking Informes para registrar los datos de informes consultados
	if(informesConsultados.length > 0){
		// Se obtiene el API Token
		const apiToken = window.parent.RALLY.getSecurityToken();
		// Se consulta el valor actual del campo para añadirlo al principio de la cadena a escribir en el campo Tracking Informes
		const urlHito = location.origin + '/slm/webservice/v2.0/milestone/75650599817?fetch=c_TrackingInformes';

		fetch(urlHito, {
		  method: 'GET', // Método HTTP utilizado para la solicitud
		  headers: {
			'Content-Type': 'application/json'
		  }
		})
		.then(response => response.json()) // Convertir la respuesta a JSON
		.then(data => {
			var datosMilestoneTracking = data.Milestone;
			if(datosMilestoneTracking){
				var c_TrackingInformesActual = datosMilestoneTracking.c_TrackingInformes;
				
				var JSON_TrackingInformes = JSON.stringify(informesConsultados).replace("[", "").replace("]","");
				if(c_TrackingInformesActual != null && c_TrackingInformesActual.trim() != ""){
					JSON_TrackingInformes = c_TrackingInformesActual + "," + JSON_TrackingInformes;
				}
				
				// La URL de la API de Rally para modificar el Hito de Tracking Informes
				const url = location.origin + '/slm/webservice/v2.x/batch?key=' + apiToken;					
			
				// Los datos para actualizar el Hito
				const datos = {
					"Batch":[{
						"Entry":{
							"Path":"/milestone/75650599817"
							, "Method":"post"
							,"Body":{"milestone":{
								"c_TrackingInformes": JSON_TrackingInformes
							}}
						}
					}]
				};

				// Configuración de la solicitud
				const fetchOptions = {
				  method: 'POST',
				  headers: {
					'Content-Type': 'application/json'
				  },
				  body: JSON.stringify(datos)
				};

				// Realizar la solicitud POST para actualizar el Hito en Rally
				fetch(url, fetchOptions)
				  .then(response => response.json())
				  .then(data => {
					console.log('Hito Tracking Informes actualizado con éxito:', data);
				  })
				  .catch(error => console.error('Error al modificar el Hito de Tracking Informes', error));
			}						
		}) // Manipulación de los datos recibidos
		.catch(error => console.error('Error:', error)); // Manejo de errores
	}
}
