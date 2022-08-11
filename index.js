const { XMLParser, XMLBuilder } = require('fast-xml-parser');
const fs = require('fs')

if (!fs.existsSync('output')){
    fs.mkdirSync('output');
}
const options = {
    ignoreAttributes: false,
    attributeNamePrefix : "@_",
    format: true
};

const parser = new XMLParser(options);
const builder = new XMLBuilder(options);

let big_gpx = parser.parse(fs.readFileSync('TeAraroaTrail.gpx'));
let route_gpx = parser.parse(fs.readFileSync('TeAraroaTrail_Route.gpx'));
let plotaroute_gpx = parser.parse(fs.readFileSync('TeAraroaTrail_Plotaroute.gpx'));

let elevations = {};
let trkpt = plotaroute_gpx.gpx.trk.trkseg.trkpt;
for(let t = 0; t < trkpt.length; t++) {
    if(elevations[trkpt[t]['@_lat'].padEnd(11,'0')] == null) {
        elevations[trkpt[t]['@_lat'].padEnd(11,'0')] = {};
    } 
    elevations[trkpt[t]['@_lat'].padEnd(11,'0')][trkpt[t]['@_lon'].padEnd(11,'0')] = trkpt[t].ele;
}

let small_gpx = null;
let name = null;
let name_prefix = null;
let track_start = null;

let track_num = 1;

for(let t = 0; t < big_gpx.gpx.trk.length; t++) {
    let trk = big_gpx.gpx.trk[t];
    let waypoints = {};
    if(small_gpx == null) {
        name = trk.desc;
        // if the track name begins with a number, prefix it with a space.
        name_prefix = (/^\d.*$/.exec(name) != null) ? ' ' : '';
        track_start = /(\d*).*/.exec(trk.cmt)[1].padStart(4, "0");
        small_gpx = {
            'gpx': {
                '@_creator': big_gpx.gpx['@_creator'],
                '@_version': big_gpx.gpx['@_version'],
                '@_xmlns': big_gpx.gpx['@_xmlns'],
                'metadata': big_gpx.gpx.metadata,
                'wpt': [],
                'trk': {
                    'name': `${track_start}${name_prefix}${name}`,
                    'src': trk.src,
                    'trkseg': {
                        'trkpt': []
                    }
                },
            },
        };
        small_gpx.gpx.metadata.name = `${track_start}${name_prefix}${name}`;

        for(let w = 0; w < route_gpx.gpx.wpt.length; w++) {
            let wpt = route_gpx.gpx.wpt[w];
            let km = Number(/^(\d*).*$/.exec(wpt.cmt)[1]);
            if(wpt.desc == name) {
                if(waypoints[km] == null) {
                    waypoints[km] = 1;
                    waypoints[km+1] = 1;
                    waypoints[km-1] = 1;
                    small_gpx.gpx.wpt.push({
                        '@_lat': wpt['@_lat'],
                        '@_lon': wpt['@_lon'],
                        'name': `${km} ${/^\d* (.*)$/.exec(wpt.name)[1]}`,
                        'cmt': trk.cmt,
                        'src': trk.src
                    });    
                }
            }
        }
    }
    // create waypoint for the start of each subtrack
    let km = Number(/^(\d*).*$/.exec(trk.cmt)[1]);
    if(waypoints[km] == null) {
        waypoints[km] = 1;
        small_gpx.gpx.wpt.push({
            '@_lat': trk.trkseg.trkpt[0]['@_lat'],
            '@_lon': trk.trkseg.trkpt[0]['@_lon'],
            'name': `${km} ${/^\d* (.*)$/.exec(trk.name)[1]}`,
            'desc': trk.cmt
        });
    }

    for(let p = 0; p < trk.trkseg.trkpt.length; p++) {
        let trkpt = trk.trkseg.trkpt[p]
        if(elevations[Number(trkpt['@_lat']).toFixed(7)] != null) {
            trkpt.ele = elevations[Number(trkpt['@_lat']).toFixed(7)][Number(trkpt['@_lon']).toFixed(7)]
        }
        small_gpx.gpx.trk.trkseg.trkpt.push(trkpt);
    }

    if(t+1 == big_gpx.gpx.trk.length || big_gpx.gpx.trk[t+1].desc != name) {
        // save
        let str = `<?xml version="1.0" encoding="UTF-8"?>\n${builder.build(small_gpx)}`;
        let filename = `output/${track_start}${name_prefix}${name}`

        fs.writeFileSync(`${filename}.gpx`, str);

        small_gpx = null;
        track_num++;
    }
}




