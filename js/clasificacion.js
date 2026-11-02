
/* =========================================
   CV PANTOJA - PÁGINA DE CLASIFICACIÓN
   ========================================= */

const JSON_URL = "./datos/competicion_26_27.json";

async function cargarClasificacion() {
    try {
        const datos = await CVPantoja.cargarDatos(JSON_URL);
        const clasificacion = {};

        // Normalizar nombres para evitar duplicados por tildes
        function normalizarNombre(nombre) {
            return nombre
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toUpperCase()
                .trim();
        }

        // Crear los equipos y calcular sus estadísticas
        datos.jornadas.forEach(jornada => {
            jornada.partidos.forEach(partido => {

                const nombreLocal = partido.equipo_local.trim();
                const nombreVisitante = partido.equipo_visitante.trim();

                const claveLocal = normalizarNombre(nombreLocal);
                const claveVisitante = normalizarNombre(nombreVisitante);

                // Crear el equipo local si no existe
                if (!clasificacion[claveLocal]) {
                    clasificacion[claveLocal] = {
                        nombre: nombreLocal,
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

                // Crear el equipo visitante si no existe
                if (!clasificacion[claveVisitante]) {
                    clasificacion[claveVisitante] = {
                        nombre: nombreVisitante,
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

                // Si el partido no tiene resultado, no contabilizarlo
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
        const tabla = Object.values(clasificacion).sort((a, b) => {

            if (b.puntos !== a.puntos) {
                return b.puntos - a.puntos;
            }

            if (b.setsFavor !== a.setsFavor) {
                return b.setsFavor - a.setsFavor;
            }

            if (a.setsContra !== b.setsContra) {
                return a.setsContra - b.setsContra;
            }

            if (b.puntosFavor !== a.puntosFavor) {
                return b.puntosFavor - a.puntosFavor;
            }

            if (a.puntosContra !== b.puntosContra) {
                return a.puntosContra - b.puntosContra;
            }

            return a.nombre.localeCompare(b.nombre);
        });

        pintarTabla(tabla);

    } catch (error) {
        console.error("Error cargando la clasificación:", error);

        const mensaje = document.getElementById("mensaje-error");

        if (mensaje) {
            mensaje.textContent =
                "No se ha podido cargar la clasificación.";
            mensaje.hidden = false;
        }
    }
}


// Mostrar la clasificación
function pintarTabla(tabla) {
    const contenedor = document.getElementById("clasificacion");

    if (!contenedor) return;

    contenedor.innerHTML = tabla.map((equipo, i) => {

        const claseEquipo = CVPantoja.obtenerClaseEquipo({
            equipo_local: equipo.nombre,
            equipo_visitante: ""
        });

        return `
            <tr class="${claseEquipo}">
                <td class="posicion">${i + 1}º</td>

                <td>
                    <span class="equipo-nombre">${equipo.nombre}</span>
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


// Ejecutar al cargar la página
cargarClasificacion();