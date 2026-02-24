// FairCar — DB Patch v2 (modelos ampliados + nuevas marcas + Ebro)
// Añade marcas/modelos/versiones sin tocar carDatabase-v3.js
// Fuentes orientativas: km77, AutoScout24 ES, fichas técnicas fabricantes (precios 2024-2025)
(function(){
  if(typeof window === 'undefined') return;
  window.CAR_DB = window.CAR_DB || {};

  function ensureBrand(brand, brandInfo){
    if(!window.CAR_DB[brand]){
      window.CAR_DB[brand] = {
        brand_info: brandInfo || {reliability_avg:3.4, parts_cost:'medium', maintenance_cost_factor:1.10},
        models: {}
      };
    } else {
      if(brandInfo) window.CAR_DB[brand].brand_info = window.CAR_DB[brand].brand_info || brandInfo;
      window.CAR_DB[brand].models = window.CAR_DB[brand].models || {};
    }
  }

  function addModel(brand, modelName, modelObj){
    ensureBrand(brand, null);
    if(!window.CAR_DB[brand].models[modelName]){
      window.CAR_DB[brand].models[modelName] = modelObj;
    } else {
      const existing = window.CAR_DB[brand].models[modelName].versions || [];
      const existingNames = new Set(existing.map(v=>v.name));
      for(const v of (modelObj.versions||[])){
        if(!existingNames.has(v.name)) existing.push(v);
      }
      window.CAR_DB[brand].models[modelName].versions = existing;
      if(!window.CAR_DB[brand].models[modelName].priceFrom && modelObj.priceFrom)
        window.CAR_DB[brand].models[modelName].priceFrom = modelObj.priceFrom;
    }
  }

  // ======================================================================
  // EBRO — marca española relanzada (2024) por DAS Automotive/LEVC
  // ======================================================================
  ensureBrand("Ebro", {reliability_avg:3.5, parts_cost:'medium', maintenance_cost_factor:1.05});
  addModel("Ebro","S700",{segment:"suv",priceFrom:26900,
    versions:[
      {name:"S700 BEV 204cv",type:"ev",power_cv:204,power_kw:150,battery_kwh:59,
       priceRange:[26900,31500],consumption:{city:14.5,highway:18.2,real:16.5,range:340}},
      {name:"S700 PHEV 199cv",type:"phev",power_cv:199,power_kw:146,battery_kwh:15,
       priceRange:[29900,35000],consumption:{city:1.4,highway:5.2,electric_range:75,real:2.0,electric_kwh:16}}
    ]});
  addModel("Ebro","S300",{segment:"suv",priceFrom:22900,
    versions:[
      {name:"S300 1.5 MHEV 130cv",type:"hibrido",power_cv:130,power_kw:96,
       priceRange:[22900,27500],consumption:{city:6.2,highway:4.8,real:5.7}},
      {name:"S300 BEV 136cv",type:"ev",power_cv:136,power_kw:100,battery_kwh:42,
       priceRange:[25900,30000],consumption:{city:13.8,highway:17.0,real:15.5,range:260}}
    ]});
  window.BRAND_MODELS_ES = window.BRAND_MODELS_ES || {};
  window.BRAND_MODELS_ES["Ebro"] = ["S300","S700"];

  // ======================================================================
  // SUZUKI
  // ======================================================================
  ensureBrand("Suzuki", {reliability_avg:3.8, parts_cost:'low', maintenance_cost_factor:0.95});
  addModel("Suzuki","Swift",{segment:"pequeño",priceFrom:18990,
    versions:[
      {name:"1.2 SHVS 83cv",type:"hibrido",power_cv:83,power_kw:61,priceRange:[18990,23500],consumption:{city:5.1,highway:4.2,real:4.8}},
      {name:"1.2 SHVS 4WD 83cv",type:"hibrido",power_cv:83,power_kw:61,priceRange:[20990,25000],consumption:{city:5.4,highway:4.4,real:5.1}}
    ]});
  addModel("Suzuki","Vitara",{segment:"suv",priceFrom:24490,
    versions:[
      {name:"1.5 SHVS 102cv",type:"hibrido",power_cv:102,power_kw:75,priceRange:[24490,29500],consumption:{city:5.3,highway:4.5,real:5.0}},
      {name:"1.5 SHVS AllGrip 102cv",type:"hibrido",power_cv:102,power_kw:75,priceRange:[27490,32000],consumption:{city:5.7,highway:4.8,real:5.4}}
    ]});
  addModel("Suzuki","S-Cross",{segment:"suv",priceFrom:28490,
    versions:[
      {name:"1.5 SHVS 102cv",type:"hibrido",power_cv:102,power_kw:75,priceRange:[28490,33000],consumption:{city:5.4,highway:4.6,real:5.1}},
      {name:"1.4 Boosterjet PHEV 129cv",type:"phev",power_cv:129,power_kw:95,battery_kwh:13.8,priceRange:[36490,41000],consumption:{city:1.3,highway:5.8,electric_range:58,real:1.8,electric_kwh:15}}
    ]});
  addModel("Suzuki","Ignis",{segment:"pequeño",priceFrom:17490,
    versions:[
      {name:"1.2 SHVS 83cv",type:"hibrido",power_cv:83,power_kw:61,priceRange:[17490,21000],consumption:{city:5.0,highway:4.1,real:4.7}},
      {name:"1.2 SHVS 4WD 83cv",type:"hibrido",power_cv:83,power_kw:61,priceRange:[19490,23000],consumption:{city:5.3,highway:4.3,real:5.0}}
    ]});
  addModel("Suzuki","Jimny",{segment:"suv",priceFrom:21990,
    versions:[
      {name:"1.5 105cv 4WD",type:"gasolina",power_cv:105,power_kw:77,priceRange:[21990,27000],consumption:{city:8.5,highway:7.0,real:7.9}}
    ]});
  addModel("Suzuki","Swace",{segment:"mediano",priceFrom:27990,
    versions:[
      {name:"1.8 HEV 122cv",type:"hibrido",power_cv:122,power_kw:90,priceRange:[27990,32000],consumption:{city:4.9,highway:5.2,real:5.0}}
    ]});
  addModel("Suzuki","Across",{segment:"suv",priceFrom:44990,
    versions:[
      {name:"2.5 PHEV 306cv AWD",type:"phev",power_cv:306,power_kw:225,battery_kwh:18.1,priceRange:[44990,49000],consumption:{city:2.0,highway:7.2,electric_range:75,real:2.8,electric_kwh:21}}
    ]});

  // ======================================================================
  // ABARTH
  // ======================================================================
  ensureBrand("Abarth", {reliability_avg:3.4, parts_cost:'high', maintenance_cost_factor:1.20});
  addModel("Abarth","500",{segment:"pequeño",priceFrom:39350,
    versions:[
      {name:"1.4 T-Jet 165cv",type:"gasolina",power_cv:165,power_kw:121,priceRange:[39350,44000],consumption:{city:7.5,highway:5.9,real:7.0}}
    ]});
  addModel("Abarth","500e",{segment:"pequeño",priceFrom:42000,
    versions:[
      {name:"500e 155cv",type:"ev",power_cv:155,power_kw:114,battery_kwh:42.2,priceRange:[42000,48000],consumption:{city:14.5,highway:17.5,real:16.0,range:265}}
    ]});

  // ======================================================================
  // SMART (JV Geely/Mercedes, EV)
  // ======================================================================
  ensureBrand("Smart", {reliability_avg:3.4, parts_cost:'medium', maintenance_cost_factor:1.10});
  addModel("Smart","#1",{segment:"pequeño",priceFrom:36990,
    versions:[
      {name:"#1 272cv RWD",type:"ev",power_cv:272,power_kw:200,battery_kwh:66,priceRange:[36990,42000],consumption:{city:15.8,highway:19.5,real:18.0,range:420}},
      {name:"#1 Brabus 428cv AWD",type:"ev",power_cv:428,power_kw:315,battery_kwh:66,priceRange:[48000,53000],consumption:{city:18.5,highway:22.0,real:20.5,range:380}}
    ]});
  addModel("Smart","#3",{segment:"suv",priceFrom:39990,
    versions:[
      {name:"#3 272cv RWD",type:"ev",power_cv:272,power_kw:200,battery_kwh:66,priceRange:[39990,45000],consumption:{city:16.0,highway:19.8,real:18.2,range:415}},
      {name:"#3 Brabus 428cv AWD",type:"ev",power_cv:428,power_kw:315,battery_kwh:66,priceRange:[51000,56000],consumption:{city:18.8,highway:22.5,real:21.0,range:370}}
    ]});
  addModel("Smart","#5",{segment:"suv",priceFrom:43990,
    versions:[
      {name:"#5 340cv AWD",type:"ev",power_cv:340,power_kw:250,battery_kwh:100,priceRange:[43990,52000],consumption:{city:16.5,highway:20.5,real:18.8,range:560}}
    ]});

  // ======================================================================
  // SSANGYONG / KGM
  // ======================================================================
  ensureBrand("SsangYong", {reliability_avg:3.3, parts_cost:'medium', maintenance_cost_factor:1.05});
  addModel("SsangYong","Tivoli",{segment:"suv",priceFrom:22000,
    versions:[
      {name:"1.5 GDI 163cv",type:"gasolina",power_cv:163,power_kw:120,priceRange:[22000,28000],consumption:{city:7.2,highway:5.8,real:6.7}},
      {name:"e-Tivoli 156cv",type:"ev",power_cv:156,power_kw:115,battery_kwh:61.5,priceRange:[35000,41000],consumption:{city:16.0,highway:19.5,real:18.0,range:400}}
    ]});
  addModel("SsangYong","Korando",{segment:"suv",priceFrom:26000,
    versions:[
      {name:"1.5 GDI 163cv",type:"gasolina",power_cv:163,power_kw:120,priceRange:[26000,32000],consumption:{city:7.8,highway:6.2,real:7.2}},
      {name:"e-Korando 190cv",type:"ev",power_cv:190,power_kw:140,battery_kwh:61.5,priceRange:[35000,41000],consumption:{city:16.0,highway:19.8,real:18.2,range:340}}
    ]});
  addModel("SsangYong","Rexton",{segment:"suv",priceFrom:35000,
    versions:[
      {name:"2.2 e-XDi 202cv AWD",type:"diesel",power_cv:202,power_kw:149,priceRange:[35000,44000],consumption:{city:9.5,highway:7.2,real:8.5}}
    ]});
  addModel("SsangYong","Musso",{segment:"suv",priceFrom:34000,
    versions:[
      {name:"2.2 e-XDi 181cv AWD",type:"diesel",power_cv:181,power_kw:133,priceRange:[34000,42000],consumption:{city:9.8,highway:7.5,real:8.8}}
    ]});

  // ======================================================================
  // INFINITI
  // ======================================================================
  ensureBrand("Infiniti", {reliability_avg:3.5, parts_cost:'high', maintenance_cost_factor:1.25});
  addModel("Infiniti","Q50",{segment:"mediano",priceFrom:45000,
    versions:[
      {name:"2.0t 211cv",type:"gasolina",power_cv:211,power_kw:155,priceRange:[45000,55000],consumption:{city:9.5,highway:7.0,real:8.5}},
      {name:"3.0t Sport 405cv",type:"gasolina",power_cv:405,power_kw:298,priceRange:[60000,70000],consumption:{city:12.5,highway:9.0,real:11.2}}
    ]});
  addModel("Infiniti","QX50",{segment:"suv",priceFrom:50000,
    versions:[
      {name:"2.0t VC-Turbo 268cv",type:"gasolina",power_cv:268,power_kw:197,priceRange:[50000,60000],consumption:{city:9.8,highway:7.5,real:9.0}}
    ]});
  addModel("Infiniti","QX55",{segment:"suv",priceFrom:58000,
    versions:[
      {name:"2.0t VC-Turbo 268cv",type:"gasolina",power_cv:268,power_kw:197,priceRange:[58000,68000],consumption:{city:10.2,highway:7.8,real:9.3}}
    ]});

  // ======================================================================
  // ISUZU
  // ======================================================================
  ensureBrand("Isuzu", {reliability_avg:3.8, parts_cost:'medium', maintenance_cost_factor:1.05});
  addModel("Isuzu","D-Max",{segment:"suv",priceFrom:35000,
    versions:[
      {name:"1.9 DDi 163cv RWD",type:"diesel",power_cv:163,power_kw:120,priceRange:[35000,42000],consumption:{city:8.8,highway:6.5,real:7.8}},
      {name:"1.9 DDi 163cv 4WD",type:"diesel",power_cv:163,power_kw:120,priceRange:[39000,46000],consumption:{city:9.2,highway:7.0,real:8.3}}
    ]});
  addModel("Isuzu","MU-X",{segment:"suv",priceFrom:44000,
    versions:[
      {name:"1.9 DDi 163cv 4WD",type:"diesel",power_cv:163,power_kw:120,priceRange:[44000,51000],consumption:{city:9.5,highway:7.2,real:8.6}}
    ]});

  // ======================================================================
  // ORA (Great Wall)
  // ======================================================================
  ensureBrand("ORA", {reliability_avg:3.4, parts_cost:'medium', maintenance_cost_factor:1.10});
  addModel("ORA","Funky Cat",{segment:"pequeño",priceFrom:29990,
    versions:[
      {name:"Funky Cat 171cv",type:"ev",power_cv:171,power_kw:126,battery_kwh:63,priceRange:[29990,36000],consumption:{city:14.8,highway:18.2,real:16.8,range:380}},
      {name:"Funky Cat GT 200cv",type:"ev",power_cv:200,power_kw:147,battery_kwh:63,priceRange:[35000,40000],consumption:{city:15.2,highway:18.8,real:17.4,range:370}}
    ]});
  addModel("ORA","03",{segment:"pequeño",priceFrom:26990,
    versions:[
      {name:"03 143cv",type:"ev",power_cv:143,power_kw:105,battery_kwh:48,priceRange:[26990,32000],consumption:{city:13.5,highway:17.0,real:15.5,range:305}}
    ]});

  // ======================================================================
  // MAXUS (SAIC)
  // ======================================================================
  ensureBrand("Maxus", {reliability_avg:3.2, parts_cost:'medium', maintenance_cost_factor:1.10});
  addModel("Maxus","Mifa 9",{segment:"suv",priceFrom:69900,
    versions:[
      {name:"Mifa 9 204cv",type:"ev",power_cv:204,power_kw:150,battery_kwh:90,priceRange:[69900,78000],consumption:{city:21.5,highway:25.5,real:23.5,range:380}}
    ]});
  addModel("Maxus","Euniq 6",{segment:"suv",priceFrom:49900,
    versions:[
      {name:"Euniq 6 PHEV 204cv",type:"phev",power_cv:204,power_kw:150,battery_kwh:16.8,priceRange:[49900,56000],consumption:{city:2.2,highway:7.5,electric_range:65,real:3.0,electric_kwh:18}}
    ]});
  addModel("Maxus","T90",{segment:"suv",priceFrom:38900,
    versions:[
      {name:"2.0 TDCI 163cv 4WD",type:"diesel",power_cv:163,power_kw:120,priceRange:[38900,45000],consumption:{city:9.5,highway:7.5,real:8.7}}
    ]});

  // ======================================================================
  // AIWAYS
  // ======================================================================
  ensureBrand("Aiways", {reliability_avg:3.2, parts_cost:'medium', maintenance_cost_factor:1.10});
  addModel("Aiways","U5",{segment:"suv",priceFrom:31990,
    versions:[
      {name:"U5 204cv",type:"ev",power_cv:204,power_kw:150,battery_kwh:63,priceRange:[31990,38000],consumption:{city:16.5,highway:20.0,real:18.5,range:340}}
    ]});
  addModel("Aiways","U6",{segment:"suv",priceFrom:36990,
    versions:[
      {name:"U6 204cv",type:"ev",power_cv:204,power_kw:150,battery_kwh:63,priceRange:[36990,42000],consumption:{city:16.8,highway:20.5,real:19.0,range:330}}
    ]});

  // ======================================================================
  // SERES (Huawei / AITO)
  // ======================================================================
  ensureBrand("Seres", {reliability_avg:3.3, parts_cost:'medium', maintenance_cost_factor:1.10});
  addModel("Seres","5",{segment:"suv",priceFrom:42000,
    versions:[
      {name:"PHEV 4WD 315cv",type:"phev",power_cv:315,power_kw:232,battery_kwh:25,priceRange:[42000,52000],consumption:{city:2.0,highway:7.5,electric_range:100,real:2.8,electric_kwh:18}}
    ]});
  addModel("Seres","7",{segment:"suv",priceFrom:65000,
    versions:[
      {name:"PHEV AWD 475cv",type:"phev",power_cv:475,power_kw:349,battery_kwh:42,priceRange:[65000,78000],consumption:{city:2.2,highway:8.0,electric_range:170,real:3.0,electric_kwh:19}}
    ]});

  // ======================================================================
  // LYNK & CO
  // ======================================================================
  ensureBrand("Lynk & Co", {reliability_avg:3.6, parts_cost:'medium', maintenance_cost_factor:1.10});
  addModel("Lynk & Co","01",{segment:"suv",priceFrom:36900,
    versions:[
      {name:"2.0T 190cv",type:"gasolina",power_cv:190,power_kw:140,priceRange:[36900,44000],consumption:{city:8.5,highway:6.5,real:7.7}},
      {name:"1.5T PHEV 261cv",type:"phev",power_cv:261,power_kw:192,battery_kwh:14.1,priceRange:[39900,47000],consumption:{city:1.8,highway:6.5,electric_range:58,real:2.5,electric_kwh:17}}
    ]});
  addModel("Lynk & Co","03",{segment:"mediano",priceFrom:36900,
    versions:[
      {name:"2.0T 190cv",type:"gasolina",power_cv:190,power_kw:140,priceRange:[36900,43000],consumption:{city:8.0,highway:6.0,real:7.2}},
      {name:"1.5T PHEV 261cv",type:"phev",power_cv:261,power_kw:192,battery_kwh:14.1,priceRange:[42900,49000],consumption:{city:1.8,highway:6.5,electric_range:55,real:2.5,electric_kwh:17}}
    ]});
  addModel("Lynk & Co","05",{segment:"suv",priceFrom:42900,
    versions:[
      {name:"1.5T PHEV 261cv",type:"phev",power_cv:261,power_kw:192,battery_kwh:14.1,priceRange:[42900,49000],consumption:{city:1.8,highway:6.5,electric_range:58,real:2.5,electric_kwh:17}}
    ]});
  addModel("Lynk & Co","08",{segment:"suv",priceFrom:58900,
    versions:[
      {name:"EM-P PHEV 493cv AWD",type:"phev",power_cv:493,power_kw:362,battery_kwh:37,priceRange:[58900,67000],consumption:{city:2.0,highway:7.2,electric_range:150,real:2.8,electric_kwh:19}}
    ]});

  // ======================================================================
  // OMODA & JAECOO (Chery)
  // ======================================================================
  ensureBrand("Omoda", {reliability_avg:3.3, parts_cost:'medium', maintenance_cost_factor:1.10});
  addModel("Omoda","5",{segment:"suv",priceFrom:23990,
    versions:[
      {name:"1.6T 150cv",type:"gasolina",power_cv:150,power_kw:110,priceRange:[23990,30000],consumption:{city:7.5,highway:5.8,real:6.9}},
      {name:"E5 204cv BEV",type:"ev",power_cv:204,power_kw:150,battery_kwh:61,priceRange:[32990,39000],consumption:{city:15.5,highway:19.0,real:17.5,range:340}}
    ]});
  addModel("Omoda","9",{segment:"suv",priceFrom:38990,
    versions:[
      {name:"2.0T 254cv",type:"gasolina",power_cv:254,power_kw:187,priceRange:[38990,46000],consumption:{city:9.5,highway:7.2,real:8.6}}
    ]});

  ensureBrand("Jaecoo", {reliability_avg:3.3, parts_cost:'medium', maintenance_cost_factor:1.10});
  addModel("Jaecoo","7",{segment:"suv",priceFrom:25990,
    versions:[
      {name:"1.6T 147cv 2WD",type:"gasolina",power_cv:147,power_kw:108,priceRange:[25990,32000],consumption:{city:7.8,highway:6.0,real:7.1}},
      {name:"1.6T 147cv 4WD",type:"gasolina",power_cv:147,power_kw:108,priceRange:[29990,36000],consumption:{city:8.2,highway:6.3,real:7.5}}
    ]});
  addModel("Jaecoo","8",{segment:"suv",priceFrom:32990,
    versions:[
      {name:"1.6T 147cv",type:"gasolina",power_cv:147,power_kw:108,priceRange:[32990,39000],consumption:{city:8.5,highway:6.5,real:7.7}},
      {name:"PHEV 218cv",type:"phev",power_cv:218,power_kw:160,battery_kwh:19.9,priceRange:[38990,45000],consumption:{city:1.8,highway:6.8,electric_range:80,real:2.5,electric_kwh:17}}
    ]});

  // ======================================================================
  // BYD — modelos adicionales
  // ======================================================================
  addModel("BYD","Seagull",{segment:"pequeño",priceFrom:19990,
    versions:[
      {name:"Seagull 74cv",type:"ev",power_cv:74,power_kw:55,battery_kwh:30.1,priceRange:[19990,24000],consumption:{city:11.5,highway:14.8,real:13.2,range:250}},
      {name:"Seagull LFP 108cv",type:"ev",power_cv:108,power_kw:79,battery_kwh:38.9,priceRange:[23990,28000],consumption:{city:12.5,highway:15.5,real:14.2,range:300}}
    ]});
  addModel("BYD","Han",{segment:"mediano",priceFrom:52990,
    versions:[
      {name:"Han EV 517cv AWD",type:"ev",power_cv:517,power_kw:380,battery_kwh:85.4,priceRange:[52990,62000],consumption:{city:18.5,highway:23.0,real:21.2,range:400}},
      {name:"Han DM-i PHEV 395cv",type:"phev",power_cv:395,power_kw:290,battery_kwh:37,priceRange:[55990,65000],consumption:{city:1.8,highway:7.0,electric_range:125,real:2.5,electric_kwh:18}}
    ]});
  addModel("BYD","Seal U DM-i",{segment:"suv",priceFrom:35990,
    versions:[
      {name:"Seal U DM-i PHEV 231cv",type:"phev",power_cv:231,power_kw:170,battery_kwh:15.2,priceRange:[35990,43000],consumption:{city:1.5,highway:6.2,electric_range:70,real:2.2,electric_kwh:16}}
    ]});
  addModel("BYD","Tang",{segment:"suv",priceFrom:67990,
    versions:[
      {name:"Tang EV AWD 517cv",type:"ev",power_cv:517,power_kw:380,battery_kwh:108.8,priceRange:[67990,78000],consumption:{city:21.5,highway:26.0,real:24.0,range:420}}
    ]});

  // ======================================================================
  // VOLKSWAGEN — modelos adicionales
  // ======================================================================
  addModel("Volkswagen","Passat",{segment:"mediano",priceFrom:36000,
    versions:[
      {name:"2.0 TDI 150cv",type:"diesel",power_cv:150,power_kw:110,priceRange:[36000,43000],consumption:{city:5.8,highway:4.6,real:5.3}},
      {name:"1.5 eTSI 150cv MHEV",type:"hibrido",power_cv:150,power_kw:110,priceRange:[38000,45000],consumption:{city:6.2,highway:4.8,real:5.7}},
      {name:"1.4 TSI eHybrid 272cv PHEV",type:"phev",power_cv:272,power_kw:200,battery_kwh:19.7,priceRange:[47000,55000],consumption:{city:1.8,highway:6.2,electric_range:90,real:2.5,electric_kwh:16}}
    ]});
  addModel("Volkswagen","ID.5",{segment:"suv",priceFrom:47990,
    versions:[
      {name:"ID.5 Pro 204cv",type:"ev",power_cv:204,power_kw:150,battery_kwh:77,priceRange:[47990,54000],consumption:{city:16.5,highway:20.5,real:18.8,range:480}},
      {name:"ID.5 GTX 299cv AWD",type:"ev",power_cv:299,power_kw:220,battery_kwh:77,priceRange:[57990,64000],consumption:{city:18.5,highway:22.5,real:20.8,range:445}}
    ]});
  addModel("Volkswagen","ID.Buzz",{segment:"suv",priceFrom:59990,
    versions:[
      {name:"ID.Buzz Pro 204cv",type:"ev",power_cv:204,power_kw:150,battery_kwh:77,priceRange:[59990,68000],consumption:{city:18.5,highway:22.5,real:20.8,range:420}},
      {name:"ID.Buzz GTX 340cv AWD",type:"ev",power_cv:340,power_kw:250,battery_kwh:86,priceRange:[72990,82000],consumption:{city:20.5,highway:24.5,real:22.8,range:450}}
    ]});
  addModel("Volkswagen","Touareg",{segment:"suv",priceFrom:65000,
    versions:[
      {name:"3.0 TDI 231cv",type:"diesel",power_cv:231,power_kw:170,priceRange:[65000,78000],consumption:{city:8.0,highway:6.5,real:7.5}},
      {name:"2.0 TSI eHybrid 381cv PHEV",type:"phev",power_cv:381,power_kw:280,battery_kwh:17.9,priceRange:[78000,90000],consumption:{city:2.5,highway:7.5,electric_range:42,real:3.2,electric_kwh:22}}
    ]});
  addModel("Volkswagen","Arteon",{segment:"mediano",priceFrom:50000,
    versions:[
      {name:"2.0 TSI 190cv",type:"gasolina",power_cv:190,power_kw:140,priceRange:[50000,57000],consumption:{city:9.0,highway:6.8,real:8.1}},
      {name:"2.0 TDI 150cv",type:"diesel",power_cv:150,power_kw:110,priceRange:[49000,56000],consumption:{city:6.2,highway:4.9,real:5.7}}
    ]});
  addModel("Volkswagen","T-Cross",{segment:"suv",priceFrom:25000,
    versions:[
      {name:"1.0 TSI 95cv",type:"gasolina",power_cv:95,power_kw:70,priceRange:[25000,29000],consumption:{city:6.8,highway:5.2,real:6.2}},
      {name:"1.0 TSI 115cv",type:"gasolina",power_cv:115,power_kw:85,priceRange:[27000,32000],consumption:{city:6.9,highway:5.3,real:6.4}},
      {name:"1.5 TSI 150cv",type:"gasolina",power_cv:150,power_kw:110,priceRange:[30000,35000],consumption:{city:7.2,highway:5.5,real:6.6}}
    ]});
  addModel("Volkswagen","Taigo",{segment:"pequeño",priceFrom:24000,
    versions:[
      {name:"1.0 TSI 95cv",type:"gasolina",power_cv:95,power_kw:70,priceRange:[24000,28000],consumption:{city:6.5,highway:5.0,real:6.0}},
      {name:"1.5 TSI 150cv",type:"gasolina",power_cv:150,power_kw:110,priceRange:[29000,34000],consumption:{city:7.0,highway:5.4,real:6.4}}
    ]});

  // ======================================================================
  // FORD — modelos adicionales
  // ======================================================================
  addModel("Ford","Fiesta",{segment:"pequeño",priceFrom:20000,
    versions:[
      {name:"1.0 EcoBoost 95cv",type:"gasolina",power_cv:95,power_kw:70,priceRange:[20000,24000],consumption:{city:6.2,highway:4.8,real:5.7}},
      {name:"1.0 EcoBoost mHEV 125cv",type:"hibrido",power_cv:125,power_kw:92,priceRange:[22000,27000],consumption:{city:5.8,highway:4.5,real:5.3}}
    ]});
  addModel("Ford","Focus",{segment:"mediano",priceFrom:26000,
    versions:[
      {name:"1.0 EcoBoost 125cv",type:"gasolina",power_cv:125,power_kw:92,priceRange:[26000,31000],consumption:{city:6.8,highway:5.2,real:6.2}},
      {name:"1.0 EcoBoost mHEV 155cv",type:"hibrido",power_cv:155,power_kw:114,priceRange:[29000,35000],consumption:{city:6.2,highway:4.8,real:5.7}},
      {name:"2.0 EcoBlue 120cv",type:"diesel",power_cv:120,power_kw:88,priceRange:[27000,33000],consumption:{city:5.2,highway:4.2,real:4.8}}
    ]});
  addModel("Ford","Ranger",{segment:"suv",priceFrom:38000,
    versions:[
      {name:"2.0 EcoBlue 170cv RWD",type:"diesel",power_cv:170,power_kw:125,priceRange:[38000,45000],consumption:{city:9.0,highway:7.0,real:8.2}},
      {name:"2.0 EcoBlue 170cv 4WD",type:"diesel",power_cv:170,power_kw:125,priceRange:[42000,50000],consumption:{city:9.5,highway:7.5,real:8.7}},
      {name:"2.3 EcoBoost Raptor 288cv",type:"gasolina",power_cv:288,power_kw:212,priceRange:[56000,64000],consumption:{city:13.5,highway:10.5,real:12.5}}
    ]});
  addModel("Ford","Explorer",{segment:"suv",priceFrom:60000,
    versions:[
      {name:"EV 286cv AWD",type:"ev",power_cv:286,power_kw:210,battery_kwh:77,priceRange:[60000,72000],consumption:{city:19.0,highway:23.5,real:21.5,range:370}},
      {name:"3.0 PHEV 457cv AWD",type:"phev",power_cv:457,power_kw:336,battery_kwh:10.4,priceRange:[54000,66000],consumption:{city:2.5,highway:8.0,electric_range:40,real:3.5,electric_kwh:22}}
    ]});
  addModel("Ford","Mustang",{segment:"deportivo",priceFrom:56000,
    versions:[
      {name:"2.3 EcoBoost 290cv",type:"gasolina",power_cv:290,power_kw:213,priceRange:[56000,63000],consumption:{city:12.5,highway:9.0,real:11.0}},
      {name:"5.0 Ti-VCT V8 450cv",type:"gasolina",power_cv:450,power_kw:331,priceRange:[68000,78000],consumption:{city:16.0,highway:11.5,real:14.5}}
    ]});
  addModel("Ford","Bronco",{segment:"suv",priceFrom:52000,
    versions:[
      {name:"2.3 EcoBoost 300cv 4WD",type:"gasolina",power_cv:300,power_kw:221,priceRange:[52000,62000],consumption:{city:12.5,highway:9.8,real:11.5}}
    ]});

  // ======================================================================
  // TOYOTA — modelos adicionales
  // ======================================================================
  addModel("Toyota","Urban Cruiser",{segment:"suv",priceFrom:31000,
    versions:[
      {name:"1.5 HEV 116cv",type:"hibrido",power_cv:116,power_kw:85,priceRange:[31000,37000],consumption:{city:4.8,highway:5.5,real:5.1}},
      {name:"BZ 144cv 2WD",type:"ev",power_cv:144,power_kw:106,battery_kwh:49,priceRange:[36000,43000],consumption:{city:13.5,highway:16.8,real:15.2,range:300}},
      {name:"BZ 213cv AWD",type:"ev",power_cv:213,power_kw:157,battery_kwh:61,priceRange:[40000,47000],consumption:{city:14.5,highway:18.0,real:16.5,range:380}}
    ]});
  addModel("Toyota","Camry",{segment:"mediano",priceFrom:40000,
    versions:[
      {name:"2.5 HEV 218cv",type:"hibrido",power_cv:218,power_kw:160,priceRange:[40000,47000],consumption:{city:5.2,highway:5.8,real:5.5}},
      {name:"2.5 HEV AWD 222cv",type:"hibrido",power_cv:222,power_kw:163,priceRange:[45000,52000],consumption:{city:5.5,highway:6.0,real:5.8}}
    ]});
  addModel("Toyota","Corolla Cross",{segment:"suv",priceFrom:36500,
    versions:[
      {name:"2.0 HEV 196cv",type:"hibrido",power_cv:196,power_kw:144,priceRange:[36500,42000],consumption:{city:5.0,highway:5.5,real:5.2}},
      {name:"2.5 HEV AWD 222cv",type:"hibrido",power_cv:222,power_kw:163,priceRange:[42000,48000],consumption:{city:5.3,highway:5.8,real:5.5}}
    ]});
  addModel("Toyota","C-HR+",{segment:"suv",priceFrom:37000,
    versions:[
      {name:"2.0 PHEV 224cv",type:"phev",power_cv:224,power_kw:165,battery_kwh:13.6,priceRange:[37000,44000],consumption:{city:1.2,highway:5.5,electric_range:66,real:1.8,electric_kwh:15}},
      {name:"2.0 PHEV AWD 302cv",type:"phev",power_cv:302,power_kw:222,battery_kwh:13.6,priceRange:[42000,49000],consumption:{city:1.3,highway:6.0,electric_range:60,real:1.9,electric_kwh:16}}
    ]});

  // ======================================================================
  // RENAULT — adicionales
  // ======================================================================
  addModel("Renault","Zoe",{segment:"pequeño",priceFrom:24990,
    versions:[
      {name:"R110 108cv",type:"ev",power_cv:108,power_kw:80,battery_kwh:52,priceRange:[24990,30000],consumption:{city:14.2,highway:17.8,real:16.0,range:320}},
      {name:"R135 136cv",type:"ev",power_cv:136,power_kw:100,battery_kwh:52,priceRange:[27990,33000],consumption:{city:14.5,highway:18.0,real:16.5,range:315}}
    ]});
  addModel("Renault","Twingo",{segment:"pequeño",priceFrom:17990,
    versions:[
      {name:"E-Tech 82cv",type:"ev",power_cv:82,power_kw:60,battery_kwh:22.4,priceRange:[17990,23000],consumption:{city:12.5,highway:16.0,real:14.5,range:145}},
      {name:"1.0 SCe 65cv",type:"gasolina",power_cv:65,power_kw:48,priceRange:[15990,19000],consumption:{city:6.2,highway:5.0,real:5.8}}
    ]});
  addModel("Renault","Rafale",{segment:"suv",priceFrom:50000,
    versions:[
      {name:"E-Tech 200cv HEV",type:"hibrido",power_cv:200,power_kw:147,priceRange:[50000,58000],consumption:{city:5.5,highway:5.8,real:5.6}},
      {name:"E-Tech 300cv PHEV AWD",type:"phev",power_cv:300,power_kw:221,battery_kwh:22,priceRange:[58000,67000],consumption:{city:1.5,highway:6.5,electric_range:100,real:2.2,electric_kwh:17}}
    ]});
  addModel("Renault","Symbioz",{segment:"suv",priceFrom:33000,
    versions:[
      {name:"E-Tech 145cv HEV",type:"hibrido",power_cv:145,power_kw:107,priceRange:[33000,39000],consumption:{city:5.0,highway:5.5,real:5.2}}
    ]});
  addModel("Renault","Espace",{segment:"suv",priceFrom:45000,
    versions:[
      {name:"E-Tech 200cv HEV",type:"hibrido",power_cv:200,power_kw:147,priceRange:[45000,55000],consumption:{city:5.5,highway:5.8,real:5.6}},
      {name:"E-Tech 200cv 7p HEV",type:"hibrido",power_cv:200,power_kw:147,priceRange:[49000,59000],consumption:{city:5.7,highway:6.0,real:5.8}}
    ]});
  addModel("Renault","Kangoo",{segment:"mediano",priceFrom:24000,
    versions:[
      {name:"1.3 TCe 130cv",type:"gasolina",power_cv:130,power_kw:96,priceRange:[24000,30000],consumption:{city:7.2,highway:5.6,real:6.6}},
      {name:"1.5 Blue dCi 95cv",type:"diesel",power_cv:95,power_kw:70,priceRange:[24000,30000],consumption:{city:5.8,highway:4.6,real:5.4}},
      {name:"E-Tech 90cv",type:"ev",power_cv:90,power_kw:66,battery_kwh:45,priceRange:[35000,40000],consumption:{city:14.5,highway:18.0,real:16.5,range:270}}
    ]});

  // ======================================================================
  // OPEL — adicionales
  // ======================================================================
  addModel("Opel","Combo",{segment:"mediano",priceFrom:24000,
    versions:[
      {name:"1.2 Turbo 110cv",type:"gasolina",power_cv:110,power_kw:81,priceRange:[24000,30000],consumption:{city:7.0,highway:5.5,real:6.5}},
      {name:"1.5 BlueHDi 100cv",type:"diesel",power_cv:100,power_kw:74,priceRange:[24000,30000],consumption:{city:5.5,highway:4.4,real:5.1}},
      {name:"e-Combo 136cv",type:"ev",power_cv:136,power_kw:100,battery_kwh:50,priceRange:[36000,42000],consumption:{city:14.5,highway:18.0,real:16.5,range:275}}
    ]});
  addModel("Opel","Zafira Life",{segment:"suv",priceFrom:38000,
    versions:[
      {name:"1.5 BlueHDi 120cv",type:"diesel",power_cv:120,power_kw:88,priceRange:[38000,48000],consumption:{city:6.5,highway:5.2,real:6.0}},
      {name:"2.0 BlueHDi 150cv",type:"diesel",power_cv:150,power_kw:110,priceRange:[42000,52000],consumption:{city:7.0,highway:5.5,real:6.4}}
    ]});
  addModel("Opel","Vivaro",{segment:"mediano",priceFrom:30000,
    versions:[
      {name:"1.5 Diesel 120cv",type:"diesel",power_cv:120,power_kw:88,priceRange:[30000,40000],consumption:{city:7.2,highway:5.8,real:6.7}},
      {name:"Vivaro-e 136cv",type:"ev",power_cv:136,power_kw:100,battery_kwh:75,priceRange:[48000,56000],consumption:{city:22.0,highway:27.0,real:25.0,range:320}}
    ]});

  // ======================================================================
  // PEUGEOT — modelos adicionales
  // ======================================================================
  addModel("Peugeot","408",{segment:"mediano",priceFrom:37000,
    versions:[
      {name:"1.2 PureTech 130cv",type:"gasolina",power_cv:130,power_kw:96,priceRange:[37000,43000],consumption:{city:7.0,highway:5.5,real:6.5}},
      {name:"1.6 Hybrid 180cv PHEV",type:"phev",power_cv:180,power_kw:133,battery_kwh:12.4,priceRange:[46000,54000],consumption:{city:1.4,highway:5.5,electric_range:55,real:2.0,electric_kwh:16}},
      {name:"1.6 Hybrid4 225cv PHEV AWD",type:"phev",power_cv:225,power_kw:165,battery_kwh:12.4,priceRange:[52000,60000],consumption:{city:1.5,highway:5.8,electric_range:52,real:2.2,electric_kwh:17}}
    ]});
  addModel("Peugeot","5008",{segment:"suv",priceFrom:45000,
    versions:[
      {name:"1.2 PureTech 130cv",type:"gasolina",power_cv:130,power_kw:96,priceRange:[45000,52000],consumption:{city:7.5,highway:5.8,real:6.9}},
      {name:"1.5 BlueHDi 130cv",type:"diesel",power_cv:130,power_kw:96,priceRange:[45000,53000],consumption:{city:6.0,highway:4.8,real:5.5}},
      {name:"e-5008 210cv",type:"ev",power_cv:210,power_kw:157,battery_kwh:73,priceRange:[55000,63000],consumption:{city:16.5,highway:20.5,real:18.8,range:500}},
      {name:"e-5008 AWD 320cv",type:"ev",power_cv:320,power_kw:235,battery_kwh:98,priceRange:[63000,72000],consumption:{city:18.0,highway:22.0,real:20.2,range:600}}
    ]});
  addModel("Peugeot","508",{segment:"mediano",priceFrom:39000,
    versions:[
      {name:"1.2 PureTech 130cv",type:"gasolina",power_cv:130,power_kw:96,priceRange:[39000,46000],consumption:{city:7.0,highway:5.4,real:6.4}},
      {name:"1.5 BlueHDi 130cv",type:"diesel",power_cv:130,power_kw:96,priceRange:[39000,47000],consumption:{city:5.8,highway:4.5,real:5.3}},
      {name:"1.6 Hybrid 225cv PHEV",type:"phev",power_cv:225,power_kw:165,battery_kwh:11.5,priceRange:[52000,60000],consumption:{city:1.4,highway:5.5,electric_range:50,real:2.0,electric_kwh:16}}
    ]});
  addModel("Peugeot","Traveller",{segment:"suv",priceFrom:43000,
    versions:[
      {name:"2.0 BlueHDi 145cv",type:"diesel",power_cv:145,power_kw:107,priceRange:[43000,55000],consumption:{city:7.5,highway:6.0,real:7.0}},
      {name:"e-Traveller 136cv",type:"ev",power_cv:136,power_kw:100,battery_kwh:75,priceRange:[62000,72000],consumption:{city:22.0,highway:27.0,real:25.0,range:310}}
    ]});

  // ======================================================================
  // SEAT — versiones completas
  // ======================================================================
  addModel("SEAT","Leon",{segment:"mediano",priceFrom:23000,
    versions:[
      {name:"1.0 TSI 110cv",type:"gasolina",power_cv:110,power_kw:81,priceRange:[23000,27000],consumption:{city:6.0,highway:4.7,real:5.5}},
      {name:"1.5 TSI 150cv",type:"gasolina",power_cv:150,power_kw:110,priceRange:[27000,33000],consumption:{city:6.5,highway:5.0,real:5.9}},
      {name:"2.0 TDI 115cv",type:"diesel",power_cv:115,power_kw:85,priceRange:[25000,30000],consumption:{city:5.2,highway:4.1,real:4.8}},
      {name:"1.4 e-Hybrid 204cv PHEV",type:"phev",power_cv:204,power_kw:150,battery_kwh:12.8,priceRange:[35000,41000],consumption:{city:1.4,highway:5.5,electric_range:55,real:2.0,electric_kwh:16}}
    ]});
  addModel("SEAT","Tarraco",{segment:"suv",priceFrom:35000,
    versions:[
      {name:"1.5 TSI 150cv",type:"gasolina",power_cv:150,power_kw:110,priceRange:[35000,42000],consumption:{city:7.5,highway:5.8,real:6.8}},
      {name:"2.0 TDI 150cv",type:"diesel",power_cv:150,power_kw:110,priceRange:[36000,43000],consumption:{city:6.2,highway:4.9,real:5.7}},
      {name:"1.4 e-Hybrid 245cv PHEV",type:"phev",power_cv:245,power_kw:180,battery_kwh:13.0,priceRange:[47000,54000],consumption:{city:2.0,highway:6.5,electric_range:48,real:2.8,electric_kwh:19}}
    ]});
  addModel("SEAT","Alhambra",{segment:"suv",priceFrom:36000,
    versions:[
      {name:"1.4 TSI 150cv",type:"gasolina",power_cv:150,power_kw:110,priceRange:[36000,43000],consumption:{city:8.2,highway:6.2,real:7.4}},
      {name:"2.0 TDI 150cv",type:"diesel",power_cv:150,power_kw:110,priceRange:[37000,44000],consumption:{city:6.8,highway:5.2,real:6.2}}
    ]});
  addModel("SEAT","Mii",{segment:"pequeño",priceFrom:15000,
    versions:[
      {name:"1.0 60cv",type:"gasolina",power_cv:60,power_kw:44,priceRange:[15000,18000],consumption:{city:5.5,highway:4.4,real:5.1}}
    ]});

  // ======================================================================
  // KIA — modelos adicionales
  // ======================================================================
  addModel("Kia","Carens",{segment:"suv",priceFrom:26000,
    versions:[
      {name:"1.5 T-GDI MHEV 160cv",type:"hibrido",power_cv:160,power_kw:118,priceRange:[26000,36000],consumption:{city:7.2,highway:5.5,real:6.6}},
      {name:"1.6 HEV 141cv",type:"hibrido",power_cv:141,power_kw:104,priceRange:[30000,38000],consumption:{city:5.8,highway:6.2,real:6.0}}
    ]});
  addModel("Kia","Rio",{segment:"pequeño",priceFrom:17000,
    versions:[
      {name:"1.0 T-GDI MHEV 100cv",type:"hibrido",power_cv:100,power_kw:74,priceRange:[17000,23000],consumption:{city:5.8,highway:4.5,real:5.3}},
      {name:"1.2 MPi 84cv",type:"gasolina",power_cv:84,power_kw:62,priceRange:[15000,19000],consumption:{city:6.2,highway:4.8,real:5.7}}
    ]});
  addModel("Kia","EV3",{segment:"pequeño",priceFrom:31990,
    versions:[
      {name:"EV3 Standard 150cv",type:"ev",power_cv:150,power_kw:110,battery_kwh:58.3,priceRange:[31990,37000],consumption:{city:13.8,highway:17.2,real:15.8,range:370}},
      {name:"EV3 Long Range 150cv",type:"ev",power_cv:150,power_kw:110,battery_kwh:81.4,priceRange:[36990,43000],consumption:{city:14.2,highway:17.8,real:16.2,range:500}}
    ]});
  addModel("Kia","Stonic",{segment:"suv",priceFrom:19000,
    versions:[
      {name:"1.0 T-GDI MHEV 100cv",type:"hibrido",power_cv:100,power_kw:74,priceRange:[19000,26000],consumption:{city:6.2,highway:4.8,real:5.7}},
      {name:"1.0 T-GDI MHEV 120cv",type:"hibrido",power_cv:120,power_kw:88,priceRange:[22000,28000],consumption:{city:6.5,highway:5.0,real:5.9}}
    ]});
  addModel("Kia","XCeed",{segment:"suv",priceFrom:24000,
    versions:[
      {name:"1.5 T-GDI MHEV 160cv",type:"hibrido",power_cv:160,power_kw:118,priceRange:[24000,31000],consumption:{city:7.0,highway:5.5,real:6.4}},
      {name:"1.6 PHEV 141cv",type:"phev",power_cv:141,power_kw:104,battery_kwh:8.9,priceRange:[32000,38000],consumption:{city:1.6,highway:5.5,electric_range:45,real:2.3,electric_kwh:17}}
    ]});
  addModel("Kia","Carnival",{segment:"suv",priceFrom:48000,
    versions:[
      {name:"1.6 T-GDI HEV 245cv",type:"hibrido",power_cv:245,power_kw:180,priceRange:[48000,58000],consumption:{city:7.2,highway:6.5,real:7.0}}
    ]});

  // ======================================================================
  // HYUNDAI — adicionales
  // ======================================================================
  addModel("Hyundai","i10",{segment:"pequeño",priceFrom:14990,
    versions:[
      {name:"1.0 MPi 67cv",type:"gasolina",power_cv:67,power_kw:49,priceRange:[14990,18000],consumption:{city:5.8,highway:4.5,real:5.3}},
      {name:"1.0 T-GDI 100cv",type:"gasolina",power_cv:100,power_kw:74,priceRange:[17990,22000],consumption:{city:6.2,highway:4.9,real:5.7}}
    ]});
  addModel("Hyundai","Bayon",{segment:"suv",priceFrom:21000,
    versions:[
      {name:"1.2 MPi 84cv",type:"gasolina",power_cv:84,power_kw:62,priceRange:[19000,24000],consumption:{city:6.5,highway:5.0,real:6.0}},
      {name:"1.0 T-GDI MHEV 100cv",type:"hibrido",power_cv:100,power_kw:74,priceRange:[21000,27000],consumption:{city:6.0,highway:4.7,real:5.5}}
    ]});
  addModel("Hyundai","Santa Fe",{segment:"suv",priceFrom:45000,
    versions:[
      {name:"1.6 T-GDI HEV 215cv AWD",type:"hibrido",power_cv:215,power_kw:158,priceRange:[45000,55000],consumption:{city:6.0,highway:6.5,real:6.2}},
      {name:"2.0 T-GDI PHEV 253cv AWD",type:"phev",power_cv:253,power_kw:186,battery_kwh:14.4,priceRange:[50000,60000],consumption:{city:2.0,highway:7.0,electric_range:57,real:2.8,electric_kwh:18}}
    ]});
  addModel("Hyundai","Ioniq 7",{segment:"suv",priceFrom:75000,
    versions:[
      {name:"Ioniq 7 AWD 320cv",type:"ev",power_cv:320,power_kw:235,battery_kwh:110,priceRange:[75000,88000],consumption:{city:19.5,highway:24.0,real:22.0,range:580}}
    ]});

  // ======================================================================
  // HONDA — versiones adicionales
  // ======================================================================
  addModel("Honda","Civic",{segment:"mediano",priceFrom:26000,
    versions:[
      {name:"1.5 VTEC Turbo 182cv",type:"gasolina",power_cv:182,power_kw:134,priceRange:[26000,32000],consumption:{city:7.5,highway:5.8,real:6.9}},
      {name:"2.0 e:HEV 184cv",type:"hibrido",power_cv:184,power_kw:135,priceRange:[31000,37000],consumption:{city:5.4,highway:6.2,real:5.8}}
    ]});
  addModel("Honda","CR-V",{segment:"suv",priceFrom:38000,
    versions:[
      {name:"2.0 e:HEV 184cv",type:"hibrido",power_cv:184,power_kw:135,priceRange:[38000,46000],consumption:{city:6.0,highway:6.5,real:6.2}},
      {name:"2.0 e:PHEV 184cv AWD",type:"phev",power_cv:184,power_kw:135,battery_kwh:17.7,priceRange:[50000,58000],consumption:{city:1.7,highway:6.5,electric_range:81,real:2.4,electric_kwh:16}}
    ]});
  addModel("Honda","HR-V",{segment:"suv",priceFrom:28000,
    versions:[
      {name:"1.5 e:HEV 131cv",type:"hibrido",power_cv:131,power_kw:96,priceRange:[28000,35000],consumption:{city:5.5,highway:6.0,real:5.7}}
    ]});
  addModel("Honda","Jazz",{segment:"pequeño",priceFrom:26000,
    versions:[
      {name:"1.5 e:HEV 109cv",type:"hibrido",power_cv:109,power_kw:80,priceRange:[26000,31000],consumption:{city:4.8,highway:5.5,real:5.1}}
    ]});
  addModel("Honda","e:Ny1",{segment:"suv",priceFrom:45000,
    versions:[
      {name:"e:Ny1 204cv",type:"ev",power_cv:204,power_kw:150,battery_kwh:68.8,priceRange:[45000,51000],consumption:{city:16.0,highway:19.8,real:18.2,range:410}}
    ]});
  addModel("Honda","ZR-V",{segment:"suv",priceFrom:35000,
    versions:[
      {name:"2.0 e:HEV 184cv",type:"hibrido",power_cv:184,power_kw:135,priceRange:[35000,42000],consumption:{city:5.8,highway:6.2,real:6.0}}
    ]});

  // ======================================================================
  // NISSAN — adicionales
  // ======================================================================
  addModel("Nissan","Micra",{segment:"pequeño",priceFrom:16000,
    versions:[
      {name:"1.0 IG-T 92cv",type:"gasolina",power_cv:92,power_kw:68,priceRange:[16000,21000],consumption:{city:5.8,highway:4.5,real:5.3}},
      {name:"1.0 IG-T 117cv",type:"gasolina",power_cv:117,power_kw:86,priceRange:[20000,25000],consumption:{city:6.0,highway:4.7,real:5.5}}
    ]});
  addModel("Nissan","Townstar",{segment:"mediano",priceFrom:28000,
    versions:[
      {name:"1.3 TCe 130cv",type:"gasolina",power_cv:130,power_kw:96,priceRange:[28000,34000],consumption:{city:7.2,highway:5.6,real:6.6}},
      {name:"Townstar EV 122cv",type:"ev",power_cv:122,power_kw:90,battery_kwh:45,priceRange:[38000,43000],consumption:{city:14.5,highway:18.0,real:16.5,range:275}}
    ]});
  addModel("Nissan","Navara",{segment:"suv",priceFrom:36000,
    versions:[
      {name:"2.3 dCi 160cv 4WD",type:"diesel",power_cv:160,power_kw:118,priceRange:[36000,44000],consumption:{city:9.5,highway:7.2,real:8.5}}
    ]});

  // ======================================================================
  // MAZDA — modelos adicionales
  // ======================================================================
  addModel("Mazda","CX-60",{segment:"suv",priceFrom:45000,
    versions:[
      {name:"3.3 e-Skyactiv D 200cv MHEV",type:"hibrido",power_cv:200,power_kw:147,priceRange:[45000,55000],consumption:{city:6.8,highway:5.5,real:6.3}},
      {name:"2.5 e-Skyactiv PHEV 327cv AWD",type:"phev",power_cv:327,power_kw:240,battery_kwh:17.8,priceRange:[55000,66000],consumption:{city:2.0,highway:7.2,electric_range:60,real:2.8,electric_kwh:20}}
    ]});
  addModel("Mazda","CX-80",{segment:"suv",priceFrom:58000,
    versions:[
      {name:"3.3 e-Skyactiv D 254cv AWD",type:"hibrido",power_cv:254,power_kw:187,priceRange:[58000,70000],consumption:{city:7.5,highway:6.0,real:6.9}},
      {name:"2.5 e-Skyactiv PHEV 327cv AWD",type:"phev",power_cv:327,power_kw:240,battery_kwh:17.8,priceRange:[65000,78000],consumption:{city:2.2,highway:7.5,electric_range:50,real:3.0,electric_kwh:21}}
    ]});
  addModel("Mazda","MX-30",{segment:"suv",priceFrom:33000,
    versions:[
      {name:"MX-30 143cv BEV",type:"ev",power_cv:143,power_kw:105,battery_kwh:35.5,priceRange:[33000,38000],consumption:{city:15.0,highway:18.5,real:17.0,range:200}},
      {name:"MX-30 R-EV PHEV 170cv",type:"phev",power_cv:170,power_kw:125,battery_kwh:17.8,priceRange:[42000,48000],consumption:{city:1.4,highway:5.5,electric_range:85,real:2.0,electric_kwh:15}}
    ]});
  addModel("Mazda","CX-3",{segment:"suv",priceFrom:22000,
    versions:[
      {name:"2.0 Skyactiv-G 121cv",type:"gasolina",power_cv:121,power_kw:89,priceRange:[22000,27000],consumption:{city:6.8,highway:5.2,real:6.2}}
    ]});

  // ======================================================================
  // CUPRA — versiones adicionales
  // ======================================================================
  addModel("CUPRA","Born",{segment:"pequeño",priceFrom:35000,
    versions:[
      {name:"Born 170cv 58kWh",type:"ev",power_cv:170,power_kw:125,battery_kwh:58,priceRange:[35000,40000],consumption:{city:15.5,highway:19.5,real:17.8,range:360}},
      {name:"Born 231cv 77kWh",type:"ev",power_cv:231,power_kw:170,battery_kwh:77,priceRange:[42000,48000],consumption:{city:16.5,highway:20.5,real:18.8,range:490}}
    ]});
  addModel("CUPRA","Tavascan",{segment:"suv",priceFrom:45000,
    versions:[
      {name:"Tavascan 286cv AWD",type:"ev",power_cv:286,power_kw:210,battery_kwh:77,priceRange:[45000,53000],consumption:{city:17.5,highway:21.5,real:19.8,range:450}},
      {name:"Tavascan VZ 340cv AWD",type:"ev",power_cv:340,power_kw:250,battery_kwh:77,priceRange:[53000,61000],consumption:{city:18.5,highway:22.5,real:20.8,range:430}}
    ]});
  addModel("CUPRA","Terramar",{segment:"suv",priceFrom:35000,
    versions:[
      {name:"1.5 eTSI MHEV 150cv",type:"hibrido",power_cv:150,power_kw:110,priceRange:[35000,42000],consumption:{city:6.5,highway:5.0,real:5.9}},
      {name:"1.5 eTSI MHEV 204cv",type:"hibrido",power_cv:204,power_kw:150,priceRange:[39000,46000],consumption:{city:7.0,highway:5.4,real:6.4}},
      {name:"1.5 PHEV 272cv",type:"phev",power_cv:272,power_kw:200,battery_kwh:19.7,priceRange:[50000,57000],consumption:{city:1.8,highway:6.2,electric_range:90,real:2.5,electric_kwh:16}}
    ]});

  // ======================================================================
  // DACIA — Bigster nuevo 2025
  // ======================================================================
  addModel("Dacia","Bigster",{segment:"suv",priceFrom:28000,
    versions:[
      {name:"1.2 TCe 130cv MHEV",type:"hibrido",power_cv:130,power_kw:96,priceRange:[28000,35000],consumption:{city:6.5,highway:5.0,real:5.9}},
      {name:"1.8 HEV 140cv",type:"hibrido",power_cv:140,power_kw:103,priceRange:[31000,38000],consumption:{city:5.5,highway:6.0,real:5.7}}
    ]});

  // ======================================================================
  // SUBARU — versiones actualizadas
  // ======================================================================
  addModel("Subaru","Forester",{segment:"suv",priceFrom:35000,
    versions:[
      {name:"2.0i e-Boxer HEV 150cv AWD",type:"hibrido",power_cv:150,power_kw:110,priceRange:[35000,42000],consumption:{city:7.5,highway:6.2,real:7.0}}
    ]});
  addModel("Subaru","Crosstrek",{segment:"suv",priceFrom:30000,
    versions:[
      {name:"2.0i e-Boxer HEV 150cv AWD",type:"hibrido",power_cv:150,power_kw:110,priceRange:[30000,37000],consumption:{city:7.2,highway:5.8,real:6.7}}
    ]});
  addModel("Subaru","Outback",{segment:"suv",priceFrom:42000,
    versions:[
      {name:"2.5i e-Boxer HEV 169cv AWD",type:"hibrido",power_cv:169,power_kw:124,priceRange:[44000,51000],consumption:{city:8.8,highway:7.0,real:8.1}}
    ]});
  addModel("Subaru","Solterra",{segment:"suv",priceFrom:50000,
    versions:[
      {name:"Solterra 218cv AWD",type:"ev",power_cv:218,power_kw:160,battery_kwh:71.4,priceRange:[50000,58000],consumption:{city:17.5,highway:21.5,real:19.8,range:380}}
    ]});
  addModel("Subaru","BRZ",{segment:"deportivo",priceFrom:36000,
    versions:[
      {name:"2.4 NA 234cv",type:"gasolina",power_cv:234,power_kw:172,priceRange:[36000,41000],consumption:{city:10.5,highway:8.0,real:9.5}}
    ]});

  // ======================================================================
  // MG — adicionales
  // ======================================================================
  addModel("MG","Cyberster",{segment:"deportivo",priceFrom:54990,
    versions:[
      {name:"Cyberster AWD 510cv",type:"ev",power_cv:510,power_kw:375,battery_kwh:77,priceRange:[54990,63000],consumption:{city:20.5,highway:24.5,real:22.8,range:440}}
    ]});
  addModel("MG","Marvel R",{segment:"suv",priceFrom:44990,
    versions:[
      {name:"Marvel R AWD 288cv",type:"ev",power_cv:288,power_kw:212,battery_kwh:70,priceRange:[44990,52000],consumption:{city:17.5,highway:21.5,real:19.8,range:400}}
    ]});

  // ======================================================================
  // ALFA ROMEO — Junior (nuevo 2024)
  // ======================================================================
  addModel("Alfa Romeo","Junior",{segment:"suv",priceFrom:29000,
    versions:[
      {name:"1.2 Turbo 136cv MHEV",type:"hibrido",power_cv:136,power_kw:100,priceRange:[29000,36000],consumption:{city:6.8,highway:5.2,real:6.2}},
      {name:"Junior Elettrica 156cv",type:"ev",power_cv:156,power_kw:115,battery_kwh:54,priceRange:[38000,45000],consumption:{city:15.5,highway:19.2,real:17.5,range:370}},
      {name:"Junior Veloce 240cv AWD",type:"ev",power_cv:240,power_kw:176,battery_kwh:54,priceRange:[46000,53000],consumption:{city:17.5,highway:21.5,real:19.8,range:340}}
    ]});

  // ======================================================================
  // LEAPMOTOR — modelos adicionales
  // ======================================================================
  addModel("Leapmotor","C10",{segment:"suv",priceFrom:32990,
    versions:[
      {name:"C10 BEV 170cv",type:"ev",power_cv:170,power_kw:125,battery_kwh:69.9,priceRange:[32990,39000],consumption:{city:15.5,highway:19.5,real:17.8,range:420}},
      {name:"C10 REEV Range Extender 180cv",type:"phev",power_cv:180,power_kw:132,battery_kwh:28.4,priceRange:[35990,42000],consumption:{city:1.6,highway:6.2,electric_range:120,real:2.3,electric_kwh:16}}
    ]});
  addModel("Leapmotor","T03",{segment:"pequeño",priceFrom:18990,
    versions:[
      {name:"T03 95cv",type:"ev",power_cv:95,power_kw:70,battery_kwh:37.3,priceRange:[18990,23000],consumption:{city:12.5,highway:16.0,real:14.5,range:265}}
    ]});

  // ======================================================================
  // DS — versiones adicionales
  // ======================================================================
  addModel("DS","DS 3",{segment:"pequeño",priceFrom:30000,
    versions:[
      {name:"1.2 PureTech 130cv",type:"gasolina",power_cv:130,power_kw:96,priceRange:[30000,37000],consumption:{city:7.0,highway:5.5,real:6.5}},
      {name:"E-Tense 136cv BEV",type:"ev",power_cv:136,power_kw:100,battery_kwh:54,priceRange:[40000,47000],consumption:{city:15.0,highway:18.5,real:17.0,range:400}}
    ]});
  addModel("DS","DS 4",{segment:"mediano",priceFrom:38000,
    versions:[
      {name:"1.2 PureTech 130cv",type:"gasolina",power_cv:130,power_kw:96,priceRange:[38000,46000],consumption:{city:7.2,highway:5.6,real:6.6}},
      {name:"1.5 BlueHDi 130cv",type:"diesel",power_cv:130,power_kw:96,priceRange:[38000,46000],consumption:{city:5.8,highway:4.6,real:5.4}},
      {name:"E-Tense 225cv PHEV",type:"phev",power_cv:225,power_kw:165,battery_kwh:12.4,priceRange:[52000,60000],consumption:{city:1.4,highway:5.5,electric_range:55,real:2.0,electric_kwh:16}}
    ]});
  addModel("DS","DS 7",{segment:"suv",priceFrom:45000,
    versions:[
      {name:"1.5 BlueHDi 130cv",type:"diesel",power_cv:130,power_kw:96,priceRange:[45000,53000],consumption:{city:6.0,highway:4.8,real:5.5}},
      {name:"E-Tense 4x4 300cv PHEV AWD",type:"phev",power_cv:300,power_kw:221,battery_kwh:14.2,priceRange:[65000,75000],consumption:{city:1.8,highway:6.5,electric_range:50,real:2.5,electric_kwh:18}}
    ]});

  // ======================================================================
  // Actualizar brandModels con todos los modelos nuevos
  // ======================================================================
  const extraModels = {
    "Ebro": ["S300","S700"],
    "Suzuki": ["Swift","Vitara","S-Cross","Ignis","Jimny","Swace","Across","Baleno"],
    "Smart": ["#1","#3","#5"],
    "SsangYong": ["Tivoli","Korando","Rexton","Musso"],
    "Infiniti": ["Q50","QX50","QX55","Q60"],
    "Isuzu": ["D-Max","MU-X"],
    "ORA": ["Funky Cat","03"],
    "Maxus": ["Mifa 9","Euniq 6","T90","Deliver 9"],
    "Aiways": ["U5","U6"],
    "Seres": ["3","5","7"],
    "Lynk & Co": ["01","02","03","05","08"],
    "Omoda": ["5","9","E5"],
    "Jaecoo": ["7","8"],
    "Leapmotor": ["C10","T03"],
    "Ford": ["Fiesta","Focus","Ranger","Explorer","Mustang","Bronco","Tourneo Connect","Tourneo Courier","Tourneo Custom"],
    "Toyota": ["Urban Cruiser","Camry","Corolla Cross","C-HR+","Land Cruiser","Proace","Hilux"],
    "Renault": ["Zoe","Twingo","Rafale","Symbioz","Espace","Kangoo","Master"],
    "Opel": ["Combo","Zafira Life","Vivaro"],
    "Peugeot": ["408","5008","508","Traveller","Rifter"],
    "SEAT": ["Leon","Tarraco","Alhambra","Mii","Toledo","Cordoba"],
    "Kia": ["Carens","Rio","EV3","Stonic","XCeed","Carnival","Proceed"],
    "Hyundai": ["i10","Bayon","Santa Fe","Ioniq 7","Staria"],
    "Honda": ["Civic","CR-V","HR-V","Jazz","e:Ny1","ZR-V"],
    "Nissan": ["Micra","Townstar","Navara"],
    "Mazda": ["CX-60","CX-80","MX-30","CX-3","MX-5"],
    "CUPRA": ["Born","Tavascan","Terramar","Ateca","Formentor"],
    "Dacia": ["Bigster","Sandero","Duster","Jogger","Spring","Logan"],
    "Subaru": ["Forester","Crosstrek","Outback","Solterra","BRZ","Impreza"],
    "MG": ["3","MG3","MG4","MG5","HS","ZS","ZS EV","Marvel R","Cyberster","EHS","HS PHEV"],
    "Alfa Romeo": ["Junior","Giulia","Stelvio","Tonale","Giulietta"],
    "DS": ["DS 3","DS 4","DS 7","DS 9"]
  };

  window.BRAND_MODELS_ES = window.BRAND_MODELS_ES || {};
  for(const brand in extraModels){
    if(!window.BRAND_MODELS_ES[brand]) window.BRAND_MODELS_ES[brand] = [];
    const s = new Set(window.BRAND_MODELS_ES[brand]);
    for(const m of extraModels[brand]) s.add(m);
    window.BRAND_MODELS_ES[brand] = Array.from(s).sort();
  }

  // Logging
  try{
    const b = Object.keys(window.CAR_DB).length;
    const m = Object.values(window.CAR_DB).reduce((s,x)=>s+Object.keys(x.models||{}).length,0);
    const v = Object.values(window.CAR_DB).reduce((s,x)=>s+Object.values(x.models||{}).reduce((s2,md)=>s2+((md.versions||[]).length),0),0);
    console.log("FairCar DB patch v2 aplicado — "+b+" marcas · "+m+" modelos · "+v+" versiones");
  }catch(e){}

})();
