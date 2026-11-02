
/* =========================================
   CV PANTOJA - ELEMENTOS COMUNES
   ========================================= */

/* ---------- MENÚ DE NAVEGACIÓN ---------- */

// Páginas de la web
const paginas = [
    {
        nombre: "Inicio",
        archivo: "index.html"
    },
    {
        nombre: "Clasificación",
        archivo: "clasificacion.html"
    },
    {
        nombre: "Jornadas",
        archivo: "jornadas.html"
    },
    {
        nombre: "Equipos",
        archivo: "equipos.html"
    },
    {
        nombre: "Temp. 24/25",
        archivo: "temporada1.html"
    },
    {
        nombre: "Temp. 25/26",
        archivo: "temporada2.html"
    }
];

// Averiguar qué página está abierta
const paginaActual = window.location.pathname.split("/").pop() || "index.html";

// Buscar el elemento donde se insertará la cabecera
const cabecera = document.getElementById("cabecera");

// Generar la cabecera
if (cabecera) {

    // Crear los enlaces del menú
    const enlaces = paginas.map(pagina => {

        const activa = pagina.archivo === paginaActual;

        return `
            <li>
                <a href="${pagina.archivo}"
                   class="${activa ? "activo" : ""}"
                   ${activa ? 'aria-current="page"' : ""}>
                    ${pagina.nombre}
                </a>
            </li>
        `;
    }).join("");

    // Insertar la cabecera completa
    cabecera.innerHTML = `
        <nav aria-label="Navegación principal">
            <ul>
                <li>
                    <a href="index.html" aria-label="Ir al inicio">
                        <img src="images/toja.png"
                             alt="CV Pantoja">
                    </a>
                </li>

                ${enlaces}
            </ul>
        </nav>
    `;
}
