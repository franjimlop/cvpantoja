
/* =========================================
   CV PANTOJA - FUNCIONES COMPARTIDAS
   ========================================= */

window.CVPantoja = {

    // Cargar los datos de un archivo JSON
    async cargarDatos(ruta) {

        const respuesta = await fetch(ruta);

        if (!respuesta.ok) {
            throw new Error("No se ha podido cargar el archivo JSON");
        }

        return await respuesta.json();
    },


    // Determinar el color del partido según el equipo
    obtenerClaseEquipo(partido) {

        const local = partido.equipo_local.toUpperCase();
        const visitante = partido.equipo_visitante.toUpperCase();

        const juegaOro =
            local.includes("PANTOJA ORO") ||
            visitante.includes("PANTOJA ORO");

        const juegaAzul =
            local.includes("PANTOJA AZUL") ||
            visitante.includes("PANTOJA AZUL");

        if (juegaOro && juegaAzul) {
            return "partido-derbi";
        }

        if (juegaOro) {
            return "equipo-oro";
        }

        if (juegaAzul) {
            return "equipo-azul";
        }

        return "";
    }

};