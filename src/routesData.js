// Chaitanya Bharathi Institute of Technology (CBIT) bus routes data
// Mapped directly from the official students transport facility circulars.

export const CBIT_COORDS = { lat: 17.39197, lng: 78.31945, name: "CBIT Campus" };

// Coordinate index for all stops mentioned in the circulars
const STOP_COORDINATES = {
  // Hubs & Common Terminus
  "CBIT": { lat: 17.39197, lng: 78.31945 },
  "CBIT Campus": { lat: 17.39197, lng: 78.31945 },
  "ORR": { lat: 17.3712, lng: 78.3611 },

  // East Hyderabad & Uppal/Tarnaka area
  "Uppal Depo": { lat: 17.4062, lng: 78.5670 },
  "Uppal Bus Stop": { lat: 17.4022, lng: 78.5601 },
  "Uppal X Road": { lat: 17.4022, lng: 78.5601 },
  "Survey of India": { lat: 17.4068, lng: 78.5504 },
  "Habsiguda": { lat: 17.4078, lng: 78.5385 },
  "Tarnaka": { lat: 17.4278, lng: 78.5385 },
  "Adikmet": { lat: 17.4182, lng: 78.5188 },
  "Vidyanagar": { lat: 17.4005, lng: 78.5133 },
  "Mettuguda": { lat: 17.4338, lng: 78.5273 },
  "Chilakalaguda": { lat: 17.4372, lng: 78.5132 },
  "Padmarao Nagar": { lat: 17.4361, lng: 78.5088 },
  "Musheerabad": { lat: 17.4258, lng: 78.5012 },
  "RTC X Road": { lat: 17.4116, lng: 78.4984 },
  "Indira Park": { lat: 17.4158, lng: 78.4878 },
  "Lakdikapool": { lat: 17.4045, lng: 78.4608 },
  "Langarhouse": { lat: 17.3821, lng: 78.4182 },
  "Langer House": { lat: 17.3821, lng: 78.4182 },
  "Sun city": { lat: 17.3598, lng: 78.3984 },
  "Badlaguda": { lat: 17.3521, lng: 78.4012 },
  "Bandlaguda": { lat: 17.3521, lng: 78.4012 },
  "Kalimandir": { lat: 17.3484, lng: 78.3812 },
  "APPA Junction": { lat: 17.3432, lng: 78.3688 },
  "APPA": { lat: 17.3432, lng: 78.3688 },

  // Ramanthapur & Amberpet area
  "Church Ramanthapur": { lat: 17.3989, lng: 78.5284 },
  "Ramanthapur": { lat: 17.3989, lng: 78.5284 },
  "Amberpet": { lat: 17.3878, lng: 78.5188 },
  "Shivam": { lat: 17.3968, lng: 78.5145 },
  "Fever Hospital": { lat: 17.3958, lng: 78.5012 },
  "Nallakunta": { lat: 17.3989, lng: 78.5085 },
  "Barkatpura": { lat: 17.3901, lng: 78.4984 },
  "Narayanaguda": { lat: 17.3888, lng: 78.4912 },
  "Himayathnagar": { lat: 17.3982, lng: 78.4855 },
  "Himayathnagar.": { lat: 17.3982, lng: 78.4855 },
  "Liberty": { lat: 17.4012, lng: 78.4788 },

  // Secunderabad & Begumpet / Punjagutta
  "Iskon Himalaya Book store Patny": { lat: 17.4452, lng: 78.4901 },
  "Paradise": { lat: 17.4433, lng: 78.4832 },
  "Begumpet": { lat: 17.4412, lng: 78.4611 },
  "Lifestyle": { lat: 17.4338, lng: 78.4552 },
  "Punjagutta": { lat: 17.4278, lng: 78.4496 },
  "GVK": { lat: 17.4194, lng: 78.4485 },
  "Care Hospital": { lat: 17.4091, lng: 78.4475 },
  "Pension Office": { lat: 17.4038, lng: 78.4435 },
  "NMDC": { lat: 17.4011, lng: 78.4401 },
  "Tolichowki": { lat: 17.3984, lng: 78.4155 },
  "Narayanama": { lat: 17.3968, lng: 78.3989 },
  "Dargha": { lat: 17.3862, lng: 78.3842 },
  "DPS": { lat: 17.3789, lng: 78.3752 },

  // ECIL & AS Rao Nagar Area
  "Radhika A S Rao Nagar": { lat: 17.4782, lng: 78.5694 },
  "Sainikpuri": { lat: 17.4855, lng: 78.5684 },
  "Neredmet": { lat: 17.4722, lng: 78.5385 },
  "Safilguda": { lat: 17.4645, lng: 78.5342 },
  "Annadbagh": { lat: 17.4588, lng: 78.5401 },
  "Malkajgiri": { lat: 17.4522, lng: 78.5284 },
  "Sairam Theatre": { lat: 17.4512, lng: 78.5384 },
  "Kavadiguda": { lat: 17.4198, lng: 78.4901 },

  // LB Nagar, Dilsukhnagar & Sagar X Roads
  "Astalakshmi Temple": { lat: 17.3542, lng: 78.5588 },
  "Kothapet": { lat: 17.3612, lng: 78.5458 },
  "Chaitanyapuri": { lat: 17.3655, lng: 78.5342 },
  "DSNR": { lat: 17.3688, lng: 78.5247 },
  "Moosarambagh": { lat: 17.3712, lng: 78.5132 },
  "Malakpet": { lat: 17.3782, lng: 78.4984 },
  "Nalgonda X Road": { lat: 17.3788, lng: 78.4891 },
  "Koti": { lat: 17.3833, lng: 78.4833 },
  "Abids": { lat: 17.3901, lng: 78.4764 },
  "Mehdipatnam": { lat: 17.3958, lng: 78.4411 },

  // Sagar X Road Details
  "Owaisi Hospital": { lat: 17.3458, lng: 78.5142 },
  "Midani": { lat: 17.3412, lng: 78.5101 },
  "DRDL": { lat: 17.3362, lng: 78.5085 },
  "Baba Nagar": { lat: 17.3312, lng: 78.5001 },
  "Chandrayangutta": { lat: 17.3188, lng: 78.4745 },
  "Aramghar": { lat: 17.3201, lng: 78.4401 },
  "Attapur": { lat: 17.3601, lng: 78.4312 },
  "Hanmantemple": { lat: 17.3712, lng: 78.4212 },
  "Musi": { lat: 17.3768, lng: 78.4199 },

  // Alakapuri Route
  "Alakapuri": { lat: 17.3612, lng: 78.5458 },
  "Ratnadeep": { lat: 17.3524, lng: 78.5524 },
  "Khamineni": { lat: 17.3488, lng: 78.5599 },
  "L B Nagar": { lat: 17.3457, lng: 78.5522 },
  "TKR Khaman": { lat: 17.3298, lng: 78.5385 },
  "Gayatrinagar": { lat: 17.3224, lng: 78.5312 },
  "Manda Mallamma": { lat: 17.3345, lng: 78.5201 },
  "Rajendra Nagar": { lat: 17.3184, lng: 78.4112 },

  // BN Reddy Route
  "BN Reddy": { lat: 17.3274, lng: 78.5634 },
  "Hastinapuram": { lat: 17.3368, lng: 78.5601 },
  "Sagar X Road": { lat: 17.3524, lng: 78.5321 },
  "Bhairamal guda": { lat: 17.3488, lng: 78.5388 },
  "Kharmangat": { lat: 17.3468, lng: 78.5288 },
  "Chempapet": { lat: 17.3452, lng: 78.5198 },
  "Santosh Nagar Yadagiri Owaisi": { lat: 17.3468, lng: 78.5088 },

  // Gokul ESI Route
  "Gokul": { lat: 17.4475, lng: 78.4412 },
  "ESI": { lat: 17.4452, lng: 78.4435 },
  "S.R Nagar": { lat: 17.4435, lng: 78.4468 },
  "Maithrivanam": { lat: 17.4385, lng: 78.4496 },
  "Yousufguda Check Post": { lat: 17.4348, lng: 78.4321 },
  "Krishna Nagar": { lat: 17.4278, lng: 78.4285 },
  "Venkatagiri": { lat: 17.4272, lng: 78.4212 },
  "Jubilee Check post": { lat: 17.4255, lng: 78.4168 },
  "Peddamma": { lat: 17.4299, lng: 78.4088 },
  "Temple": { lat: 17.4358, lng: 78.3985 },
  "Madhapur Hi-Tech City": { lat: 17.4501, lng: 78.3812 },
  "Telecom Nagar": { lat: 17.4422, lng: 78.3611 },
  "Mindspace": { lat: 17.4432, lng: 78.3785 },
  "Gachibowli": { lat: 17.4401, lng: 78.3489 },

  // Alwin / Madinaguda
  "Madinaguda": { lat: 17.4988, lng: 78.3499 },
  "Chandanagar": { lat: 17.4952, lng: 78.3312 },
  "Lingampally": { lat: 17.4812, lng: 78.3201 },
  "Railway Bridge": { lat: 17.4764, lng: 78.3242 },
  "Gulmahar Park": { lat: 17.4699, lng: 78.3188 },
  "HCU": { lat: 17.4585, lng: 78.3288 },
  "Indranagar": { lat: 17.4452, lng: 78.3385 },

  // Miyapur / Kondapur Route
  "Miyapur": { lat: 17.4968, lng: 78.3614 },
  "Talky Town": { lat: 17.4912, lng: 78.3645 },
  "Hafeezpet": { lat: 17.4878, lng: 78.3582 },
  "Kondapur": { lat: 17.4622, lng: 78.3568 },
  "Kothaguda x Road": { lat: 17.4585, lng: 78.3652 },
  "Kothaguda X Road": { lat: 17.4585, lng: 78.3652 },
  "Botanical Garden": { lat: 17.4542, lng: 78.3612 },
  "Govt. school": { lat: 17.4468, lng: 78.3521 },
  "and Govt school Gachibowli": { lat: 17.4468, lng: 78.3521 },

  // KP Y Junction
  "Bharath Nagar": { lat: 17.4682, lng: 78.4212 },
  "Musapert": { lat: 17.4722, lng: 78.4182 },
  "Y Junction": { lat: 17.4812, lng: 78.4124 },
  "Vivekandangar": { lat: 17.4852, lng: 78.4088 },
  "KPHB": { lat: 17.4888, lng: 78.3982 },
  "JNTU": { lat: 17.4933, lng: 78.3914 },
  "Forum mall": { lat: 17.4842, lng: 78.3892 },
  "Malaysian Township": { lat: 17.4788, lng: 78.3845 },
  "shilparamam": { lat: 17.4526, lng: 78.3768 },
  "Shilparamam": { lat: 17.4526, lng: 78.3768 },

  // JNTU / Nizampet
  "Nizampet": { lat: 17.5088, lng: 78.3852 },
  "Hydernagar": { lat: 17.4999, lng: 78.3801 },

  // Senior Specific Stops
  "NGRI": { lat: 17.4112, lng: 78.5301 },
  "Habsiguda Tarnaka": { lat: 17.4078, lng: 78.5385 },
  "Narayanama College": { lat: 17.3968, lng: 78.3989 },
  "NFC": { lat: 17.4645, lng: 78.5668 },
  "Mallapur": { lat: 17.4526, lng: 78.5724 },
  "Nacharam": { lat: 17.4452, lng: 78.5524 },
  "HMT Nagar": { lat: 17.4328, lng: 78.5412 },
  "Ashoknagar": { lat: 17.4088, lng: 78.5012 },
  "ECIL X Road": { lat: 17.4784, lng: 78.5638 },
  "Kamalanagar": { lat: 17.4694, lng: 78.5684 },
  "HB Colony": { lat: 17.4694, lng: 78.5684 },
  "ZTC": { lat: 17.4688, lng: 78.5501 },
  "Lalapet": { lat: 17.4485, lng: 78.5312 },
  "Radhika Theatre": { lat: 17.4782, lng: 78.5694 },
  "A S Rao Nagar": { lat: 17.4764, lng: 78.5624 },
  "RK Puram": { lat: 17.4832, lng: 78.5342 },
  "West Maredpalli": { lat: 17.4588, lng: 78.4999 },
  "Sangeeth": { lat: 17.4485, lng: 78.5022 },
  "Patny": { lat: 17.4438, lng: 78.4912 },
  "Ayyappa Swamy Temple": { lat: 17.5062, lng: 78.5122 },
  "Raithubazer": { lat: 17.5022, lng: 78.5055 },
  "Lothukunta": { lat: 17.5188, lng: 78.5101 },
  "Lalbazer": { lat: 17.5011, lng: 78.5029 },
  "Thirmalgiri": { lat: 17.4888, lng: 78.5088 },
  "Kharkhana": { lat: 17.4788, lng: 78.5002 },
  "JBS": { lat: 17.4499, lng: 78.4999 },
  "Masabtank": { lat: 17.4012, lng: 78.4552 },
  "Care hospital": { lat: 17.4091, lng: 78.4475 },
  "Suchitra": { lat: 17.5028, lng: 78.4725 },
  "MMR": { lat: 17.5068, lng: 78.4764 },
  "Garden": { lat: 17.5052, lng: 78.4752 },
  "Bowinpully": { lat: 17.4788, lng: 78.4612 },
  "Sowjanya Colony": { lat: 17.4912, lng: 78.4698 },
  "Ashoka Garden": { lat: 17.4855, lng: 78.4655 },
  "Tadbund": { lat: 17.4645, lng: 78.4801 },
  "Nagol X Road": { lat: 17.3712, lng: 78.5612 },
  "Mohan Nagar": { lat: 17.3612, lng: 78.5524 },
  "Nemboliada": { lat: 17.3822, lng: 78.4901 },
  "Kachiguda": { lat: 17.3888, lng: 78.4952 },
  "YMC": { lat: 17.3912, lng: 78.4822 },
  "Old MLA Quarters": { lat: 17.3982, lng: 78.4801 },
  "Basheerbagh": { lat: 17.4022, lng: 78.4782 },
  "Auto Nagar": { lat: 17.3242, lng: 78.5788 },
  "Panama": { lat: 17.3322, lng: 78.5684 },
  "Chintalkunta": { lat: 17.3385, lng: 78.5612 },
  "Redtank": { lat: 17.3342, lng: 78.5842 },
  "Ganesh Temple": { lat: 17.3361, lng: 78.5801 },
  "MIDHANI": { lat: 17.3412, lng: 78.5101 },
  "SR Nagar": { lat: 17.4435, lng: 78.4468 },
  "Ameerpet": { lat: 17.4361, lng: 78.4482 },
  "Srinagar Colony": { lat: 17.4244, lng: 78.4344 },
  "TV 9": { lat: 17.4201, lng: 78.4288 },
  "LVP": { lat: 17.4182, lng: 78.4212 },
  "Baswathara Film Nagar": { lat: 17.4122, lng: 78.4112 },
  "Wisper Valley": { lat: 17.4012, lng: 78.3988 },
  "Signal": { lat: 17.3922, lng: 78.3688 },
  "Khajaguda": { lat: 17.3942, lng: 78.3582 },
  "Motinagar": { lat: 17.4512, lng: 78.4212 },
  "Kalyan Nagar": { lat: 17.4478, lng: 78.4252 },
  "Yousufguda X Roads": { lat: 17.4348, lng: 78.4321 },
  "Peddammatemple": { lat: 17.4299, lng: 78.4088 },
  "RC Puram": { lat: 17.5188, lng: 78.2912 },
  "Beeramguda": { lat: 17.5212, lng: 78.2788 },
  "BHEL": { lat: 17.4888, lng: 78.3012 },
  "Nalagandla Road": { lat: 17.4722, lng: 78.3052 },
  "Gopanpally": { lat: 17.4485, lng: 78.3088 },
  "X Road": { lat: 17.4382, lng: 78.3112 },
  "Gowldodi": { lat: 17.4288, lng: 78.3242 },
  "Wipro Circle": { lat: 17.4245, lng: 78.3301 },
  "kokapet X Road": { lat: 17.4052, lng: 78.3288 },
  "Shapur PS": { lat: 17.5242, lng: 78.4352 },
  "Chinthal": { lat: 17.5188, lng: 78.4382 },
  "IDPL": { lat: 17.5022, lng: 78.4385 },
  "Narsapur X Road Y Junction": { lat: 17.4852, lng: 78.4212 },
  "Balanagar": { lat: 17.4691, lng: 78.4481 },
  "Kukapally": { lat: 17.4842, lng: 78.4045 },
  "Kukatpally": { lat: 17.4842, lng: 78.4045 }
};

