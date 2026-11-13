
/* =========================================
   CV PANTOJA - PÁGINA DE EQUIPOS
   ========================================= */

const JSON_URL = "./datos/competicion_26_27.json";

let graficoResultados = null;
let graficoPuntos = null;


// =========================================
// CARGAR ESTADÍSTICAS
// =========================================

async function cargarEstadisticas() {
    try {
        const datos = await CVPantoja.cargarDatos(JSON_URL);

        const estadisticas = {
            oro: crearEstadisticas(),
            azul: crearEstadisticas()
        };

        // Recorrer todas las jornadas y sus partidos
        datos.jornadas.forEach(jornada => {
            jornada.partidos.forEach(partido => {
                const local = partido.equipo_local.toUpperCase();
                const visitante = partido.equipo_visitante.toUpperCase();

                const esOroLocal = local.includes("PANTOJA ORO");
                const esOroVisitante = visitante.includes("PANTOJA ORO");

                const esAzulLocal = local.includes("PANTOJA AZUL");
                const esAzulVisitante = visitante.includes("PANTOJA AZUL");

                // Ignorar partidos en los que no participa ningún equipo
                if (
                    !esOroLocal && !esOroVisitante &&
                    !esAzulLocal && !esAzulVisitante
                ) {
                    return;
                }

                // Ignorar partidos pendientes
                if (!partido.resultado_final) return;

                const setsLocal = Number(partido.resultado_final.local);
                const setsVisitante = Number(partido.resultado_final.visitante);

                // Comprobar que los resultados son números válidos
                if (
                    !Number.isInteger(setsLocal) ||
                    !Number.isInteger(setsVisitante)
                ) {
                    return;
                }

                // Contabilizar el partido para Pantoja Oro
                if (esOroLocal || esOroVisitante) {
                    contabilizarPartido(
                        estadisticas.oro,
                        partido,
                        esOroLocal,
                        jornada.jornada
                    );
                }

                // Contabilizar el partido para Pantoja Azul
                if (esAzulLocal || esAzulVisitante) {
                    contabilizarPartido(
                        estadisticas.azul,
                        partido,
                        esAzulLocal,
                        jornada.jornada
                    );
                }
            });
        });

        // Obtener todos los números de jornada
        const jornadas = datos.jornadas.map(jornada => jornada.jornada);

        // Calcular estadísticas derivadas
        calcularEstadisticasDerivadas(estadisticas.oro, jornadas);
        calcularEstadisticasDerivadas(estadisticas.azul, jornadas);

        // Mostrar estadísticas
        mostrarEstadisticas("estadisticas-oro", estadisticas.oro);
        mostrarEstadisticas("estadisticas-azul", estadisticas.azul);

        // Mostrar comparativa
        mostrarComparativa(estadisticas.oro, estadisticas.azul);

        // Mostrar rachas
        mostrarRacha(estadisticas.oro, "racha-oro");
        mostrarRacha(estadisticas.azul, "racha-azul");

        // Mostrar gráficos
        mostrarGraficos(estadisticas.oro, estadisticas.azul, jornadas);

    } catch (error) {
        console.error("Error cargando las estadísticas:", error);

        const mensaje = document.getElementById("mensaje-error");

        if (mensaje) {
            mensaje.textContent =
                "No se han podido cargar las estadísticas de los equipos.";
            mensaje.hidden = false;
        }
    }
}


// =========================================
// CREAR ESTADÍSTICAS INICIALES
// =========================================

function crearEstadisticas() {
    return {
        puntos: 0,

        partidosJugados: 0,
        partidosGanados: 0,
        partidosPerdidos: 0,

        setsFavor: 0,
        setsContra: 0,

        puntosFavor: 0,
        puntosContra: 0,

        resultados: {
            "3-0": 0,
            "3-1": 0,
            "3-2": 0,
            "2-3": 0,
            "1-3": 0,
            "0-3": 0
        },

        victoriasPorJornada: {},
        derrotasPorJornada: {},
        puntosPorJornada: {},

        partidos: []
    };
}


