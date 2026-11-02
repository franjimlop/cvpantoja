
/* =========================================
   CV PANTOJA - PÁGINA DE INICIO
   ========================================= */

const JSON_URL = "./datos/competicion_26_27.json";


// Cargar los datos de la competición
async function obtenerDatos() {

    try {

        const datos = await CVPantoja.cargarDatos(JSON_URL);

        const partidosPendientes = [];
        const partidosJugados = [];

        // Recorrer todas las jornadas
        datos.jornadas.forEach(jornada => {

            jornada.partidos.forEach(partido => {

                const local = partido.equipo_local.toUpperCase();
                const visitante = partido.equipo_visitante.toUpperCase();

                // Comprobar si participa algún equipo de Pantoja
                const esPantoja =
                    local.includes("PANTOJA") ||
                    visitante.includes("PANTOJA");

                if (!esPantoja) return;

                // Guardar también el número de jornada
                const partidoCompleto = {
                    ...partido,
                    jornada: jornada.jornada
                };

                // Comprobar si el partido ya se ha jugado
                const jugado =
                    partido.resultado_final !== null &&
                    partido.resultado_final !== undefined;

                if (jugado) {
                    partidosJugados.push(partidoCompleto);
                } else {
                    partidosPendientes.push(partidoCompleto);
                }

            });

        });

        // Mostrar los próximos partidos de cada equipo
        const proximoOro = obtenerProximoPartido(
            partidosPendientes,
            "PANTOJA ORO"
        );

        const proximoAzul = obtenerProximoPartido(
            partidosPendientes,
            "PANTOJA AZUL"
        );

        mostrarProximoPartido(proximoOro, "proximo-oro", "Pantoja Oro");
        mostrarProximoPartido(proximoAzul, "proximo-azul", "Pantoja Azul");

        // Mostrar todos los partidos en sus respectivas tablas
        mostrarPartidos(partidosPendientes, "pendientes", false);
        mostrarPartidos(partidosJugados, "jugados", true);

    } catch (error) {

        console.error("Error al obtener los datos:", error);

        const mensaje = document.getElementById("mensaje-error");

        if (mensaje) {
            mensaje.textContent = "No se han podido cargar los datos de la competición.";
            mensaje.hidden = false;
        }

    }

}


// Obtener el primer partido pendiente de un equipo
function obtenerProximoPartido(partidos, nombreEquipo) {

    return partidos.find(partido => {

        const local = partido.equipo_local.toUpperCase();
        const visitante = partido.equipo_visitante.toUpperCase();

        return local.includes(nombreEquipo) ||
               visitante.includes(nombreEquipo);

    }) || null;

}


// Mostrar la tarjeta del próximo partido
function mostrarProximoPartido(partido, contenedorId, nombreEquipo) {

    const contenedor = document.getElementById(contenedorId);

    if (!contenedor) return;

    // Si no quedan partidos pendientes
    if (!partido) {

        contenedor.innerHTML = `
            <h3>${nombreEquipo}</h3>
            <p>No hay próximos partidos.</p>
        `;

        return;
    }

    // Determinar el rival
    const local = partido.equipo_local.toUpperCase();

    const esLocal = local.includes(nombreEquipo.toUpperCase());

    const rival = esLocal
    ? partido.equipo_visitante
    : partido.equipo_local;

    // Mostrar el nombre del equipo con su escritura original
    const equipoMostrar = esLocal
    ? partido.equipo_local
    : partido.equipo_visitante;

    const condicion = esLocal ? "Local" : "Visitante";

    // Mostrar fecha y lugar si existen
    const fecha = partido.fecha || "Fecha pendiente";
    const lugar = partido.lugar || "Lugar pendiente";

    contenedor.innerHTML = `
        <h3>${nombreEquipo}</h3>

        <p class="jornada-proximo">
            Jornada ${partido.jornada}
        </p>

        <div class="enfrentamiento">
            <strong>${equipoMostrar}</strong>
            <span>VS</span>
            <strong>${rival}</strong>
        </div>

        <p class="condicion-proximo">${condicion}</p>

        <div class="detalles-proximo">
            <p>🕒 ${fecha}</p>
            <p>📍 ${lugar}</p>
        </div>
    `;

}


// Mostrar partidos pendientes o jugados
function mostrarPartidos(partidos, contenedorId, esJugado) {

    const contenedor = document.getElementById(contenedorId);

    if (!contenedor) return;

    // Mensaje si no hay partidos
    if (partidos.length === 0) {

        contenedor.innerHTML = `
            <tr>
                <td>No hay partidos que mostrar.</td>
            </tr>
        `;

        return;
    }

    // Generar las filas de la tabla
    contenedor.innerHTML = partidos.map(partido => {

        const claseEquipo = CVPantoja.obtenerClaseEquipo(partido);

        const sets = partido.sets || [];

        // Mostrar el detalle de los sets si existe
        const setsDetalle = esJugado && sets.length > 0
            ? `<div class="sets">
                ${sets.map(set => `${set.local}-${set.visitante}`).join(", ")}
               </div>`
            : "";

        // Resultado o indicador de partido pendiente
        const resultado = esJugado
            ? `${partido.resultado_final.local} - ${partido.resultado_final.visitante}`
            : "vs";

        // Mostrar fecha y lugar solo si existen
        let detalles = "";

        if (!esJugado) {

            const informacion = [];

            if (partido.fecha) {
                informacion.push(`🕒 ${partido.fecha}`);
            }

            if (partido.lugar) {
                informacion.push(`📍 ${partido.lugar}`);
            }

            if (informacion.length > 0) {
                detalles = `
                    <div class="detalles">
                        ${informacion.join(" · ")}
                    </div>
                `;
            }
        }

        return `
            <tr class="partido ${claseEquipo}">
                <td>
                    <strong>
                        ${partido.equipo_local}
                        ${resultado}
                        ${partido.equipo_visitante}
                    </strong>

                    ${setsDetalle}
                    ${detalles}
                </td>
            </tr>
        `;

    }).join("");

}


// Ejecutar al cargar la página
obtenerDatos();