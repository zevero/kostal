This script extracts data from your Kostal Piko every n seconds and collects it in a csv-file, which is importable to excel or libreoffice.

## Where ist tested?

I own a Kostal Piko 5.5

## Why a script, when there are so many loggers out there already?

Normal data-loggers only provide data every 5 or 15 minutes without voltage information.
Since I experience power-drops, when only one solar module is partly shaded I needed more detailed information.

## Usage

Just install with 'npm install kostal' or include it in your package.json file and start it:

    kostal = require('kostal');

    kostal.start({
	   url: 'http://pvserver:password@192.168.2.5',
	   interval: 2
    });

Off you go! Stop it with Ctrl-C :)

The csv-file waits to be imported in your 'logs' directory.
Be sure to format the TimeExcel colum to "date with time" and use "Insert Diagramm" to view your data.

## KOSTAL-UI

Tired of converting your Data to Libreoffice? Try the full fledged dynamic web-server [Kostal-UI](http://www.github.com/zevero/kostal-ui)
