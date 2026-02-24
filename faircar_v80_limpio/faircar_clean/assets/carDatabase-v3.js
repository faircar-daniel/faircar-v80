/* ============================================================
   FairCar v3 — carDatabase.js
   Todas las marcas disponibles en España 2024-2025
   Versiones con motor, CV, kW, batería, consumo y precio
   ============================================================ */
window.CAR_DB = {

"Audi": {
  brand_info:{ reliability_avg:3.5, parts_cost:"high", maintenance_cost_factor:1.30 },
  models:{
    "A1":{ segment:"pequeño", reliability:{score:3.8,common_issues:["Electrónica","Suspensión"],avg_repair_cost:450}, depreciation:{year1:0.18,year3:0.35,year5:0.48}, maintenance_yearly:520,
      versions:[
        {name:"30 TFSI 110cv",type:"gasolina",displacement:"1.0",power_cv:110,power_kw:81,priceRange:[25000,27500],consumption:{city:6.2,highway:4.8,real:5.8}},
        {name:"35 TFSI 150cv",type:"gasolina",displacement:"1.5",power_cv:150,power_kw:110,priceRange:[27500,32000],consumption:{city:6.8,highway:5.2,real:6.2}}]},
    "A3":{ segment:"mediano", reliability:{score:3.7,common_issues:["Turbo","DSG"],avg_repair_cost:580}, depreciation:{year1:0.17,year3:0.34,year5:0.47}, maintenance_yearly:580,
      versions:[
        {name:"30 TFSI 110cv",type:"gasolina",displacement:"1.0",power_cv:110,power_kw:81,priceRange:[30000,33000],consumption:{city:6.2,highway:4.8,real:5.8}},
        {name:"35 TFSI 150cv MHEV",type:"hibrido",displacement:"1.5",power_cv:150,power_kw:110,priceRange:[35000,40000],consumption:{city:5.2,highway:4.6,real:5.1}},
        {name:"35 TDI 150cv",type:"diesel",displacement:"2.0",power_cv:150,power_kw:110,priceRange:[33000,37000],consumption:{city:5.2,highway:4.2,real:4.9}},
        {name:"45 TFSIe 245cv PHEV",type:"phev",displacement:"1.4",power_cv:245,power_kw:180,battery_kwh:12.1,priceRange:[40000,45000],consumption:{city:1.6,highway:5.8,electric_range:52,real:2.2,electric_kwh:17}},
        {name:"40 e-tron 204cv",type:"ev",displacement:null,power_cv:204,power_kw:150,battery_kwh:38.5,priceRange:[42000,47000],consumption:{city:15.5,highway:19.0,real:17.5,range:270}}]},
    "A4":{ segment:"mediano", reliability:{score:3.6,common_issues:["DSG","Electrónica"],avg_repair_cost:620}, depreciation:{year1:0.17,year3:0.33,year5:0.46}, maintenance_yearly:620,
      versions:[
        {name:"35 TFSI 150cv",type:"gasolina",displacement:"2.0",power_cv:150,power_kw:110,priceRange:[40000,44000],consumption:{city:7.0,highway:5.3,real:6.4}},
        {name:"40 TFSI 204cv",type:"gasolina",displacement:"2.0",power_cv:204,power_kw:150,priceRange:[44000,49000],consumption:{city:7.5,highway:5.7,real:6.8}},
        {name:"35 TDI 163cv",type:"diesel",displacement:"2.0",power_cv:163,power_kw:120,priceRange:[41000,46000],consumption:{city:5.4,highway:4.3,real:5.0}},
        {name:"40 TDI 204cv",type:"diesel",displacement:"2.0",power_cv:204,power_kw:150,priceRange:[46000,52000],consumption:{city:5.8,highway:4.6,real:5.3}}]},
    "Q3":{ segment:"suv", reliability:{score:3.6,common_issues:["DSG","Electrónica"],avg_repair_cost:650}, depreciation:{year1:0.16,year3:0.32,year5:0.45}, maintenance_yearly:620,
      versions:[
        {name:"35 TFSI 150cv",type:"gasolina",displacement:"1.5",power_cv:150,power_kw:110,priceRange:[35000,39000],consumption:{city:7.8,highway:5.9,real:7.1}},
        {name:"35 TDI 150cv",type:"diesel",displacement:"2.0",power_cv:150,power_kw:110,priceRange:[36000,41000],consumption:{city:6.0,highway:4.7,real:5.5}},
        {name:"45 TFSIe 245cv PHEV",type:"phev",displacement:"1.4",power_cv:245,power_kw:180,battery_kwh:13.0,priceRange:[44000,50000],consumption:{city:2.1,highway:6.5,electric_range:45,real:2.8,electric_kwh:19}}]},
    "Q4 e-tron":{ segment:"suv", reliability:{score:4.0,common_issues:["Software"],avg_repair_cost:380}, depreciation:{year1:0.22,year3:0.38,year5:0.52}, maintenance_yearly:280,
      versions:[
        {name:"35 e-tron 170cv RWD",type:"ev",displacement:null,power_cv:170,power_kw:125,battery_kwh:55,priceRange:[42000,46000],consumption:{city:15.8,highway:19.5,real:18.0,range:340}},
        {name:"40 e-tron 204cv RWD",type:"ev",displacement:null,power_cv:204,power_kw:150,battery_kwh:82,priceRange:[48000,53000],consumption:{city:16.5,highway:20.5,real:18.8,range:520}},
        {name:"50 e-tron 299cv AWD",type:"ev",displacement:null,power_cv:299,power_kw:220,battery_kwh:82,priceRange:[56000,63000],consumption:{city:18.5,highway:22.8,real:21.0,range:490}}]},
    "Q5":{ segment:"suv", reliability:{score:3.5,common_issues:["Turbo","DSG"],avg_repair_cost:720}, depreciation:{year1:0.16,year3:0.32,year5:0.45}, maintenance_yearly:720,
      versions:[
        {name:"35 TFSI 150cv",type:"gasolina",displacement:"2.0",power_cv:150,power_kw:110,priceRange:[55000,60000],consumption:{city:8.5,highway:6.5,real:7.7}},
        {name:"40 TDI 204cv",type:"diesel",displacement:"2.0",power_cv:204,power_kw:150,priceRange:[56000,62000],consumption:{city:6.8,highway:5.4,real:6.3}},
        {name:"55 TFSIe 367cv PHEV",type:"phev",displacement:"2.0",power_cv:367,power_kw:270,battery_kwh:17.9,priceRange:[65000,72000],consumption:{city:2.2,highway:6.8,electric_range:42,real:3.0,electric_kwh:20}}]},
    "e-tron GT":{ segment:"deportivo", reliability:{score:3.8,common_issues:["Electrónica"],avg_repair_cost:850}, depreciation:{year1:0.20,year3:0.35,year5:0.48}, maintenance_yearly:520,
      versions:[
        {name:"e-tron GT 476cv",type:"ev",displacement:null,power_cv:476,power_kw:350,battery_kwh:93.4,priceRange:[105000,120000],consumption:{city:20.8,highway:24.2,real:22.8,range:425}},
        {name:"RS e-tron GT 590cv",type:"ev",displacement:null,power_cv:590,power_kw:434,battery_kwh:93.4,priceRange:[130000,148000],consumption:{city:22.0,highway:26.0,real:24.2,range:400}}]}
  }
},

"BMW": {
  brand_info:{ reliability_avg:3.4, parts_cost:"high", maintenance_cost_factor:1.40 },
  models:{
    "Serie 1":{ segment:"pequeño", reliability:{score:3.5,common_issues:["Motor","Electrónica"],avg_repair_cost:620}, depreciation:{year1:0.19,year3:0.36,year5:0.49}, maintenance_yearly:650,
      versions:[
        {name:"116i 109cv",type:"gasolina",displacement:"1.5",power_cv:109,power_kw:80,priceRange:[30000,33000],consumption:{city:6.5,highway:5.0,real:5.9}},
        {name:"120i 170cv",type:"gasolina",displacement:"2.0",power_cv:170,power_kw:125,priceRange:[34000,38000],consumption:{city:7.0,highway:5.3,real:6.4}},
        {name:"118d 150cv",type:"diesel",displacement:"2.0",power_cv:150,power_kw:110,priceRange:[32000,36000],consumption:{city:5.2,highway:4.2,real:4.8}}]},
    "Serie 3":{ segment:"mediano", reliability:{score:3.6,common_issues:["Turbo","Suspensión"],avg_repair_cost:720}, depreciation:{year1:0.17,year3:0.33,year5:0.46}, maintenance_yearly:720,
      versions:[
        {name:"318i 156cv",type:"gasolina",displacement:"2.0",power_cv:156,power_kw:115,priceRange:[45000,49000],consumption:{city:7.0,highway:5.3,real:6.4}},
        {name:"320i 184cv",type:"gasolina",displacement:"2.0",power_cv:184,power_kw:135,priceRange:[48000,53000],consumption:{city:7.5,highway:5.6,real:6.8}},
        {name:"320d 163cv",type:"diesel",displacement:"2.0",power_cv:163,power_kw:120,priceRange:[47000,52000],consumption:{city:5.5,highway:4.4,real:5.1}},
        {name:"330e 292cv PHEV",type:"phev",displacement:"2.0",power_cv:292,power_kw:215,battery_kwh:17.9,priceRange:[56000,62000],consumption:{city:1.8,highway:6.2,electric_range:55,real:2.5,electric_kwh:18}}]},
    "Serie 5":{ segment:"mediano", reliability:{score:3.5,common_issues:["Suspensión","Electrónica"],avg_repair_cost:820}, depreciation:{year1:0.17,year3:0.33,year5:0.46}, maintenance_yearly:820,
      versions:[
        {name:"520i 208cv",type:"gasolina",displacement:"2.0",power_cv:208,power_kw:153,priceRange:[60000,66000],consumption:{city:8.5,highway:6.5,real:7.7}},
        {name:"520d 197cv",type:"diesel",displacement:"2.0",power_cv:197,power_kw:145,priceRange:[62000,68000],consumption:{city:6.5,highway:5.2,real:6.0}},
        {name:"530e 299cv PHEV",type:"phev",displacement:"2.0",power_cv:299,power_kw:220,battery_kwh:21.6,priceRange:[72000,80000],consumption:{city:2.0,highway:6.8,electric_range:60,real:2.7,electric_kwh:19}},
        {name:"i5 eDrive40 340cv",type:"ev",displacement:null,power_cv:340,power_kw:250,battery_kwh:81.2,priceRange:[76000,84000],consumption:{city:17.5,highway:21.5,real:19.8,range:450}}]},
    "X1":{ segment:"suv", reliability:{score:3.6,common_issues:["DSG","Electrónica"],avg_repair_cost:680}, depreciation:{year1:0.17,year3:0.33,year5:0.46}, maintenance_yearly:680,
      versions:[
        {name:"sDrive18i 136cv",type:"gasolina",displacement:"1.5",power_cv:136,power_kw:100,priceRange:[40000,44000],consumption:{city:7.5,highway:5.7,real:6.8}},
        {name:"sDrive18d 150cv",type:"diesel",displacement:"2.0",power_cv:150,power_kw:110,priceRange:[41000,46000],consumption:{city:6.0,highway:4.8,real:5.5}},
        {name:"xDrive25e 245cv PHEV",type:"phev",displacement:"1.5",power_cv:245,power_kw:180,battery_kwh:14.2,priceRange:[50000,56000],consumption:{city:1.9,highway:6.4,electric_range:60,real:2.6,electric_kwh:19}},
        {name:"iX1 eDrive20 204cv",type:"ev",displacement:null,power_cv:204,power_kw:150,battery_kwh:64.7,priceRange:[51000,57000],consumption:{city:16.5,highway:20.0,real:18.5,range:380}}]},
    "X3":{ segment:"suv", reliability:{score:3.5,common_issues:["Turbo","Electrónica"],avg_repair_cost:780}, depreciation:{year1:0.17,year3:0.33,year5:0.46}, maintenance_yearly:780,
      versions:[
        {name:"sDrive20i 184cv",type:"gasolina",displacement:"2.0",power_cv:184,power_kw:135,priceRange:[55000,60000],consumption:{city:9.0,highway:6.8,real:8.1}},
        {name:"xDrive20d 190cv",type:"diesel",displacement:"2.0",power_cv:190,power_kw:140,priceRange:[57000,62000],consumption:{city:7.0,highway:5.5,real:6.4}},
        {name:"xDrive30e 292cv PHEV",type:"phev",displacement:"2.0",power_cv:292,power_kw:215,battery_kwh:17.7,priceRange:[68000,75000],consumption:{city:2.2,highway:6.9,electric_range:50,real:3.0,electric_kwh:20}}]},
    "iX":{ segment:"suv", reliability:{score:3.9,common_issues:["Software"],avg_repair_cost:580}, depreciation:{year1:0.21,year3:0.37,year5:0.51}, maintenance_yearly:420,
      versions:[
        {name:"xDrive40 326cv",type:"ev",displacement:null,power_cv:326,power_kw:240,battery_kwh:76.6,priceRange:[84000,90000],consumption:{city:18.5,highway:22.8,real:21.0,range:370}},
        {name:"xDrive50 523cv",type:"ev",displacement:null,power_cv:523,power_kw:385,battery_kwh:111.5,priceRange:[100000,115000],consumption:{city:19.2,highway:23.8,real:21.8,range:510}}]},
    "i4":{ segment:"mediano", reliability:{score:4.0,common_issues:["Carga","Software"],avg_repair_cost:420}, depreciation:{year1:0.20,year3:0.36,year5:0.50}, maintenance_yearly:350,
      versions:[
        {name:"eDrive40 340cv",type:"ev",displacement:null,power_cv:340,power_kw:250,battery_kwh:83.9,priceRange:[63000,69000],consumption:{city:16.8,highway:20.5,real:18.9,range:470}},
        {name:"M50 544cv AWD",type:"ev",displacement:null,power_cv:544,power_kw:400,battery_kwh:83.9,priceRange:[84000,90000],consumption:{city:20.5,highway:25.5,real:23.2,range:400}}]},
    "M3":{ segment:"deportivo", reliability:{score:3.5,common_issues:["Motor S58","Frenos"],avg_repair_cost:950}, depreciation:{year1:0.14,year3:0.27,year5:0.39}, maintenance_yearly:950,
      versions:[
        {name:"Competition 530cv",type:"gasolina",displacement:"3.0",power_cv:530,power_kw:390,priceRange:[92000,100000],consumption:{city:14.0,highway:10.5,real:12.6}}]}
  }
},

"Mercedes-Benz": {
  brand_info:{ reliability_avg:3.6, parts_cost:"high", maintenance_cost_factor:1.35 },
  models:{
    "Clase A":{ segment:"pequeño", reliability:{score:3.7,common_issues:["DCT","Electrónica"],avg_repair_cost:580}, depreciation:{year1:0.18,year3:0.34,year5:0.47}, maintenance_yearly:620,
      versions:[
        {name:"A 180 136cv",type:"gasolina",displacement:"1.3",power_cv:136,power_kw:100,priceRange:[32000,35000],consumption:{city:6.2,highway:4.8,real:5.7}},
        {name:"A 200 163cv",type:"gasolina",displacement:"1.3",power_cv:163,power_kw:120,priceRange:[35000,39000],consumption:{city:6.5,highway:4.9,real:5.9}},
        {name:"A 180 d 116cv",type:"diesel",displacement:"1.5",power_cv:116,power_kw:85,priceRange:[33000,36000],consumption:{city:4.8,highway:3.9,real:4.5}},
        {name:"A 250 e 218cv PHEV",type:"phev",displacement:"1.3",power_cv:218,power_kw:160,battery_kwh:15.6,priceRange:[43000,48000],consumption:{city:1.4,highway:5.5,electric_range:48,real:2.0,electric_kwh:16}}]},
    "Clase C":{ segment:"mediano", reliability:{score:3.8,common_issues:["Suspensión","Electrónica"],avg_repair_cost:680}, depreciation:{year1:0.16,year3:0.32,year5:0.45}, maintenance_yearly:680,
      versions:[
        {name:"C 200 204cv",type:"gasolina",displacement:"1.5",power_cv:204,power_kw:150,priceRange:[48000,53000],consumption:{city:7.2,highway:5.4,real:6.5}},
        {name:"C 220 d 197cv",type:"diesel",displacement:"2.0",power_cv:197,power_kw:145,priceRange:[47000,52000],consumption:{city:5.5,highway:4.4,real:5.1}},
        {name:"C 300 e 313cv PHEV",type:"phev",displacement:"2.0",power_cv:313,power_kw:230,battery_kwh:25.4,priceRange:[58000,65000],consumption:{city:1.7,highway:6.0,electric_range:52,real:2.4,electric_kwh:17}}]},
    "GLA":{ segment:"suv", reliability:{score:3.7,common_issues:["DCT","Electrónica"],avg_repair_cost:640}, depreciation:{year1:0.17,year3:0.33,year5:0.46}, maintenance_yearly:660,
      versions:[
        {name:"GLA 180 136cv",type:"gasolina",displacement:"1.3",power_cv:136,power_kw:100,priceRange:[38000,42000],consumption:{city:7.5,highway:5.7,real:6.8}},
        {name:"GLA 200 d 150cv",type:"diesel",displacement:"2.0",power_cv:150,power_kw:110,priceRange:[40000,44000],consumption:{city:5.8,highway:4.6,real:5.3}},
        {name:"GLA 250 e PHEV 218cv",type:"phev",displacement:"1.3",power_cv:218,power_kw:160,battery_kwh:15.6,priceRange:[48000,53000],consumption:{city:1.7,highway:6.0,electric_range:52,real:2.3,electric_kwh:18}}]},
    "GLC":{ segment:"suv", reliability:{score:3.6,common_issues:["Electrónica","Air Matic"],avg_repair_cost:780}, depreciation:{year1:0.16,year3:0.32,year5:0.45}, maintenance_yearly:780,
      versions:[
        {name:"GLC 200 204cv",type:"gasolina",displacement:"2.0",power_cv:204,power_kw:150,priceRange:[55000,61000],consumption:{city:9.0,highway:6.8,real:8.1}},
        {name:"GLC 220 d 197cv",type:"diesel",displacement:"2.0",power_cv:197,power_kw:145,priceRange:[57000,63000],consumption:{city:6.8,highway:5.5,real:6.3}},
        {name:"GLC 300 e PHEV 313cv",type:"phev",displacement:"2.0",power_cv:313,power_kw:230,battery_kwh:31.2,priceRange:[68000,76000],consumption:{city:2.2,highway:6.9,electric_range:55,real:3.0,electric_kwh:21}}]},
    "EQA":{ segment:"suv", reliability:{score:3.9,common_issues:["Software"],avg_repair_cost:420}, depreciation:{year1:0.21,year3:0.37,year5:0.51}, maintenance_yearly:320,
      versions:[
        {name:"EQA 250 190cv",type:"ev",displacement:null,power_cv:190,power_kw:140,battery_kwh:66.5,priceRange:[48000,52000],consumption:{city:16.5,highway:20.2,real:18.6,range:380}},
        {name:"EQA 300 4M 228cv",type:"ev",displacement:null,power_cv:228,power_kw:168,battery_kwh:66.5,priceRange:[55000,60000],consumption:{city:18.0,highway:22.0,real:20.2,range:350}}]},
    "EQS":{ segment:"mediano", reliability:{score:4.0,common_issues:["Software"],avg_repair_cost:580}, depreciation:{year1:0.19,year3:0.34,year5:0.47}, maintenance_yearly:480,
      versions:[
        {name:"EQS 450+ 333cv",type:"ev",displacement:null,power_cv:333,power_kw:245,battery_kwh:107.8,priceRange:[109000,120000],consumption:{city:16.2,highway:19.8,real:18.2,range:650}},
        {name:"EQS 580 4M 523cv",type:"ev",displacement:null,power_cv:523,power_kw:385,battery_kwh:107.8,priceRange:[130000,148000],consumption:{city:18.0,highway:22.0,real:20.2,range:580}}]}
  }
},

"Volkswagen": {
  brand_info:{ reliability_avg:3.8, parts_cost:"medium", maintenance_cost_factor:1.00 },
  models:{
    "Polo":{ segment:"pequeño", reliability:{score:4.0,common_issues:["DSG (algunos)","Embrague"],avg_repair_cost:380}, depreciation:{year1:0.16,year3:0.32,year5:0.44}, maintenance_yearly:420,
      versions:[
        {name:"1.0 MPI 80cv",type:"gasolina",displacement:"1.0",power_cv:80,power_kw:59,priceRange:[18000,20000],consumption:{city:5.5,highway:4.2,real:5.0}},
        {name:"1.0 TSI 95cv",type:"gasolina",displacement:"1.0",power_cv:95,power_kw:70,priceRange:[20000,22500],consumption:{city:5.7,highway:4.4,real:5.2}},
        {name:"1.0 TSI 110cv",type:"gasolina",displacement:"1.0",power_cv:110,power_kw:81,priceRange:[22000,25000],consumption:{city:5.8,highway:4.5,real:5.3}}]},
    "Golf":{ segment:"mediano", reliability:{score:4.1,common_issues:["DSG","Electrónica"],avg_repair_cost:420}, depreciation:{year1:0.15,year3:0.30,year5:0.42}, maintenance_yearly:480,
      versions:[
        {name:"1.0 eTSI 110cv MHEV",type:"hibrido",displacement:"1.0",power_cv:110,power_kw:81,priceRange:[25000,28000],consumption:{city:5.8,highway:4.5,real:5.3}},
        {name:"1.5 eTSI 150cv MHEV",type:"hibrido",displacement:"1.5",power_cv:150,power_kw:110,priceRange:[29000,33000],consumption:{city:5.8,highway:4.4,real:5.3}},
        {name:"2.0 TDI 150cv",type:"diesel",displacement:"2.0",power_cv:150,power_kw:110,priceRange:[31000,35000],consumption:{city:5.0,highway:4.0,real:4.7}},
        {name:"eHybrid 204cv PHEV",type:"phev",displacement:"1.4",power_cv:204,power_kw:150,battery_kwh:19.7,priceRange:[36000,40000],consumption:{city:1.5,highway:5.5,electric_range:62,real:2.1,electric_kwh:16}},
        {name:"GTI 265cv",type:"gasolina",displacement:"2.0",power_cv:265,power_kw:195,priceRange:[38000,42000],consumption:{city:8.5,highway:6.3,real:7.6}},
        {name:"R 333cv",type:"gasolina",displacement:"2.0",power_cv:333,power_kw:245,priceRange:[50000,55000],consumption:{city:9.5,highway:7.0,real:8.5}}]},
    "T-Roc":{ segment:"suv", reliability:{score:3.9,common_issues:["DSG"],avg_repair_cost:450}, depreciation:{year1:0.17,year3:0.33,year5:0.46}, maintenance_yearly:520,
      versions:[
        {name:"1.0 TSI 110cv",type:"gasolina",displacement:"1.0",power_cv:110,power_kw:81,priceRange:[26000,29000],consumption:{city:6.8,highway:5.2,real:6.2}},
        {name:"1.5 TSI 150cv",type:"gasolina",displacement:"1.5",power_cv:150,power_kw:110,priceRange:[29000,33000],consumption:{city:7.2,highway:5.5,real:6.6}},
        {name:"2.0 TDI 115cv",type:"diesel",displacement:"2.0",power_cv:115,power_kw:85,priceRange:[27000,31000],consumption:{city:5.3,highway:4.2,real:4.9}}]},
    "Tiguan":{ segment:"suv", reliability:{score:3.8,common_issues:["DSG","Turbo"],avg_repair_cost:520}, depreciation:{year1:0.16,year3:0.31,year5:0.44}, maintenance_yearly:580,
      versions:[
        {name:"1.5 eTSI 150cv MHEV",type:"hibrido",displacement:"1.5",power_cv:150,power_kw:110,priceRange:[37000,41000],consumption:{city:7.8,highway:5.9,real:7.1}},
        {name:"2.0 TDI 150cv",type:"diesel",displacement:"2.0",power_cv:150,power_kw:110,priceRange:[38000,43000],consumption:{city:6.0,highway:4.8,real:5.5}},
        {name:"eHybrid 272cv PHEV",type:"phev",displacement:"1.4",power_cv:272,power_kw:200,battery_kwh:19.7,priceRange:[47000,52000],consumption:{city:2.0,highway:6.4,electric_range:50,real:2.7,electric_kwh:18}}]},
    "ID.3":{ segment:"mediano", reliability:{score:4.0,common_issues:["Software"],avg_repair_cost:320}, depreciation:{year1:0.20,year3:0.36,year5:0.50}, maintenance_yearly:250,
      versions:[
        {name:"Pure 150cv 58kWh",type:"ev",displacement:null,power_cv:150,power_kw:110,battery_kwh:58,priceRange:[38000,41000],consumption:{city:14.5,highway:17.8,real:16.4,range:350}},
        {name:"Pro 204cv 77kWh",type:"ev",displacement:null,power_cv:204,power_kw:150,battery_kwh:77,priceRange:[44000,48000],consumption:{city:15.5,highway:19.0,real:17.5,range:460}}]},
    "ID.4":{ segment:"suv", reliability:{score:3.9,common_issues:["Software","Carga"],avg_repair_cost:350}, depreciation:{year1:0.19,year3:0.35,year5:0.49}, maintenance_yearly:280,
      versions:[
        {name:"Pure 170cv RWD",type:"ev",displacement:null,power_cv:170,power_kw:125,battery_kwh:62,priceRange:[42000,46000],consumption:{city:16.2,highway:19.8,real:18.2,range:355}},
        {name:"Pro 204cv RWD",type:"ev",displacement:null,power_cv:204,power_kw:150,battery_kwh:82,priceRange:[48000,53000],consumption:{city:16.8,highway:20.5,real:18.9,range:520}},
        {name:"GTX 299cv AWD",type:"ev",displacement:null,power_cv:299,power_kw:220,battery_kwh:82,priceRange:[56000,62000],consumption:{city:18.5,highway:22.8,real:21.0,range:490}}]},
    "ID.7":{ segment:"mediano", reliability:{score:3.9,common_issues:["Software"],avg_repair_cost:380}, depreciation:{year1:0.19,year3:0.35,year5:0.49}, maintenance_yearly:300,
      versions:[
        {name:"Pro 286cv 77kWh",type:"ev",displacement:null,power_cv:286,power_kw:210,battery_kwh:77,priceRange:[55000,60000],consumption:{city:16.0,highway:19.5,real:18.0,range:480}},
        {name:"Pro S 286cv 91kWh",type:"ev",displacement:null,power_cv:286,power_kw:210,battery_kwh:91,priceRange:[62000,68000],consumption:{city:16.5,highway:20.0,real:18.5,range:590}}]}
  }
},

"SEAT": {
  brand_info:{ reliability_avg:3.7, parts_cost:"medium", maintenance_cost_factor:0.95 },
  models:{
    "Ibiza":{ segment:"pequeño", reliability:{score:3.9,common_issues:["DSG","Electrónica"],avg_repair_cost:360}, depreciation:{year1:0.17,year3:0.34,year5:0.46}, maintenance_yearly:400,
      versions:[
        {name:"1.0 MPI 80cv",type:"gasolina",displacement:"1.0",power_cv:80,power_kw:59,priceRange:[17000,19000],consumption:{city:5.5,highway:4.2,real:5.0}},
        {name:"1.0 TSI 95cv",type:"gasolina",displacement:"1.0",power_cv:95,power_kw:70,priceRange:[19000,21500],consumption:{city:5.8,highway:4.4,real:5.3}},
        {name:"1.0 TSI 110cv",type:"gasolina",displacement:"1.0",power_cv:110,power_kw:81,priceRange:[21000,24000],consumption:{city:6.0,highway:4.6,real:5.5}},
        {name:"FR 1.5 TSI 150cv",type:"gasolina",displacement:"1.5",power_cv:150,power_kw:110,priceRange:[23000,26500],consumption:{city:6.2,highway:4.8,real:5.7}}]},
    "León":{ segment:"mediano", reliability:{score:3.8,common_issues:["DSG","Turbo"],avg_repair_cost:410}, depreciation:{year1:0.18,year3:0.35,year5:0.48}, maintenance_yearly:460,
      versions:[
        {name:"1.0 eTSI 110cv MHEV",type:"hibrido",displacement:"1.0",power_cv:110,power_kw:81,priceRange:[23000,26000],consumption:{city:5.8,highway:4.5,real:5.3}},
        {name:"1.5 eTSI 150cv MHEV",type:"hibrido",displacement:"1.5",power_cv:150,power_kw:110,priceRange:[28000,32000],consumption:{city:5.8,highway:4.4,real:5.3}},
        {name:"2.0 TDI 115cv",type:"diesel",displacement:"2.0",power_cv:115,power_kw:85,priceRange:[27000,30000],consumption:{city:4.8,highway:3.9,real:4.5}},
        {name:"e-Hybrid 204cv PHEV",type:"phev",displacement:"1.4",power_cv:204,power_kw:150,battery_kwh:12.8,priceRange:[34000,38000],consumption:{city:1.6,highway:5.6,electric_range:58,real:2.2,electric_kwh:16}}]},
    "Arona":{ segment:"suv", reliability:{score:3.8,common_issues:["DSG"],avg_repair_cost:380}, depreciation:{year1:0.18,year3:0.35,year5:0.48}, maintenance_yearly:430,
      versions:[
        {name:"1.0 TSI 95cv",type:"gasolina",displacement:"1.0",power_cv:95,power_kw:70,priceRange:[20000,23000],consumption:{city:6.5,highway:5.0,real:5.9}},
        {name:"1.0 TSI 110cv",type:"gasolina",displacement:"1.0",power_cv:110,power_kw:81,priceRange:[22000,25500],consumption:{city:6.8,highway:5.2,real:6.2}}]},
    "Ateca":{ segment:"suv", reliability:{score:3.8,common_issues:["DSG","Suspensión"],avg_repair_cost:430}, depreciation:{year1:0.18,year3:0.34,year5:0.47}, maintenance_yearly:500,
      versions:[
        {name:"1.0 TSI 110cv",type:"gasolina",displacement:"1.0",power_cv:110,power_kw:81,priceRange:[27000,30000],consumption:{city:7.0,highway:5.3,real:6.4}},
        {name:"1.5 TSI 150cv",type:"gasolina",displacement:"1.5",power_cv:150,power_kw:110,priceRange:[29000,33500],consumption:{city:7.3,highway:5.5,real:6.6}},
        {name:"2.0 TDI 150cv",type:"diesel",displacement:"2.0",power_cv:150,power_kw:110,priceRange:[31000,36000],consumption:{city:5.6,highway:4.5,real:5.2}}]}
  }
},
"CUPRA": {
  brand_info:{ reliability_avg:3.7, parts_cost:"medium", maintenance_cost_factor:1.10 },
  models:{
    "Formentor":{ segment:"suv", reliability:{score:3.7,common_issues:["DSG","Turbo"],avg_repair_cost:520}, depreciation:{year1:0.18,year3:0.35,year5:0.48}, maintenance_yearly:580,
      versions:[
        {name:"1.5 TSI 150cv",type:"gasolina",displacement:"1.5",power_cv:150,power_kw:110,priceRange:[32000,36000],consumption:{city:7.5,highway:5.7,real:6.8}},
        {name:"2.0 TSI 265cv 4Drive",type:"gasolina",displacement:"2.0",power_cv:265,power_kw:195,priceRange:[44000,49000],consumption:{city:9.0,highway:6.8,real:8.1}},
        {name:"e-Hybrid 245cv PHEV",type:"phev",displacement:"1.4",power_cv:245,power_kw:180,battery_kwh:12.8,priceRange:[46000,52000],consumption:{city:1.9,highway:6.4,electric_range:55,real:2.6,electric_kwh:17}}]},
    "Born":{ segment:"mediano", reliability:{score:3.9,common_issues:["Software"],avg_repair_cost:330}, depreciation:{year1:0.20,year3:0.36,year5:0.50}, maintenance_yearly:270,
      versions:[
{name:"204cv 60kWh",type:"ev",displacement:null,power_cv:204,power_kw:150,battery_kwh:60,priceRange:[36610,36610],consumption:{city:14.1,highway:17.3,real:15.7,range:382}},
      {name:"231cv 60kWh",type:"ev",displacement:null,power_cv:231,power_kw:170,battery_kwh:60,priceRange:[37580,37580],consumption:{city:14.1,highway:17.3,real:15.7,range:382}},
      {name:"231cv 79kWh",type:"ev",displacement:null,power_cv:231,power_kw:170,battery_kwh:79,priceRange:[40240,40240],consumption:{city:14.4,highway:17.6,real:16.0,range:494}},
      {name:"VZ 326cv 79kWh",type:"ev",displacement:null,power_cv:326,power_kw:240,battery_kwh:79,priceRange:[42410,42410],consumption:{city:13.5,highway:16.5,real:15.0,range:526}}
    ]}
  }
},
"Škoda": {
  brand_info:{ reliability_avg:4.0, parts_cost:"medium", maintenance_cost_factor:0.90 },
  models:{
    "Fabia":{ segment:"pequeño", reliability:{score:4.2,common_issues:["DSG (pocos)"],avg_repair_cost:340}, depreciation:{year1:0.16,year3:0.31,year5:0.43}, maintenance_yearly:380,
      versions:[
        {name:"1.0 TSI 95cv",type:"gasolina",displacement:"1.0",power_cv:95,power_kw:70,priceRange:[18000,20500],consumption:{city:5.7,highway:4.4,real:5.2}},
        {name:"1.0 TSI 110cv",type:"gasolina",displacement:"1.0",power_cv:110,power_kw:81,priceRange:[20000,23000],consumption:{city:5.9,highway:4.5,real:5.4}},
        {name:"1.5 TSI 150cv",type:"gasolina",displacement:"1.5",power_cv:150,power_kw:110,priceRange:[23000,26000],consumption:{city:6.2,highway:4.8,real:5.7}}]},
    "Octavia":{ segment:"mediano", reliability:{score:4.2,common_issues:["DSG","Luces"],avg_repair_cost:390}, depreciation:{year1:0.15,year3:0.29,year5:0.41}, maintenance_yearly:440,
      versions:[
        {name:"1.5 TSI 150cv",type:"gasolina",displacement:"1.5",power_cv:150,power_kw:110,priceRange:[27000,31000],consumption:{city:6.2,highway:4.8,real:5.7}},
        {name:"2.0 TDI 115cv",type:"diesel",displacement:"2.0",power_cv:115,power_kw:85,priceRange:[26000,29500],consumption:{city:4.7,highway:3.8,real:4.4}},
        {name:"2.0 TDI 150cv",type:"diesel",displacement:"2.0",power_cv:150,power_kw:110,priceRange:[29000,33000],consumption:{city:4.8,highway:3.9,real:4.5}},
        {name:"iV 204cv PHEV",type:"phev",displacement:"1.4",power_cv:204,power_kw:150,battery_kwh:13,priceRange:[35000,40000],consumption:{city:1.5,highway:5.4,electric_range:60,real:2.0,electric_kwh:15}}]},
    "Karoq":{ segment:"suv", reliability:{score:4.0,common_issues:["DSG"],avg_repair_cost:430}, depreciation:{year1:0.17,year3:0.33,year5:0.46}, maintenance_yearly:490,
      versions:[
        {name:"1.0 TSI 110cv",type:"gasolina",displacement:"1.0",power_cv:110,power_kw:81,priceRange:[28000,32000],consumption:{city:7.2,highway:5.5,real:6.6}},
        {name:"1.5 TSI 150cv",type:"gasolina",displacement:"1.5",power_cv:150,power_kw:110,priceRange:[31000,36000],consumption:{city:7.5,highway:5.7,real:6.8}},
        {name:"2.0 TDI 115cv",type:"diesel",displacement:"2.0",power_cv:115,power_kw:85,priceRange:[29000,33000],consumption:{city:5.5,highway:4.4,real:5.1}}]},
    "Enyaq":{ segment:"suv", reliability:{score:4.0,common_issues:["Software"],avg_repair_cost:330}, depreciation:{year1:0.18,year3:0.34,year5:0.48}, maintenance_yearly:270,
      versions:[
        {name:"60 204cv",type:"ev",displacement:null,power_cv:204,power_kw:150,battery_kwh:62,priceRange:[42000,46000],consumption:{city:16.0,highway:19.5,real:18.0,range:390}},
        {name:"85 286cv",type:"ev",displacement:null,power_cv:286,power_kw:210,battery_kwh:82,priceRange:[48000,53000],consumption:{city:16.5,highway:20.0,real:18.5,range:430}},
        {name:"85x 299cv AWD",type:"ev",displacement:null,power_cv:299,power_kw:220,battery_kwh:82,priceRange:[54000,60000],consumption:{city:18.0,highway:22.0,real:20.2,range:405}}]},
    "Elroq":{segment:"suv",versions:[
      {name:"Elroq 50 170cv 52kWh",type:"ev",power_cv:170,power_kw:125,battery_kwh:52,priceRange:[34490,34490],consumption:{city:14.2,highway:17.4,real:15.8,range:374}},
      {name:"Elroq 60 204cv 59kWh",type:"ev",power_cv:204,power_kw:150,battery_kwh:59,priceRange:[37490,37490],consumption:{city:14.1,highway:17.3,real:15.7,range:403}},
      {name:"Elroq 85 286cv 77kWh",type:"ev",power_cv:286,power_kw:210,battery_kwh:77,priceRange:[42490,42490],consumption:{city:14.0,highway:17.1,real:15.5,range:578}}
    ]}
,
    "Superb":{ segment:"mediano", reliability:{score:4.1,common_issues:["DSG"],avg_repair_cost:450}, depreciation:{year1:0.15,year3:0.30,year5:0.42}, maintenance_yearly:500,
      versions:[
        {name:"1.5 TSI 150cv MHEV",type:"hibrido",displacement:"1.5",power_cv:150,power_kw:110,priceRange:[38000,42000],consumption:{city:6.8,highway:5.2,real:6.2}},
        {name:"2.0 TDI 150cv",type:"diesel",displacement:"2.0",power_cv:150,power_kw:110,priceRange:[38000,43000],consumption:{city:5.5,highway:4.4,real:5.1}},
        {name:"iV 204cv PHEV",type:"phev",displacement:"1.5",power_cv:204,power_kw:150,battery_kwh:25.7,priceRange:[48000,55000],consumption:{city:1.7,highway:6.0,electric_range:65,real:2.3,electric_kwh:17}}]}
  }
},
"Toyota": {
  brand_info:{ reliability_avg:4.5, parts_cost:"medium", maintenance_cost_factor:0.85 },
  models:{
    "Aygo X":{ segment:"pequeño", reliability:{score:4.6,common_issues:["Pocos problemas"],avg_repair_cost:250}, depreciation:{year1:0.15,year3:0.29,year5:0.41}, maintenance_yearly:300,
      versions:[
        {name:"1.0 VVT-i 72cv",type:"gasolina",displacement:"1.0",power_cv:72,power_kw:53,priceRange:[15000,17000],consumption:{city:5.3,highway:4.1,real:4.9}},
        {name:"1.0 VVT-i 72cv CVT",type:"gasolina",displacement:"1.0",power_cv:72,power_kw:53,priceRange:[17000,20000],consumption:{city:5.6,highway:4.3,real:5.1}}]},
    "Yaris":{ segment:"pequeño", reliability:{score:4.7,common_issues:["Pocos problemas"],avg_repair_cost:280}, depreciation:{year1:0.14,year3:0.27,year5:0.38}, maintenance_yearly:350,
      versions:[
        {name:"1.5 HEV 116cv",type:"hibrido",displacement:"1.5",power_cv:116,power_kw:85,priceRange:[22000,25000],consumption:{city:3.8,highway:4.2,real:4.0}},
        {name:"GR Yaris 261cv",type:"gasolina",displacement:"1.6",power_cv:261,power_kw:192,priceRange:[38000,43000],consumption:{city:9.0,highway:6.8,real:8.1}}]},
    "Yaris Cross":{ segment:"suv", reliability:{score:4.6,common_issues:["Pocos problemas"],avg_repair_cost:300}, depreciation:{year1:0.14,year3:0.28,year5:0.39}, maintenance_yearly:370,
      versions:[
        {name:"1.5 HEV 116cv FWD",type:"hibrido",displacement:"1.5",power_cv:116,power_kw:85,priceRange:[22000,26000],consumption:{city:4.2,highway:4.6,real:4.5}},
        {name:"1.5 HEV 130cv AWD-i",type:"hibrido",displacement:"1.5",power_cv:130,power_kw:96,priceRange:[26000,30000],consumption:{city:4.5,highway:4.9,real:4.8}}]},
    "Corolla":{ segment:"mediano", reliability:{score:4.6,common_issues:["Batería híbrida longevidad"],avg_repair_cost:320}, depreciation:{year1:0.13,year3:0.26,year5:0.37}, maintenance_yearly:380,
      versions:[
        {name:"1.8 HEV 122cv",type:"hibrido",displacement:"1.8",power_cv:122,power_kw:90,priceRange:[25000,28500],consumption:{city:3.8,highway:4.2,real:4.1}},
        {name:"2.0 HEV 196cv",type:"hibrido",displacement:"2.0",power_cv:196,power_kw:144,priceRange:[29000,33000],consumption:{city:4.2,highway:4.6,real:4.5}}]},
    "C-HR":{ segment:"suv", reliability:{score:4.5,common_issues:["Visibilidad trasera"],avg_repair_cost:350}, depreciation:{year1:0.15,year3:0.29,year5:0.41}, maintenance_yearly:420,
      versions:[
        {name:"1.8 HEV 140cv",type:"hibrido",displacement:"1.8",power_cv:140,power_kw:103,priceRange:[28000,32000],consumption:{city:4.5,highway:4.9,real:4.8}},
        {name:"2.0 HEV 197cv",type:"hibrido",displacement:"2.0",power_cv:197,power_kw:145,priceRange:[32000,36000],consumption:{city:4.8,highway:5.2,real:5.1}},
        {name:"2.0 PHEV 223cv",type:"phev",displacement:"2.0",power_cv:223,power_kw:164,battery_kwh:13.6,priceRange:[37000,42000],consumption:{city:1.8,highway:6.2,electric_range:62,real:2.5,electric_kwh:17}}]},
    "RAV4":{ segment:"suv", reliability:{score:4.6,common_issues:["Pocos problemas"],avg_repair_cost:380}, depreciation:{year1:0.14,year3:0.27,year5:0.39}, maintenance_yearly:450,
      versions:[
        {name:"2.5 HEV 222cv FWD",type:"hibrido",displacement:"2.5",power_cv:222,power_kw:163,priceRange:[35000,40000],consumption:{city:5.0,highway:5.4,real:5.3}},
        {name:"2.5 HEV 222cv AWD-i",type:"hibrido",displacement:"2.5",power_cv:222,power_kw:163,priceRange:[38000,43000],consumption:{city:5.2,highway:5.6,real:5.5}},
        {name:"2.5 PHEV 306cv AWD",type:"phev",displacement:"2.5",power_cv:306,power_kw:225,battery_kwh:18.1,priceRange:[44000,50000],consumption:{city:1.8,highway:6.2,electric_range:65,real:2.5,electric_kwh:17}}]},
    "Prius":{ segment:"mediano", reliability:{score:4.6,common_issues:["Pocos problemas"],avg_repair_cost:340}, depreciation:{year1:0.16,year3:0.31,year5:0.43}, maintenance_yearly:400,
      versions:[
        {name:"2.0 HEV 196cv",type:"hibrido",displacement:"2.0",power_cv:196,power_kw:144,priceRange:[32000,36000],consumption:{city:3.8,highway:4.2,real:4.0}},
        {name:"2.0 PHEV 223cv",type:"phev",displacement:"2.0",power_cv:223,power_kw:164,battery_kwh:13.6,priceRange:[38000,43000],consumption:{city:1.2,highway:5.2,electric_range:69,real:1.7,electric_kwh:15}}]},
    "bZ4X":{ segment:"suv", reliability:{score:4.2,common_issues:["Software"],avg_repair_cost:320}, depreciation:{year1:0.19,year3:0.35,year5:0.49}, maintenance_yearly:260,
      versions:[
        {name:"204cv FWD",type:"ev",displacement:null,power_cv:204,power_kw:150,battery_kwh:71.4,priceRange:[45000,49000],consumption:{city:15.8,highway:19.2,real:17.8,range:410}},
        {name:"218cv AWD",type:"ev",displacement:null,power_cv:218,power_kw:160,battery_kwh:72.8,priceRange:[50000,55000],consumption:{city:16.5,highway:20.2,real:18.6,range:390}}]}
  }
},
"Hyundai": {
  brand_info:{ reliability_avg:4.2, parts_cost:"low", maintenance_cost_factor:0.80 },
  models:{
    "i20":{ segment:"pequeño", reliability:{score:4.3,common_issues:["Pocos problemas"],avg_repair_cost:320}, depreciation:{year1:0.16,year3:0.31,year5:0.43}, maintenance_yearly:340,
      versions:[
        {name:"1.0 T-GDI 100cv MHEV",type:"hibrido",displacement:"1.0",power_cv:100,power_kw:74,priceRange:[17000,19500],consumption:{city:5.6,highway:4.3,real:5.1}},
        {name:"1.0 T-GDI 120cv MHEV",type:"hibrido",displacement:"1.0",power_cv:120,power_kw:88,priceRange:[19500,22500],consumption:{city:5.8,highway:4.5,real:5.3}}]},
    "i30":{ segment:"mediano", reliability:{score:4.2,common_issues:["Pocos problemas"],avg_repair_cost:350}, depreciation:{year1:0.17,year3:0.33,year5:0.46}, maintenance_yearly:390,
      versions:[
        {name:"1.0 T-GDI 120cv MHEV",type:"hibrido",displacement:"1.0",power_cv:120,power_kw:88,priceRange:[22000,25000],consumption:{city:5.8,highway:4.5,real:5.3}},
        {name:"1.5 T-GDI 160cv MHEV",type:"hibrido",displacement:"1.5",power_cv:160,power_kw:118,priceRange:[25000,29000],consumption:{city:6.0,highway:4.6,real:5.5}},
        {name:"2.0 N 280cv",type:"gasolina",displacement:"2.0",power_cv:280,power_kw:206,priceRange:[36000,41000],consumption:{city:9.5,highway:7.2,real:8.6}}]},
    "Kona":{ segment:"suv", reliability:{score:4.2,common_issues:["Electrónica"],avg_repair_cost:350}, depreciation:{year1:0.17,year3:0.32,year5:0.45}, maintenance_yearly:380,
      versions:[
        {name:"1.0 T-GDI 120cv MHEV",type:"hibrido",displacement:"1.0",power_cv:120,power_kw:88,priceRange:[24000,27500],consumption:{city:6.5,highway:5.0,real:5.9}},
        {name:"1.6 HEV 198cv",type:"hibrido",displacement:"1.6",power_cv:198,power_kw:146,priceRange:[28000,32000],consumption:{city:4.8,highway:5.2,real:5.1}},
        {name:"EV 65kWh 218cv",type:"ev",displacement:null,power_cv:218,power_kw:160,battery_kwh:65.4,priceRange:[38000,43000],consumption:{city:15.2,highway:18.8,real:17.2,range:390}}]},
    "Tucson":{ segment:"suv", reliability:{score:4.1,common_issues:["Pocos problemas"],avg_repair_cost:420}, depreciation:{year1:0.16,year3:0.31,year5:0.44}, maintenance_yearly:460,
      versions:[
        {name:"1.6 T-GDI 150cv MHEV",type:"hibrido",displacement:"1.6",power_cv:150,power_kw:110,priceRange:[32000,36000],consumption:{city:7.5,highway:5.7,real:6.8}},
        {name:"1.6 CRDi 136cv MHEV",type:"diesel",displacement:"1.6",power_cv:136,power_kw:100,priceRange:[33000,37000],consumption:{city:5.8,highway:4.6,real:5.3}},
        {name:"1.6 HEV 265cv",type:"hibrido",displacement:"1.6",power_cv:265,power_kw:195,priceRange:[40000,45000],consumption:{city:5.5,highway:5.9,real:5.8}},
        {name:"1.6 PHEV 265cv",type:"phev",displacement:"1.6",power_cv:265,power_kw:195,battery_kwh:13.8,priceRange:[46000,52000],consumption:{city:1.9,highway:6.4,electric_range:55,real:2.6,electric_kwh:18}}]},
    "IONIQ 5":{ segment:"suv", reliability:{score:4.3,common_issues:["Software"],avg_repair_cost:340}, depreciation:{year1:0.18,year3:0.34,year5:0.47}, maintenance_yearly:280,
      versions:[
        {name:"58kWh 170cv RWD",type:"ev",displacement:null,power_cv:170,power_kw:125,battery_kwh:58,priceRange:[44000,48000],consumption:{city:15.8,highway:19.5,real:17.9,range:340}},
        {name:"77.4kWh 217cv RWD",type:"ev",displacement:null,power_cv:217,power_kw:160,battery_kwh:77.4,priceRange:[48000,53000],consumption:{city:16.2,highway:19.8,real:18.2,range:430}},
        {name:"77.4kWh 325cv AWD",type:"ev",displacement:null,power_cv:325,power_kw:239,battery_kwh:77.4,priceRange:[56000,62000],consumption:{city:17.5,highway:21.5,real:19.8,range:400}},
        {name:"N 84kWh 650cv AWD",type:"ev",displacement:null,power_cv:650,power_kw:478,battery_kwh:84,priceRange:[72000,80000],consumption:{city:20.0,highway:24.5,real:22.5,range:350}}]},
    "IONIQ 6":{ segment:"mediano", reliability:{score:4.2,common_issues:["Software"],avg_repair_cost:350}, depreciation:{year1:0.18,year3:0.34,year5:0.47}, maintenance_yearly:290,
      versions:[
        {name:"77.4kWh 228cv RWD",type:"ev",displacement:null,power_cv:228,power_kw:168,battery_kwh:77.4,priceRange:[48000,53000],consumption:{city:14.5,highway:17.8,real:16.4,range:510}},
        {name:"77.4kWh 325cv AWD",type:"ev",displacement:null,power_cv:325,power_kw:239,battery_kwh:77.4,priceRange:[56000,62000],consumption:{city:16.5,highway:20.5,real:18.8,range:470}}]}
  }
},
"Kia": {
  brand_info:{ reliability_avg:4.3, parts_cost:"low", maintenance_cost_factor:0.80 },
  models:{
    "Picanto":{ segment:"pequeño", reliability:{score:4.4,common_issues:["Pocos problemas"],avg_repair_cost:280}, depreciation:{year1:0.17,year3:0.33,year5:0.45}, maintenance_yearly:320,
      versions:[
        {name:"1.0 MPI 67cv",type:"gasolina",displacement:"1.0",power_cv:67,power_kw:49,priceRange:[13000,15000],consumption:{city:5.4,highway:4.1,real:4.9}},
        {name:"1.0 T-GDI 100cv",type:"gasolina",displacement:"1.0",power_cv:100,power_kw:74,priceRange:[15500,18000],consumption:{city:5.6,highway:4.3,real:5.1}}]},
    "Ceed":{ segment:"mediano", reliability:{score:4.2,common_issues:["Pocos problemas"],avg_repair_cost:370}, depreciation:{year1:0.17,year3:0.33,year5:0.46}, maintenance_yearly:420,
      versions:[
        {name:"1.0 T-GDI 120cv MHEV",type:"hibrido",displacement:"1.0",power_cv:120,power_kw:88,priceRange:[22000,25500],consumption:{city:5.8,highway:4.5,real:5.3}},
        {name:"1.5 T-GDI 160cv MHEV",type:"hibrido",displacement:"1.5",power_cv:160,power_kw:118,priceRange:[26000,29500],consumption:{city:6.0,highway:4.6,real:5.5}},
        {name:"1.6 CRDi 136cv",type:"diesel",displacement:"1.6",power_cv:136,power_kw:100,priceRange:[25000,28500],consumption:{city:4.8,highway:3.8,real:4.4}},
        {name:"PHEV 204cv",type:"phev",displacement:"1.6",power_cv:204,power_kw:150,battery_kwh:11.5,priceRange:[33000,37000],consumption:{city:1.6,highway:5.7,electric_range:55,real:2.2,electric_kwh:16}}]},
    "Niro":{ segment:"suv", reliability:{score:4.4,common_issues:["Pocos problemas"],avg_repair_cost:330}, depreciation:{year1:0.16,year3:0.31,year5:0.43}, maintenance_yearly:360,
      versions:[
        {name:"1.6 HEV 141cv",type:"hibrido",displacement:"1.6",power_cv:141,power_kw:104,priceRange:[28000,32000],consumption:{city:4.4,highway:4.8,real:4.7}},
        {name:"1.6 PHEV 183cv",type:"phev",displacement:"1.6",power_cv:183,power_kw:135,battery_kwh:11.1,priceRange:[33000,37500],consumption:{city:1.6,highway:5.8,electric_range:58,real:2.2,electric_kwh:16}},
        {name:"EV 204cv 64.8kWh",type:"ev",displacement:null,power_cv:204,power_kw:150,battery_kwh:64.8,priceRange:[38000,43000],consumption:{city:16.2,highway:19.8,real:18.2,range:370}}]},
    "Sportage":{ segment:"suv", reliability:{score:4.2,common_issues:["Electrónica"],avg_repair_cost:420}, depreciation:{year1:0.16,year3:0.31,year5:0.44}, maintenance_yearly:470,
      versions:[
        {name:"1.6 T-GDI 150cv MHEV",type:"hibrido",displacement:"1.6",power_cv:150,power_kw:110,priceRange:[30000,34500],consumption:{city:7.8,highway:5.9,real:7.1}},
        {name:"1.6 HEV 265cv",type:"hibrido",displacement:"1.6",power_cv:265,power_kw:195,priceRange:[38000,43000],consumption:{city:5.8,highway:6.2,real:6.1}},
        {name:"1.6 PHEV 265cv",type:"phev",displacement:"1.6",power_cv:265,power_kw:195,battery_kwh:13.8,priceRange:[45000,51000],consumption:{city:2.0,highway:6.5,electric_range:55,real:2.7,electric_kwh:19}}]},
    "EV6":{ segment:"suv", reliability:{score:4.2,common_issues:["Software"],avg_repair_cost:350}, depreciation:{year1:0.17,year3:0.33,year5:0.46}, maintenance_yearly:290,
      versions:[
        {name:"58kWh 170cv RWD",type:"ev",displacement:null,power_cv:170,power_kw:125,battery_kwh:58,priceRange:[45000,49000],consumption:{city:16.5,highway:20.2,real:18.6,range:355}},
        {name:"77.4kWh 228cv RWD",type:"ev",displacement:null,power_cv:228,power_kw:168,battery_kwh:77.4,priceRange:[50000,55000],consumption:{city:17.2,highway:21.0,real:19.4,range:410}},
        {name:"77.4kWh 325cv AWD",type:"ev",displacement:null,power_cv:325,power_kw:239,battery_kwh:77.4,priceRange:[58000,65000],consumption:{city:18.8,highway:23.0,real:21.2,range:370}},
        {name:"GT 585cv AWD",type:"ev",displacement:null,power_cv:585,power_kw:430,battery_kwh:77.4,priceRange:[72000,80000],consumption:{city:21.5,highway:26.5,real:24.2,range:340}}]},
    "EV9":{ segment:"suv", reliability:{score:4.1,common_issues:["Nuevo modelo"],avg_repair_cost:480}, depreciation:{year1:0.18,year3:0.34,year5:0.47}, maintenance_yearly:380,
      versions:[
        {name:"RWD 215cv",type:"ev",displacement:null,power_cv:215,power_kw:158,battery_kwh:99.8,priceRange:[72000,78000],consumption:{city:18.5,highway:22.8,real:21.0,range:500}},
        {name:"AWD 384cv",type:"ev",displacement:null,power_cv:384,power_kw:283,battery_kwh:99.8,priceRange:[82000,90000],consumption:{city:20.5,highway:25.2,real:23.2,range:460}}]}
  }
},
"Renault": {
  brand_info:{ reliability_avg:3.4, parts_cost:"low", maintenance_cost_factor:0.85 },
  models:{
    "Clio":{ segment:"pequeño", reliability:{score:3.6,common_issues:["Electrónica","Embrague"],avg_repair_cost:380}, depreciation:{year1:0.19,year3:0.36,year5:0.49}, maintenance_yearly:420,
      versions:[
        {name:"1.0 TCe 90cv",type:"gasolina",displacement:"1.0",power_cv:90,power_kw:66,priceRange:[17000,19500],consumption:{city:5.8,highway:4.5,real:5.3}},
        {name:"E-Tech HEV 145cv",type:"hibrido",displacement:"1.6",power_cv:145,power_kw:107,priceRange:[22000,25500],consumption:{city:4.3,highway:4.7,real:4.6}}]},
    "Captur":{ segment:"suv", reliability:{score:3.5,common_issues:["Electrónica","DCT"],avg_repair_cost:420}, depreciation:{year1:0.20,year3:0.37,year5:0.50}, maintenance_yearly:460,
      versions:[
        {name:"1.0 TCe 90cv",type:"gasolina",displacement:"1.0",power_cv:90,power_kw:66,priceRange:[22000,25000],consumption:{city:6.5,highway:5.0,real:5.9}},
        {name:"E-Tech HEV 145cv",type:"hibrido",displacement:"1.6",power_cv:145,power_kw:107,priceRange:[26000,30000],consumption:{city:4.7,highway:5.1,real:5.0}},
        {name:"E-Tech PHEV 160cv",type:"phev",displacement:"1.6",power_cv:160,power_kw:118,battery_kwh:9.8,priceRange:[31000,35000],consumption:{city:1.7,highway:6.0,electric_range:50,real:2.3,electric_kwh:17}}]},
    "Austral":{ segment:"suv", reliability:{score:3.5,common_issues:["Nuevo modelo"],avg_repair_cost:450}, depreciation:{year1:0.19,year3:0.36,year5:0.49}, maintenance_yearly:490,
      versions:[
        {name:"1.2 TCe 130cv MHEV",type:"hibrido",displacement:"1.2",power_cv:130,power_kw:96,priceRange:[32000,36000],consumption:{city:6.8,highway:5.2,real:6.2}},
        {name:"E-Tech HEV 200cv",type:"hibrido",displacement:"1.8",power_cv:200,power_kw:147,priceRange:[38000,42000],consumption:{city:5.2,highway:5.6,real:5.5}},
        {name:"E-Tech PHEV 200cv",type:"phev",displacement:"1.8",power_cv:200,power_kw:147,battery_kwh:20,priceRange:[42000,47000],consumption:{city:1.9,highway:6.3,electric_range:58,real:2.6,electric_kwh:18}}]},
    "Megane E-Tech":{ segment:"mediano", reliability:{score:3.8,common_issues:["Software"],avg_repair_cost:350}, depreciation:{year1:0.21,year3:0.38,year5:0.52}, maintenance_yearly:280,
      versions:[
        {name:"EV40 130cv",type:"ev",displacement:null,power_cv:130,power_kw:96,battery_kwh:40,priceRange:[36000,40000],consumption:{city:14.5,highway:17.8,real:16.4,range:280}},
        {name:"EV60 220cv",type:"ev",displacement:null,power_cv:220,power_kw:162,battery_kwh:60,priceRange:[40000,45000],consumption:{city:15.5,highway:18.9,real:17.4,range:360}}]},
    "Scenic E-Tech":{ segment:"suv", reliability:{score:3.7,common_issues:["Nuevo modelo"],avg_repair_cost:380}, depreciation:{year1:0.20,year3:0.37,year5:0.51}, maintenance_yearly:300,
      versions:[
        {name:"EV60 170cv",type:"ev",displacement:null,power_cv:170,power_kw:125,battery_kwh:60,priceRange:[40000,44000],consumption:{city:15.5,highway:19.0,real:17.5,range:380}},
        {name:"EV87 220cv",type:"ev",displacement:null,power_cv:220,power_kw:162,battery_kwh:87,priceRange:[44000,49000],consumption:{city:16.0,highway:19.5,real:18.0,range:500}}]},
    "5 E-Tech":{ segment:"pequeño", reliability:{score:3.8,common_issues:["Nuevo modelo"],avg_repair_cost:320}, depreciation:{year1:0.20,year3:0.37,year5:0.51}, maintenance_yearly:260,
      versions:[
        {name:"EV40 122cv",type:"ev",displacement:null,power_cv:122,power_kw:90,battery_kwh:40,priceRange:[25000,29000],consumption:{city:13.8,highway:17.0,real:15.6,range:255}},
        {name:"EV52 150cv",type:"ev",displacement:null,power_cv:150,power_kw:110,battery_kwh:52,priceRange:[29000,34000],consumption:{city:14.5,highway:17.8,real:16.4,range:312}}]}
  }
},
"Peugeot": {
  brand_info:{ reliability_avg:3.5, parts_cost:"medium", maintenance_cost_factor:0.90 },
  models:{
    "208":{ segment:"pequeño", reliability:{score:3.6,common_issues:["Electrónica","Caja EAT"],avg_repair_cost:390}, depreciation:{year1:0.18,year3:0.35,year5:0.48}, maintenance_yearly:410,
      versions:[
        {name:"1.2 PureTech 75cv",type:"gasolina",displacement:"1.2",power_cv:75,power_kw:55,priceRange:[18000,20500],consumption:{city:5.7,highway:4.4,real:5.2}},
        {name:"1.2 PureTech 100cv",type:"gasolina",displacement:"1.2",power_cv:100,power_kw:74,priceRange:[20500,23500],consumption:{city:5.8,highway:4.5,real:5.3}},
        {name:"1.2 PureTech 130cv",type:"gasolina",displacement:"1.2",power_cv:130,power_kw:96,priceRange:[23000,27000],consumption:{city:6.0,highway:4.6,real:5.5}},
        {name:"e-208 156cv 54kWh",type:"ev",displacement:null,power_cv:156,power_kw:115,battery_kwh:54,priceRange:[30000,34000],consumption:{city:14.8,highway:18.2,real:16.8,range:320}}]},
    "2008":{ segment:"suv", reliability:{score:3.5,common_issues:["Electrónica","EAT8"],avg_repair_cost:420}, depreciation:{year1:0.19,year3:0.36,year5:0.49}, maintenance_yearly:450,
      versions:[
        {name:"1.2 PureTech 100cv",type:"gasolina",displacement:"1.2",power_cv:100,power_kw:74,priceRange:[24000,27500],consumption:{city:6.5,highway:5.0,real:5.9}},
        {name:"1.2 PureTech 130cv",type:"gasolina",displacement:"1.2",power_cv:130,power_kw:96,priceRange:[27000,31000],consumption:{city:6.8,highway:5.2,real:6.2}},
        {name:"e-2008 156cv 54kWh",type:"ev",displacement:null,power_cv:156,power_kw:115,battery_kwh:54,priceRange:[34000,38000],consumption:{city:15.5,highway:19.0,real:17.5,range:320}}]},
    "308":{ segment:"mediano", reliability:{score:3.6,common_issues:["EAT8","Electrónica"],avg_repair_cost:440}, depreciation:{year1:0.18,year3:0.35,year5:0.48}, maintenance_yearly:470,
      versions:[
        {name:"1.2 PureTech 130cv",type:"gasolina",displacement:"1.2",power_cv:130,power_kw:96,priceRange:[28000,32000],consumption:{city:6.3,highway:4.8,real:5.8}},
        {name:"1.5 BlueHDi 130cv",type:"diesel",displacement:"1.5",power_cv:130,power_kw:96,priceRange:[30000,34000],consumption:{city:5.0,highway:4.0,real:4.7}},
        {name:"PHEV 225cv",type:"phev",displacement:"1.6",power_cv:225,power_kw:165,battery_kwh:12.4,priceRange:[38000,43000],consumption:{city:1.6,highway:5.7,electric_range:55,real:2.2,electric_kwh:16}}]}
  }
},
"Citroën": {
  brand_info:{ reliability_avg:3.4, parts_cost:"medium", maintenance_cost_factor:0.90 },
  models:{
    "C3":{ segment:"pequeño", reliability:{score:3.5,common_issues:["Electrónica","Caja automática"],avg_repair_cost:390}, depreciation:{year1:0.20,year3:0.38,year5:0.51}, maintenance_yearly:410,
      versions:[
        {name:"1.2 PureTech 83cv",type:"gasolina",displacement:"1.2",power_cv:83,power_kw:61,priceRange:[16000,18500],consumption:{city:6.0,highway:4.6,real:5.5}},
        {name:"1.2 PureTech 110cv",type:"gasolina",displacement:"1.2",power_cv:110,power_kw:81,priceRange:[20000,23500],consumption:{city:6.5,highway:5.0,real:5.9}}]},
    "ë-C3":{ segment:"pequeño", reliability:{score:3.6,common_issues:["Nuevo modelo"],avg_repair_cost:350}, depreciation:{year1:0.21,year3:0.39,year5:0.53}, maintenance_yearly:280,
      versions:[
{name:"You 200 km (82/113)",type:"ev",power_cv:113,power_kw:83,battery_kwh:30,priceRange:[23150,23150],consumption:{city:15.6,highway:19.0,real:17.3,range:200}},
      {name:"You 320 km",type:"ev",power_cv:113,power_kw:83,battery_kwh:44,priceRange:[26200,26200],consumption:{city:15.4,highway:18.8,real:17.1,range:320}},
      {name:"Plus 320 km",type:"ev",power_cv:113,power_kw:83,battery_kwh:44,priceRange:[27850,27850],consumption:{city:15.5,highway:18.9,real:17.2,range:320}}
    ]},
    "C4":{ segment:"mediano", reliability:{score:3.4,common_issues:["EAT8","Suspensión"],avg_repair_cost:430}, depreciation:{year1:0.20,year3:0.37,year5:0.50}, maintenance_yearly:450,
      versions:[
        {name:"1.2 PureTech 130cv",type:"gasolina",displacement:"1.2",power_cv:130,power_kw:96,priceRange:[28000,32000],consumption:{city:6.7,highway:5.1,real:6.1}},
        {name:"ë-C4 156cv 54kWh",type:"ev",displacement:null,power_cv:156,power_kw:115,battery_kwh:54,priceRange:[36000,40000],consumption:{city:15.5,highway:19.0,real:17.5,range:330}}]},
    "C3 Aircross":{segment:"suv",versions:[
      {name:"PureTech 101 You",type:"gasolina",displacement:"1.2",power_cv:101,power_kw:74,priceRange:[19390,19390],consumption:{city:6.4,highway:5.0,real:5.6}},
      {name:"PureTech 101 Max",type:"gasolina",displacement:"1.2",power_cv:101,power_kw:74,priceRange:[21510,21510],consumption:{city:6.4,highway:5.0,real:5.6}},
      {name:"Hybrid 145 Auto Max",type:"hibrido",displacement:"1.2",power_cv:145,power_kw:107,priceRange:[25680,25680],consumption:{city:6.3,highway:5.0,real:5.5}}
    ]},
    "ë-C3 Aircross":{segment:"suv",versions:[
      {name:"You 83 kW",type:"ev",power_cv:113,power_kw:83,battery_kwh:44,priceRange:[22700,22700],consumption:{city:16.3,highway:19.9,real:18.1,range:307}},
      {name:"Plus 83 kW",type:"ev",power_cv:113,power_kw:83,battery_kwh:44,priceRange:[24900,24900],consumption:{city:16.3,highway:19.9,real:18.1,range:307}},
      {name:"Max 83 kW",type:"ev",power_cv:113,power_kw:83,battery_kwh:44,priceRange:[27400,27400],consumption:{city:14.5,highway:17.7,real:16.1,range:340}}
    ]}

  }
},
"Dacia": {
  brand_info:{ reliability_avg:3.8, parts_cost:"low", maintenance_cost_factor:0.70 },
  models:{
    "Sandero":{ segment:"pequeño", reliability:{score:4.0,common_issues:["Acabados básicos"],avg_repair_cost:280}, depreciation:{year1:0.15,year3:0.29,year5:0.40}, maintenance_yearly:320,
      versions:[
        {name:"1.0 SCe 65cv",type:"gasolina",displacement:"1.0",power_cv:65,power_kw:48,priceRange:[12000,14000],consumption:{city:6.0,highway:4.6,real:5.5}},
        {name:"1.0 TCe 90cv",type:"gasolina",displacement:"1.0",power_cv:90,power_kw:66,priceRange:[14500,17000],consumption:{city:6.2,highway:4.8,real:5.7}},
        {name:"Stepway 1.0 TCe 90cv",type:"gasolina",displacement:"1.0",power_cv:90,power_kw:66,priceRange:[16000,18500],consumption:{city:6.4,highway:4.9,real:5.9}}]},
    "Duster":{ segment:"suv", reliability:{score:3.9,common_issues:["Acabados"],avg_repair_cost:310}, depreciation:{year1:0.16,year3:0.30,year5:0.42}, maintenance_yearly:360,
      versions:[
        {name:"1.2 Hybrid 140cv",type:"hibrido",displacement:"1.2",power_cv:140,power_kw:103,priceRange:[22000,25500],consumption:{city:5.0,highway:5.4,real:5.3}},
        {name:"1.3 TCe 130cv",type:"gasolina",displacement:"1.3",power_cv:130,power_kw:96,priceRange:[20000,23000],consumption:{city:7.5,highway:5.7,real:6.8}}]},
    "Jogger":{ segment:"suv", reliability:{score:3.8,common_issues:["Acabados"],avg_repair_cost:320}, depreciation:{year1:0.17,year3:0.32,year5:0.44}, maintenance_yearly:380,
      versions:[
        {name:"1.0 TCe 110cv",type:"gasolina",displacement:"1.0",power_cv:110,power_kw:81,priceRange:[20000,23500],consumption:{city:6.8,highway:5.2,real:6.2}},
        {name:"1.2 Hybrid 140cv",type:"hibrido",displacement:"1.2",power_cv:140,power_kw:103,priceRange:[24000,27500],consumption:{city:4.9,highway:5.3,real:5.2}}]},
    "Spring":{ segment:"pequeño", reliability:{score:3.7,common_issues:["Velocidad limitada","Carga lenta"],avg_repair_cost:280}, depreciation:{year1:0.20,year3:0.37,year5:0.51}, maintenance_yearly:240,
      versions:[
        {name:"45cv 26.8kWh",type:"ev",displacement:null,power_cv:45,power_kw:33,battery_kwh:26.8,priceRange:[15000,17000],consumption:{city:13.9,highway:17.0,real:15.7,range:172}},
        {name:"65cv 26.8kWh Extreme",type:"ev",displacement:null,power_cv:65,power_kw:48,battery_kwh:26.8,priceRange:[17500,19500],consumption:{city:14.2,highway:17.5,real:16.1,range:165}}]},
    "Bigster":{ segment:"suv", reliability:{score:3.8,common_issues:["Nuevo modelo 2025"],avg_repair_cost:360}, depreciation:{year1:0.17,year3:0.32,year5:0.45}, maintenance_yearly:400,
      versions:[
        {name:"1.2 Hybrid 155cv",type:"hibrido",displacement:"1.2",power_cv:155,power_kw:114,priceRange:[29000,33000],consumption:{city:5.3,highway:5.7,real:5.6}},
        {name:"1.2 PHEV 195cv",type:"phev",displacement:"1.2",power_cv:195,power_kw:143,battery_kwh:12,priceRange:[33000,38000],consumption:{city:2.0,highway:6.5,electric_range:55,real:2.7,electric_kwh:19}}]}
  }
},
"Nissan": {
  brand_info:{ reliability_avg:3.9, parts_cost:"medium", maintenance_cost_factor:0.90 },
  models:{
    "Juke":{ segment:"suv", reliability:{score:3.8,common_issues:["CVT","Electrónica"],avg_repair_cost:410}, depreciation:{year1:0.18,year3:0.35,year5:0.48}, maintenance_yearly:440,
      versions:[
        {name:"1.0 DIG-T 114cv",type:"gasolina",displacement:"1.0",power_cv:114,power_kw:84,priceRange:[22000,25500],consumption:{city:6.5,highway:5.0,real:5.9}},
        {name:"1.6 HEV 143cv",type:"hibrido",displacement:"1.6",power_cv:143,power_kw:105,priceRange:[25000,28500],consumption:{city:4.6,highway:5.0,real:4.9}}]},
    "Qashqai":{ segment:"suv", reliability:{score:3.9,common_issues:["CVT","Turbo"],avg_repair_cost:450}, depreciation:{year1:0.17,year3:0.33,year5:0.46}, maintenance_yearly:480,
      versions:[
        {name:"1.3 MHEV 140cv",type:"hibrido",displacement:"1.3",power_cv:140,power_kw:103,priceRange:[28000,32500],consumption:{city:6.8,highway:5.2,real:6.2}},
        {name:"e-Power 190cv FWD",type:"hibrido",displacement:"1.5",power_cv:190,power_kw:140,priceRange:[36000,41000],consumption:{city:5.0,highway:5.4,real:5.3}},
        {name:"e-Power 204cv AWD",type:"hibrido",displacement:"1.5",power_cv:204,power_kw:150,priceRange:[41000,46000],consumption:{city:5.5,highway:5.9,real:5.8}}]},
    "X-Trail":{ segment:"suv", reliability:{score:3.8,common_issues:["Nuevo e-Power"],avg_repair_cost:480}, depreciation:{year1:0.17,year3:0.33,year5:0.46}, maintenance_yearly:520,
      versions:[
        {name:"e-Power 204cv FWD",type:"hibrido",displacement:"1.5",power_cv:204,power_kw:150,priceRange:[35000,40000],consumption:{city:6.8,highway:7.2,real:7.1}},
        {name:"e-Power 213cv AWD",type:"hibrido",displacement:"1.5",power_cv:213,power_kw:157,priceRange:[40000,46000],consumption:{city:7.2,highway:7.6,real:7.5}}]},
    "Leaf":{ segment:"mediano", reliability:{score:4.0,common_issues:["Batería sin refrigeración","CHAdeMO"],avg_repair_cost:380}, depreciation:{year1:0.22,year3:0.40,year5:0.55}, maintenance_yearly:270,
      versions:[
        {name:"40kWh 150cv",type:"ev",displacement:null,power_cv:150,power_kw:110,battery_kwh:40,priceRange:[32000,36000],consumption:{city:16.5,highway:20.2,real:18.6,range:270}},
        {name:"e+ 62kWh 217cv",type:"ev",displacement:null,power_cv:217,power_kw:160,battery_kwh:62,priceRange:[37000,42000],consumption:{city:17.5,highway:21.5,real:19.8,range:340}}]},
    "Ariya":{ segment:"suv", reliability:{score:3.8,common_issues:["Nuevo modelo"],avg_repair_cost:420}, depreciation:{year1:0.20,year3:0.37,year5:0.51}, maintenance_yearly:290,
      versions:[
        {name:"63kWh 218cv FWD",type:"ev",displacement:null,power_cv:218,power_kw:160,battery_kwh:63,priceRange:[47000,52000],consumption:{city:16.8,highway:20.5,real:18.9,range:395}},
        {name:"87kWh 306cv AWD",type:"ev",displacement:null,power_cv:306,power_kw:225,battery_kwh:87,priceRange:[61000,68000],consumption:{city:18.5,highway:22.8,real:21.0,range:420}}]}
  }
},
"Mazda": {
  brand_info:{ reliability_avg:4.3, parts_cost:"medium", maintenance_cost_factor:0.90 },
  models:{
    "Mazda2":{ segment:"pequeño", reliability:{score:4.4,common_issues:["Pocos problemas"],avg_repair_cost:340}, depreciation:{year1:0.16,year3:0.31,year5:0.43}, maintenance_yearly:380,
      versions:[
        {name:"1.5 HEV 116cv",type:"hibrido",displacement:"1.5",power_cv:116,power_kw:85,priceRange:[19000,22500],consumption:{city:4.0,highway:4.4,real:4.3}}]},
    "Mazda3":{ segment:"mediano", reliability:{score:4.5,common_issues:["Pocos problemas"],avg_repair_cost:370}, depreciation:{year1:0.15,year3:0.29,year5:0.41}, maintenance_yearly:420,
      versions:[
        {name:"e-Skyactiv-G 122cv",type:"gasolina",displacement:"2.0",power_cv:122,power_kw:90,priceRange:[24000,27000],consumption:{city:6.2,highway:4.8,real:5.7}},
        {name:"e-Skyactiv-G 150cv MHEV",type:"hibrido",displacement:"2.0",power_cv:150,power_kw:110,priceRange:[26000,30000],consumption:{city:5.8,highway:4.5,real:5.3}},
        {name:"e-Skyactiv-X 186cv MHEV",type:"hibrido",displacement:"2.0",power_cv:186,power_kw:137,priceRange:[31000,35000],consumption:{city:5.5,highway:4.2,real:5.0}}]},
    "CX-30":{ segment:"suv", reliability:{score:4.4,common_issues:["Pocos problemas"],avg_repair_cost:390}, depreciation:{year1:0.16,year3:0.30,year5:0.42}, maintenance_yearly:450,
      versions:[
        {name:"e-Skyactiv-G 122cv",type:"gasolina",displacement:"2.0",power_cv:122,power_kw:90,priceRange:[27000,30000],consumption:{city:6.8,highway:5.2,real:6.2}},
        {name:"e-Skyactiv-G 150cv MHEV",type:"hibrido",displacement:"2.0",power_cv:150,power_kw:110,priceRange:[29000,33000],consumption:{city:6.5,highway:5.0,real:5.9}}]},
    "CX-5":{ segment:"suv", reliability:{score:4.3,common_issues:["Pocos problemas"],avg_repair_cost:420}, depreciation:{year1:0.15,year3:0.29,year5:0.41}, maintenance_yearly:480,
      versions:[
        {name:"e-Skyactiv-G 165cv",type:"gasolina",displacement:"2.0",power_cv:165,power_kw:121,priceRange:[30000,34000],consumption:{city:7.8,highway:6.0,real:7.1}},
        {name:"e-Skyactiv-D 150cv",type:"diesel",displacement:"2.2",power_cv:150,power_kw:110,priceRange:[32000,36000],consumption:{city:6.0,highway:4.8,real:5.5}},
        {name:"e-Skyactiv-D 184cv AWD",type:"diesel",displacement:"2.2",power_cv:184,power_kw:135,priceRange:[36000,41000],consumption:{city:6.3,highway:5.0,real:5.8}}]},
    "CX-60":{ segment:"suv", reliability:{score:4.1,common_issues:["Nuevo PHEV"],avg_repair_cost:480}, depreciation:{year1:0.17,year3:0.32,year5:0.45}, maintenance_yearly:520,
      versions:[
        {name:"e-Skyactiv-D 200cv",type:"diesel",displacement:"3.3",power_cv:200,power_kw:147,priceRange:[48000,53000],consumption:{city:7.0,highway:5.5,real:6.4}},
        {name:"PHEV 327cv AWD",type:"phev",displacement:"2.5",power_cv:327,power_kw:241,battery_kwh:17.8,priceRange:[55000,62000],consumption:{city:1.9,highway:6.3,electric_range:60,real:2.6,electric_kwh:17}}]}
  }
},
"Ford": {
  brand_info:{ reliability_avg:3.6, parts_cost:"medium", maintenance_cost_factor:0.95 },
  models:{
    "Puma":{ segment:"suv", reliability:{score:3.7,common_issues:["Electrónica"],avg_repair_cost:420}, depreciation:{year1:0.18,year3:0.35,year5:0.48}, maintenance_yearly:460,
      versions:[
        {name:"EcoBoost MHEV 125cv",type:"hibrido",displacement:"1.0",power_cv:125,power_kw:92,priceRange:[22000,25500],consumption:{city:5.8,highway:4.5,real:5.3}},
        {name:"EcoBoost MHEV 155cv",type:"hibrido",displacement:"1.0",power_cv:155,power_kw:114,priceRange:[25000,29000],consumption:{city:6.0,highway:4.6,real:5.5}},
        {name:"ST 200cv",type:"gasolina",displacement:"1.5",power_cv:200,power_kw:147,priceRange:[30000,34000],consumption:{city:8.5,highway:6.4,real:7.7}}]},
    "Kuga":{ segment:"suv", reliability:{score:3.6,common_issues:["PHEV (problemas iniciales)"],avg_repair_cost:480}, depreciation:{year1:0.19,year3:0.36,year5:0.49}, maintenance_yearly:520,
      versions:[
        {name:"EcoBoost 150cv",type:"gasolina",displacement:"1.5",power_cv:150,power_kw:110,priceRange:[32000,36000],consumption:{city:7.5,highway:5.7,real:6.8}},
        {name:"FHEV 190cv",type:"hibrido",displacement:"2.5",power_cv:190,power_kw:140,priceRange:[34000,38500],consumption:{city:5.5,highway:5.9,real:5.8}},
        {name:"PHEV 225cv FWD",type:"phev",displacement:"2.5",power_cv:225,power_kw:165,battery_kwh:14.4,priceRange:[42000,47000],consumption:{city:2.0,highway:6.5,electric_range:56,real:2.7,electric_kwh:18}}]},
    "Mustang Mach-E":{ segment:"suv", reliability:{score:3.7,common_issues:["Software","Pantalla"],avg_repair_cost:480}, depreciation:{year1:0.21,year3:0.38,year5:0.52}, maintenance_yearly:310,
      versions:[
        {name:"RWD 269cv 75.7kWh",type:"ev",displacement:null,power_cv:269,power_kw:198,battery_kwh:75.7,priceRange:[48000,53000],consumption:{city:17.0,highway:20.8,real:19.2,range:380}},
        {name:"RWD 269cv 91kWh",type:"ev",displacement:null,power_cv:269,power_kw:198,battery_kwh:91,priceRange:[53000,59000],consumption:{city:17.5,highway:21.2,real:19.6,range:490}},
        {name:"GT AWD 487cv",type:"ev",displacement:null,power_cv:487,power_kw:358,battery_kwh:91,priceRange:[69000,76000],consumption:{city:21.0,highway:25.5,real:23.5,range:400}}]}
  }
},
"Opel": {
  brand_info:{ reliability_avg:3.5, parts_cost:"medium", maintenance_cost_factor:0.95 },
  models:{
    "Corsa":{ segment:"pequeño", reliability:{score:3.6,common_issues:["Electrónica","Caja automática"],avg_repair_cost:390}, depreciation:{year1:0.19,year3:0.36,year5:0.49}, maintenance_yearly:420,
      versions:[
        {name:"1.2 Turbo 100cv",type:"gasolina",displacement:"1.2",power_cv:100,power_kw:74,priceRange:[20500,23500],consumption:{city:6.0,highway:4.6,real:5.5}},
        {name:"1.2 Turbo 130cv",type:"gasolina",displacement:"1.2",power_cv:130,power_kw:96,priceRange:[23000,27000],consumption:{city:6.1,highway:4.7,real:5.6}},
        {name:"Electric 156cv 54kWh",type:"ev",displacement:null,power_cv:156,power_kw:115,battery_kwh:54,priceRange:[30000,34000],consumption:{city:15.0,highway:18.5,real:17.0,range:320}}]},
    "Mokka":{ segment:"suv", reliability:{score:3.5,common_issues:["Electrónica","AT8"],avg_repair_cost:410}, depreciation:{year1:0.20,year3:0.37,year5:0.50}, maintenance_yearly:440,
      versions:[
        {name:"1.2 Turbo 130cv",type:"gasolina",displacement:"1.2",power_cv:130,power_kw:96,priceRange:[27000,31000],consumption:{city:6.8,highway:5.2,real:6.2}},
        {name:"Electric 156cv 54kWh",type:"ev",displacement:null,power_cv:156,power_kw:115,battery_kwh:54,priceRange:[34000,38000],consumption:{city:15.5,highway:19.0,real:17.5,range:330}}]},
    "Astra":{ segment:"mediano", reliability:{score:3.5,common_issues:["Electrónica","AT8"],avg_repair_cost:430}, depreciation:{year1:0.19,year3:0.36,year5:0.49}, maintenance_yearly:460,
      versions:[
        {name:"1.2 Turbo 130cv",type:"gasolina",displacement:"1.2",power_cv:130,power_kw:96,priceRange:[29000,33000],consumption:{city:6.5,highway:5.0,real:5.9}},
        {name:"PHEV 180cv",type:"phev",displacement:"1.5",power_cv:180,power_kw:132,battery_kwh:12.4,priceRange:[36000,40000],consumption:{city:1.7,highway:5.9,electric_range:55,real:2.3,electric_kwh:16}}]},
    "Grandland":{ segment:"suv", reliability:{score:3.5,common_issues:["Electrónica PHEV"],avg_repair_cost:470}, depreciation:{year1:0.19,year3:0.36,year5:0.49}, maintenance_yearly:510,
      versions:[
        {name:"1.2 Turbo 130cv",type:"gasolina",displacement:"1.2",power_cv:130,power_kw:96,priceRange:[33000,37000],consumption:{city:7.5,highway:5.7,real:6.8}},
        {name:"PHEV 195cv",type:"phev",displacement:"1.5",power_cv:195,power_kw:143,battery_kwh:19.6,priceRange:[40000,45000],consumption:{city:1.8,highway:6.3,electric_range:55,real:2.5,electric_kwh:17}},
        {name:"Electric 195cv 82kWh",type:"ev",displacement:null,power_cv:195,power_kw:143,battery_kwh:82,priceRange:[46000,52000],consumption:{city:16.5,highway:20.2,real:18.6,range:500}}]},
    "Frontera":{segment:"suv",versions:[
      {name:"Hybrid 110 (eDCT)",type:"hibrido",displacement:"1.2",power_cv:110,power_kw:81,priceRange:[22700,22700],consumption:{city:6.0,highway:4.7,real:5.2}},
      {name:"Hybrid 145 (eDCT)",type:"hibrido",displacement:"1.2",power_cv:145,power_kw:107,priceRange:[23900,23900],consumption:{city:6.0,highway:4.7,real:5.2}},
      {name:"Electric 113cv 44kWh Edition",type:"ev",power_cv:113,power_kw:83,battery_kwh:43.8,priceRange:[24900,24900],consumption:{city:16.2,highway:19.8,real:18.0,range:308}},
      {name:"Electric 156cv 54kWh Edition",type:"ev",power_cv:156,power_kw:115,battery_kwh:54,priceRange:[27000,27000],consumption:{city:14.4,highway:17.6,real:16.0,range:402}},
      {name:"Electric 156cv 54kWh GS",type:"ev",power_cv:156,power_kw:115,battery_kwh:54,priceRange:[30200,30200],consumption:{city:14.2,highway:17.4,real:15.8,range:402}}
    ]}

  }
},
"Fiat": {
  brand_info:{ reliability_avg:3.3, parts_cost:"medium", maintenance_cost_factor:1.00 },
  models:{
    "500":{ segment:"pequeño", reliability:{score:3.3,common_issues:["Electrónica","Motor"],avg_repair_cost:420}, depreciation:{year1:0.19,year3:0.37,year5:0.50}, maintenance_yearly:430,
      versions:[
        {name:"1.0 MHEV 70cv",type:"hibrido",displacement:"1.0",power_cv:70,power_kw:51,priceRange:[19000,21500],consumption:{city:5.5,highway:4.2,real:5.0}},
        {name:"500e 118cv 24kWh",type:"ev",displacement:null,power_cv:118,power_kw:87,battery_kwh:24,priceRange:[25000,28000],consumption:{city:13.5,highway:16.8,real:15.4,range:150}},
        {name:"500e 118cv 42kWh",type:"ev",displacement:null,power_cv:118,power_kw:87,battery_kwh:42,priceRange:[28000,33000],consumption:{city:14.0,highway:17.2,real:15.8,range:262}},
        {name:"500e Cabrio 118cv 42kWh",type:"ev",displacement:null,power_cv:118,power_kw:87,battery_kwh:42,priceRange:[34000,38000],consumption:{city:14.2,highway:17.5,real:16.1,range:250}}]},
    "Panda":{ segment:"pequeño", reliability:{score:3.4,common_issues:["Electrónica"],avg_repair_cost:380}, depreciation:{year1:0.18,year3:0.35,year5:0.48}, maintenance_yearly:400,
      versions:[
        {name:"1.0 MHEV 70cv",type:"hibrido",displacement:"1.0",power_cv:70,power_kw:51,priceRange:[14000,16500],consumption:{city:5.2,highway:4.0,real:4.8}}]},
    "600":{ segment:"suv", reliability:{score:3.3,common_issues:["Nuevo modelo"],avg_repair_cost:450}, depreciation:{year1:0.20,year3:0.38,year5:0.52}, maintenance_yearly:480,
      versions:[
        {name:"1.2 MHEV 136cv",type:"hibrido",displacement:"1.2",power_cv:136,power_kw:100,priceRange:[28000,32000],consumption:{city:5.8,highway:4.5,real:5.3}},
        {name:"600e 156cv 54kWh",type:"ev",displacement:null,power_cv:156,power_kw:115,battery_kwh:54,priceRange:[35000,40000],consumption:{city:15.5,highway:19.0,real:17.5,range:330}}]}
  }
},
"Alfa Romeo": {
  brand_info:{ reliability_avg:3.2, parts_cost:"high", maintenance_cost_factor:1.40 },
  models:{
    "Tonale":{ segment:"suv", reliability:{score:3.3,common_issues:["Electrónica","Nuevo modelo"],avg_repair_cost:650}, depreciation:{year1:0.20,year3:0.38,year5:0.52}, maintenance_yearly:700,
      versions:[
        {name:"1.5 MHEV 160cv",type:"hibrido",displacement:"1.5",power_cv:160,power_kw:118,priceRange:[38000,42000],consumption:{city:5.8,highway:5.5,real:5.7}},
        {name:"PHEV 280cv AWD",type:"phev",displacement:"1.3",power_cv:280,power_kw:206,battery_kwh:15.5,priceRange:[46000,52000],consumption:{city:1.9,highway:6.4,electric_range:62,real:2.6,electric_kwh:19}}]},
    "Stelvio":{ segment:"suv", reliability:{score:3.2,common_issues:["Electrónica","Motor"],avg_repair_cost:820}, depreciation:{year1:0.18,year3:0.35,year5:0.48}, maintenance_yearly:860,
      versions:[
        {name:"2.0 Turbo 200cv",type:"gasolina",displacement:"2.0",power_cv:200,power_kw:147,priceRange:[52000,58000],consumption:{city:9.8,highway:7.4,real:8.8}},
        {name:"2.0 Turbo 280cv Q4",type:"gasolina",displacement:"2.0",power_cv:280,power_kw:206,priceRange:[60000,68000],consumption:{city:10.5,highway:7.8,real:9.4}},
        {name:"Quadrifoglio 520cv",type:"gasolina",displacement:"2.9",power_cv:520,power_kw:382,priceRange:[90000,100000],consumption:{city:13.5,highway:10.0,real:12.2}}]}
  }
},
"Jeep": {
  brand_info:{ reliability_avg:3.2, parts_cost:"high", maintenance_cost_factor:1.20 },
  models:{
    "Avenger":{ segment:"suv", reliability:{score:3.3,common_issues:["Electrónica"],avg_repair_cost:550}, depreciation:{year1:0.21,year3:0.39,year5:0.53}, maintenance_yearly:600,
      versions:[
        {name:"1.2 GSE 130cv",type:"gasolina",displacement:"1.2",power_cv:130,power_kw:96,priceRange:[27000,31000],consumption:{city:7.2,highway:5.5,real:6.6}},
        {name:"Electric 156cv 54kWh",type:"ev",displacement:null,power_cv:156,power_kw:115,battery_kwh:54,priceRange:[33000,37000],consumption:{city:16.5,highway:20.2,real:18.6,range:330}}]},
    "Compass":{ segment:"suv", reliability:{score:3.2,common_issues:["Electrónica","DCT"],avg_repair_cost:620}, depreciation:{year1:0.19,year3:0.37,year5:0.51}, maintenance_yearly:660,
      versions:[
        {name:"1.3 GSE 150cv",type:"gasolina",displacement:"1.3",power_cv:150,power_kw:110,priceRange:[35000,39000],consumption:{city:7.8,highway:5.9,real:7.1}},
        {name:"PHEV 240cv 4xe",type:"phev",displacement:"1.3",power_cv:240,power_kw:176,battery_kwh:11.4,priceRange:[45000,50000],consumption:{city:2.1,highway:7.0,electric_range:48,real:2.8,electric_kwh:20}}]}
  }
},
"MINI": {
  brand_info:{ reliability_avg:3.4, parts_cost:"high", maintenance_cost_factor:1.30 },
  models:{
    "Cooper":{ segment:"pequeño", reliability:{score:3.5,common_issues:["Motor","Electrónica"],avg_repair_cost:580}, depreciation:{year1:0.19,year3:0.36,year5:0.49}, maintenance_yearly:620,
      versions:[
        {name:"C 170cv gasolina",type:"gasolina",displacement:"1.5",power_cv:170,power_kw:125,priceRange:[28000,31000],consumption:{city:6.8,highway:5.2,real:6.2}},
        {name:"S 231cv gasolina",type:"gasolina",displacement:"2.0",power_cv:231,power_kw:170,priceRange:[32000,36000],consumption:{city:7.5,highway:5.7,real:6.8}},
        {name:"JCW 300cv",type:"gasolina",displacement:"2.0",power_cv:300,power_kw:221,priceRange:[38000,43000],consumption:{city:8.5,highway:6.4,real:7.7}},
        {name:"E 184cv eléctrico",type:"ev",displacement:null,power_cv:184,power_kw:135,battery_kwh:54.2,priceRange:[35000,39000],consumption:{city:15.5,highway:19.0,real:17.5,range:400}},
        {name:"SE 218cv eléctrico",type:"ev",displacement:null,power_cv:218,power_kw:160,battery_kwh:54.2,priceRange:[38000,43000],consumption:{city:16.0,highway:19.5,real:18.0,range:390}}]},
    "Countryman":{ segment:"suv", reliability:{score:3.4,common_issues:["Motor","Caja automática"],avg_repair_cost:680}, depreciation:{year1:0.18,year3:0.35,year5:0.48}, maintenance_yearly:720,
      versions:[
        {name:"C 170cv gasolina",type:"gasolina",displacement:"1.5",power_cv:170,power_kw:125,priceRange:[38000,42000],consumption:{city:7.5,highway:5.7,real:6.8}},
        {name:"S 204cv ALL4",type:"gasolina",displacement:"2.0",power_cv:204,power_kw:150,priceRange:[44000,49000],consumption:{city:8.2,highway:6.2,real:7.4}},
        {name:"SE ALL4 313cv PHEV",type:"phev",displacement:"1.5",power_cv:313,power_kw:230,battery_kwh:19.7,priceRange:[50000,56000],consumption:{city:2.0,highway:6.5,electric_range:55,real:2.7,electric_kwh:19}},
        {name:"E 204cv eléctrico FWD",type:"ev",displacement:null,power_cv:204,power_kw:150,battery_kwh:64.7,priceRange:[44000,49000],consumption:{city:17.5,highway:21.5,real:19.8,range:430}},
        {name:"SE 313cv eléctrico AWD",type:"ev",displacement:null,power_cv:313,power_kw:230,battery_kwh:64.7,priceRange:[50000,56000],consumption:{city:19.5,highway:23.8,real:21.8,range:380}}]}
  }
},
"Volvo": {
  brand_info:{ reliability_avg:3.8, parts_cost:"high", maintenance_cost_factor:1.20 },
  models:{
    "XC40":{ segment:"suv", reliability:{score:3.8,common_issues:["Electrónica","Software"],avg_repair_cost:620}, depreciation:{year1:0.17,year3:0.33,year5:0.46}, maintenance_yearly:680,
      versions:[
        {name:"B3 163cv MHEV",type:"hibrido",displacement:"1.5",power_cv:163,power_kw:120,priceRange:[40000,44500],consumption:{city:7.5,highway:5.7,real:6.8}},
        {name:"B4 197cv MHEV",type:"hibrido",displacement:"2.0",power_cv:197,power_kw:145,priceRange:[44500,49500],consumption:{city:8.0,highway:6.0,real:7.2}},
        {name:"Recharge Single 231cv",type:"ev",displacement:null,power_cv:231,power_kw:170,battery_kwh:69,priceRange:[50000,56000],consumption:{city:18.0,highway:22.0,real:20.2,range:390}},
        {name:"Recharge Twin 408cv AWD",type:"ev",displacement:null,power_cv:408,power_kw:300,battery_kwh:79,priceRange:[60000,67000],consumption:{city:19.5,highway:24.0,real:22.0,range:410}}]},
    "XC60":{ segment:"suv", reliability:{score:3.8,common_issues:["Electrónica"],avg_repair_cost:750}, depreciation:{year1:0.16,year3:0.31,year5:0.44}, maintenance_yearly:820,
      versions:[
        {name:"B4 197cv MHEV",type:"hibrido",displacement:"2.0",power_cv:197,power_kw:145,priceRange:[55000,61000],consumption:{city:8.5,highway:6.5,real:7.7}},
        {name:"T6 Recharge 350cv PHEV",type:"phev",displacement:"2.0",power_cv:350,power_kw:257,battery_kwh:18.8,priceRange:[68000,76000],consumption:{city:2.5,highway:7.8,electric_range:55,real:3.3,electric_kwh:22}},
        {name:"T8 Recharge 455cv PHEV AWD",type:"phev",displacement:"2.0",power_cv:455,power_kw:335,battery_kwh:18.8,priceRange:[78000,87000],consumption:{city:2.7,highway:8.2,electric_range:55,real:3.5,electric_kwh:23}}]},
    "EX30":{ segment:"pequeño", reliability:{score:3.9,common_issues:["Software"],avg_repair_cost:420}, depreciation:{year1:0.19,year3:0.35,year5:0.49}, maintenance_yearly:320,
      versions:[
        {name:"Single 272cv 51kWh (LFP)",type:"ev",displacement:null,power_cv:272,power_kw:200,battery_kwh:51,priceRange:[36950,36950],consumption:{city:15.4,highway:18.8,real:17.1,range:344}},
        {name:"Single 272cv 69kWh",type:"ev",displacement:null,power_cv:272,power_kw:200,battery_kwh:69,priceRange:[37000,42000],consumption:{city:16.5,highway:20.2,real:18.6,range:432}},
        {name:"Twin 428cv AWD",type:"ev",displacement:null,power_cv:428,power_kw:315,battery_kwh:69,priceRange:[47000,53000],consumption:{city:18.5,highway:22.8,real:21.0,range:390}}
      ]},
    "EX90":{ segment:"suv", reliability:{score:3.8,common_issues:["Software"],avg_repair_cost:680}, depreciation:{year1:0.18,year3:0.34,year5:0.47}, maintenance_yearly:520,
      versions:[
        {name:"Twin 517cv AWD",type:"ev",displacement:null,power_cv:517,power_kw:380,battery_kwh:111,priceRange:[95000,108000],consumption:{city:22.5,highway:27.5,real:25.2,range:480}},
        {name:"Twin Performance 680cv",type:"ev",displacement:null,power_cv:680,power_kw:500,battery_kwh:111,priceRange:[115000,130000],consumption:{city:23.5,highway:28.8,real:26.4,range:460}}]}
  }
},
"Polestar": {
  brand_info:{ reliability_avg:3.6, parts_cost:"high", maintenance_cost_factor:1.10 },
  models:{
    "Polestar 2":{ segment:"mediano", reliability:{score:3.7,common_issues:["Software"],avg_repair_cost:520}, depreciation:{year1:0.21,year3:0.38,year5:0.52}, maintenance_yearly:380,
      versions:[
        {name:"SR Single 170cv",type:"ev",displacement:null,power_cv:170,power_kw:125,battery_kwh:69,priceRange:[46000,51000],consumption:{city:16.5,highway:20.2,real:18.6,range:420}},
        {name:"LR Single 299cv",type:"ev",displacement:null,power_cv:299,power_kw:220,battery_kwh:82,priceRange:[54000,60000],consumption:{city:17.5,highway:21.2,real:19.6,range:480}},
        {name:"LR Dual 476cv AWD",type:"ev",displacement:null,power_cv:476,power_kw:350,battery_kwh:82,priceRange:[62000,69000],consumption:{city:19.0,highway:23.5,real:21.5,range:450}}]},
    "Polestar 3":{ segment:"suv", reliability:{score:3.7,common_issues:["Software","Nuevo modelo"],avg_repair_cost:620}, depreciation:{year1:0.20,year3:0.37,year5:0.51}, maintenance_yearly:480,
      versions:[
        {name:"LR Dual 517cv AWD",type:"ev",displacement:null,power_cv:517,power_kw:380,battery_kwh:111,priceRange:[82000,92000],consumption:{city:21.0,highway:25.5,real:23.5,range:485}},
        {name:"Performance 680cv AWD",type:"ev",displacement:null,power_cv:680,power_kw:500,battery_kwh:111,priceRange:[96000,108000],consumption:{city:22.0,highway:27.0,real:24.8,range:460}}]}
  }
},
"Porsche": {
  brand_info:{ reliability_avg:4.0, parts_cost:"very_high", maintenance_cost_factor:2.00 },
  models:{
    "Macan":{ segment:"suv", reliability:{score:4.0,common_issues:["PDK","Electrónica"],avg_repair_cost:1100}, depreciation:{year1:0.14,year3:0.27,year5:0.39}, maintenance_yearly:1100,
      versions:[
        {name:"EV 408cv AWD",type:"ev",displacement:null,power_cv:408,power_kw:300,battery_kwh:100,priceRange:[68000,78000],consumption:{city:18.5,highway:22.5,real:20.8,range:480}},
        {name:"4S EV 516cv AWD",type:"ev",displacement:null,power_cv:516,power_kw:380,battery_kwh:100,priceRange:[85000,95000],consumption:{city:20.0,highway:24.5,real:22.5,range:450}},
        {name:"Turbo EV 639cv",type:"ev",displacement:null,power_cv:639,power_kw:470,battery_kwh:100,priceRange:[100000,112000],consumption:{city:21.5,highway:26.5,real:24.2,range:420}}]},
    "Cayenne":{ segment:"suv", reliability:{score:4.0,common_issues:["Electrónica","Suspensión"],avg_repair_cost:1200}, depreciation:{year1:0.14,year3:0.27,year5:0.39}, maintenance_yearly:1200,
      versions:[
        {name:"3.0 V6 353cv",type:"gasolina",displacement:"3.0",power_cv:353,power_kw:260,priceRange:[82000,92000],consumption:{city:12.5,highway:9.5,real:11.3}},
        {name:"S 4.0 V8 474cv",type:"gasolina",displacement:"4.0",power_cv:474,power_kw:348,priceRange:[100000,115000],consumption:{city:14.0,highway:10.8,real:12.6}},
        {name:"Turbo E-Hybrid 739cv PHEV",type:"phev",displacement:"4.0",power_cv:739,power_kw:543,battery_kwh:25.9,priceRange:[145000,168000],consumption:{city:4.0,highway:12.0,electric_range:60,real:5.2,electric_kwh:32}}]},
    "Taycan":{ segment:"mediano", reliability:{score:3.9,common_issues:["Software","Electrónica"],avg_repair_cost:950}, depreciation:{year1:0.17,year3:0.32,year5:0.45}, maintenance_yearly:850,
      versions:[
        {name:"RWD 408cv",type:"ev",displacement:null,power_cv:408,power_kw:300,battery_kwh:93.4,priceRange:[88000,98000],consumption:{city:19.5,highway:23.5,real:21.8,range:440}},
        {name:"4S 530cv AWD",type:"ev",displacement:null,power_cv:530,power_kw:390,battery_kwh:93.4,priceRange:[110000,124000],consumption:{city:20.5,highway:25.0,real:23.0,range:415}},
        {name:"Turbo S 938cv AWD",type:"ev",displacement:null,power_cv:938,power_kw:690,battery_kwh:105,priceRange:[175000,195000],consumption:{city:24.0,highway:29.5,real:27.0,range:390}}]},
    "911":{ segment:"deportivo", reliability:{score:4.2,common_issues:["Mantenimiento costoso"],avg_repair_cost:1800}, depreciation:{year1:0.08,year3:0.16,year5:0.24}, maintenance_yearly:1800,
      versions:[
        {name:"Carrera 3.0 379cv",type:"gasolina",displacement:"3.0",power_cv:379,power_kw:279,priceRange:[130000,145000],consumption:{city:11.5,highway:8.8,real:10.5}},
        {name:"Carrera S 3.0 450cv",type:"gasolina",displacement:"3.0",power_cv:450,power_kw:331,priceRange:[150000,170000],consumption:{city:12.2,highway:9.2,real:11.0}},
        {name:"GT3 510cv",type:"gasolina",displacement:"4.0",power_cv:510,power_kw:375,priceRange:[195000,220000],consumption:{city:13.5,highway:10.2,real:12.2}}]}
  }
},
"Land Rover": {
  brand_info:{ reliability_avg:2.8, parts_cost:"very_high", maintenance_cost_factor:1.80 },
  models:{
    "Defender":{ segment:"suv", reliability:{score:2.8,common_issues:["Electrónica","Fugas","Suspensión"],avg_repair_cost:1500}, depreciation:{year1:0.15,year3:0.29,year5:0.41}, maintenance_yearly:1500,
      versions:[
        {name:"D200 200cv diesel",type:"diesel",displacement:"2.0",power_cv:200,power_kw:147,priceRange:[55000,62000],consumption:{city:9.5,highway:7.2,real:8.6}},
        {name:"D250 249cv diesel",type:"diesel",displacement:"3.0",power_cv:249,power_kw:183,priceRange:[65000,72000],consumption:{city:10.0,highway:7.6,real:9.0}},
        {name:"P300 300cv gasolina",type:"gasolina",displacement:"2.0",power_cv:300,power_kw:220,priceRange:[62000,70000],consumption:{city:12.5,highway:9.5,real:11.3}},
        {name:"P400e 404cv PHEV",type:"phev",displacement:"2.0",power_cv:404,power_kw:297,battery_kwh:19.2,priceRange:[80000,92000],consumption:{city:3.0,highway:9.0,electric_range:42,real:3.9,electric_kwh:28}}]},
    "Range Rover Evoque":{ segment:"suv", reliability:{score:2.9,common_issues:["Electrónica","Transmisión"],avg_repair_cost:1200}, depreciation:{year1:0.18,year3:0.34,year5:0.47}, maintenance_yearly:1200,
      versions:[
        {name:"D165 165cv diesel",type:"diesel",displacement:"2.0",power_cv:165,power_kw:121,priceRange:[48000,53000],consumption:{city:6.8,highway:5.5,real:6.3}},
        {name:"P200 200cv gasolina",type:"gasolina",displacement:"2.0",power_cv:200,power_kw:147,priceRange:[50000,56000],consumption:{city:9.2,highway:7.0,real:8.3}},
        {name:"P300e 309cv PHEV",type:"phev",displacement:"1.5",power_cv:309,power_kw:227,battery_kwh:15,priceRange:[60000,68000],consumption:{city:2.2,highway:7.0,electric_range:56,real:3.0,electric_kwh:22}}]},
    "Range Rover Sport":{ segment:"suv", reliability:{score:2.8,common_issues:["Electrónica","Suspensión"],avg_repair_cost:1800}, depreciation:{year1:0.16,year3:0.31,year5:0.44}, maintenance_yearly:1800,
      versions:[
        {name:"D300 300cv diesel",type:"diesel",displacement:"3.0",power_cv:300,power_kw:220,priceRange:[85000,96000],consumption:{city:10.2,highway:7.8,real:9.2}},
        {name:"P460e 460cv PHEV",type:"phev",displacement:"3.0",power_cv:460,power_kw:338,battery_kwh:38.2,priceRange:[105000,120000],consumption:{city:3.2,highway:9.5,electric_range:100,real:4.2,electric_kwh:30}}]}
  }
},
"Jaguar": {
  brand_info:{ reliability_avg:3.0, parts_cost:"high", maintenance_cost_factor:1.50 },
  models:{
    "F-Pace":{ segment:"suv", reliability:{score:3.0,common_issues:["Electrónica","Motor"],avg_repair_cost:1100}, depreciation:{year1:0.20,year3:0.38,year5:0.52}, maintenance_yearly:1150,
      versions:[
        {name:"D165 165cv diesel",type:"diesel",displacement:"2.0",power_cv:165,power_kw:121,priceRange:[55000,62000],consumption:{city:6.8,highway:5.5,real:6.3}},
        {name:"P250 250cv gasolina",type:"gasolina",displacement:"2.0",power_cv:250,power_kw:184,priceRange:[60000,68000],consumption:{city:11.0,highway:8.2,real:9.9}},
        {name:"P400e 400cv PHEV",type:"phev",displacement:"2.0",power_cv:400,power_kw:294,battery_kwh:17,priceRange:[78000,88000],consumption:{city:2.8,highway:8.5,electric_range:50,real:3.7,electric_kwh:26}}]}
  }
},
"Lexus": {
  brand_info:{ reliability_avg:4.6, parts_cost:"high", maintenance_cost_factor:1.20 },
  models:{
    "UX":{ segment:"suv", reliability:{score:4.7,common_issues:["Pocos problemas"],avg_repair_cost:450}, depreciation:{year1:0.15,year3:0.29,year5:0.41}, maintenance_yearly:520,
      versions:[
        {name:"250h 184cv HEV",type:"hibrido",displacement:"2.0",power_cv:184,power_kw:135,priceRange:[40000,45000],consumption:{city:4.5,highway:4.9,real:4.8}},
        {name:"300e 204cv EV",type:"ev",displacement:null,power_cv:204,power_kw:150,battery_kwh:72.8,priceRange:[48000,54000],consumption:{city:17.5,highway:21.2,real:19.6,range:400}}]},
    "NX":{ segment:"suv", reliability:{score:4.6,common_issues:["Pocos problemas"],avg_repair_cost:520}, depreciation:{year1:0.14,year3:0.28,year5:0.39}, maintenance_yearly:580,
      versions:[
        {name:"250h 245cv HEV",type:"hibrido",displacement:"2.5",power_cv:245,power_kw:180,priceRange:[50000,56000],consumption:{city:5.5,highway:5.9,real:5.8}},
        {name:"350h 309cv HEV AWD",type:"hibrido",displacement:"2.5",power_cv:309,power_kw:227,priceRange:[56000,63000],consumption:{city:6.0,highway:6.4,real:6.3}},
        {name:"450h+ 309cv PHEV",type:"phev",displacement:"2.5",power_cv:309,power_kw:227,battery_kwh:18.1,priceRange:[62000,70000],consumption:{city:1.9,highway:6.3,electric_range:62,real:2.6,electric_kwh:18}}]},
    "RX":{ segment:"suv", reliability:{score:4.7,common_issues:["Pocos problemas"],avg_repair_cost:580}, depreciation:{year1:0.13,year3:0.26,year5:0.37}, maintenance_yearly:650,
      versions:[
        {name:"350h 246cv HEV FWD",type:"hibrido",displacement:"2.5",power_cv:246,power_kw:181,priceRange:[65000,73000],consumption:{city:6.5,highway:7.0,real:6.8}},
        {name:"450h+ 309cv PHEV AWD",type:"phev",displacement:"2.5",power_cv:309,power_kw:227,battery_kwh:18.1,priceRange:[75000,85000],consumption:{city:2.2,highway:7.0,electric_range:65,real:3.0,electric_kwh:20}}]}
  }
},
"Honda": {
  brand_info:{ reliability_avg:4.2, parts_cost:"medium", maintenance_cost_factor:0.95 },
  models:{
    "Jazz":{ segment:"pequeño", reliability:{score:4.4,common_issues:["Pocos problemas"],avg_repair_cost:320}, depreciation:{year1:0.16,year3:0.31,year5:0.43}, maintenance_yearly:370,
      versions:[
        {name:"1.5 i-MMD 109cv HEV",type:"hibrido",displacement:"1.5",power_cv:109,power_kw:80,priceRange:[23000,26000],consumption:{city:4.0,highway:4.4,real:4.3}},
        {name:"Crosstar 1.5 i-MMD 109cv",type:"hibrido",displacement:"1.5",power_cv:109,power_kw:80,priceRange:[26000,29000],consumption:{city:4.2,highway:4.6,real:4.5}}]},
    "HR-V":{ segment:"suv", reliability:{score:4.3,common_issues:["Pocos problemas"],avg_repair_cost:380}, depreciation:{year1:0.17,year3:0.33,year5:0.46}, maintenance_yearly:440,
      versions:[
        {name:"1.5 i-MMD 131cv HEV",type:"hibrido",displacement:"1.5",power_cv:131,power_kw:96,priceRange:[29000,33000],consumption:{city:5.0,highway:5.4,real:5.3}},
        {name:"Advance 1.5 i-MMD 131cv",type:"hibrido",displacement:"1.5",power_cv:131,power_kw:96,priceRange:[33000,37000],consumption:{city:5.2,highway:5.6,real:5.5}}]},
    "CR-V":{ segment:"suv", reliability:{score:4.2,common_issues:["Nuevo PHEV"],avg_repair_cost:480}, depreciation:{year1:0.16,year3:0.31,year5:0.44}, maintenance_yearly:540,
      versions:[
        {name:"2.0 i-MMD 184cv HEV",type:"hibrido",displacement:"2.0",power_cv:184,power_kw:135,priceRange:[42000,47000],consumption:{city:5.5,highway:5.9,real:5.8}},
        {name:"2.0 PHEV 204cv AWD",type:"phev",displacement:"2.0",power_cv:204,power_kw:150,battery_kwh:17.7,priceRange:[50000,56000],consumption:{city:1.9,highway:6.3,electric_range:60,real:2.6,electric_kwh:17}}]}
  }
},
"Mitsubishi": {
  brand_info:{ reliability_avg:3.8, parts_cost:"medium", maintenance_cost_factor:0.90 },
  models:{
    "ASX":{ segment:"suv", reliability:{score:3.9,common_issues:["Electrónica"],avg_repair_cost:390}, depreciation:{year1:0.19,year3:0.36,year5:0.49}, maintenance_yearly:430,
      versions:[
        {name:"1.0 MHEV 100cv",type:"hibrido",displacement:"1.0",power_cv:100,power_kw:74,priceRange:[22000,25500],consumption:{city:6.2,highway:4.8,real:5.7}},
        {name:"1.6 HEV 143cv",type:"hibrido",displacement:"1.6",power_cv:143,power_kw:105,priceRange:[28000,32000],consumption:{city:5.0,highway:5.4,real:5.3}},
        {name:"1.6 PHEV 162cv 4WD",type:"phev",displacement:"1.6",power_cv:162,power_kw:119,battery_kwh:13.8,priceRange:[34000,39000],consumption:{city:1.8,highway:6.0,electric_range:55,real:2.5,electric_kwh:17}}]},
    "Outlander":{ segment:"suv", reliability:{score:3.8,common_issues:["Electrónica PHEV"],avg_repair_cost:480}, depreciation:{year1:0.17,year3:0.33,year5:0.46}, maintenance_yearly:520,
      versions:[
        {name:"PHEV 248cv 4WD",type:"phev",displacement:"2.4",power_cv:248,power_kw:182,battery_kwh:20,priceRange:[45000,50000],consumption:{city:2.0,highway:6.5,electric_range:70,real:2.7,electric_kwh:20}},
        {name:"PHEV 248cv Instyle 4WD",type:"phev",displacement:"2.4",power_cv:248,power_kw:182,battery_kwh:20,priceRange:[49000,55000],consumption:{city:2.1,highway:6.7,electric_range:70,real:2.8,electric_kwh:21}}]}
  }
},
"Subaru": {
  brand_info:{ reliability_avg:4.0, parts_cost:"medium", maintenance_cost_factor:1.00 },
  models:{
    "Forester":{ segment:"suv", reliability:{score:4.1,common_issues:["Pocos problemas"],avg_repair_cost:480}, depreciation:{year1:0.17,year3:0.33,year5:0.46}, maintenance_yearly:540,
      versions:[
        {name:"2.0ie 150cv e-Boxer",type:"hibrido",displacement:"2.0",power_cv:150,power_kw:110,priceRange:[37000,41000],consumption:{city:6.5,highway:6.9,real:6.8}},
        {name:"2.0ie Platinum 150cv",type:"hibrido",displacement:"2.0",power_cv:150,power_kw:110,priceRange:[41000,45000],consumption:{city:6.7,highway:7.1,real:7.0}}]},
    "Solterra":{ segment:"suv", reliability:{score:4.0,common_issues:["Software"],avg_repair_cost:380}, depreciation:{year1:0.19,year3:0.35,year5:0.49}, maintenance_yearly:290,
      versions:[
        {name:"218cv FWD 71.4kWh",type:"ev",displacement:null,power_cv:218,power_kw:160,battery_kwh:71.4,priceRange:[48000,52000],consumption:{city:16.2,highway:19.8,real:18.2,range:410}},
        {name:"218cv AWD 72.8kWh",type:"ev",displacement:null,power_cv:218,power_kw:160,battery_kwh:72.8,priceRange:[52000,57000],consumption:{city:17.0,highway:20.8,real:19.2,range:390}}]}
  }
},
"DS": {
  brand_info:{ reliability_avg:3.2, parts_cost:"high", maintenance_cost_factor:1.20 },
  models:{
    "DS3":{ segment:"pequeño", reliability:{score:3.3,common_issues:["EAT8","Electrónica"],avg_repair_cost:550}, depreciation:{year1:0.21,year3:0.39,year5:0.53}, maintenance_yearly:600,
      versions:[
        {name:"PureTech 130cv",type:"gasolina",displacement:"1.2",power_cv:130,power_kw:96,priceRange:[28000,32000],consumption:{city:6.8,highway:5.2,real:6.2}},
        {name:"E-Tense 156cv 54kWh",type:"ev",displacement:null,power_cv:156,power_kw:115,battery_kwh:54,priceRange:[38000,42000],consumption:{city:16.5,highway:20.2,real:18.6,range:330}}]},
    "DS4":{ segment:"mediano", reliability:{score:3.2,common_issues:["Electrónica"],avg_repair_cost:620}, depreciation:{year1:0.21,year3:0.39,year5:0.53}, maintenance_yearly:660,
      versions:[
        {name:"PureTech 130cv",type:"gasolina",displacement:"1.2",power_cv:130,power_kw:96,priceRange:[37000,41000],consumption:{city:7.0,highway:5.3,real:6.4}},
        {name:"E-Tense 225cv PHEV",type:"phev",displacement:"1.6",power_cv:225,power_kw:165,battery_kwh:12.4,priceRange:[46000,52000],consumption:{city:1.8,highway:6.2,electric_range:55,real:2.5,electric_kwh:17}}]},
    "DS7":{ segment:"suv", reliability:{score:3.2,common_issues:["Suspensión hidráulica"],avg_repair_cost:720}, depreciation:{year1:0.21,year3:0.39,year5:0.53}, maintenance_yearly:760,
      versions:[
        {name:"BlueHDi 130cv",type:"diesel",displacement:"1.5",power_cv:130,power_kw:96,priceRange:[48000,53000],consumption:{city:5.5,highway:4.4,real:5.1}},
        {name:"E-Tense 360cv PHEV 4x4",type:"phev",displacement:"1.6",power_cv:360,power_kw:265,battery_kwh:14.2,priceRange:[65000,73000],consumption:{city:2.1,highway:7.0,electric_range:50,real:2.8,electric_kwh:21}}]}
  }
},
"Lancia": {
  brand_info:{ reliability_avg:3.5, parts_cost:"medium", maintenance_cost_factor:1.00 },
  models:{
    "Ypsilon":{ segment:"pequeño", reliability:{score:3.5,common_issues:["Nuevo modelo 2024"],avg_repair_cost:380}, depreciation:{year1:0.20,year3:0.37,year5:0.51}, maintenance_yearly:400,
      versions:[
        {name:"1.2 Hybrid 100cv",type:"hibrido",displacement:"1.2",power_cv:100,power_kw:74,priceRange:[22000,25000],consumption:{city:5.2,highway:4.0,real:4.8}},
        {name:"Electric 156cv 54kWh",type:"ev",displacement:null,power_cv:156,power_kw:115,battery_kwh:54,priceRange:[30000,34000],consumption:{city:14.5,highway:17.8,real:16.4,range:330}}]}
  }
},
"Alpine": {
  brand_info:{ reliability_avg:3.5, parts_cost:"high", maintenance_cost_factor:1.50 },
  models:{
    "A110":{ segment:"deportivo", reliability:{score:3.6,common_issues:["Red servicio limitada"],avg_repair_cost:850}, depreciation:{year1:0.14,year3:0.27,year5:0.39}, maintenance_yearly:950,
      versions:[
        {name:"1.8 Turbo 300cv",type:"gasolina",displacement:"1.8",power_cv:300,power_kw:220,priceRange:[62000,68000],consumption:{city:8.8,highway:6.6,real:7.9}},
        {name:"S 1.8 Turbo 300cv",type:"gasolina",displacement:"1.8",power_cv:300,power_kw:220,priceRange:[70000,76000],consumption:{city:9.0,highway:6.8,real:8.1}},
        {name:"GT 1.8 Turbo 300cv",type:"gasolina",displacement:"1.8",power_cv:300,power_kw:220,priceRange:[78000,85000],consumption:{city:9.2,highway:7.0,real:8.3}}]}
  }
},
"Tesla": {
  brand_info:{ reliability_avg:3.8, parts_cost:"high", maintenance_cost_factor:0.50 },
  models:{
    "Model 3":{ segment:"mediano", reliability:{score:3.9,common_issues:["Calidad pintura","Ruidos"],avg_repair_cost:480}, depreciation:{year1:0.19,year3:0.35,year5:0.48}, maintenance_yearly:220,
      versions:[
        {name:"RWD 283cv 60kWh",type:"ev",displacement:null,power_cv:283,power_kw:208,battery_kwh:60,priceRange:[38000,42000],consumption:{city:13.8,highway:17.0,real:15.6,range:390}},
        {name:"LR AWD 358cv 78.1kWh",type:"ev",displacement:null,power_cv:358,power_kw:263,battery_kwh:78.1,priceRange:[44000,49000],consumption:{city:14.5,highway:17.8,real:16.4,range:570}},
        {name:"Performance AWD 460cv",type:"ev",displacement:null,power_cv:460,power_kw:338,battery_kwh:78.1,priceRange:[53000,59000],consumption:{city:16.0,highway:19.5,real:18.0,range:528}}]},
    "Model Y":{ segment:"suv", reliability:{score:3.8,common_issues:["Calidad acabados","Suspensión"],avg_repair_cost:520}, depreciation:{year1:0.18,year3:0.34,year5:0.47}, maintenance_yearly:240,
      versions:[
        {name:"RWD 286cv 60kWh",type:"ev",displacement:null,power_cv:286,power_kw:210,battery_kwh:60,priceRange:[42000,46000],consumption:{city:16.2,highway:19.8,real:18.2,range:390}},
        {name:"LR AWD 393cv 78.1kWh",type:"ev",displacement:null,power_cv:393,power_kw:289,battery_kwh:78.1,priceRange:[49000,54000],consumption:{city:17.5,highway:21.5,real:19.8,range:533}},
        {name:"Performance AWD 544cv",type:"ev",displacement:null,power_cv:544,power_kw:400,battery_kwh:78.1,priceRange:[58000,64000],consumption:{city:18.5,highway:22.8,real:21.0,range:480}}]},
    "Model S":{ segment:"mediano", reliability:{score:3.7,common_issues:["Suspensión","MCU"],avg_repair_cost:720}, depreciation:{year1:0.20,year3:0.36,year5:0.50}, maintenance_yearly:320,
      versions:[
        {name:"Dual Motor AWD 670cv",type:"ev",displacement:null,power_cv:670,power_kw:493,battery_kwh:100,priceRange:[90000,100000],consumption:{city:17.5,highway:21.2,real:19.6,range:600}},
        {name:"Plaid 1020cv",type:"ev",displacement:null,power_cv:1020,power_kw:750,battery_kwh:100,priceRange:[115000,125000],consumption:{city:19.5,highway:24.0,real:22.0,range:560}}]}
  }
},
"BYD": {
  brand_info:{ reliability_avg:3.9, parts_cost:"medium", maintenance_cost_factor:0.75 },
  models:{
    "Atto 3":{ segment:"suv", reliability:{score:4.0,common_issues:["Nuevos en Europa","Software"],avg_repair_cost:350}, depreciation:{year1:0.22,year3:0.40,year5:0.55}, maintenance_yearly:280,
      versions:[
        {name:"60.5kWh 204cv",type:"ev",displacement:null,power_cv:204,power_kw:150,battery_kwh:60.5,priceRange:[35000,38000],consumption:{city:16.0,highway:19.5,real:18.0,range:330}},
        {name:"72.8kWh 204cv Extended",type:"ev",displacement:null,power_cv:204,power_kw:150,battery_kwh:72.8,priceRange:[38000,42000],consumption:{city:16.2,highway:19.8,real:18.2,range:380}}]},
    "Seal":{ segment:"mediano", reliability:{score:3.9,common_issues:["Nuevos en Europa"],avg_repair_cost:380}, depreciation:{year1:0.21,year3:0.38,year5:0.52}, maintenance_yearly:290,
      versions:[
        {name:"RWD 313cv 82.5kWh",type:"ev",displacement:null,power_cv:313,power_kw:230,battery_kwh:82.5,priceRange:[44000,48000],consumption:{city:15.5,highway:18.9,real:17.4,range:460}},
        {name:"AWD 530cv Excellence",type:"ev",displacement:null,power_cv:530,power_kw:390,battery_kwh:82.5,priceRange:[52000,58000],consumption:{city:16.8,highway:20.5,real:18.9,range:420}}]},
    "Seal U DM-i":{ segment:"suv", reliability:{score:3.9,common_issues:["Nuevos en Europa"],avg_repair_cost:400}, depreciation:{year1:0.21,year3:0.38,year5:0.52}, maintenance_yearly:310,
      versions:[
        {name:"1.5 DM-i 215cv PHEV",type:"phev",displacement:"1.5",power_cv:215,power_kw:158,battery_kwh:15.2,priceRange:[40000,44000],consumption:{city:1.6,highway:5.8,electric_range:80,real:2.2,electric_kwh:17}},
        {name:"1.5 DM-i Boost 310cv PHEV",type:"phev",displacement:"1.5",power_cv:310,power_kw:228,battery_kwh:15.2,priceRange:[44000,50000],consumption:{city:1.7,highway:6.0,electric_range:75,real:2.3,electric_kwh:17}}]}
  }
},
"MG": {
  brand_info:{ reliability_avg:3.6, parts_cost:"low", maintenance_cost_factor:0.75 },
  models:{
    "MG3":{ segment:"pequeño", reliability:{score:3.7,common_issues:["Red concesionarios","Software"],avg_repair_cost:320}, depreciation:{year1:0.22,year3:0.41,year5:0.56}, maintenance_yearly:340,
      versions:[
        {name:"1.5 VTi-Tech 106cv",type:"gasolina",displacement:"1.5",power_cv:106,power_kw:78,priceRange:[16000,18500],consumption:{city:6.5,highway:5.0,real:5.9}},
        {name:"Hybrid+ 194cv",type:"hibrido",displacement:"1.5",power_cv:194,power_kw:143,priceRange:[19000,22500],consumption:{city:4.5,highway:4.9,real:4.8}}]},
    "MG4":{ segment:"mediano", reliability:{score:3.7,common_issues:["Software"],avg_repair_cost:340}, depreciation:{year1:0.23,year3:0.42,year5:0.57}, maintenance_yearly:270,
      versions:[
        {name:"Comfort 170cv 64kWh",type:"ev",displacement:null,power_cv:170,power_kw:125,battery_kwh:64,priceRange:[27000,30000],consumption:{city:15.2,highway:18.8,real:17.2,range:370}},
        {name:"Luxury 170cv 64kWh",type:"ev",displacement:null,power_cv:170,power_kw:125,battery_kwh:64,priceRange:[30000,33500],consumption:{city:15.5,highway:19.0,real:17.5,range:370}},
        {name:"XPOWER 435cv AWD",type:"ev",displacement:null,power_cv:435,power_kw:320,battery_kwh:64,priceRange:[36000,40000],consumption:{city:18.5,highway:22.8,real:21.0,range:315}}]},
    "ZS EV":{ segment:"suv", reliability:{score:3.6,common_issues:["Software","Carga rápida"],avg_repair_cost:360}, depreciation:{year1:0.24,year3:0.43,year5:0.58}, maintenance_yearly:290,
      versions:[
        {name:"Comfort 177cv 72.6kWh",type:"ev",displacement:null,power_cv:177,power_kw:130,battery_kwh:72.6,priceRange:[31000,34000],consumption:{city:16.8,highway:20.5,real:18.9,range:400}},
        {name:"Luxury 177cv 72.6kWh",type:"ev",displacement:null,power_cv:177,power_kw:130,battery_kwh:72.6,priceRange:[34000,37500],consumption:{city:17.0,highway:20.8,real:19.2,range:400}}]},
    "HS PHEV":{ segment:"suv", reliability:{score:3.6,common_issues:["Electrónica"],avg_repair_cost:380}, depreciation:{year1:0.23,year3:0.42,year5:0.57}, maintenance_yearly:410,
      versions:[
        {name:"1.5T PHEV 258cv",type:"phev",displacement:"1.5",power_cv:258,power_kw:190,battery_kwh:16.6,priceRange:[35000,39000],consumption:{city:2.0,highway:6.5,electric_range:60,real:2.7,electric_kwh:19}},
        {name:"1.5T PHEV+ 334cv AWD",type:"phev",displacement:"1.5",power_cv:334,power_kw:246,battery_kwh:16.6,priceRange:[39000,43000],consumption:{city:2.1,highway:6.8,electric_range:55,real:2.8,electric_kwh:20}}]}
  }
},
"Xpeng": {
  brand_info:{ reliability_avg:3.7, parts_cost:"medium", maintenance_cost_factor:0.80 },
  models:{
    "G6":{ segment:"suv", reliability:{score:3.8,common_issues:["Red servicio limitada"],avg_repair_cost:380}, depreciation:{year1:0.22,year3:0.40,year5:0.55}, maintenance_yearly:290,
      versions:[
        {name:"RWD 218cv 76.3kWh",type:"ev",displacement:null,power_cv:218,power_kw:160,battery_kwh:76.3,priceRange:[42000,46000],consumption:{city:15.8,highway:19.2,real:17.8,range:435}},
        {name:"AWD 428cv 87.5kWh",type:"ev",displacement:null,power_cv:428,power_kw:315,battery_kwh:87.5,priceRange:[50000,56000],consumption:{city:17.5,highway:21.5,real:19.8,range:500}}]},
    "P7":{ segment:"mediano", reliability:{score:3.7,common_issues:["Red servicio limitada"],avg_repair_cost:400}, depreciation:{year1:0.22,year3:0.40,year5:0.55}, maintenance_yearly:300,
      versions:[
        {name:"RWD 245cv 80.7kWh",type:"ev",displacement:null,power_cv:245,power_kw:180,battery_kwh:80.7,priceRange:[48000,53000],consumption:{city:15.5,highway:19.0,real:17.5,range:480}},
        {name:"AWD 477cv 86.2kWh",type:"ev",displacement:null,power_cv:477,power_kw:351,battery_kwh:86.2,priceRange:[58000,65000],consumption:{city:17.0,highway:20.8,real:19.2,range:520}}]}
  }
},
"Zeekr": {
  brand_info:{ reliability_avg:3.8, parts_cost:"medium", maintenance_cost_factor:0.80 },
  models:{
    "001":{ segment:"deportivo", reliability:{score:3.8,common_issues:["Nueva marca en Europa"],avg_repair_cost:420}, depreciation:{year1:0.22,year3:0.40,year5:0.55}, maintenance_yearly:320,
      versions:[
        {name:"RWD 272cv 86kWh",type:"ev",displacement:null,power_cv:272,power_kw:200,battery_kwh:86,priceRange:[55000,60000],consumption:{city:17.5,highway:21.5,real:19.8,range:475}},
        {name:"AWD 544cv 100kWh",type:"ev",displacement:null,power_cv:544,power_kw:400,battery_kwh:100,priceRange:[65000,73000],consumption:{city:19.5,highway:23.8,real:21.8,range:490}}]},
    "X":{ segment:"suv", reliability:{score:3.8,common_issues:["Nueva marca en Europa"],avg_repair_cost:380}, depreciation:{year1:0.22,year3:0.40,year5:0.55}, maintenance_yearly:290,
      versions:[
        {name:"RWD 272cv 66kWh",type:"ev",displacement:null,power_cv:272,power_kw:200,battery_kwh:66,priceRange:[38000,43000],consumption:{city:15.5,highway:19.0,real:17.5,range:370}},
        {name:"AWD 402cv 66kWh",type:"ev",displacement:null,power_cv:402,power_kw:296,battery_kwh:66,priceRange:[44000,50000],consumption:{city:17.0,highway:20.8,real:19.2,range:350}}]}
  }
},
"Leapmotor": {
  brand_info:{ reliability_avg:3.6, parts_cost:"low", maintenance_cost_factor:0.70 },
  models:{
    "T03":{ segment:"pequeño", reliability:{score:3.7,common_issues:["Nueva en Europa"],avg_repair_cost:280}, depreciation:{year1:0.23,year3:0.42,year5:0.57}, maintenance_yearly:230,
      versions:[
        {name:"95cv 37.3kWh",type:"ev",displacement:null,power_cv:95,power_kw:70,battery_kwh:37.3,priceRange:[17000,19500],consumption:{city:12.8,highway:15.8,real:14.5,range:245}},
        {name:"Plus 95cv 37.3kWh",type:"ev",displacement:null,power_cv:95,power_kw:70,battery_kwh:37.3,priceRange:[19500,22000],consumption:{city:13.0,highway:16.0,real:14.7,range:265}}]},
    "C10":{ segment:"suv", reliability:{score:3.6,common_issues:["Nueva en Europa"],avg_repair_cost:350}, depreciation:{year1:0.23,year3:0.42,year5:0.57}, maintenance_yearly:280,
      versions:[
        {name:"RWD 218cv 69.9kWh",type:"ev",displacement:null,power_cv:218,power_kw:160,battery_kwh:69.9,priceRange:[32000,36000],consumption:{city:16.5,highway:20.2,real:18.6,range:400}},
        {name:"AWD 354cv 69.9kWh",type:"ev",displacement:null,power_cv:354,power_kw:260,battery_kwh:69.9,priceRange:[38000,43000],consumption:{city:18.5,highway:22.8,real:21.0,range:370}}]}
  }
},
"Genesis": {
  brand_info:{ reliability_avg:4.1, parts_cost:"high", maintenance_cost_factor:1.10 },
  models:{
    "GV60":{ segment:"suv", reliability:{score:4.2,common_issues:["Nuevo en Europa"],avg_repair_cost:480}, depreciation:{year1:0.19,year3:0.35,year5:0.49}, maintenance_yearly:380,
      versions:[
        {name:"Standard RWD 228cv",type:"ev",displacement:null,power_cv:228,power_kw:168,battery_kwh:77.4,priceRange:[55000,61000],consumption:{city:16.5,highway:20.2,real:18.6,range:400}},
        {name:"Performance AWD 490cv",type:"ev",displacement:null,power_cv:490,power_kw:360,battery_kwh:77.4,priceRange:[68000,75000],consumption:{city:18.2,highway:22.5,real:20.5,range:370}},
        {name:"Magma AWD 578cv",type:"ev",displacement:null,power_cv:578,power_kw:425,battery_kwh:77.4,priceRange:[78000,86000],consumption:{city:19.5,highway:24.0,real:22.0,range:350}}]},
    "GV70":{ segment:"suv", reliability:{score:4.1,common_issues:["Red limitada en España"],avg_repair_cost:520}, depreciation:{year1:0.19,year3:0.35,year5:0.49}, maintenance_yearly:420,
      versions:[
        {name:"2.5T 304cv AWD gasolina",type:"gasolina",displacement:"2.5",power_cv:304,power_kw:224,priceRange:[55000,62000],consumption:{city:10.0,highway:7.5,real:9.0}},
        {name:"2.2D 210cv AWD diesel",type:"diesel",displacement:"2.2",power_cv:210,power_kw:154,priceRange:[57000,64000],consumption:{city:7.8,highway:6.2,real:7.2}},
        {name:"Electrified 490cv AWD",type:"ev",displacement:null,power_cv:490,power_kw:360,battery_kwh:77.4,priceRange:[72000,80000],consumption:{city:18.0,highway:22.0,real:20.2,range:400}}]}
  }
},
"Bentley": {
  brand_info:{ reliability_avg:3.5, parts_cost:"very_high", maintenance_cost_factor:4.00 },
  models:{
    "Bentayga":{ segment:"suv", reliability:{score:3.5,common_issues:["Electrónica","Muy costoso mantener"],avg_repair_cost:4500}, depreciation:{year1:0.14,year3:0.27,year5:0.38}, maintenance_yearly:4500,
      versions:[
        {name:"V8 558cv",type:"gasolina",displacement:"4.0",power_cv:558,power_kw:410,priceRange:[185000,205000],consumption:{city:19.5,highway:14.5,real:17.6}},
        {name:"Hybrid 462cv PHEV",type:"phev",displacement:"3.0",power_cv:462,power_kw:340,battery_kwh:18,priceRange:[200000,225000],consumption:{city:3.5,highway:11.5,electric_range:40,real:4.6,electric_kwh:32}},
        {name:"Speed V8 635cv",type:"gasolina",displacement:"4.0",power_cv:635,power_kw:467,priceRange:[240000,270000],consumption:{city:21.0,highway:15.5,real:18.9}}]},
    "Continental GT":{ segment:"deportivo", reliability:{score:3.6,common_issues:["Electrónica","Muy costoso"],avg_repair_cost:5000}, depreciation:{year1:0.12,year3:0.23,year5:0.34}, maintenance_yearly:5000,
      versions:[
        {name:"V8 550cv",type:"gasolina",displacement:"4.0",power_cv:550,power_kw:405,priceRange:[220000,245000],consumption:{city:18.5,highway:13.5,real:16.7}},
        {name:"W12 659cv",type:"gasolina",displacement:"6.0",power_cv:659,power_kw:485,priceRange:[255000,280000],consumption:{city:21.5,highway:16.0,real:19.4}},
        {name:"Speed W12 659cv",type:"gasolina",displacement:"6.0",power_cv:659,power_kw:485,priceRange:[280000,310000],consumption:{city:22.0,highway:16.5,real:19.9}}]}
  }
},
"Rolls-Royce": {
  brand_info:{ reliability_avg:3.8, parts_cost:"very_high", maintenance_cost_factor:8.00 },
  models:{
    "Cullinan":{ segment:"suv", reliability:{score:3.8,common_issues:["Muy costoso mantener"],avg_repair_cost:8000}, depreciation:{year1:0.12,year3:0.23,year5:0.33}, maintenance_yearly:8000,
      versions:[
        {name:"V12 6.75 571cv",type:"gasolina",displacement:"6.75",power_cv:571,power_kw:420,priceRange:[350000,400000],consumption:{city:24.5,highway:17.5,real:21.8}},
        {name:"Black Badge V12 600cv",type:"gasolina",displacement:"6.75",power_cv:600,power_kw:441,priceRange:[400000,460000],consumption:{city:25.0,highway:18.0,real:22.2}}]},
    "Ghost":{ segment:"mediano", reliability:{score:3.9,common_issues:["Muy costoso mantener"],avg_repair_cost:7000}, depreciation:{year1:0.11,year3:0.22,year5:0.32}, maintenance_yearly:7000,
      versions:[
        {name:"V12 6.75 571cv",type:"gasolina",displacement:"6.75",power_cv:571,power_kw:420,priceRange:[320000,360000],consumption:{city:22.5,highway:16.5,real:20.1}},
        {name:"Extended V12 571cv",type:"gasolina",displacement:"6.75",power_cv:571,power_kw:420,priceRange:[360000,410000],consumption:{city:23.0,highway:17.0,real:20.6}}]},
    "Spectre":{ segment:"mediano", reliability:{score:3.8,common_issues:["Muy costoso mantener"],avg_repair_cost:6000}, depreciation:{year1:0.13,year3:0.25,year5:0.36}, maintenance_yearly:6000,
      versions:[
        {name:"EV 577cv AWD 102kWh",type:"ev",displacement:null,power_cv:577,power_kw:425,battery_kwh:102,priceRange:[380000,440000],consumption:{city:22.5,highway:27.5,real:25.2,range:430}}]}
  }
},
"Maserati": {
  brand_info:{ reliability_avg:3.0, parts_cost:"very_high", maintenance_cost_factor:2.50 },
  models:{
    "Grecale":{ segment:"suv", reliability:{score:3.0,common_issues:["Electrónica","Red servicio limitada"],avg_repair_cost:1800}, depreciation:{year1:0.20,year3:0.38,year5:0.52}, maintenance_yearly:1800,
      versions:[
        {name:"GT 2.0 300cv",type:"gasolina",displacement:"2.0",power_cv:300,power_kw:220,priceRange:[70000,78000],consumption:{city:11.5,highway:8.5,real:10.4}},
        {name:"Modena 2.0 330cv",type:"gasolina",displacement:"2.0",power_cv:330,power_kw:243,priceRange:[78000,88000],consumption:{city:12.0,highway:9.0,real:10.8}},
        {name:"Trofeo V6 3.0 530cv",type:"gasolina",displacement:"3.0",power_cv:530,power_kw:390,priceRange:[105000,118000],consumption:{city:16.5,highway:12.0,real:14.9}},
        {name:"Folgore EV 557cv 105kWh",type:"ev",displacement:null,power_cv:557,power_kw:410,battery_kwh:105,priceRange:[105000,118000],consumption:{city:21.5,highway:26.5,real:24.2,range:430}}]},
    "Levante":{ segment:"suv", reliability:{score:2.9,common_issues:["Electrónica","Motor ZF"],avg_repair_cost:2000}, depreciation:{year1:0.21,year3:0.39,year5:0.53}, maintenance_yearly:2000,
      versions:[
        {name:"GT 2.0 300cv",type:"gasolina",displacement:"2.0",power_cv:300,power_kw:220,priceRange:[85000,95000],consumption:{city:13.5,highway:10.0,real:12.2}},
        {name:"S V6 3.0 430cv",type:"gasolina",displacement:"3.0",power_cv:430,power_kw:316,priceRange:[100000,112000],consumption:{city:16.0,highway:12.0,real:14.4}},
        {name:"Trofeo V8 3.8 580cv",type:"gasolina",displacement:"3.8",power_cv:580,power_kw:427,priceRange:[130000,145000],consumption:{city:19.5,highway:14.5,real:17.6}}]}
  }
},
"Ferrari": {
  brand_info:{ reliability_avg:3.9, parts_cost:"very_high", maintenance_cost_factor:10.00 },
  models:{
    "Roma":{ segment:"deportivo", reliability:{score:3.9,common_issues:["Mantenimiento muy especializado"],avg_repair_cost:7000}, depreciation:{year1:0.08,year3:0.16,year5:0.24}, maintenance_yearly:7000,
      versions:[
        {name:"V8 3.9 620cv",type:"gasolina",displacement:"3.9",power_cv:620,power_kw:456,priceRange:[220000,250000],consumption:{city:16.5,highway:12.5,real:14.9}},
        {name:"Spider V8 3.9 620cv",type:"gasolina",displacement:"3.9",power_cv:620,power_kw:456,priceRange:[250000,280000],consumption:{city:17.0,highway:12.8,real:15.3}}]},
    "SF90":{ segment:"deportivo", reliability:{score:3.9,common_issues:["Mantenimiento muy especializado"],avg_repair_cost:12000}, depreciation:{year1:0.05,year3:0.10,year5:0.15}, maintenance_yearly:12000,
      versions:[
        {name:"Stradale PHEV 1000cv",type:"phev",displacement:"4.0",power_cv:1000,power_kw:735,battery_kwh:7.9,priceRange:[450000,510000],consumption:{city:5.5,highway:9.8,electric_range:25,real:9.8,electric_kwh:30}},
        {name:"Spider PHEV 1000cv",type:"phev",displacement:"4.0",power_cv:1000,power_kw:735,battery_kwh:7.9,priceRange:[500000,560000],consumption:{city:5.8,highway:10.0,electric_range:25,real:10.0,electric_kwh:30}}]},
    "Purosangue":{ segment:"suv", reliability:{score:3.9,common_issues:["Mantenimiento muy especializado"],avg_repair_cost:10000}, depreciation:{year1:0.07,year3:0.14,year5:0.21}, maintenance_yearly:10000,
      versions:[
        {name:"V12 6.5 725cv",type:"gasolina",displacement:"6.5",power_cv:725,power_kw:533,priceRange:[390000,450000],consumption:{city:21.5,highway:16.5,real:19.4}}]}
  }
},
"Aston Martin": {
  brand_info:{ reliability_avg:3.2, parts_cost:"very_high", maintenance_cost_factor:4.00 },
  models:{
    "Vantage":{ segment:"deportivo", reliability:{score:3.2,common_issues:["Electrónica","Transmisión ZF"],avg_repair_cost:4500}, depreciation:{year1:0.15,year3:0.29,year5:0.41}, maintenance_yearly:4500,
      versions:[
        {name:"V8 4.0 665cv",type:"gasolina",displacement:"4.0",power_cv:665,power_kw:489,priceRange:[155000,175000],consumption:{city:17.5,highway:13.5,real:15.8}},
        {name:"F1 Edition V8 528cv",type:"gasolina",displacement:"4.0",power_cv:528,power_kw:388,priceRange:[140000,158000],consumption:{city:16.5,highway:12.5,real:14.9}}]},
    "DB12":{ segment:"deportivo", reliability:{score:3.3,common_issues:["Electrónica","Muy especializado"],avg_repair_cost:5500}, depreciation:{year1:0.14,year3:0.27,year5:0.39}, maintenance_yearly:5500,
      versions:[
        {name:"V8 4.0 680cv",type:"gasolina",displacement:"4.0",power_cv:680,power_kw:500,priceRange:[228000,255000],consumption:{city:18.5,highway:14.5,real:16.8}},
        {name:"Volante V8 4.0 680cv",type:"gasolina",displacement:"4.0",power_cv:680,power_kw:500,priceRange:[248000,275000],consumption:{city:19.0,highway:15.0,real:17.2}}]},
    "DBX":{ segment:"suv", reliability:{score:3.3,common_issues:["Electrónica","Red servicio limitada"],avg_repair_cost:5000}, depreciation:{year1:0.15,year3:0.29,year5:0.41}, maintenance_yearly:5000,
      versions:[
        {name:"V8 4.0 550cv",type:"gasolina",displacement:"4.0",power_cv:550,power_kw:404,priceRange:[195000,218000],consumption:{city:18.0,highway:13.5,real:16.2}},
        {name:"DBX707 V8 4.0 707cv",type:"gasolina",displacement:"4.0",power_cv:707,power_kw:520,priceRange:[260000,290000],consumption:{city:20.5,highway:15.5,real:18.6}}]}
  }
},
"Lamborghini": {
  brand_info:{ reliability_avg:3.5, parts_cost:"very_high", maintenance_cost_factor:5.00 },
  models:{
    "Urus SE":{ segment:"suv", reliability:{score:3.5,common_issues:["Mantenimiento muy costoso"],avg_repair_cost:5500}, depreciation:{year1:0.14,year3:0.27,year5:0.39}, maintenance_yearly:5500,
      versions:[
        {name:"V8 4.0 PHEV 800cv",type:"phev",displacement:"4.0",power_cv:800,power_kw:588,battery_kwh:25.9,priceRange:[250000,290000],consumption:{city:4.0,highway:12.0,electric_range:60,real:5.2,electric_kwh:30}}]},
    "Huracán":{ segment:"deportivo", reliability:{score:3.8,common_issues:["Mantenimiento muy costoso"],avg_repair_cost:6000}, depreciation:{year1:0.10,year3:0.20,year5:0.30}, maintenance_yearly:6000,
      versions:[
        {name:"EVO V10 5.2 640cv",type:"gasolina",displacement:"5.2",power_cv:640,power_kw:470,priceRange:[220000,255000],consumption:{city:22.0,highway:16.0,real:19.8}},
        {name:"Tecnica V10 5.2 640cv RWD",type:"gasolina",displacement:"5.2",power_cv:640,power_kw:470,priceRange:[230000,265000],consumption:{city:22.5,highway:16.5,real:20.2}},
        {name:"STO V10 5.2 640cv RWD",type:"gasolina",displacement:"5.2",power_cv:640,power_kw:470,priceRange:[320000,360000],consumption:{city:23.0,highway:17.0,real:20.7}}]}
  }
}

}; // FIN window.CAR_DB

