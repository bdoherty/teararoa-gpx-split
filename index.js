const { XMLParser, XMLBuilder } = require('fast-xml-parser');
const fs = require('fs');
const { parse } = require('path');

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

['TeAraroaTrail.gpx', 'TeAraroaTrail_Route.gpx'].forEach((el) => {
    if(!fs.existsSync(el)) {
        throw `${el} not found`;
    }    
})
let big_gpx = parser.parse(fs.readFileSync('TeAraroaTrail.gpx'));
let route_gpx = parser.parse(fs.readFileSync('TeAraroaTrail_Route.gpx'));

let small_gpx = null;
let name = null;
let name_prefix = null;
let track_start = null;

for(let r = 0; r < route_gpx.gpx.rte.length; r++) {

    let waypoints = {};

    let rte = route_gpx.gpx.rte[r];
    let name = rte.name;
    // if the track name begins with a number, prefix it with a space.
    name_prefix = (/^\d.*$/.exec(name) != null) ? ' ' : '';
    track_start = /(\d*).*/.exec(rte.cmt)[1].padStart(4, "0");
    let {from, to} = parseFromToComment(rte.cmt);
    small_gpx = {
        'gpx': {
            '@_creator': big_gpx.gpx['@_creator'],
            '@_version': big_gpx.gpx['@_version'],
            '@_xmlns': big_gpx.gpx['@_xmlns'],
            'metadata': big_gpx.gpx.metadata,
            'wpt': [],
            'trk': {
                'name': `${track_start}${name_prefix}${name}`,
                'src': rte.src,
                'trkseg': {
                    'trkpt': []
                }
            }
        }
    };
    small_gpx.gpx.metadata.desc = rte.cmt;
/*
    for(let w = 0; w < route_gpx.gpx.wpt.length; w++) {
        let wpt = route_gpx.gpx.wpt[w];
        let km = Number(/^(.*)$/.exec(wpt.cmt)[1]);
        let km_int = Math.round(km);
        if(from <= km && km <= to) {
            if(waypoints[km_int] == null) {
                waypoints[km_int] = 1;
                small_gpx.gpx.wpt.push({
                    '@_lat': wpt['@_lat'],
                    '@_lon': wpt['@_lon'],
                    'name': `${km_int} ${wpt.name}`,
                    'src': wpt.src
                });    
            }
        }
    }*/

    for(let t = 0; t < big_gpx.gpx.trk.length; t++) {
        let trk = big_gpx.gpx.trk[t];
        let track_length = parseFromToComment(trk.cmt);
        let km_int = Math.round(track_length.from);
        if(from <= track_length.from && track_length.to <= to) {

            if(waypoints[km_int] == null) {
                waypoints[km_int] = 1;
                small_gpx.gpx.wpt.push({
                    '@_lat': trk.trkseg.trkpt[0]['@_lat'],
                    '@_lon': trk.trkseg.trkpt[0]['@_lon'],
                    'name': `${track_length.from} ${/^\d* (.*)$/.exec(trk.name)[1]}`,
                    'desc': trk.cmt
                });    
            }
        }
    }

    for(let w = 0; w < big_gpx.gpx.wpt.length; w++) {
        let wpt = big_gpx.gpx.wpt[w];
        let km = Number(/^(.*) km$/.exec(wpt.name)[1]);
        if(from <= km && km <= to) { 
            if(waypoints[Math.round(km)] == null) {
                small_gpx.gpx.wpt.push({
                    '@_lat': wpt['@_lat'],
                    '@_lon': wpt['@_lon'],
                    'name': wpt.name
                });    
                waypoints[Math.round(km)] = 1;
            }
        }
    }    

    for(let t = 0; t < big_gpx.gpx.trk.length; t++) {
        let trk = big_gpx.gpx.trk[t];
        let track_length = parseFromToComment(trk.cmt);
        if(from <= track_length.from && track_length.to <= to) {

            for(let p = 0; p < trk.trkseg.trkpt.length; p++) {
                let trkpt = trk.trkseg.trkpt[p]
                delete trkpt.time;
                trkpt.ele = Math.round(trkpt.ele*10)/10;
                small_gpx.gpx.trk.trkseg.trkpt.push(trkpt);
            }

        }
    }

    // save
    let str = `<?xml version="1.0" encoding="UTF-8"?>\n${builder.build(small_gpx)}`;
    let filename = `output/${track_start}${name_prefix}${name}`

    fs.writeFileSync(`${filename}.gpx`, str);

}



function parseFromToComment(cmt) {
    let [, from, to] = /(.*) km to (.*) km/.exec(cmt);
    return {
        from: Math.round(from*10)/10,
        to: Math.round(to*10)/10
    }
}