// Raw definitions of all routes with their ordered stops
const routesRaw = [
  // JUNIOR ROUTES
  {
    number: "15",
    name: "BOD UPPAL",
    category: "Junior",
    stopNames: ["Uppal Depo", "Uppal Bus Stop", "Uppal X Road", "Survey of India", "Habsiguda", "Tarnaka", "Adikmet", "Vidyanagar", "CBIT"]
  },
  {
    number: "16",
    name: "TARNAKA",
    category: "Junior",
    stopNames: ["Tarnaka", "Mettuguda", "Chilakalaguda", "Padmarao Nagar", "Musheerabad", "RTC X Road", "Indira Park", "Lakdikapool", "Langarhouse", "Sun city", "Badlaguda", "Kalimandir", "APPA Junction", "CBIT"]
  },
  {
    number: "19",
    name: "MODERN BAKERY",
    category: "Junior",
    stopNames: ["Church Ramanthapur", "Amberpet", "Shivam", "Vidyanagar", "Fever Hospital", "Nallakunta", "Barkatpura", "Narayanaguda", "Himayathnagar", "Liberty", "Lakdikapool", "CBIT"]
  },
  {
    number: "28",
    name: "SECUNDERABAD",
    category: "Junior",
    stopNames: ["Iskon Himalaya Book store Patny", "Paradise", "Begumpet", "Lifestyle", "Punjagutta", "GVK", "Care Hospital", "Pension Office", "NMDC", "Tolichowki", "Narayanama", "Dargha", "DPS", "ORR", "CBIT"]
  },
  {
    number: "29",
    name: "ECIL",
    category: "Junior",
    stopNames: ["Radhika A S Rao Nagar", "Sainikpuri", "Neredmet", "Safilguda", "Annadbagh", "Malkajgiri", "Sairam Theatre", "Mettuguda", "Chilakalaguda", "Musheerabad", "Kavadiguda", "CBIT"]
  },
  {
    number: "39",
    name: "L.B. NAGAR",
    category: "Junior",
    stopNames: ["Astalakshmi Temple", "Kothapet", "Chaitanyapuri", "DSNR", "Moosarambagh", "Malakpet", "Nalgonda X Road", "Koti", "Abids", "Lakdikapool", "Mehdipatnam", "Langer House", "CBIT"]
  },
  {
    number: "42",
    name: "SAGAR X ROAD",
    category: "Junior",
    stopNames: ["Owaisi Hospital", "Midani", "DRDL", "Baba Nagar", "Chandrayangutta", "Aramghar", "Attapur", "Hanmantemple", "Musi", "Langarhouse", "CBIT"]
  },
  {
    number: "45",
    name: "ALAKAPURI",
    category: "Junior",
    stopNames: ["Alakapuri", "Ratnadeep", "Khamineni", "L B Nagar", "TKR Khaman", "Gayatrinagar", "Manda Mallamma", "Owaisi Hospital", "Aramghar", "Rajendra Nagar", "APPA", "CBIT"]
  },
  {
    number: "49",
    name: "BN REDDY",
    category: "Junior",
    stopNames: ["BN Reddy", "Hastinapuram", "Sagar X Road", "Bhairamal guda", "Kharmangat", "Chempapet", "Santosh Nagar Yadagiri Owaisi", "Aramghar", "CBIT"]
  },
  {
    number: "59",
    name: "GOKUL ESI",
    category: "Junior",
    stopNames: ["Gokul", "ESI", "S.R Nagar", "Maithrivanam", "Yousufguda Check Post", "Krishna Nagar", "Venkatagiri", "Jubilee Check post", "Peddamma", "Temple", "Madhapur Hi-Tech City", "Telecom Nagar", "Mindspace", "Gachibowli", "ORR", "CBIT"]
  },
  {
    number: "61",
    name: "ALWIN JUNCTION",
    category: "Junior",
    stopNames: ["Madinaguda", "Chandanagar", "Lingampally", "Railway Bridge", "Gulmahar Park", "HCU", "Indranagar", "Gachibowli", "ORR", "CBIT"]
  },
  {
    number: "63",
    name: "MIYAPUR X ROAD",
    category: "Junior",
    stopNames: ["Miyapur", "Talky Town", "Hafeezpet", "Kondapur", "Kothaguda x Road", "Botanical Garden", "Govt. school", "Gachibowli", "ORR", "CBIT"]
  },
  {
    number: "65",
    name: "KP-Y-JUNCTION",
    category: "Junior",
    stopNames: ["Bharath Nagar", "Musapert", "Y Junction", "Vivekandangar", "KPHB", "JNTU", "Forum mall", "Malaysian Township", "shilparamam", "Kothaguda X Road", "Gachibowli", "CBIT"]
  },
  {
    number: "69",
    name: "JNTU",
    category: "Junior",
    stopNames: ["Nizampet", "Hydernagar", "Miyapur", "Talky Town", "Hafeezpet", "Kondapur", "Kothaguda x Road", "Botanical Garden", "and Govt school Gachibowli", "ORR", "CBIT"]
  },

  // SENIOR ROUTES
  {
    number: "10",
    name: "MODERN BAKERY",
    category: "Senior",
    stopNames: ["Church Ramanthapur", "Amberpet", "Shivam", "Vidyanagar", "Fever Hospital", "Nallakunta", "Barkatpura", "Narayanaguda", "Himayathnagar", "Liberty", "Lakdikapool", "CBIT"]
  },
  {
    number: "12",
    name: "UPPAL X ROAD",
    category: "Senior",
    stopNames: ["NGRI", "Habsiguda Tarnaka", "Adikmet", "Vidyanagar", "Lakdikapool", "Mehdipatnam", "Langarhouse", "Sun city", "Badlaguda", "Kalimandir", "APPA Junction", "CBIT"]
  },
  {
    number: "13",
    name: "RAMANTHAPUR",
    category: "Senior",
    stopNames: ["Ramanthapur", "Amberpet", "Shivam", "Vidyanagar", "Lakdikapool", "NMDC", "Mehdipatnam", "Tolichowki", "Narayanama College", "Dargha", "DPS", "CBIT"]
  },
  {
    number: "14",
    name: "BOD UPPAL",
    category: "Senior",
    stopNames: ["Uppal Depo", "Uppal Bus Stop", "Uppal X Road", "Survey of India", "Habsiguda", "Tarnaka", "Adikmet", "Vidyanagar", "CBIT"]
  },
  {
    number: "17",
    name: "NFC",
    category: "Senior",
    stopNames: ["NFC", "Mallapur", "Nacharam", "HMT Nagar", "Habsiguda", "Tarnaka", "Mettuguda", "Chilakalaguda", "Musheerabad", "RTC X Road", "Ashoknagar", "Indira Park", "Lakdikapool", "CBIT"]
  },
  {
    number: "18",
    name: "ECIL",
    category: "Senior",
    stopNames: ["ECIL X Road", "Kamalanagar", "HB Colony", "ZTC", "Lalapet", "Tarnaka", "Mettuguda", "Chilakalaguda", "Padmarao Nagar", "Musheerabad", "Kavadiguda", "Lakdikapool", "CBIT"]
  },
  {
    number: "20",
    name: "AS RAO Nagar",
    category: "Senior",
    stopNames: ["Radhika Theatre", "A S Rao Nagar", "Sainikpuri", "Neredmet", "Safilguda", "Annadbagh", "Malkajgiri", "Sairam Theatre", "Mettuguda", "Chilakalaguda", "CBIT"]
  },
  {
    number: "22",
    name: "AS RAO Nagar",
    category: "Senior",
    stopNames: ["Radhika Theatre", "A S Rao Nagar", "Sainikpuri", "Neredmet", "RK Puram", "West Maredpalli", "Sangeeth", "Patny", "NMDC", "CBIT"]
  },
  {
    number: "24",
    name: "ALWAL",
    category: "Senior",
    stopNames: ["Ayyappa Swamy Temple", "Raithubazer", "Lothukunta", "Lalbazer", "Thirmalgiri", "Kharkhana", "JBS", "Paradise", "Punjagutta", "Care hospital", "Masabtank", "CBIT"]
  },
  {
    number: "26",
    name: "SUCHITRA",
    category: "Senior",
    stopNames: ["Suchitra", "MMR", "Garden", "Bowinpully", "Sowjanya Colony", "Ashoka Garden", "Tadbund", "Paradise", "Begumpet", "Lifestyle", "GVK", "Care Hospital", "NMDC", "CBIT"]
  },
  {
    number: "30",
    name: "INDU ARANYA",
    category: "Senior",
    stopNames: ["Bandlaguda", "Nagol X Road", "Mohan Nagar", "Kothapet", "Malakpet", "Nemboliada", "Kachiguda", "YMC", "Old MLA Quarters", "Basheerbagh", "Lakdikapool", "CBIT"]
  },
  {
    number: "36",
    name: "L.B. NAGAR",
    category: "Senior",
    stopNames: ["Astalakshmi Temple", "Kothapet", "Chaitanyapuri", "DSNR", "Moosarambagh", "Malakpet", "Nalgonda X Road", "Koti", "Abids", "Lakdikapool", "Mehdipatnam", "Langer House", "CBIT"]
  },
  {
    number: "41",
    name: "HAYATH NAGAR",
    category: "Senior",
    stopNames: ["Auto Nagar", "Panama", "Chintalkunta", "Sagar X Road", "TKR Khaman", "Gayatrinagar", "Owaisi Hospital", "DRDL", "Aramghar", "Rajendra Nagar", "APPA", "CBIT"]
  },
  {
    number: "44",
    name: "ALAKAPURI",
    category: "Senior",
    stopNames: ["Alakapuri", "Ratnadeep", "Khamineni", "L B Nagar", "TKR Khaman", "Gayatrinagar", "Owaisi Hospital", "DRDL", "Aramghar", "Rajendra Nagar", "APPA", "CBIT"]
  },
  {
    number: "46",
    name: "VANASTHALIPURAM",
    category: "Senior",
    stopNames: ["Redtank", "Ganesh Temple", "Panama", "Chintalkunta", "Sagar X Road", "Manda Mallamma", "Owaisi Hospital", "DRDL", "Aramghar", "Rajendra Nagar", "APPA", "CBIT"]
  },
  {
    number: "47",
    name: "SAGAR X ROAD",
    category: "Senior",
    stopNames: ["Sagar X Road", "Bhairamal guda", "Kharmangat", "Chempapet", "Santosh Nagar Yadagiri Owaisi", "MIDHANI", "Baba Nagar", "Chandrayangutta", "Aramghar", "Rajendra Nagar", "APPA", "CBIT"]
  },
  {
    number: "48",
    name: "BN REDDY",
    category: "Senior",
    stopNames: ["BN Reddy", "Hastinapuram", "Sagar X Road", "Bhairamal guda", "Kharmangat", "Chempapet", "Santosh Nagar Yadagiri Owaisi", "Aramghar", "Attapur", "Hanmantemple", "Musi", "Langarhouse", "CBIT"]
  },
  {
    number: "52",
    name: "SRINAGAR COLONY",
    category: "Senior",
    stopNames: ["Gokul", "SR Nagar", "Maithrivanam", "Ameerpet", "Srinagar Colony", "Ratnadeep", "TV 9", "LVP", "Baswathara Film Nagar", "Wisper Valley", "Darga", "Signal", "DPS", "Khajaguda", "CBIT"]
  },
  {
    number: "54",
    name: "PR NAGAR",
    category: "Senior",
    stopNames: ["Motinagar", "Kalyan Nagar", "Yousufguda X Roads", "Krishna Nagar", "Jubilee Check post", "Peddammatemple", "Madhapur Hi-Tech City", "Mindspace", "Telecom Nagar", "Gachibowli", "CBIT"]
  },
  {
    number: "60",
    name: "ICRISAT",
    category: "Senior",
    stopNames: ["RC Puram", "Beeramguda", "Ashoknagar", "BHEL", "Lingampally", "Railway Bridge", "Nalagandla Road", "Gopanpally", "X Road", "Gowldodi", "Wipro Circle", "kokapet X Road", "CBIT"]
  },
  {
    number: "62",
    name: "MIYAPUR X ROAD",
    category: "Senior",
    stopNames: ["Miyapur", "Talky Town", "Hafeezpet", "Kondapur", "Kothaguda x Road", "Botanical Garden", "Govt. school", "Gachibowli", "ORR", "CBIT"]
  },
  {
    number: "64",
    name: "PRAGATHI NAGAR",
    category: "Senior",
    stopNames: ["JNTU", "Nizampet", "Hydernagar", "Miyapur", "Talky Town", "Hafeezpet", "Kondapur", "Gachibowli", "ORR", "CBIT"]
  },
  {
    number: "66",
    name: "JEEDIMETLA",
    category: "Senior",
    stopNames: ["Shapur PS", "Chinthal", "IDPL", "Narsapur X Road Y Junction", "Vivekandangar", "KPHB", "JNTU", "Forum mall", "Malaysian Township", "shilparamam", "Telecom Nagar", "Gachibowli", "ORR", "CBIT"]
  },
  {
    number: "67",
    name: "ALWIN JUNCTION",
    category: "Senior",
    stopNames: ["Madinaguda", "Chandanagar", "Lingampally", "Railway Bridge", "Gulmahar Park", "HCU", "Indranagar", "Gachibowli", "ORR", "CBIT"]
  },
  {
    number: "68",
    name: "FEROZGUDA",
    category: "Senior",
    stopNames: ["Bowinpully", "Balanagar", "Kukapally", "KPHB", "JNTU", "Forum mall", "Malaysian Township", "Shilparamam", "Kothaguda X Road", "Gachibowli", "CBIT"]
  }
];

