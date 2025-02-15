async function obtenerDatos() {
    try {
        const response = await fetch('https://deportes.ayto-fuenlabrada.es/resul.php?competi=009069&tipc=&c=0');
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const jornadas = doc.querySelectorAll("#divPrincipal .panel-heading");
        const partidosPendientes = [];
        const partidosJugados = [];

        jornadas.forEach(jornada => {
            const jornadaNombre = jornada.textContent.trim();
            const tabla = jornada.nextElementSibling.querySelector("table");

            if (tabla) {
                const filas = tabla.querySelectorAll("tbody tr");
                filas.forEach(fila => {
                    const columnas = fila.querySelectorAll("td");

                    let fechaHora = columnas[4].textContent.trim().replace(/\n/g, '').trim();
                    fechaHora = fechaHora.replace(/(\d{2}\/\d{2}\/\d{2})(\d{2}:\d{2})/, '$1 $2');

                    const partido = {
                        jornada: jornadaNombre,
                        local: columnas[0].textContent.trim(),
                        golesLocal: columnas[1].textContent.trim(),
                        golesVisitante: columnas[2].textContent.trim(),
                        visitante: columnas[3].textContent.trim(),
                        fecha: fechaHora,
                        lugar: columnas[5].textContent.trim()
                    };

                    const esPantoja = partido.local.includes("C.V. PANTOJA") || partido.visitante.includes("C.V. PANTOJA");

                    if (esPantoja) {
                        if (partido.golesLocal && partido.golesVisitante) {
                            partidosJugados.push(partido);
                        } else {
                            partidosPendientes.push(partido);
                        }
                    }
                });
            }
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
    contenedor.innerHTML = partidos.map(partido => `
        <tr class="${partido.local.includes("C.V. PANTOJA") || partido.visitante.includes("C.V. PANTOJA") ? "highlight" : ""}">
            <td>
                <strong>${partido.local} ${esJugado ? partido.golesLocal + " - " + partido.golesVisitante : "vs"} ${partido.visitante}</strong>
                ${!esJugado ? `<div class="detalles">🕒 ${partido.fecha} 📍 ${partido.lugar}</div>` : ""}
            </td>
        </tr>
    `).join('');
}

// Llamamos a la función al cargar la página
obtenerDatos();