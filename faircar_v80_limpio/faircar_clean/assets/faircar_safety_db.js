// FairCar – Base de Datos de Seguridad y Calidad por Marca
// Versión: 2026-02 · Fuentes: Euro NCAP 2022-2025, OCU Fiabilidad 2024, JD Power 2025,
//           Autovista Group RV Awards 2024, carVertical, km77, Carwow, Motor1.es
// ─────────────────────────────────────────────────────────────────────────────
// METODOLOGÍA DE PUNTUACIÓN (escala 1-10, decimal):
//   euroNcapScore    → Estrellas medias Euro NCAP (5★→10, 4★→8, 3★→6, 0★→1) + ponderación % categorías
//   fiabilidadOCU    → Índice OCU fiabilidad 2024 (0-100 → convertido a 1-10)
//   devaluacion      → Valor residual a 3 años: 10=mínima pérdida · 1=máxima pérdida
//   seguridadActiva  → Sistemas ADAS / seguridad activa media gama
//   seguridadPasiva  → Protección pasajeros adultos + niños (% Euro NCAP → 1-10)
//   proteccionVPU    → Protección usuarios vulnerables (peatones/ciclistas/motoristas)
//   asistenciaADAS   → Score ADAS Euro NCAP media modelos recientes
//   satisfaccionUser → Satisfacción propietario (OCU + foros españoles)
//   scoreFinal       → Suma ponderada (ver PESOS abajo)
//
// PESOS:
//   euroNcapScore    20%
//   fiabilidadOCU    20%
//   devaluacion      15%
//   seguridadActiva  10%
//   seguridadPasiva  15%
//   proteccionVPU    10%
//   satisfaccionUser 10%
//
// scoreFinal = suma ponderada de los 7 criterios (decimal, 1 décima)
// ─────────────────────────────────────────────────────────────────────────────

