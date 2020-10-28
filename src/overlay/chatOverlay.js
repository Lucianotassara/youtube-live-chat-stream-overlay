
const COOLDOWN_GOTA_MS = 45000;
const COOLDOWN_MOTIVO_MS = 45000;
const TIMEOUT_MOTIVOS_PANTALLA = 1800000000;
const TIMEOUT_BURBUJA_PANTALLA = 9000;

let chatFijo = [
  {
    author: {
      channelId: "UCR0AYDs070yWgnX6X2Ygatw",
      channelUrl: "http://www.youtube.com/channel/UCR0AYDs070yWgnX6X2Ygatw",
      displayName: "Luciano Tassara",
      isChatModerator: false,
      isChatOwner: false,
      isChatSponsor: false,
      isVerified: false,
      profileImageUrl:
        "https://yt3.ggpht.com/-KLM1HdFMDpM/AAAAAAAAAAI/AAAAAAAAAAA/BsKLj9pR3ko/s88-c-k-no-mo-rj-c0xffffff/photo.jpg",
    },
    channelId: "UCR0AYDs070yWgnX6X2Ygatw",
    liveChatId:
      "Cg0KC2NnbFJlY0JYcVprKicKGFVDc2NYNXZXbE5mSjNXVExWVlAxR044URILY2dsUmVjQlhxWms",
    message: "Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.Suspendisse sed auctor urna, in eleifend nulla. Praesent viverra sem risus, id ornare nisi asdadf asdfa",
    message_id:
      "LCC.CjgKDQoLY2dsUmVjQlhxWmsqJwoYVUNzY1g1dldsTmZKM1dUTFZWUDFHTjhREgtjZ2xSZWNCWHFaaxI6ChpDTnZCOXFDUmctd0NGZGF3Z2dvZG9nSUhwdxIcQ0p1V3NwNzVndXdDRlZIRWtRb2RQbHdMWUEyMA",
    publishedAt: "2020-09-25T01:17:21.710Z",
  }
]

const SOCKET_URL = "https://chat.encuentrovida.com.ar";
// const SOCKET_URL = "http://192.168.100.105:5000";

function createGota(message) {
  const burbuja = document.createElement("div");
  burbuja.classList.add("burbuja");

  burbuja.style.left = Math.random() * 80 + "vw";
  burbuja.style.height = Math.random() * 10;
  burbuja.style.animationDuration = Math.random() * 5 + 6 + "s";

  burbuja.innerHTML = `<section class="container">
                        <div class="one message parker">
                          <h6 id="nombre">${message.author.displayName}</h6>
                          <p id="mensaje">${message.message}</p>
                          </div>
                        <div class="two">
                          <img id="avatar" src="${message.author.profileImageUrl}" alt="" width="48" height="48">
                          </div>
                      </section>`;

  document.body.appendChild(burbuja);

  //Listener para eliminar haciendo click
  burbuja.addEventListener("click", () => {
    burbuja.remove();
  });

  setTimeout(() => {
    burbuja.remove();
  }, TIMEOUT_BURBUJA_PANTALLA);
}
/**/

/********************** TEST BOTON **************************

const btn = document.getElementById("btn");

btn.addEventListener("click", () => {
    // createMotivo(chatFijo[Math.floor(Math.random() * 15) + 1]);
    createMotivo(chatFijo[0]);
});

********************** TEST BOTON **************************/

/* MOTIVOS DE ORACION */
const container = document.getElementById("container");

function createMotivo(message) {
  const motivo = document.createElement("div");
  motivo.classList.add("toast");

  motivo.innerHTML = ` <img id="avatar" src="${message.author.profileImageUrl}" alt="" width="48" height="48">
                      <h3 id="nombreMotivo">${message.author.displayName} pide oración</h3>
                      <p id="motivo">${message.message}</p>`;

  //Listener para eliminar haciendo click
  motivo.addEventListener("click", () => {
    motivo.remove();
  });

  container.appendChild(motivo);

  setTimeout(() => {
    motivo.remove();
    console.log(`pasaron ${TIMEOUT_MOTIVOS_PANTALLA/1000} segundos, remuevo el motivo de oración`);
  }, TIMEOUT_MOTIVOS_PANTALLA);
}

/* Burbujas de comentarios */
let orar = false;
let allowed = [];
let blacklistUsersLluvia = [];
let blacklistUsersOracion = [];
const socket = io(SOCKET_URL, {transport: websocket});