// =========================================
// CONTABILIZAR UN PARTIDO
// =========================================

function contabilizarPartido(equipo, partido, esLocal, numeroJornada) {
    const setsLocal = Number(partido.resultado_final.local);
    const setsVisitante = Number(partido.resultado_final.visitante);

    // Obtener el resultado desde el punto de vista del equipo
    const setsFavor = esLocal ? setsLocal : setsVisitante;
    const setsContra = esLocal ? setsVisitante : setsLocal;

    // Comprobar que el resultado corresponde a un partido válido
    if (
        setsFavor < 0 || setsContra < 0 ||
        setsFavor > 3 || setsContra > 3 ||
        Math.max(setsFavor, setsContra) !== 3
    ) {
        return;
    }

    equipo.partidosJugados++;

    equipo.setsFavor += setsFavor;
    equipo.setsContra += setsContra;

    // Contabilizar los puntos de cada set
    (partido.sets || []).forEach(set => {
        const puntosLocal = Number(set.local) || 0;
        const puntosVisitante = Number(set.visitante) || 0;

        equipo.puntosFavor += esLocal
            ? puntosLocal
            : puntosVisitante;

        equipo.puntosContra += esLocal
            ? puntosVisitante
            : puntosLocal;
    });

    // Resultado desde el punto de vista del equipo
    const resultado = `${setsFavor}-${setsContra}`;

    equipo.resultados[resultado]++;

    const haGanado = setsFavor === 3;

    // Calcular puntos de clasificación
    let puntosClasificacion = 0;

    if (haGanado) {
        equipo.partidosGanados++;

        // Victoria 3-2: 2 puntos. Victoria 3-0 o 3-1: 3 puntos.
        puntosClasificacion = setsContra === 2 ? 2 : 3;

        equipo.victoriasPorJornada[numeroJornada] =
            (equipo.victoriasPorJornada[numeroJornada] || 0) + 1;

    } else {
        equipo.partidosPerdidos++;

        // Derrota 2-3: 1 punto. Derrota 0-3 o 1-3: 0 puntos.
        puntosClasificacion = setsFavor === 2 ? 1 : 0;

        equipo.derrotasPorJornada[numeroJornada] =
            (equipo.derrotasPorJornada[numeroJornada] || 0) + 1;
    }

    equipo.puntos += puntosClasificacion;

    // Guardar el partido para calcular las rachas y los gráficos
    equipo.partidos.push({
        jornada: numeroJornada,
        resultado,
        ganado: haGanado,
        puntosClasificacion
    });
}


// =========================================
// CALCULAR ESTADÍSTICAS DERIVADAS
// =========================================

function calcularEstadisticasDerivadas(equipo, jornadas) {
    const partidos = equipo.partidosJugados;

    equipo.porcentajeVictorias = partidos > 0
        ? equipo.partidosGanados / partidos * 100
        : 0;

    equipo.porcentajeDerrotas = partidos > 0
        ? equipo.partidosPerdidos / partidos * 100
        : 0;

    equipo.diferenciaSets = equipo.setsFavor - equipo.setsContra;

    equipo.diferenciaPuntos = equipo.puntosFavor - equipo.puntosContra;

    equipo.mediaSetsFavor = partidos > 0
        ? equipo.setsFavor / partidos
        : 0;

    equipo.mediaSetsContra = partidos > 0
        ? equipo.setsContra / partidos
        : 0;

    equipo.mediaPuntosFavor = partidos > 0
        ? equipo.puntosFavor / partidos
        : 0;

    equipo.mediaPuntosContra = partidos > 0
        ? equipo.puntosContra / partidos
        : 0;

    // Calcular los puntos acumulados al terminar cada jornada
    let puntosAcumulados = 0;

    equipo.puntosPorJornada = {};

    jornadas.forEach(numeroJornada => {
        // Puede haber más de un partido en una misma jornada
        const partidosJornada = equipo.partidos.filter(
            partido => partido.jornada === numeroJornada
        );

        partidosJornada.forEach(partido => {
            puntosAcumulados += partido.puntosClasificacion;
        });

        // Si el equipo descansa, conserva los puntos anteriores
        equipo.puntosPorJornada[numeroJornada] = puntosAcumulados;
    });
}


