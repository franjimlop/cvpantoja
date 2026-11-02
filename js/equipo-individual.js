
/* =========================================
   CV PANTOJA - PÁGINA INDIVIDUAL DE EQUIPO
   ========================================= */

// Archivos JSON
const JSON_COMPETICION = "./datos/competicion_26_27.json";

const paginaEquipo = document.querySelector("main");

const JSON_PLANTILLA = paginaEquipo.dataset.plantilla;
const NOMBRE_EQUIPO = paginaEquipo.dataset.equipo;

const ES_ORO = NOMBRE_EQUIPO.includes("ORO");

const COLOR_EQUIPO = ES_ORO ? "#D4AF37" : "#244F78";
const COLOR_EQUIPO_TRANSPARENTE = ES_ORO
    ? "rgba(212, 175, 55, 0.35)"
    : "rgba(36, 79, 120, 0.35)";
const COLOR_EQUIPO_SUAVE = ES_ORO
    ? "rgba(212, 175, 55, 0.15)"
    : "rgba(36, 79, 120, 0.15)";

// Gráficos
let graficoResultados = null;
let graficoPuntos = null;


// =========================================
// CARGAR DATOS DE LA PÁGINA
// =========================================

async function cargarPaginaEquipo() {

    try {

        // Cargar competición y plantilla
        const [datosCompeticion, datosPlantilla] = await Promise.all([
            CVPantoja.cargarDatos(JSON_COMPETICION),
            CVPantoja.cargarDatos(JSON_PLANTILLA)
        ]);

        // Comprobar que se ha cargado el sistema de estadísticas
        if (!window.CVPantojaEstadisticas) {
            throw new Error("No se ha cargado el archivo de estadísticas.");
        }

        // Mostrar información general
        mostrarInformacionEquipo(datosPlantilla);

        // Mostrar plantilla
        mostrarPlantilla(datosPlantilla);

        // Calcular estadísticas
        const estadisticas =
            CVPantojaEstadisticas.calcularEstadisticasEquipo(
                datosCompeticion,
                NOMBRE_EQUIPO
            );

        // Obtener jornadas
        const jornadas = datosCompeticion.jornadas.map(
            jornada => jornada.jornada
        );

        // Mostrar estadísticas y rendimiento
        mostrarEstadisticasEquipo(estadisticas);
        mostrarRendimiento(estadisticas);

        // Mostrar últimos resultados
        mostrarRachaEquipo(estadisticas);

        // Mostrar gráficos
        mostrarGraficosEquipo(estadisticas, jornadas);

        // Mostrar calendario
        mostrarCalendario(datosCompeticion);

    } catch (error) {

        console.error("Error cargando la página del equipo:", error);

        const mensaje = document.getElementById("mensaje-error");

        if (mensaje) {
            mensaje.textContent =
                "No se ha podido cargar la información del equipo.";
            mensaje.hidden = false;
        }
    }
}


// =========================================
// MOSTRAR INFORMACIÓN GENERAL
// =========================================

function mostrarInformacionEquipo(plantilla) {

    document.getElementById("categoria-equipo").textContent =
        `Categoría: ${plantilla.categoria}`;

    document.getElementById("entrenador-equipo").textContent =
        `Entrenador: ${plantilla.entrenador}`;
}


// =========================================
// MOSTRAR PLANTILLA
// =========================================

function mostrarPlantilla(plantilla) {

    const contenedor = document.getElementById("plantilla-equipo");

    if (!contenedor) return;

    if (!plantilla.jugadoras || plantilla.jugadoras.length === 0) {
        contenedor.innerHTML =
            '<p class="sin-datos">No hay jugadores registrados.</p>';
        return;
    }

    contenedor.innerHTML = `
        <table class="tabla-plantilla">

            <thead>
                <tr>
                    <th>Dorsal</th>
                    <th>Jugador/a</th>
                    <th>Posición</th>
                </tr>
            </thead>

            <tbody>
                ${plantilla.jugadoras.map(jugador => `
                    <tr>
                        <td>
                            ${jugador.dorsal ?? "-"}
                        </td>

                        <td>
                            ${escaparHTML(jugador.nombre)}
                        </td>

                        <td>
                            ${escaparHTML(jugador.posicion)}
                        </td>
                    </tr>
                `).join("")}
            </tbody>

        </table>
    `;
}


// =========================================
// MOSTRAR ESTADÍSTICAS GENERALES
// =========================================

