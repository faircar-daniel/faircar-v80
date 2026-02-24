// Listado ampliado marca → modelos (España).
// Se usa para autocompletar cuando la BD de versiones no cubre un modelo.
window.BRAND_MODELS_ES = window.BRAND_MODELS_ES || {};
(function(){
  const data = {
    "Abarth": ["500", "500e"],
    "Aiways": ["U5", "U6"],
    "Alfa Romeo": ["Giulia", "Giulietta", "Junior", "MiTo", "Stelvio", "Tonale"],
    "Alpine": ["A110"],
    "Aston Martin": ["DB11", "DB12", "DBX", "Valhalla", "Vantage"],
    "Audi": ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "e-tron GT", "Q2", "Q3", "Q4 e-tron", "Q5", "Q7", "Q8", "RS 3", "RS 4", "RS 6", "RS Q3", "RS Q8", "S3", "S4", "S5", "S6", "S7", "S8", "TT"],
    "Bentley": ["Bentayga", "Continental GT", "Flying Spur"],
    "BMW": ["i3", "i4", "i5", "i7", "iX", "iX1", "iX2", "M2", "M3", "M4", "M5", "M8", "Serie 1", "Serie 2", "Serie 3", "Serie 4", "Serie 5", "Serie 6", "Serie 7", "Serie 8", "X1", "X2", "X3", "X3 M", "X4", "X5", "X5 M", "X6", "X6 M", "X7", "Z4"],
    "BYD": ["Atto 2", "Atto 3", "Dolphin", "Han", "Seagull", "Seal", "Seal U", "Seal U DM-i", "Tang"],
    "Cadillac": ["Escalade", "Lyriq"],
    "Chery": ["Jaecoo 7", "Omoda 5"],
    "Citroën": ["Ami", "Berlingo", "C3", "C3 Aircross", "C4", "C4 X", "C5 Aircross", "C5 X", "Spacetourer", "ë-C3", "ë-C4", "ë-C4 X"],
    "CUPRA": ["Ateca", "Born", "Formentor", "Leon", "Tavascan", "Terramar"],
    "Dacia": ["Bigster", "Duster", "Jogger", "Lodgy", "Logan", "Sandero", "Spring"],
    "DFSK": ["500", "580", "600", "E5", "F5"],
    "Dongfeng": ["Box", "Forthing", "Voyah Dream", "Voyah Free"],
    "DR Automobiles": ["DR 3.0", "DR 4.0", "DR 5.0", "DR 6.0", "DR 7.0"],
    "DS": ["DS 3", "DS 4", "DS 7", "DS 9", "DS3", "DS4", "DS7"],
    "EVO": ["3", "4", "5", "6", "7", "Cross4", "CUATRO"],
    "Ferrari": ["296", "458", "488", "Purosangue", "Roma", "SF90"],
    "Fiat": ["500", "500e", "600", "600e", "Doblo", "E-Doblo", "Panda", "Tipo", "Ulysse"],
    "Ford": ["Bronco", "Explorer", "Fiesta", "Focus", "Kuga", "Mustang", "Mustang Mach-E", "Puma", "Ranger", "Tourneo Connect", "Tourneo Courier", "Tourneo Custom", "Transit", "Transit Custom"],
    "Genesis": ["G70", "G80", "G90", "GV60", "GV70", "GV80"],
    "Honda": ["Civic", "CR-V", "e:Ny1", "HR-V", "Jazz", "ZR-V"],
    "Hyundai": ["Bayon", "i10", "i20", "i30", "Ioniq 5", "IONIQ 5", "Ioniq 6", "IONIQ 6", "Ioniq 7", "Kona", "Santa Fe", "Staria", "Tucson"],
    "INEOS": ["Grenadier"],
    "Ineos": ["Grenadier"],
    "Infiniti": ["Q30", "Q50", "Q60", "QX30", "QX50", "QX60"],
    "Isuzu": ["D-Max"],
    "Jaecoo": ["7", "8"],
    "Jaguar": ["E-Pace", "F-Pace", "F-Type", "I-Pace", "XF"],
    "Jeep": ["Avenger", "Cherokee", "Compass", "Grand Cherokee", "Renegade", "Wrangler"],
    "Kia": ["Carens", "Carnival", "Ceed", "EV3", "EV6", "EV9", "Niro", "Picanto", "Proceed", "Rio", "Sorento", "Sportage", "Stonic", "XCeed"],
    "Lamborghini": ["Huracán", "Revuelto", "Urus", "Urus SE"],
    "Lancia": ["Ypsilon"],
    "Land Rover": ["Defender", "Discovery", "Discovery Sport", "Range Rover", "Range Rover Evoque", "Range Rover Sport", "Range Rover Velar"],
    "Leapmotor": ["C10", "T03"],
    "Lexus": ["CT", "ES", "IS", "LBX", "LC", "LS", "NX", "RC", "RX", "RZ", "UX"],
    "Lynk & Co": ["01", "02", "03", "05", "06", "08", "09"],
    "Maserati": ["Ghibli", "GranTurismo", "Grecale", "Levante", "MC20", "Quattroporte"],
    "Maxus": ["Deliver 9", "Euniq 5", "Euniq 6", "Mifa 9", "T90"],
    "Mazda": ["CX-3", "CX-30", "CX-5", "CX-60", "CX-80", "Mazda2", "Mazda3", "MX-30", "MX-5"],
    "Mercedes-Benz": ["CLA", "Clase A", "Clase B", "Clase C", "Clase E", "Clase G", "Clase S", "CLS", "EQA", "EQB", "EQC", "EQE", "EQS", "EQT", "GLA", "GLB", "GLC", "GLE", "GLS", "Sprinter", "Vito"],
    "MG": ["3", "Cyberster", "EHS", "HS", "HS PHEV", "Marvel R", "MG3", "MG4", "MG5", "ZS", "ZS EV"],
    "MINI": ["Aceman", "Clubman", "Cooper", "Cooper Electric", "Countryman"],
    "Mitsubishi": ["ASX", "Eclipse Cross", "L200", "Outlander", "Space Star"],
    "Nissan": ["Ariya", "Juke", "Leaf", "Micra", "Navara", "Qashqai", "Townstar", "X-Trail"],
    "Omoda": ["5", "9", "E5"],
    "Opel": ["Astra", "Astra Electric", "Combo", "Corsa", "Corsa-e", "Frontera", "Grandland", "Mokka", "Mokka-e", "Vivaro", "Zafira Life"],
    "ORA": ["03", "Funky Cat"],
    "Peugeot": ["108", "2008", "208", "3008", "308", "408", "5008", "508", "e-2008", "e-208", "e-Partner", "e-Rifter", "e-Traveller", "Partner", "Rifter", "Traveller"],
    "Polestar": ["2", "3", "4", "Polestar 2", "Polestar 3"],
    "Porsche": ["718 Boxster", "718 Cayman", "911", "Cayenne", "Macan", "Panamera", "Taycan"],
    "Renault": ["5 E-Tech", "Arkana", "Austral", "Captur", "Clio", "Espace", "Express", "Fluence", "Grand Scenic", "Kadjar", "Kangoo", "Kangoo Combi", "Kangoo Z.E.", "Kangoo ZE", "Koleos", "Laguna", "Mascott", "Master", "Megane", "Megane E-Tech", "Modus", "Rafale", "Scenic", "Scenic E-Tech", "Symbioz", "Talisman", "Trafic", "Twingo", "Twizy", "Vel Satis", "Wind", "Zoe"],
    "Rolls-Royce": ["Cullinan", "Ghost", "Spectre"],
    "Saab": ["9-3", "9-5"],
    "SEAT": ["Alhambra", "Altea", "Arona", "Ateca", "Cordoba", "Exeo", "Fura", "Ibiza", "Inca", "Leon", "León", "Malaga", "Marbella", "Mii", "Ronda", "Tarraco", "Toledo"],
    "Seres": ["3", "5", "7"],
    "Smart": ["#1", "#3", "#5", "Forfour", "Fortwo"],
    "smart": ["#1", "#3", "forfour", "fortwo"],
    "SsangYong": ["Korando", "Musso", "Rexton", "Tivoli"],
    "Subaru": ["BRZ", "Crosstrek", "Forester", "Impreza", "Outback", "Solterra", "XV"],
    "Suzuki": ["Across", "Alto", "Baleno", "Celerio", "Ignis", "Jimny", "Kizashi", "Liana", "S-Cross", "Samurai", "Splash", "Swace", "Swift", "SX4", "SX4 S-Cross", "Vitara", "Wagon R+"],
    "SWM": ["G01", "G01 F", "G03", "G03F", "G05"],
    "Tesla": ["Cybertruck", "Model 3", "Model S", "Model X", "Model Y"],
    "Toyota": ["Aygo X", "bZ4X", "C-HR", "C-HR+", "Camry", "Corolla", "Corolla Cross", "Highlander", "Hilux", "Land Cruiser", "Mirai", "Prius", "Proace", "Proace City", "Proace City Verso", "Proace Max", "Proace Verso", "RAV4", "Supra", "Urban Cruiser", "Yaris", "Yaris Cross"],
    "Volkswagen": ["Amarok", "Arteon", "Caddy", "Golf", "ID.3", "ID.4", "ID.5", "ID.7", "ID.Buzz", "Passat", "Polo", "T-Cross", "T-Roc", "Taigo", "Tiguan", "Touareg", "Transporter", "up!"],
    "Volvo": ["C40", "EM90", "EX30", "EX90", "S60", "S90", "V60", "V90", "XC40", "XC60", "XC90"],
    "Xpeng": ["G6", "P7"],
    "XPeng": ["G6", "G9", "P7"],
    "Zeekr": ["001", "X"],
    "Škoda": ["Elroq", "Enyaq", "Enyaq Coupé", "Epiq", "Fabia", "Kamiq", "Karoq", "Kodiaq", "Octavia", "Scala", "Superb"]
  };
  // merge (sin machacar si el usuario ya ha definido BRAND_MODELS_ES)
  for(const b in data){
    if(!window.BRAND_MODELS_ES[b]) window.BRAND_MODELS_ES[b]=data[b];
    else {
      const set=new Set(window.BRAND_MODELS_ES[b]);
      for(const m of data[b]) set.add(m);
      window.BRAND_MODELS_ES[b]=Array.from(set);
    }
  }
})();