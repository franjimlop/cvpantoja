
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

                // Comprobar si el partido ya se ha jugado
                const jugado =
                    partido.resultado_final !== null &&
                    partido.resultado_final !== undefined;

                if (jugado) {
                    partidosJugados.push(partido);
                } else {
                    partidosPendientes.push(partido);
                }

            });

        });

        // Mostrar los partidos en sus respectivas tablas
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