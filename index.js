async function obtenerDatos() {
    try {
        const response = await fetch('./competicion.json');
        const datos = await response.json(); // parseamos JSON

        const partidosPendientes = [];
        const partidosJugados = [];

        datos.jornadas.forEach(jornada => {
            jornada.partidos.forEach(partido => {
                const esPantoja = 
                    partido.equipo_local.includes("PANTOJA") ||
                    partido.equipo_visitante.includes("PANTOJA");

                if (!esPantoja) return;

                const jugado = partido.resultado_final.local > 0 || partido.resultado_final.visitante > 0;

                if (jugado) {
                    partidosJugados.push(partido);
                } else {
                    partidosPendientes.push(partido);
                }
            });
        });

        // Mostrar partidos pendientes y jugados
        mostrarPartidos(partidosPendientes, "pendientes", false);
        mostrarPartidos(partidosJugados, "jugados", true);

    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
}

function mostrarPartidos(partidos, contenedorId, esJugado) {
    const contenedor = document.getElementById(contenedorId);

    contenedor.innerHTML = partidos.map(partido => {
        const setsDetalle = esJugado && partido.sets.length > 0
            ? `<div class="sets">${partido.sets.map(set => `${set.local}-${set.visitante}`).join(', ')}</div>`
            : '';

        return `
            <tr class="${partido.equipo_local.includes("PANTOJA") || partido.equipo_visitante.includes("PANTOJA") ? "highlight" : ""}">
                <td>
                    <strong>${partido.equipo_local} ${esJugado ? partido.resultado_final.local + " - " + partido.resultado_final.visitante : "vs"} ${partido.equipo_visitante}</strong>
                    ${setsDetalle}
                    ${!esJugado ? `<div class="detalles">🕒 ${partido.fecha} 📍 ${partido.lugar}</div>` : ""}
                </td>
            </tr>
        `;
    }).join('');
}

// Llamamos a la función al cargar la página
obtenerDatos();