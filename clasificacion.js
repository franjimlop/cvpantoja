async function obtenerResultados() {
    try {
        const response = await fetch('https://deportes.ayto-fuenlabrada.es/resul.php?competi=009069&tipc=&c=0');
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const jornadas = doc.querySelectorAll("#divPrincipal .panel-heading");
        const clasificacion = {};

        jornadas.forEach(jornada => {
            const jornadaNombre = jornada.textContent.trim();
            const tabla = jornada.nextElementSibling.querySelector("table");

            if (tabla) {
                const filas = tabla.querySelectorAll("tbody tr");
                filas.forEach(fila => {
                    const columnas = fila.querySelectorAll("td");

                    // Recuperar la información del partido
                    const partido = {
                        local: columnas[0].textContent.trim(),
                        golesLocal: parseInt(columnas[1].textContent.trim()) || 0,
                        golesVisitante: parseInt(columnas[2].textContent.trim()) || 0,
                        visitante: columnas[3].textContent.trim(),
                    };

                    // Solo consideramos partidos con resultado (goles) para contar como partidos jugados
                    if (partido.golesLocal !== 0 || partido.golesVisitante !== 0) {
                        // Aseguramos que ambos equipos estén en la clasificación
                        if (!clasificacion[partido.local]) {
                            clasificacion[partido.local] = { jugados: 0, ganados: 0, perdidos: 0, setsAFavor: 0, setsEnContra: 0 };
                        }
                        if (!clasificacion[partido.visitante]) {
                            clasificacion[partido.visitante] = { jugados: 0, ganados: 0, perdidos: 0, setsAFavor: 0, setsEnContra: 0 };
                        }

                        // Actualizamos los partidos jugados y sets
                        clasificacion[partido.local].jugados++;
                        clasificacion[partido.visitante].jugados++;
                        clasificacion[partido.local].setsAFavor += partido.golesLocal;
                        clasificacion[partido.visitante].setsAFavor += partido.golesVisitante;
                        clasificacion[partido.local].setsEnContra += partido.golesVisitante;
                        clasificacion[partido.visitante].setsEnContra += partido.golesLocal;

                        // Determinamos al ganador y perdedor
                        if (partido.golesLocal > partido.golesVisitante) {
                            clasificacion[partido.local].ganados++;
                            clasificacion[partido.visitante].perdidos++;
                        } else if (partido.golesVisitante > partido.golesLocal) {
                            clasificacion[partido.visitante].ganados++;
                            clasificacion[partido.local].perdidos++;
                        }
                    }
                });
            }
        });

        // Convertimos el objeto de clasificación en un array para ordenar
        const clasificacionArray = Object.keys(clasificacion).map(equipo => {
            return {
                equipo: equipo,
                ...clasificacion[equipo]
            };
        });

        // Ordenamos la clasificación por partidos ganados y sets a favor
        clasificacionArray.sort((a, b) => {
            if (b.ganados !== a.ganados) {
                return b.ganados - a.ganados; // Primero por partidos ganados
            } else {
                return b.setsAFavor - a.setsAFavor; // Luego por sets a favor
            }
        });

        mostrarClasificacion(clasificacionArray);

    } catch (error) {
        console.error('Error al obtener los resultados:', error);
    }
}

function mostrarClasificacion(clasificacion) {
    const contenedor = document.getElementById('clasificacion');
    contenedor.innerHTML = clasificacion.map((equipo, index) => {
        return `
            <tr class="${equipo.equipo === 'C.V. PANTOJA' ? 'equipo-destacado' : ''}">
                <td class="posicion">${index + 1}º</td>
                <td>${equipo.equipo}</td>
                <td>${equipo.jugados}</td>
                <td>${equipo.ganados}</td>
                <td>${equipo.perdidos}</td>
                <td>${equipo.setsAFavor}</td>
                <td>${equipo.setsEnContra}</td>
            </tr>
        `;
    }).join('');
}

// Llamamos a la función para obtener los resultados al cargar la página
obtenerResultados();
