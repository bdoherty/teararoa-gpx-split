const { XMLParser, XMLBuilder } = require('fast-xml-parser');
const fs = require('fs');
const { parse } = require('path');
const { start } = require('repl');

if (!fs.existsSync('output')) {
    fs.mkdirSync('output');
}
const options = {
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    format: true
};

const parser = new XMLParser(options);
const builder = new XMLBuilder(options);

['TeAraroaTrail.gpx', 'TeAraroaTrail_Route.gpx', 'TeAraroaTrail_GpsVisualizer.gpx'].forEach((el) => {
    if (!fs.existsSync(el)) {
        throw `${el} not found`;
    }
})
const big_gpx = parser.parse(fs.readFileSync('TeAraroaTrail.gpx'));
const route_gpx = parser.parse(fs.readFileSync('TeAraroaTrail_Route.gpx'));
let gpsvisualizer_gpx = parser.parse(fs.readFileSync('TeAraroaTrail_GpsVisualizer.gpx'));

let elevations = {};

gpsvisualizer_gpx.gpx.trk.forEach(trk => {
    trk.trkseg.trkpt.forEach(trkpt => {
        if(elevations[String(Number(trkpt['@_lat']).toFixed(7))] == null) {
            elevations[String(Number(trkpt['@_lat']).toFixed(7))] = {};
        }
        elevations[String(Number(trkpt['@_lat']).toFixed(7))][String(Number(trkpt['@_lon']).toFixed(7))] = trkpt.ele.toFixed(0);
    })
})

const segments = [];

for (let r = 0; r < route_gpx.gpx.rte.length; r++) {
    let { src, name } = route_gpx.gpx.rte[r]
    segments.push({ name, src, key: src.split("/").slice(-1)[0], trks: [] })
}

let lastSegment;

for (let t = 0; t < big_gpx.gpx.trk.length; t++) {
    let trk = big_gpx.gpx.trk[t]
    let key;
    // two tracks have wrong keys when derived from the src, manually move those
    if (trk.name === "412 Millenium Track"){
        key = "glendhu-bay-track"
    } else if (trk.name === "267 Campbell Road") {
        key = "bulls-to-feilding"
    } else {
        key = trk.src.split("/").slice(-1)[0]
    }
    
    let segment = segments.find(s => s.key == key)
    if (segment) {
        segment.trks.push(trk)
    } else {
        segments.push({ name: key.replaceAll("-", " "), src: trk.src, key, trks: [trk] })
    }
}

segments.forEach(segment => {
    if (segment.trks.length === 0) {
        return;
    }

    let name = segment.name;
    // if the track name begins with a number, prefix it with a space.
    name_prefix = (/^\d.*$/.exec(name) != null) ? ' ' : '';

    let limits = segment.trks.map(t => parseFromToComment(t.cmt))
    let from = Math.min(...limits.map(l => l.from))
    let to = Math.max(...limits.map(l => l.to))

    let track_start = Math.floor(from).toString().padStart(4, "0");

    small_gpx = {
        'gpx': {
            '@_creator': big_gpx.gpx['@_creator'],
            '@_version': big_gpx.gpx['@_version'],
            '@_xmlns': big_gpx.gpx['@_xmlns'],
            'metadata': big_gpx.gpx.metadata,
            'wpt': [],
            'trk': {
                'name': `${track_start}${name_prefix}${name}`,
                'src': segment.src,
                'trkseg': {
                    'trkpt': []
                }
            }
        }
    };
    small_gpx.gpx.metadata.desc = `${from} km to ${to} km`;

    const waypoints = {}

    segment.trks.forEach(trk => {

        let track_length = parseFromToComment(trk.cmt);
        let km_int = Math.floor(track_length.from);
        let segment_start = Math.floor(track_length.from).toString().padStart(4, "0")

        trk.trkseg.trkpt.forEach(trkpt => {

            let small_trkpt= {
                '@_lat': trkpt['@_lat'],
                '@_lon': trkpt['@_lon']
            }
            if(elevations[Number(trkpt['@_lat']).toFixed(7)] != null) {
                small_trkpt.ele = elevations[Number(trkpt['@_lat']).toFixed(7)][Number(trkpt['@_lon']).toFixed(7)]
            }
            small_gpx.gpx.trk.trkseg.trkpt.push(small_trkpt)
        });

        waypoints[km_int] = 1;
        small_gpx.gpx.wpt.push({
            '@_lat': trk.trkseg.trkpt[0]['@_lat'],
            '@_lon': trk.trkseg.trkpt[0]['@_lon'],
            'name': `${track_length.from} ${/^\d* (.*)$/.exec(trk.name)[1]}`,
            'desc': trk.cmt
        });

    });


    for (let w = 0; w < big_gpx.gpx.wpt.length; w++) {
        let wpt = big_gpx.gpx.wpt[w];
        let km = Number(/^(.*) km$/.exec(wpt.name)[1]);
        if (from <= km && km <= to) {
            if (waypoints[Math.round(km)] == null) {
                small_gpx.gpx.wpt.push({
                    '@_lat': wpt['@_lat'],
                    '@_lon': wpt['@_lon'],
                    'name': wpt.name
                });
                waypoints[Math.round(km)] = 1;
            }
        }
    }

    track_start = Math.floor(from).toString().padStart(4, "0");

    // save
    let str = `<?xml version="1.0" encoding="UTF-8"?>\n${builder.build(small_gpx)}`;
    let filename = `output/${track_start}${name_prefix}${name.replaceAll("/", "_")}`

    fs.writeFileSync(`${filename}.gpx`, str);

});



function parseFromToComment(cmt) {
    let [, from, to] = /(.*) km to (.*) km/.exec(cmt);
    return {
        from: Math.round(from * 10) / 10,
        to: Math.round(to * 10) / 10
    }
}
