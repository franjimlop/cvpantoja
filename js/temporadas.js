
/* =========================================
   CV PANTOJA - TEMPORADAS HISTÓRICAS
   ========================================= */

// Detectar qué temporada estamos mostrando
const elementoTemporada = document.querySelector("main[data-temporada]");
const temporadaActual = elementoTemporada.dataset.temporada;

const JSON_URL = `./datos/competicion_${temporadaActual}.json`;


// Cargar los datos de la temporada
async function cargarTemporada() {
    try {
        const datos = await CVPantoja.cargarDatos(JSON_URL);

        const partidosJugados = {};

        // Recorrer todas las jornadas
        datos.jornadas.forEach(jornada => {

            const numeroJornada = jornada.jornada;

            partidosJugados[numeroJornada] = [];

            jornada.partidos.forEach(partido => {

                // Comprobar si el partido tiene resultado
                const jugado = partido.resultado_final !== null &&
                    partido.resultado_final !== undefined;

                if (!jugado) return;

                partidosJugados[numeroJornada].push(partido);
            });
        });

        // Obtener la clasificación según la temporada
        let tabla;

        if (temporadaActual === "24_25") {
            tabla = datos.clasificacion_final;
        } else {
            tabla = calcularClasificacion(datos);
        }

        // Mostrar información
        pintarClasificacion(tabla);
        mostrarTodosLosPartidos(partidosJugados,temporadaActual.replace("_", "/"));
        mostrarPartidosPorJornada(partidosJugados);

    } catch (error) {
        console.error("Error cargando la temporada:", error);

        const mensaje = document.getElementById("mensaje-error");

        if (mensaje) {
            mensaje.textContent = "No se han podido cargar los datos de la temporada.";
            mensaje.hidden = false;
        }
    }
}


// Calcular la clasificación de la temporada 2025/2026
function calcularClasificacion(datos) {

    const clasificacion = {};

    // Recorrer todas las jornadas
    datos.jornadas.forEach(jornada => {
        jornada.partidos.forEach(partido => {

            const nombreLocal = partido.equipo_local.trim();
            const nombreVisitante = partido.equipo_visitante.trim();

            const claveLocal = nombreLocal.toUpperCase();
            const claveVisitante = nombreVisitante.toUpperCase();

            // Crear equipos si no existen
            if (!clasificacion[claveLocal]) {
                clasificacion[claveLocal] = crearEquipo(nombreLocal);
            }

            if (!clasificacion[claveVisitante]) {
                clasificacion[claveVisitante] = crearEquipo(nombreVisitante);
            }

            // Ignorar partidos pendientes
            if (!partido.resultado_final) return;

            const local = clasificacion[claveLocal];
            const visitante = clasificacion[claveVisitante];

            const setsLocal = Number(partido.resultado_final.local);
            const setsVisitante = Number(partido.resultado_final.visitante);

            // Comprobar que el resultado sea válido
            if (!Number.isFinite(setsLocal) ||
                !Number.isFinite(setsVisitante)) {
                return;
            }

            // Partidos jugados
            local.partidosJugados++;
            visitante.partidosJugados++;

            // Sets a favor y en contra
            local.setsFavor += setsLocal;
            local.setsContra += setsVisitante;

            visitante.setsFavor += setsVisitante;
            visitante.setsContra += setsLocal;

            // Puntos dentro de los sets
            (partido.sets || []).forEach(set => {

                local.puntosFavor += Number(set.local) || 0;
                local.puntosContra += Number(set.visitante) || 0;

                visitante.puntosFavor += Number(set.visitante) || 0;
                visitante.puntosContra += Number(set.local) || 0;

            });

            // Reparto de puntos: 3-2-1-0
            if (setsLocal > setsVisitante) {

                local.partidosGanados++;
                visitante.partidosPerdidos++;

                if (setsVisitante === 2) {
                    local.puntos += 2;
                    visitante.puntos += 1;
                } else {
                    local.puntos += 3;
                }

            } else if (setsVisitante > setsLocal) {

                visitante.partidosGanados++;
                local.partidosPerdidos++;

                if (setsLocal === 2) {
                    visitante.puntos += 2;
                    local.puntos += 1;
                } else {
                    visitante.puntos += 3;
                }
            }
        });
    });

    // Ordenar clasificación
    return Object.values(clasificacion).sort((a, b) => {

        if (b.puntos !== a.puntos)
            return b.puntos - a.puntos;

        if (b.setsFavor !== a.setsFavor)
            return b.setsFavor - a.setsFavor;

        if (a.setsContra !== b.setsContra)
            return a.setsContra - b.setsContra;

        if (b.puntosFavor !== a.puntosFavor)
            return b.puntosFavor - a.puntosFavor;

        if (a.puntosContra !== b.puntosContra)
            return a.puntosContra - b.puntosContra;

        return a.nombre.localeCompare(b.nombre);
    });
}


