
/* =========================================
   CV PANTOJA - PÁGINA DE JORNADAS
   ========================================= */

const JSON_URL = "./datos/competicion_26_27.json";


// Cargar los datos de la competición
async function obtenerDatos() {
    try {
        const data = await CVPantoja.cargarDatos(JSON_URL);

        const partidosPorJornada = {};

        data.jornadas.forEach(jornada => {

            const partidos = jornada.partidos.map(partido => ({
                local: partido.equipo_local,
                visitante: partido.equipo_visitante,
                resultado: partido.resultado_final,
                sets: partido.sets || [],
                fecha: partido.fecha || "",
                lugar: partido.lugar || ""
            }));

            partidosPorJornada[jornada.jornada] = {
                partidos: partidos,
                descansa: jornada.descansa || []
            };
        });

        mostrarResultados(partidosPorJornada);

    } catch (error) {
        console.error("Error al obtener los datos del JSON:", error);

        const mensaje = document.getElementById("mensaje-error");

        if (mensaje) {
            mensaje.textContent = "No se ha podido cargar el calendario.";
            mensaje.hidden = false;
        }
    }
}


// Mostrar todas las jornadas
function mostrarResultados(partidosPorJornada) {

    const contenedor = document.getElementById("resultados");

    if (!contenedor) return;

    contenedor.innerHTML = "";

    const jornadasHTML = Object.entries(partidosPorJornada).map(
        ([numeroJornada, datos]) => {

            const partidos = datos.partidos;
            const descansan = datos.descansa;

            const partidosHTML = partidos.map(partido => {

                const claseEquipo = CVPantoja.obtenerClaseEquipo({
                    equipo_local: partido.local,
                    equipo_visitante: partido.visitante
                });

                const tieneResultado = partido.resultado !== null &&
                    partido.resultado !== undefined;

                const resultado = tieneResultado
                    ? `${partido.resultado.local} - ${partido.resultado.visitante}`
                    : "vs";

                // Mostrar los sets si el partido está jugado
                const setsDetalle = tieneResultado && partido.sets.length > 0
                    ? `
                        <div class="sets">
                            ${partido.sets.map(set =>
                                `${set.local}-${set.visitante}`
                            ).join(", ")}
                        </div>
                    `
                    : "";

                // Mostrar fecha y lugar si está pendiente
                let detalles = "";

                if (!tieneResultado) {
                    const informacion = [];

                    if (partido.fecha) informacion.push(`🕒 ${partido.fecha}`);
                    if (partido.lugar) informacion.push(`📍 ${partido.lugar}`);

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
                                ${partido.local}
                                ${resultado}
                                ${partido.visitante}
                            </strong>

                            ${setsDetalle}
                            ${detalles}
                        </td>
                    </tr>
                `;
            }).join("");


            // Mostrar el equipo que descansa
            const descansoHTML = descansan.length > 0
                ? `
                    <div class="descanso">
                        <strong>Descansa:</strong>
                        ${descansan.join(", ")}
                    </div>
                `
                : "";


            return `
                <div class="jornada-container">
                    <div class="jornada">
                        <h2>Jornada ${numeroJornada}</h2>

                        <table class="tabla-jornada">
                            <tbody>
                                ${partidosHTML}
                            </tbody>
                        </table>

                        ${descansoHTML}
                    </div>
                </div>
            `;
        }
    ).join("");

    contenedor.innerHTML = `
        <div class="jornadas-grid">
            ${jornadasHTML}
        </div>
    `;
}


// Ejecutar al cargar la página
obtenerDatos();
