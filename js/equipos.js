
/* =========================================
   CV PANTOJA - PÁGINA DE EQUIPOS
   ========================================= */

const JSON_URL = "./datos/competicion_26_27.json";

async function cargarEstadisticas() {
    try {
        const datos = await CVPantoja.cargarDatos(JSON_URL);

        const estadisticas = {
            oro: crearEstadisticas(),
            azul: crearEstadisticas()
        };

        // Recorrer todos los partidos de la competición
        datos.jornadas.forEach(jornada => {
            jornada.partidos.forEach(partido => {

                const local = partido.equipo_local.toUpperCase();
                const visitante = partido.equipo_visitante.toUpperCase();

                const esOro = local.includes("PANTOJA ORO") ||
                              visitante.includes("PANTOJA ORO");

                const esAzul = local.includes("PANTOJA AZUL") ||
                               visitante.includes("PANTOJA AZUL");

                // Ignorar partidos que no sean de Pantoja
                if (!esOro && !esAzul) return;

                const equipo = esOro ? estadisticas.oro : estadisticas.azul;

                // Ignorar partidos pendientes
                if (!partido.resultado_final) return;

                const setsLocal = Number(partido.resultado_final.local);
                const setsVisitante = Number(partido.resultado_final.visitante);

                if (!Number.isFinite(setsLocal) ||
                    !Number.isFinite(setsVisitante)) {
                    return;
                }

                const juegaEnCasa = local.includes(
                    esOro ? "PANTOJA ORO" : "PANTOJA AZUL"
                );

                const setsFavor = juegaEnCasa ? setsLocal : setsVisitante;
                const setsContra = juegaEnCasa ? setsVisitante : setsLocal;

                equipo.partidosJugados++;

                equipo.setsFavor += setsFavor;
                equipo.setsContra += setsContra;

                // Contabilizar puntos dentro de los sets
                (partido.sets || []).forEach(set => {
                    const puntosLocal = Number(set.local) || 0;
                    const puntosVisitante = Number(set.visitante) || 0;

                    equipo.puntosFavor += juegaEnCasa
                        ? puntosLocal
                        : puntosVisitante;

                    equipo.puntosContra += juegaEnCasa
                        ? puntosVisitante
                        : puntosLocal;
                });

                // Calcular victorias, derrotas y puntos
                if (setsFavor > setsContra) {

                    equipo.partidosGanados++;

                    equipo.puntos += setsContra === 2 ? 2 : 3;

                } else if (setsContra > setsFavor) {

                    equipo.partidosPerdidos++;

                    if (setsFavor === 2) {
                        equipo.puntos += 1;
                    }
                }
            });
        });

        mostrarEstadisticas("estadisticas-oro", estadisticas.oro);
        mostrarEstadisticas("estadisticas-azul", estadisticas.azul);

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


// Crear la estructura inicial de estadísticas
function crearEstadisticas() {
    return {
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


// Mostrar las estadísticas de un equipo
function mostrarEstadisticas(contenedorId, equipo) {
    const contenedor = document.getElementById(contenedorId);

    if (!contenedor) return;

    contenedor.innerHTML = `
        <div class="estadistica">
            <span>Partidos jugados</span>
            <strong>${equipo.partidosJugados}</strong>
        </div>

        <div class="estadistica">
            <span>Partidos ganados</span>
            <strong>${equipo.partidosGanados}</strong>
        </div>

        <div class="estadistica">
            <span>Partidos perdidos</span>
            <strong>${equipo.partidosPerdidos}</strong>
        </div>

        <div class="estadistica">
            <span>Puntos en clasificación</span>
            <strong>${equipo.puntos}</strong>
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
            <span>Puntos a favor</span>
            <strong>${equipo.puntosFavor}</strong>
        </div>

        <div class="estadistica">
            <span>Puntos en contra</span>
            <strong>${equipo.puntosContra}</strong>
        </div>
    `;
}


// Ejecutar al cargar la página
cargarEstadisticas();