// Crear un equipo con sus estadísticas iniciales
function crearEquipo(nombre) {
    return {
        nombre: nombre,
        puntos: 0,
        partidosJugados: 0,
        partidosGanados: 0,
        partidosPerdidos: 0,
        setsFavor: 0,
        setsContra: 0,
        puntosFavor: 0,
        puntosContra: 0
    };
}


// Mostrar clasificación
function pintarClasificacion(tabla) {

    const contenedor = document.getElementById("clasificacion");

    if (!contenedor) return;

    contenedor.innerHTML = tabla.map((equipo, i) => {

        // Temporada 2024/2025
        if (temporadaActual === "24_25") {

            const nombre = equipo.equipo;
            const clase = nombre.toUpperCase().includes("PANTOJA")
                ? "equipo-destacado"
                : "";

            return `
                <tr class="${clase}">
                    <td class="posicion">${equipo.posicion}º</td>

                    <td>
                        <div class="equipo-contenedor">
                            <span class="equipo-nombre">${nombre}</span>
                        </div>
                    </td>

                    <td>${equipo.partidos_jugados}</td>
                    <td>${equipo.partidos_ganados}</td>
                    <td>${equipo.partidos_perdidos}</td>
                    <td>${equipo.sets_favor}</td>
                    <td>${equipo.sets_contra}</td>
                </tr>
            `;
        }

        // Temporada 2025/2026
        const clase = equipo.nombre.toUpperCase().includes("PANTOJA")
            ? "equipo-destacado"
            : "";

        return `
            <tr class="${clase}">
                <td class="posicion">${i + 1}º</td>

                <td>
                    <div class="equipo-contenedor">
                        <span class="equipo-nombre">${equipo.nombre}</span>
                    </div>
                </td>

                <td class="puntos">${equipo.puntos}</td>
                <td class="sets-favor">${equipo.setsFavor}</td>
                <td class="sets-contra">${equipo.setsContra}</td>
                <td class="puntos-favor">${equipo.puntosFavor}</td>
                <td class="puntos-contra">${equipo.puntosContra}</td>
            </tr>
        `;

    }).join("");
}


// Mostrar todos los partidos jugados por Pantoja
function mostrarTodosLosPartidos(partidosPorJornada, temporada) {

    const contenedor = document.getElementById("todos-jugados");

    if (!contenedor) return;

    let partidos = [];

    Object.keys(partidosPorJornada).forEach(numeroJornada => {

        partidos = partidos.concat(
            partidosPorJornada[numeroJornada].filter(partido =>
                partido.equipo_local.toUpperCase().includes("PANTOJA") ||
                partido.equipo_visitante.toUpperCase().includes("PANTOJA")
            )
        );
    });

    let html = `
        <h2>Partidos Jugados ${temporada}</h2>

        <table class="tabla-jornada">
            <tbody>
    `;

    if (partidos.length === 0) {
        html += `
            <tr>
                <td>No hay partidos jugados.</td>
            </tr>
        `;
    }

    partidos.forEach(partido => {

        const sLocal = partido.resultado_final.local;
        const sVisitante = partido.resultado_final.visitante;

        html += `
            <tr class="partido highlight">
                <td>
                    <strong>
                        ${partido.equipo_local}
                        ${sLocal} - ${sVisitante}
                        ${partido.equipo_visitante}
                    </strong>
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    contenedor.innerHTML = html;
}


// Mostrar los partidos organizados por jornada
function mostrarPartidosPorJornada(partidosPorJornada) {

    const contenedor = document.getElementById("jugados");

    if (!contenedor) return;

    let html = "";

    Object.keys(partidosPorJornada).forEach(numeroJornada => {

        const partidos = partidosPorJornada[numeroJornada];

        if (partidos.length === 0) return;

        html += `
            <div class="jornada-container">
                <div class="jornada">
                    <h2>Jornada ${numeroJornada}</h2>

                    <table class="tabla-jornada">
                        <tbody>
        `;

        partidos.forEach(partido => {

            const esPantoja =
                partido.equipo_local.toUpperCase().includes("PANTOJA") ||
                partido.equipo_visitante.toUpperCase().includes("PANTOJA");

            const clasePantoja = esPantoja ? "highlight" : "";

            const sLocal = partido.resultado_final.local;
            const sVisitante = partido.resultado_final.visitante;

            const setsDetalle = partido.sets && partido.sets.length > 0
                ? `
                    <div class="sets">
                        ${partido.sets.map(set =>
                            `${set.local}-${set.visitante}`
                        ).join(", ")}
                    </div>
                `
                : "";

            html += `
                <tr class="partido ${clasePantoja}">
                    <td>
                        <strong>
                            ${partido.equipo_local}
                            ${sLocal} - ${sVisitante}
                            ${partido.equipo_visitante}
                        </strong>

                        ${setsDetalle}
                    </td>
                </tr>
            `;
        });

        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    });

    contenedor.innerHTML = html;
}


// Ejecutar al cargar la página
cargarTemporada();