function mostrarEstadisticasEquipo(equipo) {

    const contenedor = document.getElementById("estadisticas-equipo");

    if (!contenedor) return;

    const porcentaje = valor => `${valor.toFixed(1)} %`;
    const media = valor => valor.toFixed(2);

    contenedor.innerHTML = `
        <div class="estadisticas-generales">

            <div class="estadistica">
                <span>Partidos jugados</span>
                <strong>${equipo.partidosJugados}</strong>
            </div>

            <div class="estadistica">
                <span>Victorias</span>
                <strong>${equipo.partidosGanados}</strong>
            </div>

            <div class="estadistica">
                <span>Derrotas</span>
                <strong>${equipo.partidosPerdidos}</strong>
            </div>

            <div class="estadistica">
                <span>Puntos en clasificación</span>
                <strong>${equipo.puntos}</strong>
            </div>

            <div class="estadistica">
                <span>Porcentaje de victorias</span>
                <strong>${porcentaje(equipo.porcentajeVictorias)}</strong>
            </div>

            <div class="estadistica">
                <span>Porcentaje de derrotas</span>
                <strong>${porcentaje(equipo.porcentajeDerrotas)}</strong>
            </div>

            <div class="estadistica">
                <span>Sets a favor</span>
                <strong>${equipo.setsFavor}</strong>
            </div>

            <div class="estadistica">
                <span>Sets en contra</span>
                <strong>${equipo.setsContra}</strong>
            </div>

            <div class="estadistica">
                <span>Diferencia de sets</span>
                <strong>${equipo.diferenciaSets}</strong>
            </div>

            <div class="estadistica">
                <span>Media de sets ganados</span>
                <strong>${media(equipo.mediaSetsFavor)}</strong>
            </div>

            <div class="estadistica">
                <span>Media de sets perdidos</span>
                <strong>${media(equipo.mediaSetsContra)}</strong>
            </div>

            <div class="estadistica">
                <span>Puntos a favor</span>
                <strong>${equipo.puntosFavor}</strong>
            </div>

            <div class="estadistica">
                <span>Puntos en contra</span>
                <strong>${equipo.puntosContra}</strong>
            </div>

            <div class="estadistica">
                <span>Diferencia de puntos</span>
                <strong>${equipo.diferenciaPuntos}</strong>
            </div>

            <div class="estadistica">
                <span>Media de puntos anotados</span>
                <strong>${media(equipo.mediaPuntosFavor)}</strong>
            </div>

            <div class="estadistica">
                <span>Media de puntos recibidos</span>
                <strong>${media(equipo.mediaPuntosContra)}</strong>
            </div>

        </div>
    `;
}


// =========================================
// MOSTRAR RENDIMIENTO POR RESULTADOS
// =========================================

function mostrarRendimiento(equipo) {

    const contenedor = document.getElementById("rendimiento-equipo");

    if (!contenedor) return;

    contenedor.innerHTML = `
        <div class="rendimiento">

            ${Object.entries(equipo.resultados).map(
                ([resultado, cantidad]) => `
                    <div class="estadistica">
                        <span>${resultado}</span>
                        <strong>${cantidad}</strong>
                    </div>
                `
            ).join("")}

        </div>
    `;
}


// =========================================
// MOSTRAR ÚLTIMOS RESULTADOS
// =========================================

function mostrarRachaEquipo(equipo) {

    const contenedor = document.getElementById("racha-equipo");

    if (!contenedor) return;

    const partidos = [...equipo.partidos].sort(
        (a, b) => a.jornada - b.jornada
    );

    const ultimos = partidos.slice(-5);

    if (partidos.length === 0) {

        contenedor.innerHTML =
            '<p class="sin-datos">Todavía no se han disputado partidos.</p>';

        return;
    }

    const rachaActual = calcularRachaActualEquipo(partidos);

    contenedor.innerHTML = `
        <div class="ultimos-partidos">

            ${ultimos.map(partido => `
                <span
                    class="${partido.ganado ? "ganado" : "perdido"}"
                    title="Jornada ${partido.jornada}: ${partido.resultado}">
                    ${partido.ganado ? "G" : "P"}
                </span>
            `).join("")}

        </div>

        <p class="racha-actual">
            ${rachaActual}
        </p>
    `;
}


// =========================================
// CALCULAR RACHA ACTUAL
// =========================================

function calcularRachaActualEquipo(partidos) {

    const ultimo = partidos[partidos.length - 1];

    const resultado = ultimo.ganado;

    let cantidad = 0;

    for (let i = partidos.length - 1; i >= 0; i--) {

        if (partidos[i].ganado !== resultado) {
            break;
        }

        cantidad++;
    }

    const tipo = resultado ? "victoria" : "derrota";
    const plural = cantidad > 1 ? "s" : "";

    return `${cantidad} ${tipo}${plural} consecutiva${plural}`;
}


// =========================================
// MOSTRAR GRÁFICOS
// =========================================

function mostrarGraficosEquipo(equipo, jornadas) {

    if (typeof Chart === "undefined") {
        console.error("Chart.js no se ha cargado.");
        return;
    }

    mostrarGraficoResultadosEquipo(equipo, jornadas);
    mostrarGraficoPuntosEquipo(equipo, jornadas);
}


// =========================================
// GRÁFICO DE VICTORIAS Y DERROTAS
// =========================================

