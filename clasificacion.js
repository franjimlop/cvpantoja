const API_URL = "https://ighvyqimicqhtrhwjezp.supabase.co/rest/v1/matches?select=*,home_team:teams!matches_home_team_id_fkey(name,logo_url),away_team:teams!matches_away_team_id_fkey(name,logo_url)&category=eq.Senior";

const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnaHZ5cWltaWNxaHRyaHdqZXpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNjc3ODYsImV4cCI6MjA3OTg0Mzc4Nn0.Nk8pNqVmoEKU1LoQirtUB3fxUjDyHiwpoTBetOG3fzI";

async function cargarClasificacion() {
  try {
    const response = await fetch(API_URL, {
      headers: {
        "apikey": API_KEY,
        "authorization": `Bearer ${API_KEY}`,
        "accept-profile": "public"
      }
    });

    const logosLocales = {
    "CLUB VOLEY CUBAS": "images/cubas.png",
    "LA RESISTENCIA": "images/resistencia.png",
    "AVS SESEÑA MASCULINO": "images/avs.png",
    "AVS SESEÑA SENIOR MIXTO": "images/avs.png",
    "CLUB VOLEY PANTOJA": "images/pantoja.png",
    "CLUB VOLEY YELES": "images/yeles.png",
    "VOLTECH BARGAS": "images/bargas.png",
    "CLUB VOLEY NEXUS": "images/nexus.png"
    };

    const partidos = await response.json();
        const clasificacion = {};

        partidos.forEach(partido => {
            const local = partido.home_team.name.toUpperCase();
            const visitante = partido.away_team.name.toUpperCase();

            if (!clasificacion[local]) {
                clasificacion[local] = {
                    nombre: local,
                    logo: logosLocales[local],
                    puntos: 0,
                    setsFavor: 0,
                    setsContra: 0,
                    puntosFavor: 0,
                    puntosContra: 0
                };
            }
            if (!clasificacion[visitante]) {
                clasificacion[visitante] = {
                    nombre: visitante,
                    logo: logosLocales[visitante],
                    puntos: 0,
                    setsFavor: 0,
                    setsContra: 0,
                    puntosFavor: 0,
                    puntosContra: 0
                };
            }

            const l = clasificacion[local];
            const v = clasificacion[visitante];

            const setsLocal = partido.home_score;
            const setsVisitante = partido.away_score;

            // Sets a favor / en contra
            l.setsFavor += setsLocal;
            l.setsContra += setsVisitante;
            v.setsFavor += setsVisitante;
            v.setsContra += setsLocal;

            // Puntos dentro de los sets
            if (partido.sets) {
                partido.sets.forEach(s => {
                    l.puntosFavor += s.homePoints;
                    l.puntosContra += s.awayPoints;
                    v.puntosFavor += s.awayPoints;
                    v.puntosContra += s.homePoints;
                });
            }

            // Puntuación 3-2-1-0
            if ((setsLocal === 3 && setsVisitante <= 1) || (setsVisitante === 3 && setsLocal <= 1)) {
                // victoria clara
                if (setsLocal > setsVisitante) l.puntos += 3;
                else v.puntos += 3;
            } else if ((setsLocal === 3 && setsVisitante === 2) || (setsVisitante === 3 && setsLocal === 2)) {
                // victoria apretada
                if (setsLocal > setsVisitante) {
                    l.puntos += 2;
                    v.puntos += 1;
                } else {
                    v.puntos += 2;
                    l.puntos += 1;
                }
            }
        });

        // Orden
        const tabla = Object.values(clasificacion).sort((a, b) => {
            if (b.puntos !== a.puntos) return b.puntos - a.puntos;
            if (b.setsFavor !== a.setsFavor) return b.setsFavor - a.setsFavor;
            if (a.setsContra !== b.setsContra) return a.setsContra - b.setsContra;
            if (b.puntosFavor !== a.puntosFavor) return b.puntosFavor - a.puntosFavor;
            if (a.puntosContra !== b.puntosContra) return a.puntosContra - b.puntosContra;
            return a.nombre.localeCompare(b.nombre);
        });

        pintarTabla(tabla);
    } catch (error) {
        console.error("Error cargando datos:", error);
    }
}

function pintarTabla(tabla) {
    const contenedor = document.getElementById("clasificacion");
    if (!contenedor) return;

    // Mantener tu estructura CSS: solo tbody, sin crear tabla extra
    contenedor.innerHTML = tabla.map((e, i) => `
        <tr class="${e.nombre.includes("PANTOJA") ? "equipo-destacado" : ""}">
            <td class="posicion">${i + 1}º</td>
            <td class="equipo">
                <img src="${e.logo}" alt="${e.nombre}" class="equipo-logo">
                <span class="equipo-nombre">${e.nombre}</span>
            </td>
            <td class="puntos">${e.puntos}</td>
            <td class="sets-favor">${e.setsFavor}</td>
            <td class="sets-contra">${e.setsContra}</td>
            <td class="puntos-favor">${e.puntosFavor}</td>
            <td class="puntos-contra">${e.puntosContra}</td>
        </tr>
    `).join('');
}

// Ejecutar al cargar la página
cargarClasificacion();