async function cargarDatos() {
    const response = await fetch("competicion.json");
    const data = await response.json();
    generarClasificacion(data);
}

function generarClasificacion(data) {
    const clasificacion = {};

    data.jornadas.forEach(jornada => {
        jornada.partidos.forEach(p => {
            const resultado = typeof p.resultado_final === "string" ? p.resultado_final : "0-0";
            const [setsLocal, setsVisitante] = resultado.split("-").map(Number);

            const localTeam = p.equipo_local;
            const awayTeam = p.equipo_visitante;

            if (!clasificacion[localTeam]) {
                clasificacion[localTeam] = { equipo: localTeam, puntos: 0, jugados: 0, setsAF: 0, setsEC: 0, puntosAF: 0, puntosEC: 0 };
            }
            if (!clasificacion[awayTeam]) {
                clasificacion[awayTeam] = { equipo: awayTeam, puntos: 0, jugados: 0, setsAF: 0, setsEC: 0, puntosAF: 0, puntosEC: 0 };
            }

            const local = clasificacion[localTeam];
            const visitante = clasificacion[awayTeam];


            // Partido no jugado
            if (setsLocal === 0 && setsVisitante === 0) return;

            // Partidos jugados
            local.jugados++;
            visitante.jugados++;

            // Sets
            local.setsAF += setsLocal;
            local.setsEC += setsVisitante;
            visitante.setsAF += setsVisitante;
            visitante.setsEC += setsLocal;

            // Puntos por sets (puntos dentro de los sets)
            p.sets.forEach(s => {
                local.puntosAF += s.local;
                local.puntosEC += s.visitante;
                visitante.puntosAF += s.visitante;
                visitante.puntosEC += s.local;
            });

            // Asignar puntos por victoria/derrota
            if ((setsLocal === 3 && setsVisitante <= 1) || (setsVisitante === 3 && setsLocal <= 1)) {
                // Victoria clara 3–0 / 3–1
                if (setsLocal > setsVisitante) {
                    local.puntos += 3;
                } else {
                    visitante.puntos += 3;
                }
            } else {
                // Partido 3–2 / 2–3
                if (setsLocal > setsVisitante) {
                    local.puntos += 2;
                    visitante.puntos += 1;
                } else {
                    visitante.puntos += 2;
                    local.puntos += 1;
                }
            }
        });
    });

    const tabla = Object.values(clasificacion).sort((a, b) => {
        // 1) Puntos
        if (b.puntos !== a.puntos) return b.puntos - a.puntos;

        // 2) Más sets a favor
        if (b.setsAF !== a.setsAF) return b.setsAF - a.setsAF;

        // 3) Menos sets en contra
        if (a.setsEC !== b.setsEC) return a.setsEC - b.setsEC;

        // 4) Más puntos a favor
        if (b.puntosAF !== a.puntosAF) return b.puntosAF - a.puntosAF;

        // 5) Menos puntos en contra
        if (a.puntosEC !== b.puntosEC) return a.puntosEC - b.puntosEC;

        // 6) Orden alfabético si todo empata
        return a.equipo.localeCompare(b.equipo);
    });

    mostrarClasificacion(tabla);
}

function mostrarClasificacion(tabla) {
    const contenedor = document.getElementById("clasificacion");
    contenedor.innerHTML = tabla.map((e, i) => { 
        return `
            <tr class="${e.equipo === 'PANTOJA' ? 'equipo-destacado' : ''}">
                <td class="posicion">${i + 1}º</td>
                <td>${e.equipo}</td>
                <td>${e.puntos}</td>
                <td>${e.setsAF}</td>
                <td>${e.setsEC}</td>
                <td>${e.puntosAF}</td>
                <td>${e.puntosEC}</td>
            </tr>
        `;
    }).join('');
}

cargarDatos();