// Generate the fully detailed routes database by combining stop listings with coordinate indexes
export const ALL_ROUTES = routesRaw.map(route => {
  const stops = route.stopNames.map((name, idx) => {
    const trimmed = name.trim();
    const coords = STOP_COORDINATES[trimmed];
    
    if (!coords) {
      console.warn(`Missing coordinates for stop: "${trimmed}" in route ${route.number}`);
      // Fallback coordinate near CBIT to avoid crashing
      return {
        name: idx === 0 ? route.name : trimmed,
        lat: CBIT_COORDS.lat + 0.01 * idx,
        lng: CBIT_COORDS.lng + 0.01 * idx
      };
    }

    // Add small staggering offset to stops that share a coordinate, so they look distinct on maps
    const latOffset = ((parseInt(route.number, 10) % 7) - 3) * 0.0003;
    const lngOffset = ((parseInt(route.number, 10) % 5) - 2) * 0.0003;
    
    const isStartOrEnd = idx === 0 || idx === route.stopNames.length - 1;

    return {
      name: idx === 0 ? route.name : trimmed,
      lat: coords.lat + (isStartOrEnd ? 0 : latOffset),
      lng: coords.lng + (isStartOrEnd ? 0 : lngOffset)
    };
  });

  return {
    number: route.number,
    name: route.name,
    category: route.category,
    stops: stops
  };
});

// Dictionary for fast lookups
export const ROUTES_BY_NUMBER = ALL_ROUTES.reduce((acc, route) => {
  acc[route.number] = route;
  return acc;
}, {});

// Haversine formula to calculate distance in kilometers between two coordinates
export function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Linear interpolation to generate intermediate points along a route for smooth UI rendering & simulation
export function getInterpolatedPath(stops, pointsPerSegment = 20) {
  const path = [];
  for (let i = 0; i < stops.length - 1; i++) {
    const start = stops[i];
    const end = stops[i + 1];
    for (let j = 0; j < pointsPerSegment; j++) {
      const t = j / pointsPerSegment;
      path.push({
        lat: start.lat + (end.lat - start.lat) * t,
        lng: start.lng + (end.lng - start.lng) * t,
        stage: i,
        prevStop: start.name,
        nextStop: end.name
      });
    }
  }
  // Include final stop
  const finalStop = stops[stops.length - 1];
  path.push({
    lat: finalStop.lat,
    lng: finalStop.lng,
    stage: stops.length - 2,
    prevStop: stops[stops.length - 2].name,
    nextStop: finalStop.name
  });
  return path;
}