// =========================================
// MOSTRAR ESTADÍSTICAS GENERALES
// =========================================

function mostrarEstadisticas(contenedorId, equipo) {
    const contenedor = document.getElementById(contenedorId);

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

        <h3>Resultados de los partidos</h3>

        <div class="rendimiento">
            ${Object.entries(equipo.resultados).map(([resultado, cantidad]) => `
                <div class="estadistica">
                    <span>${resultado}</span>
                    <strong>${cantidad}</strong>
                </div>
            `).join("")}
        </div>
    `;
}


// =========================================
// COMPARATIVA ENTRE EQUIPOS
// =========================================

function mostrarComparativa(oro, azul) {
    const contenedor = document.getElementById("comparativa");

    if (!contenedor) return;

    const datos = [
        ["Partidos jugados", azul.partidosJugados, oro.partidosJugados],
        ["Victorias", azul.partidosGanados, oro.partidosGanados],
        ["Derrotas", azul.partidosPerdidos, oro.partidosPerdidos],
        ["Puntos de clasificación", azul.puntos, oro.puntos],
        ["Sets a favor", azul.setsFavor, oro.setsFavor],
        ["Sets en contra", azul.setsContra, oro.setsContra],
        ["Diferencia de sets", azul.diferenciaSets, oro.diferenciaSets],
        ["Puntos a favor", azul.puntosFavor, oro.puntosFavor],
        ["Puntos en contra", azul.puntosContra, oro.puntosContra],
        ["Diferencia de puntos", azul.diferenciaPuntos, oro.diferenciaPuntos],
        [
            "Porcentaje de victorias",
            azul.porcentajeVictorias.toFixed(1) + " %",
            oro.porcentajeVictorias.toFixed(1) + " %"
        ]
    ];

    contenedor.innerHTML = `
        <table class="tabla-comparativa">
            <thead>
                <tr>
                    <th>Estadística</th>
                    <th>Pantoja Azul</th>
                    <th>Pantoja Oro</th>
                </tr>
            </thead>

            <tbody>
                ${datos.map(fila => `
                    <tr>
                        <td>${fila[0]}</td>
                        <td>${fila[1]}</td>
                        <td>${fila[2]}</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;
}


// =========================================
// MOSTRAR RACHA DE LOS ÚLTIMOS CINCO PARTIDOS
// =========================================

function mostrarRacha(equipo, contenedorId) {
    const contenedor = document.getElementById(contenedorId);

    if (!contenedor) return;

    const partidosOrdenados = [...equipo.partidos].sort(
        (a, b) => a.jornada - b.jornada
    );

    const ultimos = partidosOrdenados.slice(-5);

    const rachaActual = calcularRachaActual(partidosOrdenados);

    contenedor.innerHTML = `
        <div class="ultimos-partidos">
            ${ultimos.length > 0
                ? ultimos.map(partido => `
                    <span
                        class="${partido.ganado ? "ganado" : "perdido"}"
                        title="Jornada ${partido.jornada}: ${partido.resultado}">
                        ${partido.ganado ? "G" : "P"}
                    </span>
                `).join("")
                : "<p>Sin partidos jugados.</p>"
            }
        </div>

        <p class="racha-actual">
            ${rachaActual}
        </p>
    `;
}


// =========================================
// CALCULAR RACHA CONSECUTIVA ACTUAL
// =========================================

function calcularRachaActual(partidos) {
    if (partidos.length === 0) {
        return "Todavía no ha disputado partidos.";
    }

    const ultimo = partidos[partidos.length - 1];
    const resultado = ultimo.ganado;

    let cantidad = 0;

    for (let i = partidos.length - 1; i >= 0; i--) {
        if (partidos[i].ganado !== resultado) break;

        cantidad++;
    }

    const tipo = resultado ? "victoria" : "derrota";
    const plural = cantidad > 1 ? "s" : "";

    return `${cantidad} ${tipo}${plural} consecutiva${plural}`;
}


// =========================================
// MOSTRAR LOS DOS GRÁFICOS
// =========================================

function mostrarGraficos(oro, azul, jornadas) {
    if (typeof Chart === "undefined") {
        console.error(
            "Chart.js no se ha cargado. Comprueba el enlace CDN del HTML."
        );
        return;
    }

    mostrarGraficoResultados(oro, azul, jornadas);
    mostrarGraficoPuntos(oro, azul, jornadas);
}


// =========================================
// GRÁFICO DE VICTORIAS Y DERROTAS
// POR JORNADA
// =========================================

function mostrarGraficoResultados(oro, azul, jornadas) {
    const contenedor = document.getElementById("grafico-resultados");

    if (!contenedor) return;

    // Destruir el gráfico anterior si ya existía
    if (graficoResultados) {
        graficoResultados.destroy();
    }

    const etiquetas = jornadas.map(jornada => `J${jornada}`);

    graficoResultados = new Chart(contenedor, {
        type: "bar",

        data: {
            labels: etiquetas,

            datasets: [
                {
                    label: "Oro - Victorias",
                    data: jornadas.map(
                        jornada => oro.victoriasPorJornada[jornada] || 0
                    ),
                    backgroundColor: "#D4AF37"
                },
                {
                    label: "Oro - Derrotas",
                    data: jornadas.map(
                        jornada => oro.derrotasPorJornada[jornada] || 0
                    ),
                    backgroundColor: "rgba(212, 175, 55, 0.35)",
                    borderColor: "#D4AF37",
                    borderWidth: 1
                },
                {
                    label: "Azul - Victorias",
                    data: jornadas.map(
                        jornada => azul.victoriasPorJornada[jornada] || 0
                    ),
                    backgroundColor: "#244F78"
                },
                {
                    label: "Azul - Derrotas",
                    data: jornadas.map(
                        jornada => azul.derrotasPorJornada[jornada] || 0
                    ),
                    backgroundColor: "rgba(36, 79, 120, 0.35)",
                    borderColor: "#244F78",
                    borderWidth: 1
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            interaction: {
                mode: "index",
                intersect: false
            },

            plugins: {
                legend: {
                    position: "bottom"
                },

                tooltip: {
                    enabled: true
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
// GRÁFICO DE EVOLUCIÓN DE PUNTOS
// ACUMULADOS POR JORNADA
// =========================================

function mostrarGraficoPuntos(oro, azul, jornadas) {
    const contenedor = document.getElementById("grafico-puntos");

    if (!contenedor) return;

    // Destruir el gráfico anterior si ya existía
    if (graficoPuntos) {
        graficoPuntos.destroy();
    }

    const etiquetas = jornadas.map(jornada => `J${jornada}`);

    graficoPuntos = new Chart(contenedor, {
        type: "line",

        data: {
            labels: etiquetas,

            datasets: [
                {
                    label: "Pantoja Oro",

                    data: jornadas.map(
                        jornada => oro.puntosPorJornada[jornada] || 0
                    ),

                    borderColor: "#D4AF37",
                    backgroundColor: "rgba(212, 175, 55, 0.15)",
                    pointBackgroundColor: "#D4AF37",
                    borderWidth: 3,
                    pointRadius: 4,
                    tension: 0.25,
                    fill: false
                },
                {
                    label: "Pantoja Azul",

                    data: jornadas.map(
                        jornada => azul.puntosPorJornada[jornada] || 0
                    ),

                    borderColor: "#244F78",
                    backgroundColor: "rgba(36, 79, 120, 0.15)",
                    pointBackgroundColor: "#244F78",
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

            interaction: {
                mode: "index",
                intersect: false
            },

            plugins: {
                legend: {
                    position: "bottom"
                },

                tooltip: {
                    enabled: true
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
// EJECUTAR AL CARGAR LA PÁGINA
// =========================================

cargarEstadisticas();