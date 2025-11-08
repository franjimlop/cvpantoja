async function obtenerDatos() {
    try {
        // Carga el archivo JSON local
        const response = await fetch('competicion.json');
        const data = await response.json();

        const partidosPorJornada = {};

        data.jornadas.forEach(jornada => {
            const jornadaNombre = `Jornada ${jornada.jornada}`;
            const partidos = jornada.partidos.map(p => {
                return {
                    local: p.equipo_local.toUpperCase(),
                    visitante: p.equipo_visitante.toUpperCase(),
                    resultado_final: p.resultado_final,
                    sets: p.sets || [],
                    fecha: p.fecha || '',
                    lugar: p.lugar || ''
                };
            });
            partidosPorJornada[jornadaNombre] = partidos;
        });

        mostrarResultados(partidosPorJornada);
    } catch (error) {
        console.error('Error al obtener los datos del JSON:', error);
    }
}

function mostrarResultados(partidosPorJornada) {
    const contenedor = document.getElementById("resultados");
    contenedor.innerHTML = ""; // Limpiamos contenido previo

    const jornadasHTML = Object.keys(partidosPorJornada).map(jornada => {
        const partidos = partidosPorJornada[jornada];

        return `
            <div class="jornada-container">
                <div class="jornada">
                    <h2>${jornada}</h2>
                    <table class="tabla-jornada">
                        <tbody>
                            ${partidos.map(partido => {
                                const esPantoja = partido.local.includes("PANTOJA") || partido.visitante.includes("PANTOJA");
                                const clasePantoja = esPantoja ? 'highlight' : '';

                                const sLocal = partido.resultado_final.local;
                                const sVisitante = partido.resultado_final.visitante;
                                const tieneResultado = (sLocal !== 0 || sVisitante !== 0);

                                // Mostrar sets si hay resultado
                                const setsDetalle = tieneResultado && partido.sets.length > 0
                                    ? `<div class="sets">${partido.sets.map(set => `${set.local}-${set.visitante}`).join(', ')}</div>`
                                    : '';

                                return `
                                    <tr class="partido ${clasePantoja}">
                                        <td>
                                            <strong>${partido.local} ${tieneResultado ? sLocal + " - " + sVisitante : "vs"} ${partido.visitante}</strong>
                                            ${setsDetalle}
                                            ${!tieneResultado ? `<div class="detalles">🕒 ${partido.fecha} 📍 ${partido.lugar}</div>` : ""}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }).join('');

    contenedor.innerHTML = `<div class="jornadas-grid">${jornadasHTML}</div>`;
}

// Ejecutar al cargar la página
obtenerDatos();
