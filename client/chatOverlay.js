const COOLDOWN_BURBUJA_MS = 45000;
const COOLDOWN_MOTIVO_MS = 45000;
// const COOLDOWN_BURBUJA_MS = 1000;
// const COOLDOWN_MOTIVO_MS = 1000;
const TIMEOUT_MOTIVOS_PANTALLA = 180000;
const TIMEOUT_BURBUJA_PANTALLA = 9000;

const SOCKET_URL = "http://192.168.1.50:5000";

function createBuble(message) {
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

  burbuja.addEventListener("click", () => {
    burbuja.remove();
  });

  setTimeout(() => {
    burbuja.remove();
  }, TIMEOUT_BURBUJA_PANTALLA);
}
/**/

/********************** TEST BOTON **************************/

// const btn = document.getElementById("btn");

// btn.addEventListener("click", () => {
//     createMotivo(chatFijo[Math.floor(Math.random() * 15) + 1]);
// });

/********************** TEST BOTON **************************/

/* MOTIVOS DE ORACION */
const container = document.getElementById("container");

function createMotivo(message) {
  const notif = document.createElement("div");
  notif.classList.add("toast");

  notif.innerHTML = ` <img id="avatar" src="${message.author.profileImageUrl}" alt="" width="48" height="48">
                      <h3 id="nombreMotivo">${message.author.displayName} pide oración</h3>
                      <p id="motivo">${message.message}</p>`;

  //Listener para eliminar haciendo click
  notif.addEventListener("click", () => {
    notif.remove();
  });

  container.appendChild(notif);

  setTimeout(() => {
    notif.remove();
    console.log(`pasaron ${TIMEOUT_MOTIVOS_PANTALLA/1000} segundos, remuevo el motivo de oración`);
  }, TIMEOUT_MOTIVOS_PANTALLA);
}

/* Burbujas de comentarios */
let orar = false;
let allowed = [];

let users = [];
let usersOracion = [];

const socket = io(SOCKET_URL);

// listen for new messages in realtime
socket.on("messages", (messages) => {
  console.log(messages);

  messages.forEach((element) => {
    let comment = element.message;

    // TODO: Chequear si es owner de transmisión y permitir modificar el tipo de lluvia o activar desactivar motivos de oración
    if (element.author.isChatOwner || element.author.isChatModerator) {
    // if (element.author.displayName == 'Luciano Tassara') {
      if (comment ===`!hola`) {
        // modoLluvia = `hola`;
        allowed = ["HOLA","HOLAA","HOLAAA!","HOLA!","HOLIS!","HOLISSSS","👋 HOLA","👋 HOLA!!","👋👋","👋","👋👋👋"];
        console.log(`${element.author.displayName} activó el modo lluvia en hola` )
        console.log(`Valores permitidos en lluvia ${allowed.toString()}` )

      } else {
        if (comment ===`!amen`){
          // modoLluvia = `amen`;
          allowed = ["AMEN","AMÉN","AMEN!","AMÉN!","AMEN!!","AMÉN!!","🙏","🙏🙏","🙏🙏🙏","ALELUYA!","ALELUYA!!",'🙌🙌','',"🙌",'🎵','🎵🎵','🎵🎵🎵','🎶','🎶🎶','🎶🎶🎶'];
          console.log(`${element.author.displayName} activó el modo lluvia en amen` )
          console.log(`Valores permitidos en lluvia ${allowed.toString()}` )
          
        } else {
          if (comment ===`!chau`){
            // modoLluvia = `chau`;
            allowed = ["CHAU","CHAU!","CHAUUU!!","CHAUUU!","HASTA LA PROXIMA","ADIOS!","ADIOS!!","👋👋","👋","👋👋👋"];
            console.log(`${element.author.displayName} activó el modo lluvia en chau` )
            console.log(`Valores permitidos en lluvia ${allowed.toString()}` )

          }
          if(comment === '!orar'){
            orar = true;
            allowed = ["AMEN","AMÉN","AMEN!","AMÉN!","AMEN!!","AMÉN!!","🙏","🙏🙏","🙏🙏🙏"];
            console.log(`${element.author.displayName} activó el modo orar por necesidades 🙏🙏🙏` )
            console.log(`Valores permitidos en lluvia ${allowed.toString()}` )
          } else {
            if(comment === '!orar-end'){
              orar = false;
              console.log(`${element.author.displayName} finalizó el modo orar por necesidades. 🙏🙏🙏` )
              console.log(`Valores permitidos en lluvia ${allowed.toString()}` )
            } else {
              if(comment === '!silent-mode'){
                orar = false;
                allowed = [];
                console.log(`${element.author.displayName} Activó el modo silencio. 🔴🔴🔴` )
              } else {
                if(comment === '!opciones'){
                  allowed = ["1", "2", "3", "4", "5", "6", "A", "B", "C", "D", "E", "F"];
                  console.log(`${element.author.displayName} Activó el modo silencio. 🔴🔴🔴` )
                  console.log(`Valores permitidos en lluvia ${allowed.toString()}` )
                }
              }
            }
          }
        }
      }
    }

    

    /********* LLUVIA  *****************/
    let saludo = element.message.toUpperCase();
    if (allowed.indexOf(saludo) !== -1) {
      if (users.indexOf(element.author.displayName) === -1) {
        users.push(element.author.displayName);
        console.log("Usuarios silenciados: " + users);
        createBuble(element);
        setTimeout(() => {
          let removed = users.pop();
          console.log(
            `pasaron ${COOLDOWN_BURBUJA_MS/1000} segundos, remuevo de blacklist al usuario ${removed}`
          );
        }, COOLDOWN_BURBUJA_MS);
      } else {
        console.log(
          `${element.author.displayName} Envió un mensaje pero está silenciado.`
        );
      }
    }

    /*********  MOTIVOS DE ORACIÓN  *****************/
    if(orar){
      let str = element.message;
      if (str.startsWith("!orar ")) {
        if (usersOracion.indexOf(element.author.displayName) === -1) {
          usersOracion.push(element.author.displayName);
          console.log("Recibo un motivo de oración");

          element.message = str.replace("!orar ", "");
          // Mostrar motivo de oración
          createMotivo(element);
          setTimeout(() => {
            let removed = usersOracion.pop();
            console.log(
              `pasaron ${COOLDOWN_MOTIVO_MS/1000} segundos, permito un nuevo motivo al usuario ${removed}`
            );
          }, COOLDOWN_MOTIVO_MS);
        } else {
          console.log(
            element.author.displayName +
              " quiere enviar mas de un motivo de oración."
          );
        }
      }
    }

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