// ════════════════════════════════════════
// FUNCIONES AUXILIARES
// ════════════════════════════════════════
window.getVersions = function(brand,model) {
  return window.CAR_DB?.[brand]?.models?.[model]?.versions || [];
};
window.getVersionsByType = function(brand,model,type) {
  return window.getVersions(brand,model).filter(v=>v.type===type);
};
window.getMotorTypes = function(brand,model) {
  return [...new Set(window.getVersions(brand,model).map(v=>v.type))];
};
window.getCarReliability = function(brand,model) {
  return window.CAR_DB?.[brand]?.models?.[model]?.reliability||null;
};
window.getCarDepreciation = function(brand,model) {
  return window.CAR_DB?.[brand]?.models?.[model]?.depreciation||null;
};
window.getCarMaintenanceCost = function(brand,model) {
  return window.CAR_DB?.[brand]?.models?.[model]?.maintenance_yearly||450;
};
window.getBrandCostFactor = function(brand) {
  return window.CAR_DB?.[brand]?.brand_info?.maintenance_cost_factor||1.0;
};
window.getAllBrands = function() {
  return Object.keys(window.CAR_DB).sort((a,b)=>a.localeCompare(b,'es'));
};
window.getModelsForBrand = function(brand) {
  const m=window.CAR_DB?.[brand]?.models;
  return m?Object.keys(m).sort((a,b)=>a.localeCompare(b,'es')):[];
};
window.buildVersionSelect = function(brand,model) {
  const versions=window.getVersions(brand,model);
  if(!versions.length) return '<option value="">Sin versiones disponibles</option>';
  const labels={gasolina:'⛽ Gasolina',diesel:'🛢 Diésel',hibrido:'🔋 Híbrido',phev:'🔌 PHEV Enchufable',ev:'⚡ Eléctrico'};
  const order=['gasolina','diesel','hibrido','phev','ev'];
  const groups={};
  versions.forEach(v=>{if(!groups[v.type])groups[v.type]=[];groups[v.type].push(v);});
  let html='<option value="">Selecciona versión…</option>';
  order.filter(t=>groups[t]).forEach(type=>{
    html+=`<optgroup label="${labels[type]||type}">`;
    groups[type].forEach((v,i)=>{
      const d=v.displacement?`${v.displacement}L · `:'';
      const b=v.battery_kwh?` · ${v.battery_kwh}kWh`:'';
      const p=v.priceRange[0].toLocaleString('es-ES');
      html+=`<option value="${type}_${i}" data-type="${v.type}" data-cv="${v.power_cv}" data-kw="${v.power_kw}" data-displacement="${v.displacement||''}" data-battery="${v.battery_kwh||''}" data-pekw="${v.pe_kw||v.peKw||''}" data-price="${v.priceRange[0]}" data-pricemax="${v.priceRange[1]}">${v.name} — ${d}${v.power_cv}cv (${v.power_kw} kW)${b} · desde ${p}€</option>`;
    });
    html+='</optgroup>';
  });
  return html;
};
window.getVersionByKey = function(brand,model,key) {
  const [type,idxStr]=key.split('_');
  return window.getVersionsByType(brand,model,type)[parseInt(idxStr)]||null;
};
(function(){
  const b=Object.keys(window.CAR_DB).length;
  const m=Object.values(window.CAR_DB).reduce((s,x)=>s+Object.keys(x.models).length,0);
  const v=Object.values(window.CAR_DB).reduce((s,x)=>s+Object.values(x.models).reduce((s2,md)=>s2+(md.versions?md.versions.length:0),0),0);
  console.log("FairCar v3 — BD: "+b+" marcas · "+m+" modelos · "+v+" versiones");
})();