function mostrarGraficoResultadosEquipo(equipo, jornadas) {

    const canvas = document.getElementById("grafico-resultados");

    if (!canvas) return;

    if (graficoResultados) {
        graficoResultados.destroy();
    }

    graficoResultados = new Chart(canvas, {

        type: "bar",

        data: {
            labels: jornadas.map(jornada => `J${jornada}`),

            datasets: [
                {
                    label: "Victorias",
                    data: jornadas.map(
                        jornada => equipo.victoriasPorJornada[jornada] || 0
                    ),
                    backgroundColor: COLOR_EQUIPO
                },
                {
                    label: "Derrotas",
                    data: jornadas.map(
                        jornada => equipo.derrotasPorJornada[jornada] || 0
                    ),
                    backgroundColor: COLOR_EQUIPO_TRANSPARENTE,
                    borderColor: COLOR_EQUIPO,
                    borderWidth: 1
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    position: "bottom"
                }
            },

            scales: {
                y: {
                    beginAtZero: true,

                    ticks: {
                        precision: 0,
                        stepSize: 1
                    },

                    title: {
                        display: true,
                        text: "Número de partidos"
                    }
                },

                x: {
                    title: {
                        display: true,
                        text: "Jornadas"
                    }
                }
            }
        }
    });
}


// =========================================
// GRÁFICO DE PUNTOS ACUMULADOS
// =========================================

function mostrarGraficoPuntosEquipo(equipo, jornadas) {

    const canvas = document.getElementById("grafico-puntos");

    if (!canvas) return;

    if (graficoPuntos) {
        graficoPuntos.destroy();
    }

    graficoPuntos = new Chart(canvas, {

        type: "line",

        data: {
            labels: jornadas.map(jornada => `J${jornada}`),

            datasets: [
                {
                    label: NOMBRE_EQUIPO,

                    data: jornadas.map(
                        jornada => equipo.puntosPorJornada[jornada] || 0
                    ),

                    borderColor: COLOR_EQUIPO,
                    backgroundColor: COLOR_EQUIPO_SUAVE,
                    pointBackgroundColor: COLOR_EQUIPO,

                    borderWidth: 3,
                    pointRadius: 4,
                    tension: 0.25,
                    fill: false
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    position: "bottom"
                }
            },

            scales: {
                y: {
                    beginAtZero: true,

                    ticks: {
                        precision: 0
                    },

                    title: {
                        display: true,
                        text: "Puntos acumulados"
                    }
                },

                x: {
                    title: {
                        display: true,
                        text: "Jornadas"
                    }
                }
            }
        }
    });
}


// =========================================
// MOSTRAR CALENDARIO DEL EQUIPO
// =========================================

function mostrarCalendario(datos) {

    const contenedor = document.getElementById("calendario-equipo");

    if (!contenedor) return;

    let partidosEquipo = [];

    datos.jornadas.forEach(jornada => {

        jornada.partidos.forEach(partido => {

            const local = partido.equipo_local.toUpperCase();
            const visitante = partido.equipo_visitante.toUpperCase();

            const participa =
                local.includes(NOMBRE_EQUIPO) ||
                visitante.includes(NOMBRE_EQUIPO);

            if (participa) {

                partidosEquipo.push({
                    ...partido,
                    jornada: jornada.jornada
                });
            }
        });
    });

    if (partidosEquipo.length === 0) {

        contenedor.innerHTML =
            '<p class="sin-datos">No hay partidos registrados.</p>';

        return;
    }

    contenedor.innerHTML = `
        <table class="tabla-calendario">

            <thead>
                <tr>
                    <th>Jornada</th>
                    <th>Local</th>
                    <th>Resultado</th>
                    <th>Visitante</th>
                    <th>Fecha</th>
                    <th>Lugar</th>
                </tr>
            </thead>

            <tbody>

                ${partidosEquipo.map(partido => {

                    const clase = CVPantoja.obtenerClaseEquipo(partido);

                    const jugado =
                        partido.resultado_final !== null &&
                        partido.resultado_final !== undefined;

                    const resultado = jugado
                        ? `${partido.resultado_final.local} - ${partido.resultado_final.visitante}`
                        : "Pendiente";

                    return `
                        <tr class="${clase}">

                            <td>${partido.jornada}</td>

                            <td>${escaparHTML(partido.equipo_local)}</td>

                            <td>${resultado}</td>

                            <td>${escaparHTML(partido.equipo_visitante)}</td>

                            <td>
                                ${partido.fecha
                                    ? escaparHTML(partido.fecha)
                                    : "Pendiente"}
                            </td>

                            <td>
                                ${partido.lugar
                                    ? escaparHTML(partido.lugar)
                                    : "Pendiente"}
                            </td>

                        </tr>
                    `;
                }).join("")}

            </tbody>

        </table>
    `;
}


// =========================================
// EVITAR INSERTAR HTML DESDE LOS DATOS
// =========================================

function escaparHTML(valor) {

    return String(valor ?? "").replace(/[&<>"']/g, caracter => {

        const caracteres = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return caracteres[caracter];
    });
}


// =========================================
// EJECUTAR AL CARGAR LA PÁGINA
// =========================================

cargarPaginaEquipo();