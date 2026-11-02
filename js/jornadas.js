
/* =========================================
   CV PANTOJA - PÁGINA DE JORNADAS
   ========================================= */

const JSON_URL = "./datos/competicion_26_27.json";

// Guardar los datos originales de las jornadas
let jornadasDisponibles = [];


// =========================================
// CARGAR LOS DATOS DE LA COMPETICIÓN
// =========================================

async function obtenerDatos() {
    try {
        const data = await CVPantoja.cargarDatos(JSON_URL);

        jornadasDisponibles = data.jornadas.map(jornada => ({
            numero: jornada.jornada,

            partidos: jornada.partidos.map(partido => ({
                local: partido.equipo_local,
                visitante: partido.equipo_visitante,
                resultado: partido.resultado_final,
                sets: partido.sets || [],
                fecha: partido.fecha || "",
                lugar: partido.lugar || ""
            })),

            descansa: jornada.descansa || []
        }));

        // Preparar los filtros
        inicializarFiltros();

        // Mostrar todas las jornadas inicialmente
        mostrarResultados();

    } catch (error) {
        console.error("Error al obtener los datos del JSON:", error);

        const mensaje = document.getElementById("mensaje-error");

        if (mensaje) {
            mensaje.textContent = "No se ha podido cargar el calendario.";
            mensaje.hidden = false;
        }
    }
}


// =========================================
// INICIALIZAR LOS FILTROS
// =========================================

function inicializarFiltros() {
    const filtroJornada = document.getElementById("filtro-jornada");
    const filtroEquipo = document.getElementById("filtro-equipo");
    const filtroEstado = document.getElementById("filtro-estado");

    if (!filtroJornada || !filtroEquipo || !filtroEstado) return;

    // Añadir las jornadas disponibles al desplegable
    filtroJornada.innerHTML = `
        <option value="todas">Todas las jornadas</option>

        ${jornadasDisponibles.map(jornada => `
            <option value="${jornada.numero}">
                Jornada ${jornada.numero}
            </option>
        `).join("")}
    `;

    // Actualizar los resultados al cambiar cualquier filtro
    filtroJornada.addEventListener("change", mostrarResultados);
    filtroEquipo.addEventListener("change", mostrarResultados);
    filtroEstado.addEventListener("change", mostrarResultados);
}


// =========================================
// MOSTRAR LAS JORNADAS FILTRADAS
// =========================================

function mostrarResultados() {
    const contenedor = document.getElementById("resultados");

    if (!contenedor) return;

    const filtroJornada = document.getElementById("filtro-jornada").value;
    const filtroEquipo = document.getElementById("filtro-equipo").value;
    const filtroEstado = document.getElementById("filtro-estado").value;

    // Filtrar las jornadas
    const jornadasFiltradas = jornadasDisponibles.filter(jornada => {
        return filtroJornada === "todas" ||
            jornada.numero === Number(filtroJornada);
    });

    const jornadasHTML = jornadasFiltradas.map(jornada => {

        // Filtrar los partidos de la jornada
        const partidos = jornada.partidos.filter(partido => {

            const esOro =
                partido.local.toUpperCase().includes("PANTOJA ORO") ||
                partido.visitante.toUpperCase().includes("PANTOJA ORO");

            const esAzul =
                partido.local.toUpperCase().includes("PANTOJA AZUL") ||
                partido.visitante.toUpperCase().includes("PANTOJA AZUL");

            // Filtro por equipo
            if (filtroEquipo === "oro" && !esOro) return false;
            if (filtroEquipo === "azul" && !esAzul) return false;

            // Comprobar si el partido tiene resultado
            const tieneResultado = partido.resultado !== null &&
                partido.resultado !== undefined &&
                partido.resultado.local !== null &&
                partido.resultado.local !== undefined &&
                partido.resultado.visitante !== null &&
                partido.resultado.visitante !== undefined;

            // Filtro por estado
            if (filtroEstado === "jugados" && !tieneResultado) {
                return false;
            }

            if (filtroEstado === "pendientes" && tieneResultado) {
                return false;
            }

            return true;
        });

        // Filtrar los equipos que descansan
        let descansan = jornada.descansa;

        if (filtroEquipo === "oro") {
            descansan = descansan.filter(equipo =>
                equipo.toUpperCase().includes("PANTOJA ORO")
            );
        }

        if (filtroEquipo === "azul") {
            descansan = descansan.filter(equipo =>
                equipo.toUpperCase().includes("PANTOJA AZUL")
            );
        }

        // Si no hay partidos ni descansos que mostrar, ocultar la jornada
        if (partidos.length === 0 && descansan.length === 0) {
            return "";
        }

        // Crear el HTML de los partidos
        const partidosHTML = partidos.map(partido => {

            const claseEquipo = CVPantoja.obtenerClaseEquipo({
                equipo_local: partido.local,
                equipo_visitante: partido.visitante
            });

            const tieneResultado = partido.resultado !== null &&
                partido.resultado !== undefined &&
                partido.resultado.local !== null &&
                partido.resultado.local !== undefined &&
                partido.resultado.visitante !== null &&
                partido.resultado.visitante !== undefined;

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

        // Mostrar los equipos que descansan
        const claseDescanso = descansan.length > 0
            ? CVPantoja.obtenerClaseEquipo({
                equipo_local: descansan.join(" "),
                equipo_visitante: ""
            })
            : "";

        const descansoHTML = descansan.length > 0
            ? `
                <div class="descanso ${claseDescanso}">
                    <strong>Descansa:</strong>
                    ${descansan.join(", ")}
                </div>
            `
            : "";

        return `
            <div class="jornada-container">
                <div class="jornada">

                    <h2>Jornada ${jornada.numero}</h2>

                    <table class="tabla-jornada">
                        <tbody>
                            ${partidosHTML}
                        </tbody>
                    </table>

                    ${descansoHTML}

                </div>
            </div>
        `;
    }).join("");

    // Mostrar el resultado final
    if (jornadasHTML.trim() === "") {
        contenedor.innerHTML = `
            <p class="sin-resultados">
                No hay partidos que coincidan con los filtros seleccionados.
            </p>
        `;
        return;
    }

    contenedor.innerHTML = `
        <div class="jornadas-grid">
            ${jornadasHTML}
        </div>
    `;
}


// =========================================
// EJECUTAR AL CARGAR LA PÁGINA
// =========================================

obtenerDatos();