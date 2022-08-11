# teararoa-gpx-split

This utility combines the **Tracks** and **Section Routes** gpx files from https://www.teararoa.org.nz/before-you-go/maps-and-notes-download/, as well as elevation data from https://plotaroute.com/, and then splits into 78 smaller gpx files.  Each file contains the waypoints from the **Section Routes** file, as well as waypoints for each track contained the section.

I developed this tool to make it easy to navigate these sections on my Garmin watch.  To install, either copy the gpx files to \GARMIN\NewFiles on your Garmin watch, or use [Garmin Basecamp](https://www.garmin.com/en-NZ/software/basecamp/). 

# Download all 2021-22 section files
[teararoa-gpx-split-2021-11-22.zip](https://github.com/bdoherty/teararoa-gpx-split/raw/main/published/teararoa-gpx-split-2021-11-22.zip)

# 2022-22 Section GPX Files

* 0000Cape Reinga to Ahipara.gpx
* 0100The Northland Forests.gpx
* 0198Mangakaretu to Kerikeri.gpx
* 0226Kerikeri to Waitangi.gpx
* 0246Paihia to Opua Coastal Walkway.gpx
* 0255Waikare Connection.gpx
* 0266Russell Forest to Whangarei Heads.gpx
* 0398Bream Bay Walk.gpx
* 0432Cullen Brynderwyn Walkway.gpx
* 0439Bream Tail Mangawhai Walkway.gpx
* 0446Mangawhai to Pakiri.gpx
* 0476Mt Tamahunga (Te Hikoi O Te Kiri).gpx
* 0487Govan Wilson to Puhoi Valley.gpx
* 0524Puhoi Track.gpx
* 0529Puhoi to Wenderholm.gpx
* 0536Wenderholm to Stillwater.gpx
* 0562Okura to Long Bay.gpx
* 0566North Shore Coastal Walk.gpx
* 0595Coast to Coast Walkway.gpx
* 0610Onehunga to Puhinui.gpx
* 0633Puhinui Stream Track.gpx
* 0643Totara Park to Clevedon.gpx
* 0684Mangatawhiri to Mercer.gpx
* 0697Mercer to Rangiriri.gpx
* 0720Rangiriri to Huntly.gpx
* 0742Hakarimata Walkway.gpx
* 0753Ngaruawahia to Hamilton.gpx
* 0776Hamilton City.gpx
* 0784Waipa Walk.gpx
* 0812Pirongia Traverse.gpx
* 0828Pirongia to Waitomo.gpx
* 0872Pehitawa Track.gpx
* 0887Te Kuiti to Pureora.gpx
* 0944Hauhungaroa Track.gpx
* 1048 42 Traverse.gpx
* 1120Tongariro Alpine Crossing.gpx
* 1137Mangatepopo to National Park.gpx
* 1167National Park to Whanganui River.gpx
* 1255Whanganui River.gpx
* 1377Wanganui to Bulls.gpx
* 1441Bulls to Feilding.gpx
* 1462Feilding to Palmerston North.gpx
* 1480Palmerston North.gpx
* 1492Massey to Levin.gpx
* 1553Tararua Ranges.gpx
* 1598Pukeatua.gpx
* 1622Kapiti Coast.gpx
* 1644Paekakariki Escarpment Track.gpx
* 1654Ara Harakeke.gpx
* 1660Colonial Knob.gpx
* 1682Ngaio.gpx
* 1698Wellington City.gpx
* 1703Wellington South.gpx
* 1713Queen Charlotte Track.gpx
* 1782Anakiwa to Pelorus Bridge.gpx
* 1823Pelorus River Track.gpx
* 1868Richmond Alpine Track.gpx
* 1964Waiau Pass Track.gpx
* 2079Boyle to Arthurs Pass.gpx
* 2192Arthurs Pass to Rakaia.gpx
* 2264Rakaia River to Rangitata River.gpx
* 2334Two Thumb Track.gpx
* 2407Tekapo to Lake Ohau.gpx
* 2501East Ahuriri Track.gpx
* 2555Breast Hill Track.gpx
* 2573Gladstone to Wanaka.gpx
* 2599Glendhu Bay Track.gpx
* 2622Motatapu Alpine Track.gpx
* 2667Wakatipu Track.gpx
* 2696Mavora Walkway.gpx
* 2760Mararoa River Track.gpx
* 2803Takitimu Track.gpx
* 2836Birchwood to Merrivale.gpx
* 2889Longwood Forest Track.gpx
* 2927Long Hilly Track.gpx
* 2934Tihaka Beach Track.gpx
* 2946Oreti Beach Track.gpx
* 2977Invercargill to Bluff.gpx

# How to generate the section files yourself.

1. Ensure you have nodejs installed.  If not, get it from https://nodejs.org/en/
2. Download and extract https://github.com/bdoherty/teararoa-gpx-split/archive/refs/heads/main.zip to a new folder.
 
3. Go to https://www.teararoa.org.nz/before-you-go/maps-and-notes-download/
4. Download **Te Araroa Trail Tracks** zip file, open the zip file and save the contents to the above folder.  Rename the file to TeAraroaTrail.gpx.
5. Download **Te Araroa Trail Section Routes** zip file, open the zip file and save the contents to the above folder.  Rename the file to TeAraroaTrail_Route.gpx.
6. Go to https://www.plotaroute.com/routeplanner, choose **Create** > **Upload a route** and then choose to upload TeAraroaTrail.gpx. Once the file is uploaded, choose *D'load* (lower right corner), and ignore any warnings about a large number of directions. Accept the default download options (GPS, GPX, Track, Directions) and choose Download. Save the file to the above folder as TeAraroaTrail_plotaroute.gpx.

7. from the folder that contains all the files, run the following commands: `npm install` and then `node index.js`.

# How this works

The ```trk```'s in TeAraroaTrail gpx file that are in the same section, all have the same ```desc``` value - this is something like "Cape Reinga to Ahipara", "The Northland Forests", or "Mangakaretu to Kerikeri".  I generate a seperate gpx file for each of these sections. 

The TeAraroaTrail_Route gpx file contains a way point for the start of each of the sections, so I include the relavent start way point.   This will be something like "1 Cape Reinga lighthouse" or "2 Kaka St".   The number is the section number, I change this to the km, so the name of the waypoint will be "0 Cape Reinga lighthouse" " or "100 Kaka St".

I then create a way point for the start of each trk in the section from the TeAraroaTrail gpx file.  The trk names had a sequential number at the start, which I replace with the km, so the name will be something like "102 Herekino Bypass" or "166 Omahuta Forest Road".

I then copy over all the Track Points from (trk.trkseg.trkpt from TeAraroaTrail gpx file), with elevation data pulled in from Plotaroute from (TeAraroaTrail_plotaroute).