function manageMessage(element){
  // Guardo el mensaje en la variable comment
  let comment = element.message;

  /*** BUSCO SI EL MENSAJE ES UN COMANDO de moderador o dueño de transmisión */
  if (element.author.isChatOwner || element.author.isChatModerator || element.author.displayName == 'Luciano Tassara') {
    switch(comment){
      case '!hola': 
        allowed = ["HOLA","HOLAA","HOLAAA!","HOLA!","HOLIS!","BENDICIONES","HOLISSSS","👋 HOLA","👋 HOLA!!","👋👋","👋","👋👋👋"];
        console.log(`${element.author.displayName} activó el modo lluvia en hola 👋. Permitidos: ${allowed.toString()}` )
        break;
      case '!amen': 
        allowed = ["AMEN","AMÉN","AMEN!","AMÉN!","AMEN!!","AMÉN!!","🙏","🙏🙏","🙏🙏🙏","ALELUYA!","ALELUYA!!",'🙌🙌','',"🙌",'🎵','🎵🎵','🎵🎵🎵','🎶','🎶🎶','🎶🎶🎶'];
        console.log(`${element.author.displayName} activó el modo lluvia en amen 🙏. Permitidos: ${allowed.toString()}` )
        break;
      case '!chau': 
        allowed = ["CHAU","CHAU!","CHAUUU!!","CHAUUU!","BENDICIONES","HASTA LA PROXIMA","ADIOS!","ADIOS!!","👋👋","👋","👋👋👋"];
        console.log(`${element.author.displayName} activó el modo lluvia en chau 👋👋. Permitidos: ${allowed.toString()}` )
        break;
      case '!orar': 
        orar = true;
        allowed = ["AMEN","AMÉN","AMEN!","AMÉN!","AMEN!!","AMÉN!!","🙏","🙏🙏","🙏🙏🙏"];
        console.log(`${element.author.displayName} activó el modo lluvia en orar 🙏🙏🙏. Permitidos: ${allowed.toString()}` )
        break;
      case '!orar-end': 
        orar = false;
        console.log(`${element.author.displayName} desactivó el modo oración 🙏🙏🙏. Permitidos: ${allowed.toString()}` )
        break;
      case '!silent-mode': 
        orar = false;
        allowed = [];
        console.log(`${element.author.displayName} Activó el modo silencio 🔴🔴🔴.  Permitidos: ${allowed.toString()}` )
        break;
      case '!opciones': 
        allowed = ["1", "2", "3", "4", "5", "6", "A", "B", "C", "D", "E", "F"]; 
        console.log(`${element.author.displayName} activó el modo lluvia en opciones 🔴🔴. Permitidos: ${allowed.toString()}` )
        break;
      default: 
        console.log(`Escribió un moderador, pero no se reconoce el comando.`)
        break;
      
    }
  }

  /********************************************  MOTIVOS *********************************/
  // está habilitado el modo orar?
  if(orar){
    let str = element.message;
    // se utilizó el comando correcto?
    if (str.startsWith("!orar ")) {
      // el autor ya envió otro comentario? (solo muestro uno por persona)
      if (blacklistUsersOracion.indexOf(element.author.displayName) === -1) {
        // Permito el motivo y agrego al usuario al blacklist para que no pueda mandar otro hasta que se cumpla el cooldown COOLDOWN_MOTIVO_MS
        blacklistUsersOracion.push(element.author.displayName);
        console.log("Recibo un motivo de oración");

        element.message = str.replace(`!orar `, ``);
        // Mostrar motivo de oración
        createMotivo(element);

        //Creo el timeout para eliminar del silencio al autor por COOLDOWN_MOTIVO_MS milisengundos
        // if (element.author.isChatOwner || element.author.isChatModerator || element.author.displayName == 'Luciano Tassara') {
          setTimeout(() => {
            let removed = blacklistUsersOracion.pop();
            console.log(
              `pasaron ${COOLDOWN_MOTIVO_MS/1000} segundos, permito un nuevo motivo al usuario ${removed}`
            );
          }, COOLDOWN_MOTIVO_MS);
        // }
        return;
      } else {
      // El autor del comentario está silenciado temporalmente. No muestro el motivo
        console.log(
          element.author.displayName +
            " quiere enviar mas de un motivo de oración."
        );
        return;
      }
    }
  }
  

  /******************************************* LLUVIA  *************************************/
  let saludo = element.message.toUpperCase();
  // Es lluvia permitida?
  if (allowed.indexOf(saludo) !== -1) {
    // está silenciado temporalmente el autor del comentario?
    if (blacklistUsersLluvia.indexOf(element.author.displayName) === -1) {
      // Es permitido y no esatá silenciado. Armo la gota de lluvia
      blacklistUsersLluvia.push(element.author.displayName);
      console.log("Usuarios silenciados: " + blacklistUsersLluvia);
      createGota(element);
      
      //Creo el timeout para eliminar del silencio al autor por COOLDOWN_GOTA_MS milisengundos
      // if (element.author.isChatOwner || element.author.isChatModerator || element.author.displayName == 'Luciano Tassara') {
        
        setTimeout(() => {
          let removed = blacklistUsersLluvia.pop();
          console.log(
            `pasaron ${COOLDOWN_GOTA_MS/1000} segundos, remuevo de blacklist al usuario ${removed}`
          );
        }, COOLDOWN_GOTA_MS);
      // }
    } else {
      // El autor del comentario está silenciado temporalmente. No muestro la gota de lluvia
      console.log(
        `${element.author.displayName} Envió un mensaje pero está silenciado.`
      );
    }
  }

}

// Escuchar por mensajes en tiempo real
socket.on("messages", (messages) => {
  console.log(messages);
  messages.forEach((element) => {
    
    manageMessage(element);

  });
});

// REST Endpoints:

// Get a list of all youtube events
// GET http://localhost:5000/events

// Get a list of all live chat messages
// GET http://localhost:5000/messages

// Filter messages by liveChatId (obtain id from events endpoint)
// GET http://localhost:5000/messages?liveChatId=some-liveChatId-from-active-events-endpoint-to-filter-messages

// Filter messages by some regex against the message
// GET http://localhost:5000/messages?q=any-valid-regular-expression-to-filter-messages
