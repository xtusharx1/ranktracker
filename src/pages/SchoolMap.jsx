import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const schools = [
    {
      "name": "PM SHRI KENDRIYA VIDYALAYA",
      "lat": 28.471749919731053,
      "lng": 77.04241082580168
    },
    {
      "name": "PM SHRI KENDRIYA VIDYALAYA",
      "lat": 28.338302774285907,
      "lng": 76.93982441184829
    },
    {
      "name": "KENDRIYA VIDYALAYA NO.2",
      "lat": 28.43846923665473,
      "lng": 77.02866101000036
    },
    {
      "name": "KV GC CRPF KADARPUR",
      "lat": 28.38194804064373,
      "lng": 77.09385011370081
    },
    {
      "name": "S D ADARSH VIDYALAYA",
      "lat": 28.42275763357723,
      "lng": 77.03949475788157
    },
    {
      "name": "OUR LADY OF FATIMA CONVENT SECONDARY SCHOOL",
      "lat": 28.473040758227643,
      "lng": 77.04496501185272
    },
    {
      "name": "ROTARY PUBLIC SCHOOL",
      "lat": 28.501791790267884,
      "lng": 77.06222749836122
    },
    {
      "name": "SHRI S N SIDHESHWAR SR SEC PUBLIC SCHOOL",
      "lat": 28.467225791388138,
      "lng": 76.99644065047839
    },
    {
      "name": "BLUE BELLS MODEL SCHOOL",
      "lat": 28.47784531201357,
      "lng": 77.01206364809332
    },
    {
      "name": "D A V PUBLIC SCHOOL",
      "lat": 28.476345200000004,
      "lng": 77.05132331044851
    },
    {
      "name": "D.P.S.G.,",
      "lat": 28.514749159647618,
      "lng": 77.03443444886135
    },
    {
      "name": "COLONELS CENTRAL ACADEMY",
      "lat": 28.476955013921902,
      "lng": 77.00581684994445
    },
    {
      "name": "GYAN DEVI PUB SCHOOL",
      "lat": 28.48021119836301,
      "lng": 77.05707370761633
    },
    {
      "name": "SUMMER FIELDS SCHOOL",
      "lat": 28.47329025938863,
      "lng": 77.09897720386883
    },
    {
      "name": "SHERWOOD CONVENT SCHOOL",
      "lat": 28.48300779161901,
      "lng": 77.07650323645228
    },
    {
      "name": "G D GOENKA PUBLIC SCHOOL",
      "lat": 28.443902356785387,
      "lng": 77.00452807084035
    },
    {
      "name": "ST. MICHAEL'S SENIOR SECONDARY SCHOOL",
      "lat": 28.47020391349749,
      "lng": 77.01716683081126
    },
    {
      "name": "RAMAN MUNJAL VIDYA MANDIR",
      "lat": 28.24840060637444,
      "lng": 76.81422959226528
    },
    {
      "name": "ST. P B N PUBLIC SCHOOL",
      "lat": 28.483605480696607,
      "lng": 77.06369554015465
    },
    {
      "name": "DEV SAMAJ VIDYA NIKETAN",
      "lat": 28.468379498811366,
      "lng": 77.01381946811634
    },
    {
      "name": "DELHI PUBLIC SCHOOL",
      "lat": 28.36114989819328,
      "lng": 77.07952647061997
    },
    
    {
      "name": "ST. SOLDIER PUBLIC SCHOOL",
      "lat": 28.512354734347486,
      "lng": 77.02431228218572
    },
    {
      "name": "COLONEL'S PUBLIC SCHOOL",
      "lat": 28.446944444672145,
      "lng": 76.98778430971365
    },
    {
      "name": "SHARDA INTERNATIONAL SCHOOL",
      "lat": 28.450819703625097,
      "lng": 77.01066840916944
    },
    {
      "name": "SALWAN PUBLIC SCHOOL",
      "lat": 28.463875523393288,
      "lng": 77.04766093253527
    },
    {
      "name": "RAO RAM JIWAN SINGH DAV PUBLIC SCHOOL",
      "lat": 28.34363150050033,
      "lng": 76.7702537343017
    },
    {
      "name": "LION PUBLIC SCHOOL",
      "lat": 28.4486525744553,
      "lng": 77.00302073800503
    },
    {
      "name": "GAV International School",
      "lat": 28.4656886203187,
      "lng": 77.00895603376165
    },
    {
      "name": "AJANTA PUBLIC SCHOOL",
      "lat": 28.451713667900012,
      "lng": 77.04936006684082
    },
    {
      "name": "SHEETLA VIDYA NIKETAN",
      "lat": 28.34702581213279,
      "lng": 76.96809551209635
    },
    {
      "name": "DRONA PUBLIC SCHOOL",
      "lat": 28.45839925366948,
      "lng": 77.00560929760587
    },
    {
      "name": "BASANT VALLEY PUBLIC SCHOOL",
      "lat": 28.442200322135417,
      "lng": 76.93695238642721
    },
    {
      "name": "ASCENT PUBLIC SCHOOL",
      "lat": 28.472974966769584,
      "lng": 77.08203302636277
    },
    {
      "name": "ST CRISPINS SR SEC SCHOOL",
      "lat": 28.463678074220635,
      "lng": 77.03008588588358
    },
    {
      "name": "POLE STAR PUBLIC SCHOOL",
      "lat": 28.462552320363738,
      "lng": 77.00763296314159
    },
    {
      "name": "SHAHEED AMAR SINGH PUBLIC SCHOOL",
      "lat": 28.282243742563626,
      "lng": 76.85372892082181
    },
    {
      "name": "DELHI PUBLIC SCHOOL SITE I",
      "lat": 28.442159214289337,
      "lng": 77.06553416499074
    },
    {
      "name": "THE PINE CREST SCHOOL",
      "lat": 28.470653933352065,
      "lng": 77.09797780307638
    },
    {
      "name": "GURUGRAM PUBLIC SCHOOL",
      "lat": 28.42598251113649,
      "lng": 77.10665182026737
    },
    {
      "name": "AMITY INTERNATIONAL SCHOOL",
      "lat": 28.455146593257496,
      "lng": 77.07555569937618
    },
    {
      "name": "BRAHM DUTT BLUE BELLS PUBLIC SCHOOL",
      "lat": 28.453819103882132,
      "lng": 77.0034088208127
    },
    {
      "name": "RABINDRANATH WORLD SCHOOL",
      "lat": 28.49628488853087,
      "lng": 77.09813624964984
    },
    {
      "name": "SHANTI NIKETAN PUBLIC SCHOOL",
      "lat": 28.486169671377613,
      "lng": 76.99696778333728
    },
    {
      "name": "AMERICAN MONTESSORI PUBLIC SCHOOL",
      "lat": 28.480684560642242,
      "lng": 77.07580199859704
    },
    {
      "name": "AMITY INTERNATIONAL SCHOOL",
      "lat": 28.4338723812934,
      "lng": 77.06309963647861
    },
    {
      "name": "HERITAGE XPERIENTIAL LEARNING SCHOOL",
      "lat": 28.40949978929036,
      "lng": 77.08993087238876
    },
    {
      "name": "SHIKSHA BHARTI PUBLIC SCHOOL",
      "lat": 28.392932379616507,
      "lng": 77.05893427246977
    },
    {
      "name": "LADY FLORENCE PUBLIC SCHOOL",
      "lat": 28.41319359615054,
      "lng": 77.01515511471753
    },
    {
      "name": "M M PUBLIC SENIOR SECONDARY SCHOOL",
      "lat": 28.475833692778316,
      "lng": 77.0131470686915
    },
    {
      "name": "DELHI PUBLIC SCHOOL",
      "lat": 28.463854241894627,
      "lng": 77.07721953006197
    },
    {
      "name": "GREENWOOD PUBLIC SCHOOL",
      "lat": 28.462166792646695,
      "lng": 76.9910703306063
    },
    {
      "name": "ROCKFORD CONVENT HIGH SCHOOL",
      "lat": 28.44715111136831,
      "lng": 77.01080181101908
    },
    {
      "name": "RYAN INTERNATIONAL SCHOOL",
      "lat": 28.364678798664244,
      "lng": 77.06398490307274
    },
    {
      "name": "SUNCITY SCHOOL",
      "lat": 28.43489221102631,
      "lng": 77.11309301101868
    },
    {
      "name": "SHALOM HILLS INTERNATIONAL SCHOOL",
      "lat": 28.44859440799351,
      "lng": 77.08422436684066
    },
    {
      "name": "GYAN DEEP SENIOR SECONDARY SCHOOL",
      "lat": 28.484239709014215,
      "lng": 77.02498832636316
    },
    {
      "name": "MANAV RACHNA INTERNATIONAL SCHOOL",
      "lat": 28.438828742236332,
      "lng": 77.06017744355407
    },
    {
      "name": "RAJENDRA PUBLIC SCHOOL",
      "lat": 28.252986237341844,
      "lng": 76.82166666737827
    },
    {
      "name": "ST. ANGEL MIDDLE SCHOOL",
      "lat": 28.44202768537713,
      "lng": 77.0699385073193
    },
    {
      "name": "AMITY INDIAN MILITARY COLLEGE",
      "lat": 28.343140445700204,
      "lng": 76.96532247262371
    },
    {
      "name": "ROSE LAND PUBLIC SCHOOL",
      "lat": 28.43903430486928,
      "lng": 77.01376338033332
    },
    {
      "name": "EURO INTERNATIONAL SCHOOL",
      "lat": 28.452975203313667,
      "lng": 77.00518510731969
    },
    {
      "name": "GEMS INTERNATIONAL SCHOOL",
      "lat": 28.49248303487578,
      "lng": 77.01687393068549
    },
    {
      "name": "S C R PUBLIC SCHOOL",
      "lat": 28.486129795446008,
      "lng": 77.02249109567771
    },
    {
      "name": "K R MANGALAM WORLD SCHOOL",
      "lat": 28.461186515439692,
      "lng": 77.06788251047516
    },
    {
      "name": "C.D. INTERNATIONAL SCHOOL",
      "lat": 28.418191344591506,
      "lng": 77.02590587179316
    },
    {
      "name": "LOTUS VALLEY INTERNATIONAL SCHOOL",
      "lat": 28.416236890602654,
      "lng": 77.06895233854824
    },
    {
      "name": "SHEETLA VIDYA PEETH",
      "lat": 28.460132785339635,
      "lng": 77.01057381896301
    },
    {
      "name": "THE SHIKSHIYAN SCHOOL",
      "lat": 28.514050350060465,
      "lng": 76.98904334355674
    },
    {
      "name": "THE MAURYA SCHOOL",
      "lat": 28.5091249217462,
      "lng": 77.03926590492752
    },
    {
      "name": "VIDYA SCHOOL",
      "lat": 28.486404346982475,
      "lng": 77.09987760130544
    },
    {
      "name": "ROYAL OAK INTERNATIONAL SCHOOL",
      "lat": 28.50441778324316,
      "lng": 77.01389721472066
    },
    {
      "name": "D.A.V. PUBLIC SCHOOL",
      "lat": 28.40913296456111,
      "lng": 77.0490913226609
    },
    {
      "name": "G.D. GOENKA PUBLIC SCHOOL,",
      "lat": 28.421016122076036,
      "lng": 77.03468863438508
    },
    {
      "name": "GYAN DEVI SENIOR SECONDARY SCHOOL",
      "lat": 28.453928895974258,
      "lng": 77.00145780916951
    },
    {
      "name": "SHIV NADAR SCHOOL, GURGAON",
      "lat": 28.464601004027866,
      "lng": 77.1040985110197
    },
    {
      "name": "RED ROSES PUBLIC SCHOOL",
      "lat": 28.510206659138746,
      "lng": 77.0303358808802
    },
    {
      "name": "RIDGE VALLEY SCHOOL",
      "lat": 28.463869733463177,
      "lng": 77.07990439622125
    },
    {
      "name": "DAV POLICE PUBLIC SCHOOL",
      "lat": 28.378108219057054,
      "lng": 77.092547382181
    },
    {
      "name": "KUNSKAPSSKOLAN",
      "lat": 28.479424052896462,
      "lng": 77.0884416115646
    },
    {
      "name": "PRESIDIUM",
      "lat": 28.434391045464373,
      "lng": 77.072606733571
    },
    {
      "name": "Vega School",
      "lat": 28.39164867409675,
      "lng": 76.98530548781252
    },
    {
      "name": "EURO INTERNATIONAL SCHOOL",
      "lat": 28.449154241279068,
      "lng": 77.06726129752617
    },
    {
      "name": "ST.XAVIERS HIGH SCHOOL",
      "lat": 28.407337380526187,
      "lng": 77.05788653253529
    },
    {
      "name": "PRANAVANANDA INTERNATIONAL SCHOOL",
      "lat": 28.410908781925162,
      "lng": 76.92388292636058
    },
    {
      "name": "GD GOENKA SIGNATURE SCHOOL",
      "lat": 28.268528097164626,
      "lng": 77.06774700735431
    },
    {
      "name": "SATYA SCHOOL",
      "lat": 28.41768841631731,
      "lng": 77.049793353891
    },
    {
      "name": "THE HDFC SCHOOL, GURGAON",
      "lat": 28.421938217627257,
      "lng": 77.07690527478334
    },
    {
      "name": "DELHI PUBLIC SCHOOL",
      "lat": 28.406444857264418,
      "lng": 76.9603963263604
    },
    {
      "name": "MOUNT OLYMPUS SCHOOL",
      "lat": 28.42178873195658,
      "lng": 77.05177251101816
    },
    {
      "name": "SHALOM PRESIDENCY SCHOOL",
      "lat": 28.419140550288272,
      "lng": 77.09837069937495
    },
    {
      "name": "NARAYANA E-TECHNO SCHOOL, SOUTHCITY2",
      "lat": 28.418366943448635,
      "lng": 77.05596648218247
    },
    {
      "name": "NARAYANA E- TECHNO SCHOOL, SECTOR 37C",
      "lat": 28.44834380843334,
      "lng": 76.98335377663403
    },
    {
      "name": "DPSG SUSHANT LOK",
      "lat": 28.45307853473953,
      "lng": 77.07970669622095
    },
    {
      "name": "R P S INTERNATIONAL SCHOOL",
      "lat": 28.420173174615137,
      "lng": 77.05459276736723
    },
    {
      "name": "SURAJ SCHOOL",
      "lat": 28.399731365041593,
      "lng": 77.01082722320494
    },
    {
      "name": "ALPINE CONVENT SCHOOL",
      "lat": 28.45562222097306,
      "lng": 76.99438936877016
    },
    {
      "name": "SURAJ SCHOOL",
      "lat": 28.424414226339046,
      "lng": 77.1018221073187
    },
    {
      "name": "BASANT VALLEY GLOBAL SCHOOL",
      "lat": 28.415013338503268,
      "lng": 77.05391125149681
    },
    {
      "name": "ROSHAN LAL INTERNATIONAL SCHOOL",
      "lat": 28.393790277302248,
      "lng": 76.96117227848197
    },
    {
      "name": "NARAYANA E-TECHNO SCHOOL, M.G. ROAD",
      "lat": 28.47484574236119,
      "lng": 77.07405685518292
    },
    {
      "name": "RPS INTERNATIONAL SCHOOL",
      "lat": 28.41363895862597,
      "lng": 76.94356635889588
    },
    {
      "name": "NARAYANA E-TECHNO SCHOOL, PALAM VIHAR",
      "lat": 28.499534107917285,
      "lng": 77.02437295280518
    },
    {
      "name": "RPS INTERNATIONAL SCHOOL",
      "lat": 28.420220329425792,
      "lng": 77.05343404964717
    },
    {
      "name": "KIIT WORLD SCHOOL",
      "lat": 28.690750883033434,
      "lng": 77.1158623715134
    },
    {
      "name": "THE VENKATESHWAR SCHOOL",
      "lat": 28.419033494044953,
      "lng": 77.0883402963303
    },
    {
      "name": "KUNSKAPSSKOLAN INTERNATIONAL SCHOOL",
      "lat": 28.383460913815505,
      "lng": 77.01028234789874
    },
    {
      "name": "EURO INTERNATIONAL SCHOOL",
      "lat": 28.45506245695034,
      "lng": 76.9739474767362
    },
    {
      "name": "SUCHETA MEMORIAL SCHOOL",
      "lat": 28.483582558176405,
      "lng": 77.02074028412919
    },
    {
      "name": "OPEN SKY",
      "lat": 28.478754856867173,
      "lng": 77.02312582645821
    },
    {
      "name": "AMBIENCE PUBLIC SCHOOL",
      "lat": 28.45451237451216,
      "lng": 77.09665859111716
    },
    {
      "name": "YADUVANSHI SHIKSHA NIKETAN",
      "lat": 28.41775276492463,
      "lng": 76.9249054534439
    },
    {
      "name": "MANAV RACHNA INTERNATIONAL SCHOOL",
      "lat": 28.423143160260338,
      "lng": 77.06195270692685
    },
    {
      "name": "DELHI PUBLIC SCHOOL",
      "lat": 28.483980777703195,
      "lng": 76.97435986106224
    },
    {
      "name": "RAO BHARAT SINGH INTERNATIONAL SCHOOL",
      "lat": 28.406345378024383,
      "lng": 76.92454690315873
    },
    {
      "name": "SUNCITY SCHOOL",
      "lat": 28.455590126928,
      "lng": 76.97183319962933
    },
    {
      "name": "TAGORE PUBLIC SCHOOL",
      "lat": 28.414991307857644,
      "lng": 77.07281153384464
    },
    {
      "name": "MADE EASY SCHOOL",
      "lat": 28.397885231831623,
      "lng": 77.13997792661266
    },
    {
      "name": "EURO INTERNATIONAL SCHOOL",
      "lat": 28.404527094435938,
      "lng": 76.96464039407684
    },
    {
      "name": "THE NAVYANDHRA SCHOOL",
      "lat": 28.411016012811466,
      "lng": 77.04939569756425
    },
    {
      "name": "EURO INTERNATIONAL SCHOOL",
      "lat": 28.509659298329957,
      "lng": 77.00440415121062
    },
    {
      "name": "NARAYANA E-TECHNO SCHOOL",
      "lat": 28.398632635772955,
      "lng": 77.39551069292526
    },
    {
      "name": "IMPERIAL HERITAGE SCHOOL",
      "lat": 28.477390182832018,
      "lng": 76.96398448983756
    },
    {
      "name": "VEGA SCHOOLS",
      "lat": 28.410939571921123,
      "lng": 77.03806221127019
    },
    {
      "name": "GYAANANDA SCHOOL",
      "lat": 28.51099874081346,
      "lng": 77.0065996401097
    },
    {
      "name": "SRI CHAITANYA TECHNO SCHOOL",
      "lat": 28.46633412212378,
      "lng": 77.0783714592228
    },
    {
      "name": "PRESIDIUM SCHOOL",
      "lat": 28.503302943692365,
      "lng": 77.03001032661666
    },
    {
      "name": "GURUGRAM GLOBAL HEIGHTS SCHOOL",
      "lat": 28.47872840401474,
      "lng": 76.97291701867347
    },
    {
      "name": "PRIME SCHOLARS INTERNATIONAL SCHOOL",
      "lat": 28.48734268994949,
      "lng": 76.96969144141742
    },
    {
      "name": "ASHOKA INTERNATIONAL SCHOOL",
      "lat": 28.391579026826502,
      "lng": 77.05518499538492
    },
    {
      "name": "C R MODEL PUBLIC SCHOOL",
      "lat": 28.447009847774297,
      "lng": 77.05457550093185
    },
    {
      "name": "H S V GLOBAL SCHOOL",
      "lat": 28.435067985203172,
      "lng": 77.05575176883666
    },
    {
      "name": "KARMEL INTERNATIONAL SCHOOL",
      "lat": 28.392082794227843,
      "lng": 77.07355511527685
    },
    {
      "name": "S D HERITAGE PRIDE SCHOOL",
      "lat": 28.40496599995553,
      "lng": 76.95527722911673
    },
    {
      "name": "THE VIVEKANANDA SCHOOL",
      "lat": 28.39151984412623,
      "lng": 77.03550815719649
    },
    {
      "name": "ST. ANGEL'S GLOBAL",
      "lat": 28.382076244970552,
      "lng": 77.0215990664426
    },
    {
      "name": "THE BLUE BELLS SCHOOL",
      "lat": 28.42208561843083,
      "lng": 77.05750085985117
    },
    {
      "name": "EURO INTERNATIONAL SCHOOL",
      "lat": 28.425789376045127,
      "lng": 77.06651596396334
    },
    {
      "name": "BUDDHA INTERNATIONAL SCHOOL",
      "lat": 28.369040848700827,
      "lng": 77.09196102110035
    },
    {
      "name": "GITANJALI INTERNATIONAL SCHOOL",
      "lat": 28.427160813384578,
      "lng": 77.0744318143947
    },
    {
      "name": "ST. XAVIER'S HIGH SCHOOL",
      "lat": 28.417987332223483,
      "lng": 76.946987661892
    },
    {
      "name": "RISHI PUBLIC SCHOOL",
      "lat": 28.455089853323923,
      "lng": 77.05650254995146
    },
    {
      "name": "PRAGYANAM SCHOOL",
      "lat": 28.404439723326437,
      "lng": 77.07385016288511
    },
    {
      "name": "G.A.V. INTERNATIONAL SCHOOL",
      "lat": 28.49203113761779,
      "lng": 77.09669866898028
    },
    {
      "name": "SRI CHAITANYA TECHNO SCHOOL",
      "lat": 28.425324620594175,
      "lng": 77.10328091433469
    },
    {
      "name": "EXCELLERE WORLD SCHOOL",
      "lat": 28.458008167485563,
      "lng": 76.9356338530367
    },
    {
      "name": "VIBGYOR HIGH SCHOOL",
      "lat": 28.39030814346346,
      "lng": 77.06177424890966
    },
    {
      "name": "KNOWLEDGE TREE WORLD SCHOOL",
      "lat": 28.39827804446151,
      "lng": 76.96566279540633
    },
    {
      "name": "OMPEE INTERNATIONAL SCHOOL",
      "lat": 28.36472945773076,
      "lng": 76.94442811109904
    },
    {
      "name": "ORCHIDS THE INTERNATIONAL SCHOOL",
      "lat": 28.456245098738968,
      "lng": 77.06440370315565
    },
    {
      "name": "H S V INTERNATIONAL SCHOOL",
      "lat": 28.488488773549435,
      "lng": 76.99796399752648
    },
    {
      "name": "ST. ANDREWS WORLD SCHOOL",
      "lat": 28.405897540156577,
      "lng": 76.95316702546131
    },
    {
      "name": "AIR FORCE SCHOOL",
      "lat": 28.474583379897172,
      "lng": 77.04377551479872
    }
];


// 🎨 Custom animated school icon
const schoolIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2991/2991231.png", // School icon URL
  iconSize: [40, 40], // Icon size
  iconAnchor: [20, 40], // Position anchor
  popupAnchor: [0, -40], // Popup positioning
});

const SchoolMap = () => {
  return (
    <MapContainer 
      center={[28.45, 77.05]} 
      zoom={12} 
      style={{ height: "80vh", width: "100%" }} // Increased height to 80% of viewport height
    >
      <TileLayer 
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
        attribution="&copy; OpenStreetMap contributors" 
      />
      
      {schools.length > 0 ? (
        schools.map((school, index) => (
          <Marker key={index} position={[school.lat, school.lng]} icon={schoolIcon}>
            <Popup>
              <strong>{school.name}</strong> <br />
              📍 {school.lat}, {school.lng}
            </Popup>
          </Marker>
        ))
      ) : (
        <Popup position={[28.45, 77.05]}>No school data available</Popup>
      )}
    </MapContainer>
  );
};

export default SchoolMap;
