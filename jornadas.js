async function obtenerDatos() {
    try {
        const response = await fetch('https://deportes.ayto-fuenlabrada.es/resul.php?competi=009069&tipc=&c=0');
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const jornadas = doc.querySelectorAll("#divPrincipal .panel-heading");
        const partidosPorJornada = {};

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
                        local: columnas[0].textContent.trim(),
                        golesLocal: columnas[1].textContent.trim(),
                        golesVisitante: columnas[2].textContent.trim(),
                        visitante: columnas[3].textContent.trim(),
                        fecha: fechaHora,
                        lugar: columnas[5].textContent.trim()
                    };

                    if (!partidosPorJornada[jornadaNombre]) {
                        partidosPorJornada[jornadaNombre] = [];
                    }
                    partidosPorJornada[jornadaNombre].push(partido);
                });
            }
        });

        mostrarResultados(partidosPorJornada);
    } catch (error) {
        console.error('Error al obtener los datos:', error);
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
                                const esPantoja = partido.local.includes("C.V. PANTOJA") || partido.visitante.includes("C.V. PANTOJA");
                                const clasePantoja = esPantoja ? 'highlight' : '';
                                const tieneResultado = partido.golesLocal && partido.golesVisitante;

                                return `
                                    <tr class="partido ${clasePantoja}">
                                        <td>
                                            <strong>${partido.local} ${tieneResultado ? partido.golesLocal + " - " + partido.golesVisitante : "vs"} ${partido.visitante}</strong>
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

// Llamamos a la función para obtener los datos al cargar la página
obtenerDatos();
