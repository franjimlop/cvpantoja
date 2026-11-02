/* =========================================
   CV PANTOJA - ESTADÍSTICAS COMPARTIDAS
   ========================================= */

window.CVPantojaEstadisticas = {

    // =====================================
    // CREAR ESTADÍSTICAS INICIALES
    // =====================================

    crearEstadisticas() {
        return {
            puntos: 0,

            partidosJugados: 0,
            partidosGanados: 0,
            partidosPerdidos: 0,

            setsFavor: 0,
            setsContra: 0,

            puntosFavor: 0,
            puntosContra: 0,

            resultados: {
                "3-0": 0,
                "3-1": 0,
                "3-2": 0,
                "2-3": 0,
                "1-3": 0,
                "0-3": 0
            },

            victoriasPorJornada: {},
            derrotasPorJornada: {},
            puntosPorJornada: {},

            partidos: []
        };
    },


    // =====================================
    // CONTABILIZAR UN PARTIDO
    // =====================================

    contabilizarPartido(equipo, partido, esLocal, numeroJornada) {

        const setsLocal = Number(partido.resultado_final.local);
        const setsVisitante = Number(partido.resultado_final.visitante);

        // Obtener el resultado desde el punto de vista del equipo
        const setsFavor = esLocal ? setsLocal : setsVisitante;
        const setsContra = esLocal ? setsVisitante : setsLocal;

        // Comprobar que el resultado corresponde a un partido válido
        if (
            !Number.isInteger(setsFavor) ||
            !Number.isInteger(setsContra) ||
            setsFavor < 0 ||
            setsContra < 0 ||
            setsFavor > 3 ||
            setsContra > 3 ||
            Math.max(setsFavor, setsContra) !== 3
        ) {
            return;
        }

        equipo.partidosJugados++;

        equipo.setsFavor += setsFavor;
        equipo.setsContra += setsContra;

        // Contabilizar los puntos de cada set, si están disponibles
        (partido.sets || []).forEach(set => {

            const puntosLocal = Number(set.local);
            const puntosVisitante = Number(set.visitante);

            if (
                !Number.isFinite(puntosLocal) ||
                !Number.isFinite(puntosVisitante)
            ) {
                return;
            }

            equipo.puntosFavor += esLocal
                ? puntosLocal
                : puntosVisitante;

            equipo.puntosContra += esLocal
                ? puntosVisitante
                : puntosLocal;
        });

        // Resultado desde el punto de vista del equipo
        const resultado = `${setsFavor}-${setsContra}`;

        equipo.resultados[resultado]++;

        const haGanado = setsFavor === 3;

        // Calcular puntos de clasificación
        let puntosClasificacion = 0;

        if (haGanado) {

            equipo.partidosGanados++;

            // Victoria 3-2: 2 puntos.
            // Victoria 3-0 o 3-1: 3 puntos.
            puntosClasificacion = setsContra === 2 ? 2 : 3;

            equipo.victoriasPorJornada[numeroJornada] =
                (equipo.victoriasPorJornada[numeroJornada] || 0) + 1;

        } else {

            equipo.partidosPerdidos++;

            // Derrota 2-3: 1 punto.
            // Derrota 0-3 o 1-3: 0 puntos.
            puntosClasificacion = setsFavor === 2 ? 1 : 0;

            equipo.derrotasPorJornada[numeroJornada] =
                (equipo.derrotasPorJornada[numeroJornada] || 0) + 1;
        }

        equipo.puntos += puntosClasificacion;

        // Guardar el partido para las rachas y los gráficos
        equipo.partidos.push({
            jornada: numeroJornada,
            resultado,
            ganado: haGanado,
            puntosClasificacion
        });
    },


    // =====================================
    // CALCULAR ESTADÍSTICAS DERIVADAS
    // =====================================

    calcularEstadisticasDerivadas(equipo, jornadas) {

        const partidos = equipo.partidosJugados;

        equipo.porcentajeVictorias = partidos > 0
            ? equipo.partidosGanados / partidos * 100
            : 0;

        equipo.porcentajeDerrotas = partidos > 0
            ? equipo.partidosPerdidos / partidos * 100
            : 0;

        equipo.diferenciaSets = equipo.setsFavor - equipo.setsContra;

        equipo.diferenciaPuntos = equipo.puntosFavor - equipo.puntosContra;

        equipo.mediaSetsFavor = partidos > 0
            ? equipo.setsFavor / partidos
            : 0;

        equipo.mediaSetsContra = partidos > 0
            ? equipo.setsContra / partidos
            : 0;

        equipo.mediaPuntosFavor = partidos > 0
            ? equipo.puntosFavor / partidos
            : 0;

        equipo.mediaPuntosContra = partidos > 0
            ? equipo.puntosContra / partidos
            : 0;

        // Calcular los puntos acumulados por jornada
        let puntosAcumulados = 0;

        equipo.puntosPorJornada = {};

        jornadas.forEach(numeroJornada => {

            const partidosJornada = equipo.partidos.filter(
                partido => partido.jornada === numeroJornada
            );

            partidosJornada.forEach(partido => {
                puntosAcumulados += partido.puntosClasificacion;
            });

            // Si el equipo descansa, conserva los puntos anteriores
            equipo.puntosPorJornada[numeroJornada] = puntosAcumulados;
        });
    },


    // =====================================
    // CALCULAR ESTADÍSTICAS DE UN EQUIPO
    // =====================================

    calcularEstadisticasEquipo(datos, nombreEquipo) {

        const estadisticas = this.crearEstadisticas();

        const jornadas = datos.jornadas.map(
            jornada => jornada.jornada
        );

        datos.jornadas.forEach(jornada => {

            jornada.partidos.forEach(partido => {

                const local = partido.equipo_local.toUpperCase();
                const visitante = partido.equipo_visitante.toUpperCase();

                const participaComoLocal =
                    local.includes(nombreEquipo.toUpperCase());

                const participaComoVisitante =
                    visitante.includes(nombreEquipo.toUpperCase());

                // Ignorar partidos en los que no participa el equipo
                if (!participaComoLocal && !participaComoVisitante) {
                    return;
                }

                // Ignorar partidos pendientes
                if (!partido.resultado_final) {
                    return;
                }

                this.contabilizarPartido(
                    estadisticas,
                    partido,
                    participaComoLocal,
                    jornada.jornada
                );
            });
        });

        this.calcularEstadisticasDerivadas(
            estadisticas,
            jornadas
        );

        return estadisticas;
    }

};