(function() {

// ─── UTILIDAD ────────────────────────────────────────────────────────────────
function calcScore(b) {
  return +(
    b.euroNcapScore    * 0.20 +
    b.fiabilidadOCU    * 0.20 +
    b.devaluacion      * 0.15 +
    b.seguridadActiva  * 0.10 +
    b.seguridadPasiva  * 0.15 +
    b.proteccionVPU    * 0.10 +
    b.satisfaccionUser * 0.10
  ).toFixed(1);
}

// ─── BASE DE DATOS ────────────────────────────────────────────────────────────
const raw = [
  // ────────────────────────────────────── MARCAS PREMIUM ALEMANAS
  {
    id: "mercedes-benz", name: "Mercedes-Benz", country: "Alemania",
    euroNcapScore: 9.5, // Clase E 2024: mejor resultado absoluto 92/90/84/87%; modelos recientes 5★
    fiabilidadOCU: 7.5, // OCU 2024: 87pts → posición media-alta
    devaluacion: 5.5,   // Premium lujo: depreciación alta (Clase E -69% 5 años); S/GLS peor; GLC/GLA mejor
    seguridadActiva: 9.5, // Pre-Safe, Distronic Plus, Active Brake Assist. Mejor ADAS del mercado
    seguridadPasiva: 9.2, // Clase E 92% adultos, 90% niños. Airbags centrales traseros
    proteccionVPU: 8.5, // 84% VPU Clase E 2024. Media gama decente
    satisfaccionUser: 8.0, // Alta satisfacción de lujo; coste taller alto (400€/año)
    ncapStars: 5,
    ncapModelos: "Clase E (2024, mejor del año), GLC, GLA, EQA, Vito",
    fiabilidadNota: "87/100 OCU. Posición 13ª. Costes taller entre los más altos (400€/año).",
    devaluacionNota: "Clase E -69% en 5 años. GLA/GLC mejoran por demanda. G-Class retiene muy bien.",
    resumen: "El mejor en seguridad EuroNCAP 2024 (Clase E). Fiabilidad media-alta. Alta devaluación en lujo."
  },
  {
    id: "bmw", name: "BMW", country: "Alemania",
    euroNcapScore: 8.8,
    fiabilidadOCU: 7.5, // OCU 2024: 87pts
    devaluacion: 5.0,   // BMW X3/X5/Serie 5/Serie 7 entre los que más se deprecian (66-73% en 5 años)
    seguridadActiva: 9.2,
    seguridadPasiva: 8.8,
    proteccionVPU: 8.2,
    satisfaccionUser: 8.0,
    ncapStars: 5,
    ncapModelos: "iX1, i4, Serie 1. BMW X5 en categoría SUV grande.",
    fiabilidadNota: "87/100 OCU. Frenos como punto débil (JD Power 2024). Eléctricos más fiables.",
    devaluacionNota: "Serie 7: -72.6% en 5 años. Serie 5: -70.1%. X3: -66.5%. Mejor retención: X1, Serie 1.",
    resumen: "Tecnología y seguridad activa de primer nivel. Devaluación muy alta en gamas altas."
  },
  {
    id: "audi", name: "Audi", country: "Alemania",
    euroNcapScore: 8.5, // Q6 e-tron 2024: 5★ con notas altas; Q3, A3 también 5★
    fiabilidadOCU: 7.5, // OCU 2024: 87pts
    devaluacion: 5.5,   // A6 -56.3%, A7 -57.2%, Q7 -56.8% en 5 años. Mejor: A1, Q2
    seguridadActiva: 9.0,
    seguridadPasiva: 8.8,
    proteccionVPU: 8.2,
    satisfaccionUser: 7.8,
    ncapStars: 5,
    ncapModelos: "Q6 e-tron (2024, excelente), Q8, A3, Q3",
    fiabilidadNota: "87/100 OCU. Averías eléctricas frecuentes en algunos modelos. Coste taller ~400€/año.",
    devaluacionNota: "Gama alta: -55 a -57% en 5 años. Gama media: mejor retención. Q6 e-tron pendiente.",
    resumen: "Tecnología ADAS excelente, Euro NCAP sólido. Fiabilidad y devaluación en gama alta son puntos débiles."
  },
  {
    id: "porsche", name: "Porsche", country: "Alemania",
    euroNcapScore: 8.5,
    fiabilidadOCU: 7.5, // 87/100 OCU
    devaluacion: 9.0,   // Porsche: marca que MENOS se deprecia (911 retiene ~35-45% pérdida en 5 años; Cayenne sólido)
    seguridadActiva: 9.0,
    seguridadPasiva: 8.5,
    proteccionVPU: 8.0,
    satisfaccionUser: 9.0, // Muy alta satisfacción propietario
    ncapStars: 5,
    ncapModelos: "Cayenne (5★), Macan EV (5★)",
    fiabilidadNota: "87/100 OCU. Fiable para ser marca premium. Coste mantenimiento muy alto.",
    devaluacionNota: "Menor depreciación del segmento lujo. 911 retiene valor excelentemente. Cayenne bien.",
    resumen: "Mejor retención de valor del mercado, alta satisfacción. Precio de entrada y mantenimiento muy elevados."
  },
  {
    id: "volkswagen", name: "Volkswagen", country: "Alemania",
    euroNcapScore: 8.0, // Tiguan 5★ 2024 pero con malos parciales (3.6 ocupantes, impacto frontal débil); Golf 5★
    fiabilidadOCU: 7.0, // Opel/Peugeot/Citroën/VW últimas posiciones antes de Land Rover
    devaluacion: 7.0,   // Golf y Tiguan: buena retención en España. RV Awards 2024: VW arriba
    seguridadActiva: 8.5,
    seguridadPasiva: 8.0,
    proteccionVPU: 7.5, // Tiguan 3.6 VPU → baja puntuación
    satisfaccionUser: 7.5,
    ncapStars: 5,
    ncapModelos: "Golf (5★), Tiguan (5★ con matices), ID.3, ID.4, Passat/Superb",
    fiabilidadNota: "Penúltima posición grupo europeo OCU. Frenos frecuentes (JD Power). Averías eléctricas en algunos modelos.",
    devaluacionNota: "Golf y Tiguan retienen bien valor en España. ID.3/ID.4 con incertidumbre por transición EV.",
    resumen: "Sólido en conjunto. Fiabilidad por debajo de japoneses. Buen valor residual en modelos populares."
  },
  // ────────────────────────────────────── JAPONESAS LÍDERES FIABILIDAD
  {
    id: "toyota", name: "Toyota", country: "Japón",
    euroNcapScore: 8.5, // C-HR, Corolla, RAV4 todos 5★. Yaris Cross 5★
    fiabilidadOCU: 9.2, // 91/100 OCU 2024 (4º lugar). Históricamente top
    devaluacion: 8.0,   // Toyota: entre las que menos se deprecian. C-HR híbrido retiene muy bien
    seguridadActiva: 8.8, // Toyota Safety Sense de serie en toda la gama
    seguridadPasiva: 8.8,
    proteccionVPU: 8.5,
    satisfaccionUser: 8.5,
    ncapStars: 5,
    ncapModelos: "C-HR, Corolla, RAV4, Yaris Cross, bZ4X",
    fiabilidadNota: "91/100 OCU. 4ª marca más fiable. Híbridos HEV: mejor categoría de motor. 200€/año taller.",
    devaluacionNota: "Corollas e híbridos retienen bien. Toyota = referencia de bajo costo de propiedad.",
    resumen: "Referente mundial en fiabilidad. Euro NCAP sólido. Excelente relación calidad-coste a largo plazo."
  },
  {
    id: "lexus", name: "Lexus", country: "Japón",
    euroNcapScore: 8.5,
    fiabilidadOCU: 9.8, // 98/100 OCU: MEJOR MARCA DEL MERCADO. 1ª posición
    devaluacion: 7.5,   // LR: 89.9% retención 5 años. Excelente para marca premium
    seguridadActiva: 9.0,
    seguridadPasiva: 8.8,
    proteccionVPU: 8.5,
    satisfaccionUser: 9.5, // Máxima satisfacción taller oficial. Alta lealtad
    ncapStars: 5,
    ncapModelos: "NX (5★), UX (5★), RX",
    fiabilidadNota: "98/100 OCU: la marca más fiable del mercado europeo. Talleres: muy alta satisfacción.",
    devaluacionNota: "89.9% retención a 5 años. Mejor ratio fiabilidad/devaluación del segmento premium.",
    resumen: "La marca más fiable según OCU. Alta satisfacción propietario. Excelente para propietarios a largo plazo."
  },
  {
    id: "honda", name: "Honda", country: "Japón",
    euroNcapScore: 8.5, // HR-V, CR-V, Civic todos 5★. CR-V con extras opcional 5★
    fiabilidadOCU: 8.9, // 89/100 OCU (5º-8º posición empatadas)
    devaluacion: 7.0,
    seguridadActiva: 8.5, // Honda Sensing estándar
    seguridadPasiva: 8.5,
    proteccionVPU: 8.0,
    satisfaccionUser: 8.5,
    ncapStars: 5,
    ncapModelos: "CR-V (5★ con extras), HR-V, Civic e:HEV",
    fiabilidadNota: "89/100 OCU. Posición 5-8ª empatada. Motores e:HEV muy robustos.",
    devaluacionNota: "Buena retención. Civic y CR-V hybrid: demanda sostenida.",
    resumen: "Fiabilidad japonesa sólida. Sistemas híbridos e:HEV de referencia. Euro NCAP excelente."
  },
  {
    id: "mazda", name: "Mazda", country: "Japón",
    euroNcapScore: 8.5, // CX-60, CX-5, 3: todos 5★
    fiabilidadOCU: 8.7, // 87/100 OCU (10-11ª posición)
    devaluacion: 7.5,   // CX-5 retiene bien. Buena reputación
    seguridadActiva: 8.5, // i-Activsense de serie
    seguridadPasiva: 8.5,
    proteccionVPU: 8.0,
    satisfaccionUser: 8.5, // Alta satisfacción, taller 200€/año
    ncapStars: 5,
    ncapModelos: "CX-60, CX-5, CX-80, Mazda3",
    fiabilidadNota: "87/100 OCU. Skyactiv: motores de muy baja tasa de averías según OCU. Taller 200€/año.",
    devaluacionNota: "CX-5 entre los modelos con mejor retención de valor en su categoría.",
    resumen: "Motor Skyactiv: referente en durabilidad. Euro NCAP alto. Excelente relación calidad-precio."
  },
  {
    id: "suzuki", name: "Suzuki", country: "Japón",
    euroNcapScore: 6.5, // Swift 2024: solo 3★ (26.9/40pts, 67% adultos) → el PEOR del año 2024
    fiabilidadOCU: 9.3, // 93/100 OCU: 2ª marca más fiable. Solo superada por Lexus
    devaluacion: 7.5,   // Ignis, Vitara: retienen bien. Rango precio bajo → menos margen caída
    seguridadActiva: 6.5, // Swift: carece de muchos ADAS modernos
    seguridadPasiva: 6.8, // Swift 67% adultos, 66% niños → puntuación baja
    proteccionVPU: 6.5, // Swift: 66% VPU
    satisfaccionUser: 8.5, // Muy alta satisfacción por fiabilidad y sencillez
    ncapStars: 3,       // Swift 3★ (su modelo principal 2024)
    ncapModelos: "Swift (3★ 2024, peor resultado), e-Vitara (pendiente)",
    fiabilidadNota: "93/100 OCU: 2ª más fiable. Mecánica sencilla, pocas averías, bajo mantenimiento.",
    devaluacionNota: "Precio base bajo limita caída absoluta. Vitara e Ignis retienen bien.",
    resumen: "PARADOJA: máxima fiabilidad OCU pero pésimo Euro NCAP (Swift 3★). Ideal si priorizas mecánica sobre seguridad activa."
  },
  {
    id: "subaru", name: "Subaru", country: "Japón",
    euroNcapScore: 9.0, // Crosstrek/Impreza 2024: notas muy altas. Varios modelos top
    fiabilidadOCU: 9.3, // 93/100 OCU: 2ª (empatada con Suzuki)
    devaluacion: 7.0,
    seguridadActiva: 9.0, // EyeSight: uno de los mejores ADAS del mercado
    seguridadPasiva: 9.0, // Crosstrek 2024: top categoría
    proteccionVPU: 8.8, // Excelente en km77
    satisfaccionUser: 8.5,
    ncapStars: 5,
    ncapModelos: "Crosstrek/Impreza (5★ 2024, tops del año), Forester, Outback",
    fiabilidadNota: "93/100 OCU. 2ª más fiable. EyeSight destacado en ADAS. Alta fidelidad propietarios.",
    devaluacionNota: "Retención moderada-buena. Menor volumen en España que Toyota/Honda.",
    resumen: "Mejor combinación EuroNCAP + OCU fiabilidad en 2024. EyeSight entre los mejores ADAS. Gama limitada en España."
  },
  {
    id: "nissan", name: "Nissan", country: "Japón",
    euroNcapScore: 8.5, // Qashqai 5★ 2021, Ariya 5★, Juke 5★ 2019
    fiabilidadOCU: 8.7, // 87/100 OCU (posición 10-11ª)
    devaluacion: 6.5,   // Leaf: -49% en 5 años (peor EV). Qashqai mejor. Leaf penaliza media
    seguridadActiva: 8.5, // ProPILOT en Qashqai/Ariya
    seguridadPasiva: 8.5,
    proteccionVPU: 8.0,
    satisfaccionUser: 8.0,
    ncapStars: 5,
    ncapModelos: "Qashqai (5★ 2021), Ariya (5★), Juke (5★)",
    fiabilidadNota: "87/100 OCU. Qashqai: muy bien valorado por propietarios. Leaf: dudas batería largo plazo.",
    devaluacionNota: "Leaf: mal (tecnología EV envejece rápido). Qashqai e-Power: mejor retención.",
    resumen: "Fiabilidad sólida, buen NCAP. Hoja (Leaf) con devaluación fuerte por obsolescencia tecnológica."
  },
  {
    id: "mitsubishi", name: "Mitsubishi", country: "Japón",
    euroNcapScore: 7.5, // ASX (rebadge Captur): 4★. Eclipse Cross 4★. Outlander PHEV sin datos recientes
    fiabilidadOCU: 8.9, // 89/100 OCU (5-8ª posición)
    devaluacion: 7.0,
    seguridadActiva: 7.5,
    seguridadPasiva: 7.8,
    proteccionVPU: 7.5,
    satisfaccionUser: 8.0,
    ncapStars: 4,
    ncapModelos: "ASX (=Captur, 4★), Eclipse Cross (4★), Outlander PHEV",
    fiabilidadNota: "89/100 OCU. Muy sólida mecánica. Outlander PHEV: batería madura y robusta.",
    devaluacionNota: "Moderada. Outlander PHEV: demanda segunda mano decente.",
    resumen: "Fiabilidad japonesa sólida. NCAP moderado (comparte plataformas Renault). Outlander PHEV = opción duradera."
  },
  // ────────────────────────────────────── FRANCESAS Y STELLANTIS
  {
    id: "renault", name: "Renault", country: "Francia",
    euroNcapScore: 7.0, // Symbioz 4★, Captur 4★, Renault 5 4★. En 2024 cuatro modelos con 4★ (mal año)
    fiabilidadOCU: 7.0, // Posición baja en OCU europeo
    devaluacion: 7.0,   // Austral: valor residual líder SUV. Clio/Captur retienen bien en España
    seguridadActiva: 7.5, // Symbioz: débil en ADAS (safety assist: bajo). Austral mejor
    seguridadPasiva: 7.5, // Symbioz: 73% adultos → débil. Austral mejor
    proteccionVPU: 7.2, // Captur/Symbioz: débiles en VPU (76%)
    satisfaccionUser: 7.0,
    ncapStars: 4,
    ncapModelos: "Austral (5★), Symbioz (4★ débil), Captur (4★), Renault 5 (4★)",
    fiabilidadNota: "Posición baja OCU europeo. Averías eléctricas frecuentes. Taller ~200€/año.",
    devaluacionNota: "Austral: ganador RV en su categoría. Clio/Captur: estables. Renault 5 EV: por determinar.",
    resumen: "Año 2024 complicado en EuroNCAP. Fiabilidad por mejorar. Valor residual aceptable en modelos populares."
  },
  {
    id: "peugeot", name: "Peugeot", country: "Francia",
    euroNcapScore: 8.0, // 3008, 308, 408: 5★. Buen resultado global
    fiabilidadOCU: 7.0, // Penúltima posición europea OCU
    devaluacion: 6.8,
    seguridadActiva: 8.0, // Active Safety Brake. Mejor que Renault en ADAS
    seguridadPasiva: 8.2,
    proteccionVPU: 7.8,
    satisfaccionUser: 7.0,
    ncapStars: 5,
    ncapModelos: "3008 EV, 308, 408 (todos 5★ recientes)",
    fiabilidadNota: "Baterías: uno de los más frecuentes en averías (OCU). Coste taller moderado.",
    devaluacionNota: "Moderada. 3008/208: buena demanda en España. EV nuevo 3008: incierto.",
    resumen: "Buen Euro NCAP. Fiabilidad por debajo de media europea. El diseño y ADAS son puntos fuertes."
  },
  {
    id: "citroen", name: "Citroën", country: "Francia",
    euroNcapScore: 7.5, // C3/ë-C3: 5★ recientes. C4: 4★. C3 Aircross nuevo
    fiabilidadOCU: 7.0, // Penúltima posición europea OCU
    devaluacion: 6.5,
    seguridadActiva: 7.5,
    seguridadPasiva: 7.8,
    proteccionVPU: 7.5,
    satisfaccionUser: 7.0,
    ncapStars: 5,
    ncapModelos: "ë-C3 (5★), C4, C3 Aircross",
    fiabilidadNota: "Frenos: punto débil frecuente (JD Power). Similar a Peugeot (grupo Stellantis).",
    devaluacionNota: "Moderada-baja. ë-C3: depreciación EV económico incierta.",
    resumen: "Confort francés destacable. Fiabilidad por mejorar según OCU. Euro NCAP sólido en modelos nuevos."
  },
  {
    id: "ds", name: "DS Automobiles", country: "Francia",
    euroNcapScore: 7.5, // DS Nº8 2025: 4★ (mejor entre los peores). DS3 Crossback 5★
    fiabilidadOCU: 7.5, // 87/100 OCU
    devaluacion: 6.0,
    seguridadActiva: 8.0,
    seguridadPasiva: 7.5,
    proteccionVPU: 7.5,
    satisfaccionUser: 7.5,
    ncapStars: 4,
    ncapModelos: "DS Nº8 (4★ 2025), DS3 (5★), DS7 (5★)",
    fiabilidadNota: "87/100 OCU. Mejor que Citroën/Peugeot en percepción premium. Red servicio menor.",
    devaluacionNota: "Depreciación moderada-alta. Marca premium francesa con menor demanda segunda mano que alemanes.",
    resumen: "Propuesta premium francesa. NCAP aceptable. Mejor fiabilidad percibida que otras marcas Stellantis."
  },
  {
    id: "opel", name: "Opel", country: "Alemania/Francia",
    euroNcapScore: 8.0, // Astra 5★, Grandland 5★, Mokka 5★
    fiabilidadOCU: 7.0, // Penúltima posición europea OCU (junto a Peugeot/Citroën/VW)
    devaluacion: 6.5,
    seguridadActiva: 7.8,
    seguridadPasiva: 8.0,
    proteccionVPU: 7.8,
    satisfaccionUser: 7.0,
    ncapStars: 5,
    ncapModelos: "Astra, Grandland, Mokka, Corsa (todos 5★ recientes)",
    fiabilidadNota: "Penúltima posición OCU europeo. Averías eléctricas frecuentes. Comparte plataformas Stellantis.",
    devaluacionNota: "Depreciación alta comparado con japoneses y alemanes premium.",
    resumen: "NCAP sólido. Fiabilidad por debajo de la media europea según OCU. Remodelación de gama completa."
  },
  {
    id: "fiat", name: "Fiat", country: "Italia",
    euroNcapScore: 7.5, // Fiat 500 EV: 5★. Panda y Tipo: más baja. 500X: 4★
    fiabilidadOCU: 7.0, // Averías eléctricas frecuentes (OCU). Panda: muy fiable por sencillez
    devaluacion: 7.0,   // Fiat 500: retiene bien (icónico). Panda: valor residual alto por precio base bajo
    seguridadActiva: 7.0,
    seguridadPasiva: 7.5,
    proteccionVPU: 7.0,
    satisfaccionUser: 7.0,
    ncapStars: 5,
    ncapModelos: "500 EV (5★), 500X (4★), Panda (seguridad pasiva limitada en versión antigua)",
    fiabilidadNota: "Averías eléctricas frecuentes (OCU). Panda mild-hybrid: fiabilísima por diseño simple.",
    devaluacionNota: "500: valor icónico. Panda: retiene bien por precio base bajo.",
    resumen: "500 EV: buen NCAP. Fiabilidad mixta según modelo. Iconos como Panda y 500 retienen bien su valor."
  },
  {
    id: "alfa-romeo", name: "Alfa Romeo", country: "Italia",
    euroNcapScore: 8.5, // Tonale 5★, Giulia 5★, Stelvio 5★
    fiabilidadOCU: 6.5, // Una de las peores en OCU europeo (junto a Jaguar/Tesla)
    devaluacion: 5.5,   // Alta depreciación en berlinas
    seguridadActiva: 8.0,
    seguridadPasiva: 8.3,
    proteccionVPU: 8.0,
    satisfaccionUser: 7.5, // Alta satisfacción emocional pero frustración por averías
    ncapStars: 5,
    ncapModelos: "Tonale (5★), Giulia (5★ excelente), Stelvio (5★)",
    fiabilidadNota: "Una de las peores de OCU europeo. Averías eléctricas frecuentes. Alta tasa incidencias.",
    devaluacionNota: "Alta depreciación. Tonale PHEV: por ver. Giulia/Stelvio: demanda segunda mano limitada.",
    resumen: "NCAP sorprendentemente bueno. Fiabilidad: el mayor punto débil. Para entusiastas con bajo umbral de averías."
  },
  {
    id: "lancia", name: "Lancia", country: "Italia",
    euroNcapScore: 7.0, // Ypsilon nuevo: en proceso. Heredado de Citroën ë-C3
    fiabilidadOCU: 7.0,
    devaluacion: 6.0,
    seguridadActiva: 7.5,
    seguridadPasiva: 7.5,
    proteccionVPU: 7.0,
    satisfaccionUser: 7.0,
    ncapStars: 4,
    ncapModelos: "Ypsilon EV (nueva generación, comparte base ë-C3)",
    fiabilidadNota: "Comparte mecánica con ë-C3 (Stellantis). Base limitada de propietarios en España.",
    devaluacionNota: "Nicho premium italiano. Retención incierta por volumen bajo.",
    resumen: "Reingreso reciente en España. Solo Ypsilon EV disponible. Datos limitados."
  },
  // ────────────────────────────────────── MARCAS ESPAÑOLAS / CUPRA
  {
    id: "seat", name: "SEAT", country: "España",
    euroNcapScore: 8.0, // León 5★, Arona 5★, Ateca 5★
    fiabilidadOCU: 7.5, // Posición media. Comparte con VW. CarVertical: SEAT entre marcas con más depreciación
    devaluacion: 6.5,
    seguridadActiva: 8.0,
    seguridadPasiva: 8.0,
    proteccionVPU: 7.8,
    satisfaccionUser: 7.5,
    ncapStars: 5,
    ncapModelos: "León (5★), Arona, Ateca",
    fiabilidadNota: "Media. Comparte plataformas VW. CarVertical: entre las que más deprecian.",
    devaluacionNota: "Skoda y SEAT: entre las que más se deprecian según carVertical. León mejor que Arona.",
    resumen: "Buena relación calidad-precio. NCAP sólido. Devaluación por encima de media española."
  },
  {
    id: "cupra", name: "CUPRA", country: "España",
    euroNcapScore: 8.5, // Born, Formentor: 5★ Euro NCAP
    fiabilidadOCU: 9.1, // 91/100 OCU: SORPRESA. 4-5ª posición en fiabilidad 2024
    devaluacion: 7.0,   // Formentor retiene bien. Born EV: pendiente largo plazo
    seguridadActiva: 8.5,
    seguridadPasiva: 8.5,
    proteccionVPU: 8.2,
    satisfaccionUser: 8.5, // Alta satisfacción propietario; marca joven con buen NPS
    ncapStars: 5,
    ncapModelos: "Born (5★), Formentor (5★), Ateca CUPRA",
    fiabilidadNota: "91/100 OCU. GRAN SORPRESA: única marca europea en top 5 fiabilidad 2024. Casi empatada con Toyota.",
    devaluacionNota: "Formentor: buena retención por demanda alta. Born EV: incierta largo plazo.",
    resumen: "La gran sorpresa de fiabilidad 2024 (OCU). NCAP excelente. Imagen premium deportiva con fiabilidad inesperada."
  },
  {
    id: "skoda", name: "Škoda", country: "República Checa",
    euroNcapScore: 8.5, // Enyaq 5★, Superb/Passat 5★, Elroq 5★ 2024
    fiabilidadOCU: 7.5, // 87/100 OCU
    devaluacion: 6.5,   // CarVertical: Skoda entre las que más deprecian
    seguridadActiva: 8.5,
    seguridadPasiva: 8.5,
    proteccionVPU: 8.0,
    satisfaccionUser: 7.8,
    ncapStars: 5,
    ncapModelos: "Enyaq (5★), Elroq (5★ 2024), Octavia, Superb/Passat (5★)",
    fiabilidadNota: "87/100 OCU. Frenos: punto débil (JD Power, comparte con VW grupo).",
    devaluacionNota: "carVertical: entre las que más se deprecian. Octavia con mejor retención que gamas menores.",
    resumen: "NCAP excelente. Fiabilidad media. Depreciación elevada. Buen ratio equipamiento/precio de compra."
  },
  // ────────────────────────────────────── COREANAS
  {
    id: "hyundai", name: "Hyundai", country: "Corea del Sur",
    euroNcapScore: 8.5, // IONIQ 5/6 5★, Santa Fe 5★ (con extras), Tucson 5★
    fiabilidadOCU: 8.0,
    devaluacion: 7.0,
    seguridadActiva: 8.5, // SmartSense de serie. IONIQ 6 top en ADAS
    seguridadPasiva: 8.5,
    proteccionVPU: 8.5, // IONIQ 6: Tesla solo le gana en VPU en 2025
    satisfaccionUser: 8.0,
    ncapStars: 5,
    ncapModelos: "IONIQ 5 (5★), IONIQ 6 (5★, top VPU), Santa Fe (5★), Tucson (5★)",
    fiabilidadNota: "Buena. Taller ~200€/año. Plataforma E-GMP eléctrica: pocos datos de larga duración.",
    devaluacionNota: "Moderada-buena. IONIQ 5: retiene bien por alta demanda. Tucson estable.",
    resumen: "Uno de los mejores en EuroNCAP (IONIQ 6 top VPU). Fiabilidad creciente. Fuerte apuesta EV."
  },
  {
    id: "kia", name: "Kia", country: "Corea del Sur",
    euroNcapScore: 8.5, // EV6 5★, Sportage 5★, Niro 5★, EV3 reciente
    fiabilidadOCU: 8.9, // 89/100 OCU (5-8ª posición)
    devaluacion: 7.0,
    seguridadActiva: 8.5,
    seguridadPasiva: 8.5,
    proteccionVPU: 8.2,
    satisfaccionUser: 8.0,
    ncapStars: 5,
    ncapModelos: "EV6 (5★), Sportage (5★), Niro (5★), EV3",
    fiabilidadNota: "89/100 OCU. Alta fiabilidad. Garantía 7 años es un diferencial único en el mercado.",
    devaluacionNota: "Moderada-buena. EV6 con alta demanda. Sportage: estable. Garantía 7 años ayuda al residual.",
    resumen: "Garantía 7 años + OCU 89/100 + Euro NCAP 5★ = propuesta muy competitiva. Referente en valor por dinero."
  },
  {
    id: "genesis", name: "Genesis", country: "Corea del Sur",
    euroNcapScore: 8.5,
    fiabilidadOCU: 8.5,
    devaluacion: 6.0, // Marca nueva: depreciación incierta, históricamente alta en primeras generaciones
    seguridadActiva: 9.0,
    seguridadPasiva: 8.8,
    proteccionVPU: 8.5,
    satisfaccionUser: 8.5,
    ncapStars: 5,
    ncapModelos: "GV60, GV70, GV80 (todos 5★, comparten con Hyundai)",
    fiabilidadNota: "Hereda calidad Hyundai. Base usuarios reducida en España para datos sólidos.",
    devaluacionNota: "Marca premium nueva: depreciación difícil de predecir. Potencial mejora al ganar reconocimiento.",
    resumen: "Propuesta premium coreana con tecnología de primer nivel. Pocos datos de largo plazo en España."
  },
  // ────────────────────────────────────── OTRAS EUROPEAS
  {
    id: "volvo", name: "Volvo", country: "Suecia",
    euroNcapScore: 9.0, // EX30 5★, EX40/EC40 5★, XC60/XC90 5★. Pioneros en seguridad
    fiabilidadOCU: 7.5,
    devaluacion: 5.5,   // S90 -55.8% en 5 años. XC60 mejor retención. Alta devaluación en berlinas
    seguridadActiva: 9.5, // Pioneros en AEB. City Safety. Detección somnolencia. Limitador velocidad
    seguridadPasiva: 9.5, // Inventores del cinturón de 3 puntos. Excelentes resultados históricos
    proteccionVPU: 8.8,
    satisfaccionUser: 8.0,
    ncapStars: 5,
    ncapModelos: "EX30 (5★), EX40 (5★), XC60 (5★), XC90",
    fiabilidadNota: "Coste taller alto (compartido con Lexus en satisfacción; pero más caro). Frenos frecuentes (JD Power).",
    devaluacionNota: "S90: mal (-55.8%). XC60/XC40: mejor. EX30: precio base bajo ayuda a retención relativa.",
    resumen: "LÍDER HISTÓRICO EN SEGURIDAD PASIVA. EyeSight de seguridad global. Devaluación alta en berlinas. Taller caro."
  },
  {
    id: "mini", name: "MINI", country: "Reino Unido/Alemania",
    euroNcapScore: 8.0, // Mini (F56) 5★. Nuevo Mini Electric pendiente prueba completa
    fiabilidadOCU: 7.5, // 87/100 OCU
    devaluacion: 8.5,   // MINI: entre las marcas que MENOS se devalúan. Alta demanda segunda mano
    seguridadActiva: 8.0,
    seguridadPasiva: 8.0,
    proteccionVPU: 7.8,
    satisfaccionUser: 8.5, // Alta satisfacción emocional y de conducción
    ncapStars: 5,
    ncapModelos: "Mini Hatch (5★), Mini Countryman (5★), Mini Electric",
    fiabilidadNota: "87/100 OCU. Mejor que su hermano BMW en fiabilidad percibida. Coste taller moderado-alto.",
    devaluacionNota: "MINI: entre los que MENOS se devalúan. Alta demanda y factor emocional sostienen precio.",
    resumen: "Excelente retención de valor. NCAP sólido. Factor emocional hace de MINI una compra inteligente también a largo plazo."
  },
  {
    id: "smart", name: "Smart", country: "Alemania/China",
    euroNcapScore: 7.5,
    fiabilidadOCU: 8.9, // 89/100 OCU: top 10 de fiabilidad 2024
    devaluacion: 6.5, // EV urbano: depreciación EV incierta
    seguridadActiva: 7.5,
    seguridadPasiva: 7.8,
    proteccionVPU: 7.5,
    satisfaccionUser: 7.5,
    ncapStars: 4,
    ncapModelos: "Smart #1, Smart #3",
    fiabilidadNota: "89/100 OCU: gran sorpresa en top 10 fiabilidad. Fabricación china (Geely). Pocos datos largo plazo.",
    devaluacionNota: "Eléctrico nicho: depreciación incierta. Precio base moderado ayuda a retención relativa.",
    resumen: "Gran sorpresa OCU fiabilidad (89/100). Nueva generación EV con base Geely. Datos de largo plazo limitados."
  },
  {
    id: "jaguar", name: "Jaguar", country: "Reino Unido",
    euroNcapScore: 8.0, // F-Pace, E-Pace 5★
    fiabilidadOCU: 6.8, // OCU 2022: entre las peores (junto a Tesla y Alfa Romeo)
    devaluacion: 5.0,   // XF: -57.6% en 5 años. Alta devaluación histórica
    seguridadActiva: 8.0,
    seguridadPasiva: 8.0,
    proteccionVPU: 7.5,
    satisfaccionUser: 7.0,
    ncapStars: 5,
    ncapModelos: "F-Pace (5★), E-Pace (5★)",
    fiabilidadNota: "OCU 2022: entre las peores. Muchas averías reportadas. JLR comparte con Land Rover problemas.",
    devaluacionNota: "XF -57.6% 5 años. Enorme devaluación. Compra de ocasión: gran oportunidad si se asume el riesgo.",
    resumen: "Imagen premium, NCAP bueno. Fiabilidad y devaluación: los dos puntos más débiles del mercado."
  },
  {
    id: "land-rover", name: "Land Rover", country: "Reino Unido",
    euroNcapScore: 8.5, // Defender 5★ (top categoría SUV grande). Discovery, Range Rover: 5★
    fiabilidadOCU: 6.4, // ÚLTIMO LUGAR OCU 2024: solo 64/100. La PEOR marca del mercado
    devaluacion: 7.5,   // Defender: excelente retención (2ª en RV Awards 2024). Range Rover icónico
    seguridadActiva: 8.5,
    seguridadPasiva: 8.5,
    proteccionVPU: 8.2,
    satisfaccionUser: 6.5, // Baja satisfacción por averías, alta por imagen
    ncapStars: 5,
    ncapModelos: "Defender (5★, top categoría), Discovery (5★), Range Rover (5★)",
    fiabilidadNota: "ÚLTIMO LUGAR OCU 2024 con 64/100. La marca menos fiable del mercado europeo. Costes taller muy altos.",
    devaluacionNota: "Paradoja: Defender retiene muy bien (2ª RV Awards 2024). Range Rover: icónico. Pero mantenimiento elevadísimo.",
    resumen: "PARADOJA total: mejor retención de valor en su segmento pero PEOR fiabilidad del mercado. Solo para quien asume costes."
  },
  // ────────────────────────────────────── ELÉCTRICAS / TECNOLÓGICAS
  {
    id: "tesla", name: "Tesla", country: "EEUU",
    euroNcapScore: 8.5, // Model 3 (2023 restyled): 5★ excelente. Model 3: mejor en VPU 2025 (peatones)
    fiabilidadOCU: 8.4, // 84/100 OCU 2024. Enorme mejora desde 2022 (era el peor)
    devaluacion: 5.0,   // Model S: -55.5% en 5 años. Model 3: mejor pero incierto
    seguridadActiva: 9.0, // Autopilot, FSD: más avanzado del mercado. Mejor en ADAS en algunas categorías
    seguridadPasiva: 9.0, // Model 3 2024: excelentes puntuaciones ocupantes
    proteccionVPU: 9.5, // Model 3: MEJOR del mercado en VPU 2025 (56.2/63 pts)
    satisfaccionUser: 8.0, // Alta satisfacción de conducción; frustración por servicio postventa
    ncapStars: 5,
    ncapModelos: "Model 3 (5★, mejor en peatones 2025), Model Y (5★)",
    fiabilidadNota: "84/100 OCU: enorme mejora desde 2022. Model Y especialmente fiable. Postventa con margen mejora.",
    devaluacionNota: "Model S: -55.5%. Model 3/Y: mejor retención pero mercado EV incierto. Actualizaciones OTA ayudan.",
    resumen: "Tecnología puntera. Mejora fiabilidad notable. Model 3: mejor protección peatones del mercado. Devaluación incierta."
  },
  {
    id: "byd", name: "BYD", country: "China",
    euroNcapScore: 8.5, // BYD ATTO 3: 5★ 2022. Seal: 5★ 2023. Sealion 6 PHEV: pendiente
    fiabilidadOCU: 7.5, // Pocos datos. Primeras impresiones positivas pero base limitada
    devaluacion: 5.5,   // Marca nueva en Europa: alta incertidumbre. Depreciación EV chino alta
    seguridadActiva: 8.5, // DiPilot ADAS: competitivo
    seguridadPasiva: 8.8, // ATTO 3: excelentes resultados
    proteccionVPU: 8.5, // Seal: notable
    satisfaccionUser: 7.5, // Buenas reseñas iniciales, red servicio limitada en España
    ncapStars: 5,
    ncapModelos: "ATTO 3 (5★ 2022), Seal (5★ 2023), Sealion 7",
    fiabilidadNota: "Pocos datos de largo plazo en Europa. Batería Blade LFP: buena reputación técnica.",
    devaluacionNota: "Alta incertidumbre. Marca nueva = depreciación elevada inicial. Aranceles UE afectan.",
    resumen: "Excelente Euro NCAP. Tecnología puntera. Red servicio y datos largo plazo limitados en España. Aranceles UE = riesgo."
  },
  {
    id: "mg", name: "MG", country: "China/Reino Unido",
    euroNcapScore: 7.0, // MG ZS EV 5★ (2019 antiguo). MG ZS Hybrid+ 4★ (2024). MG3 2025: 4★ mediocre
    fiabilidadOCU: 7.5,
    devaluacion: 5.0,   // Marca china: alta depreciación. Poco historial en segunda mano España
    seguridadActiva: 7.0, // MG3 2025: débil en ADAS
    seguridadPasiva: 7.5, // MG3 2025: protección niños débil en lateral
    proteccionVPU: 7.5,
    satisfaccionUser: 7.0,
    ncapStars: 4,
    ncapModelos: "MG ZS EV (5★ antiguo), MG ZS Hybrid+ (4★ 2024), MG3 (4★ 2025)",
    fiabilidadNota: "Datos de largo plazo limitados. Red servicio creciendo en España.",
    devaluacionNota: "Alta depreciación en Europa. Marca china sin historial largo de residual en España.",
    resumen: "Precio competitivo. NCAP decepcionante en modelos 2024-2025. Depreciación elevada por marca nueva."
  },
  {
    id: "polestar", name: "Polestar", country: "Suecia/China",
    euroNcapScore: 9.0, // Polestar 2 (5★), Polestar 4 (5★ excelente 2024)
    fiabilidadOCU: 7.5, // Pocos datos. Base usuarios pequeña
    devaluacion: 5.5,   // EV premium: alta devaluación. Marca nueva sin historial largo
    seguridadActiva: 9.0,
    seguridadPasiva: 9.0,
    proteccionVPU: 8.5,
    satisfaccionUser: 8.0,
    ncapStars: 5,
    ncapModelos: "Polestar 2 (5★), Polestar 4 (5★ 2024)",
    fiabilidadNota: "Pocos datos. Propietarios reportan buena experiencia. Software OTA continuo.",
    devaluacionNota: "Premium EV: alta depreciación. Sin historial largo en segunda mano española.",
    resumen: "Excelente Euro NCAP. Posicionamiento premium, base Volvo/Geely. Depreciación EV incierta."
  },
  // ────────────────────────────────────── DACIA / ECONÓMICAS
  {
    id: "dacia", name: "Dacia", country: "Rumanía",
    euroNcapScore: 6.0, // Duster 2024: 3★ (28.1/40pts, 70% adultos, 57% ADAS). Entre los 5 peores 2024
    fiabilidadOCU: 8.7, // 87/100 OCU (posición 13-14ª). Fiabilidad real buena por mecánica simple
    devaluacion: 8.5,   // Sandero/Duster: entre los que MENOS se deprecian. Precio base bajo → margen caída mínimo
    seguridadActiva: 5.5, // Duster 2024: 57% ADAS. Uno de los peores del mercado en asistencias
    seguridadPasiva: 7.0, // Duster: 70% adultos, 84% niños. Irregular
    proteccionVPU: 6.0, // Duster: 60% VPU. Débil en peatones
    satisfaccionUser: 8.0, // Alta satisfacción relativa al precio. "Value for money" extremo
    ncapStars: 3,
    ncapModelos: "Duster 2024 (3★, 5º peor del año), Spring (sin datos 2024), Sandero",
    fiabilidadNota: "87/100 OCU. Mecánica simple = pocas averías. Precio base bajo = coste total mínimo.",
    devaluacionNota: "ENTRE LOS QUE MENOS SE DEPRECIAN: precio bajo de partida limita pérdida absoluta. Duster: buena demanda segunda mano.",
    resumen: "PARADOJA: excelente valor residual y fiabilidad pero PÉSIMO Euro NCAP (Duster 3★). Compra racional para bajo presupuesto si se acepta riesgo seguridad."
  },
  // ────────────────────────────────────── AMERICANAS
  {
    id: "ford", name: "Ford", country: "EEUU",
    euroNcapScore: 7.5, // Explorer EV 5★ pero débil en algunas pruebas. Puma 5★. Tourneo Custom 3★
    fiabilidadOCU: 7.0,
    devaluacion: 6.5,
    seguridadActiva: 7.5,
    seguridadPasiva: 7.8, // Explorer: débil (Passat/Superb similar 3.4pts ocupantes)
    proteccionVPU: 7.5,
    satisfaccionUser: 7.0,
    ncapStars: 5,
    ncapModelos: "Puma (5★), Explorer EV (5★ débil), Kuga (5★), Tourneo Custom (3★)",
    fiabilidadNota: "Frenos: punto débil frecuente (JD Power). Ocupantes traseros débiles en Explorer.",
    devaluacionNota: "Moderada. Puma: buena demanda. Kuga PHEV: incierta. Mustang Mach-E: alta deprec. EV",
    resumen: "NCAP mixto según modelo. Fiabilidad media. Tourneo Custom con solo 3★ penaliza la media."
  },
  {
    id: "jeep", name: "Jeep", country: "EEUU",
    euroNcapScore: 6.5, // Avenger 3★ 2024 (débil en ADAS y VPU). Compass/Renegade 5★ antiguos
    fiabilidadOCU: 7.5,
    devaluacion: 7.5,   // Jeep: entre los que menos se deprecian (historial USA). Avenger: por ver
    seguridadActiva: 6.5, // Avenger: débil en ADAS (sistemas incompletos)
    seguridadPasiva: 7.7, // Avenger: 77% adultos → ok; 59% VPU → muy débil
    proteccionVPU: 5.9, // Avenger: 59% VPU. Uno de los peores 2024
    satisfaccionUser: 7.5,
    ncapStars: 3,
    ncapModelos: "Avenger (3★ 2024, débil VPU), Renegade (5★ antiguo), Compass (5★ antiguo)",
    fiabilidadNota: "Fiabilidad aceptable. Comparte plataformas Stellantis (Peugeot/Citroën).",
    devaluacionNota: "Históricamente buena retención en USA. Avenger nuevo: por determinar en España.",
    resumen: "Avenger (modelo principal en España): solo 3★ con VPU muy débil. Imagen 4x4 pero NCAP decepciona."
  },
  // ────────────────────────────────────── MARCAS CHINAS NUEVAS EN ESPAÑA
  {
    id: "omoda", name: "Omoda", country: "China",
    euroNcapScore: 8.0, // Omoda 5: pendiente prueba formal. Chery (Tiggo7/8) 5★ en segunda prueba 2025
    fiabilidadOCU: 7.0, // Datos mínimos. Chery tiene historial mixto
    devaluacion: 4.5,   // Marca nueva: alta depreciación esperada
    seguridadActiva: 7.5,
    seguridadPasiva: 7.8,
    proteccionVPU: 7.5,
    satisfaccionUser: 7.0,
    ncapStars: 4,
    ncapModelos: "Omoda 5 (Chery - 5★ en segunda prueba bajo nombre Tiggo7 2025)",
    fiabilidadNota: "Datos insuficientes en España. Chery Tiggo7 resolvió fallos soldadura y logró 5★ en segunda prueba.",
    devaluacionNota: "Marca china nueva: alta depreciación esperada. Sin historial en segunda mano española.",
    resumen: "Llegada reciente a España. NCAP mejorado tras revisión. Depreciación e historial: las grandes incógnitas."
  },
  {
    id: "jaecoo", name: "Jaecoo", country: "China",
    euroNcapScore: 7.5,
    fiabilidadOCU: 6.5, // Sin datos OCU. Estimación conservadora
    devaluacion: 4.0,
    seguridadActiva: 7.0,
    seguridadPasiva: 7.5,
    proteccionVPU: 7.0,
    satisfaccionUser: 6.5,
    ncapStars: 4,
    ncapModelos: "Jaecoo 7 (Chery - comparte base con Omoda)",
    fiabilidadNota: "Sin datos suficientes en Europa. Marca hermana de Omoda (Chery).",
    devaluacionNota: "Marca nueva: depreciación muy alta esperada. Sin historial en segunda mano.",
    resumen: "Muy reciente en España. Datos insuficientes para puntuación sólida. Alto riesgo de depreciación."
  },
  {
    id: "ebro-dfsk", name: "EBRO / DFSK", country: "China/España",
    euroNcapScore: 8.5, // EBRO s700/s800 = Chery Tiggo7/8 con 5★ en segunda prueba 2025
    fiabilidadOCU: 7.0,
    devaluacion: 5.0,
    seguridadActiva: 7.5,
    seguridadPasiva: 8.0,
    proteccionVPU: 7.8,
    satisfaccionUser: 7.0,
    ncapStars: 5,
    ncapModelos: "EBRO s700 (= Chery Tiggo7, 5★), EBRO s800 (= Chery Tiggo8, 5★)",
    fiabilidadNota: "Mecánica Chery. Primeros datos en España muy limitados. Marca en reactivación.",
    devaluacionNota: "Alta incertidumbre. Marca histórica española reactivada con base china.",
    resumen: "NCAP excelente (base Chery tras corrección). Marca histórica española. Datos de mercado muy limitados."
  },
  {
    id: "leapmotor", name: "Leapmotor", country: "China",
    euroNcapScore: 8.5, // C10 2024: 5★ con notas buenas. "Lowcost que gana a rivales más caros"
    fiabilidadOCU: 7.0,
    devaluacion: 4.5,
    seguridadActiva: 8.0,
    seguridadPasiva: 8.5,
    proteccionVPU: 8.0,
    satisfaccionUser: 7.0,
    ncapStars: 5,
    ncapModelos: "C10 (5★ 2024 excelente para su precio)",
    fiabilidadNota: "Sin datos de largo plazo. Distribución a través de Stellantis en Europa.",
    devaluacionNota: "EV económico chino: alta depreciación esperada. Precio bajo de entrada ayuda relativamente.",
    resumen: "Sorprende en EuroNCAP siendo económico. Distribución Stellantis da confianza. Sin historial largo plazo."
  },
  {
    id: "deepal", name: "Deepal", country: "China",
    euroNcapScore: 9.0, // S07 2024: 5★ con notas muy altas
    fiabilidadOCU: 7.0,
    devaluacion: 4.0,
    seguridadActiva: 8.5,
    seguridadPasiva: 9.0,
    proteccionVPU: 8.5,
    satisfaccionUser: 7.0,
    ncapStars: 5,
    ncapModelos: "Deepal S07 (5★ 2024, notas muy altas en todas categorías)",
    fiabilidadNota: "Changan subsidiary. Sin datos de largo plazo en España.",
    devaluacionNota: "Marca desconocida: altísima depreciación esperada. Sin historial de segunda mano.",
    resumen: "Excelente EuroNCAP 2024. Marca totalmente desconocida en España. Riesgo máximo en devaluación."
  },
  {
    id: "nio", name: "NIO", country: "China",
    euroNcapScore: 8.5, // EL6 2024: 5★ con buenas notas
    fiabilidadOCU: 7.0,
    devaluacion: 4.0,
    seguridadActiva: 8.5,
    seguridadPasiva: 8.8,
    proteccionVPU: 8.5,
    satisfaccionUser: 7.5, // Sistema battery swap innovador
    ncapStars: 5,
    ncapModelos: "EL6 (5★ 2024), ET5, ET7",
    fiabilidadNota: "Sin datos europeos suficientes. Battery swap es diferencial técnico único.",
    devaluacionNota: "EV premium chino: alta depreciación. Battery swap puede ayudar o complicar el residual.",
    resumen: "NCAP sólido. Sistema swap de baterías único. Muy limitado en España. Riesgo alto por marca nueva."
  },
  {
    id: "xpeng", name: "XPENG", country: "China",
    euroNcapScore: 8.5, // G6 2024: 5★ con notas perfectas
    fiabilidadOCU: 7.0,
    devaluacion: 4.0,
    seguridadActiva: 9.0, // XPILOT: uno de los más avanzados ADAS del mercado
    seguridadPasiva: 9.0,
    proteccionVPU: 8.5,
    satisfaccionUser: 7.5,
    ncapStars: 5,
    ncapModelos: "G6 (5★ 2024, notas perfectas), G9",
    fiabilidadNota: "Sin datos europeos. Tecnología software muy avanzada.",
    devaluacionNota: "EV tecnológico chino: altísima depreciación. Sin historial en Europa.",
    resumen: "ADAS y NCAP de primer nivel. Totalmente nuevo en España. Riesgo máximo en devaluación e historial."
  },
  // ────────────────────────────────────── OTRAS EN ESPAÑA
  {
    id: "volvo-polestar", // ya cubierto arriba
    id: "dacia2",          // ya cubierto arriba (se usa id: "dacia")
    // PLACEHOLDER para evitar duplicados
  },
  {
    id: "volkswagen-comerciales", // skip - ya en VW
  },
  // ────────────────────────────────────── MARCAS EXTRA EN ESPAÑA
  {
    id: "maserati", name: "Maserati", country: "Italia",
    euroNcapScore: 7.5,
    fiabilidadOCU: 6.5,
    devaluacion: 3.5,   // Levante: -57.8% en 5 años. Quattroporte: -72.2%. LA PEOR depreciación absoluta del lujo
    seguridadActiva: 8.0,
    seguridadPasiva: 8.0,
    proteccionVPU: 7.5,
    satisfaccionUser: 7.0,
    ncapStars: 4,
    ncapModelos: "Grecale (5★ reciente), Levante (4★)",
    fiabilidadNota: "Fiabilidad inferior a alemanes premium. Costes mantenimiento muy altos.",
    devaluacionNota: "Quattroporte: -72.2% en 5 años = LA PEOR depreciación del lujo. Levante: -57.8%.",
    resumen: "Imagen y sonido espectaculares. Fiabilidad y devaluación: los peores del segmento lujo."
  },
  {
    id: "infiniti", name: "Infiniti", country: "Japón",
    euroNcapScore: 7.5,
    fiabilidadOCU: 7.5,
    devaluacion: 4.0, // QX80: -58.1% en 5 años
    seguridadActiva: 7.5,
    seguridadPasiva: 7.8,
    proteccionVPU: 7.2,
    satisfaccionUser: 7.5,
    ncapStars: 4,
    ncapModelos: "QX30 (5★ antiguo)",
    fiabilidadNota: "Marca Nissan premium. Presencia muy limitada en España. Red servicio escasa.",
    devaluacionNota: "QX80: -58.1% en 5 años. Alta depreciación en SUV grandes.",
    resumen: "Presencia mínima en España. Sin datos actuales sólidos. Red servicio limitada."
  },
  {
    id: "tesla2",   // ya cubierto
  },
  {
    id: "lynk-co", name: "Lynk & Co", country: "China/Suecia",
    euroNcapScore: 7.5,
    fiabilidadOCU: 7.5,
    devaluacion: 5.5,
    seguridadActiva: 8.0,
    seguridadPasiva: 7.8,
    proteccionVPU: 7.5,
    satisfaccionUser: 8.0, // Modelo de suscripción innovador, buena comunidad
    ncapStars: 4,
    ncapModelos: "01 (5★ antiguo), 02, 03",
    fiabilidadNota: "Base Geely/Volvo. Modelo suscripción limita datos de propiedad clásica.",
    devaluacionNota: "Modelo negocio suscripción: devaluación clásica difícil de medir.",
    resumen: "Modelo de negocio innovador (suscripción). Base técnica Geely/Volvo. Datos de mercado clásico limitados."
  },
  {
    id: "maxus", name: "Maxus / DFSK", country: "China",
    euroNcapScore: 8.5, // eTerron 9: 5★ 2024 (primera pick-up/furgoneta eléctrica probada)
    fiabilidadOCU: 7.0,
    devaluacion: 5.0,
    seguridadActiva: 8.0,
    seguridadPasiva: 8.5,
    proteccionVPU: 8.0,
    satisfaccionUser: 7.0,
    ncapStars: 5,
    ncapModelos: "eTerron 9 (5★ 2024, primera furgoneta eléctrica probada)",
    fiabilidadNota: "Sin datos suficientes. Comerciales eléctricos. Presente en España flota.",
    devaluacionNota: "Alta depreciación esperada. Comerciales eléctricos con poco mercado segunda mano.",
    resumen: "Primer comercial eléctrico con 5★ NCAP. Presencia en flotas española. Sin datos particulares."
  },
  {
    id: "zeekr", name: "Zeekr", country: "China",
    euroNcapScore: 9.2, // 001 y X: 5★ 2024 con notas muy altas. X: ganador SUV compacto
    fiabilidadOCU: 7.5,
    devaluacion: 4.5,
    seguridadActiva: 9.0,
    seguridadPasiva: 9.5, // X: top absoluto en su categoría 2024
    proteccionVPU: 9.0,
    satisfaccionUser: 7.5,
    ncapStars: 5,
    ncapModelos: "Zeekr 001 (5★ 2024, excelente), Zeekr X (5★, mejor SUV compacto categoría 2024)",
    fiabilidadNota: "Sin datos de largo plazo en España. Base Geely (robusta). Distribución limitada.",
    devaluacionNota: "Marca china premium nueva: alta depreciación esperada. Muy poca segunda mano.",
    resumen: "Mejor en EuroNCAP de todas las marcas chinas en 2024. Sin historial. Riesgo alto en devaluación."
  },
];

// ─── LIMPIEZA Y CÁLCULO DE SCORE ─────────────────────────────────────────────
const SAFETY_DB = raw
  .filter(b => b && b.id && b.name) // eliminar placeholders
  .map(b => ({
    ...b,
    scoreFinal: Number(calcScore(b))
  }))
  .sort((a, b) => b.scoreFinal - a.scoreFinal);

// ─── API PÚBLICA ──────────────────────────────────────────────────────────────
function getAllSafetyBrands(){
  return SAFETY_DB.map(b => b.name).sort((a,c) => a.localeCompare(c,"es"));
}

function getSafetyBrand(idOrName){
  const q = String(idOrName||"").toLowerCase();
  return SAFETY_DB.find(b =>
    b.id === q ||
    b.name.toLowerCase() === q ||
    b.name.toLowerCase().includes(q)
  ) || null;
}

function compareSafety(idA, idB){
  const A = getSafetyBrand(idA);
  const B = getSafetyBrand(idB);
  if(!A || !B) return null;

  const criteria = [
    { key: "euroNcapScore",    label: "Euro NCAP",           pct: "20%" },
    { key: "fiabilidadOCU",    label: "Fiabilidad (OCU)",    pct: "20%" },
    { key: "devaluacion",      label: "Valor residual",      pct: "15%" },
    { key: "seguridadActiva",  label: "Seguridad activa",    pct: "10%" },
    { key: "seguridadPasiva",  label: "Seguridad pasiva",    pct: "15%" },
    { key: "proteccionVPU",    label: "Protección peatones", pct: "10%" },
    { key: "satisfaccionUser", label: "Satisfacción usuario",pct: "10%" },
  ];

  const detail = criteria.map(c => ({
    ...c,
    scoreA: A[c.key],
    scoreB: B[c.key],
    winner: A[c.key] > B[c.key] ? "A" : B[c.key] > A[c.key] ? "B" : "="
  }));

  return {
    brandA: A,
    brandB: B,
    scoreA: A.scoreFinal,
    scoreB: B.scoreFinal,
    winner: A.scoreFinal >= B.scoreFinal ? A.name : B.name,
    margin: Math.abs(A.scoreFinal - B.scoreFinal).toFixed(1),
    detail
  };
}

function getRankingSeguridad(){
  return SAFETY_DB.map((b, i) => ({
    rank: i+1,
    id: b.id,
    name: b.name,
    score: b.scoreFinal,
    ncapStars: b.ncapStars,
    fiabilidadOCU: b.fiabilidadOCU,
    resumen: b.resumen
  }));
}

// Exponer al window (browser)
if(typeof window !== "undefined"){
  window.FAIRCAR_SAFETY_DB     = SAFETY_DB;
  window.getAllSafetyBrands    = getAllSafetyBrands;
  window.getSafetyBrand        = getSafetyBrand;
  window.compareSafety         = compareSafety;
  window.getRankingSeguridad   = getRankingSeguridad;
}
// Node.js / CommonJS
if(typeof module !== "undefined" && module.exports){
  module.exports = { SAFETY_DB, getAllSafetyBrands, getSafetyBrand, compareSafety, getRankingSeguridad };
}

})();
