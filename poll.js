var options = {}, options_default = {
  url: "",
  interval: 60,
  sep: ';',
  dir:  'logs/', //use with trailing /
  onData: function(live){/*doSomething*/}
};

var request = require('request');
var jsdom = require('jsdom');
var fs = require('fs');
var mkdirp = require('mkdirp');
var extend = require('extend');

var excel = {
  header: "TimeISO;TimeExcel;E_Tot;E;P;U1;A1;U2;A2;U3;A3\n",
  map: [
	"P",
	"E_Tot",
	"E",
	"U1", false,
	"A1", false,
	"U2", false,
	"A2", false,
	"U3", false,
	"A3", false,false,false,false,false
 ],
 line: function excel_line(data){
    var sep = options.sep;
    var t = new Date();
    var line = '' +
        t.toISOString() + sep +
        this.time(t) + sep +
	     data.E_Tot + sep +
	     data.E + sep +
	     data.P + sep +
	     data.U1 + sep +
	     data.A1 + sep +
	     data.U2 + sep +
	     data.A2 + sep +
	     data.U3 + sep +
	     data.A3 + '\n';
    if (!data.P) {
      module.exports.stop(); //no data, so we will stop everything
      return;
    }
    this.write(line.replace(/\./g,',')); 
  },
  time: function excel_time(t){
    var ts = Math.round( t.getTime() / 1000);
    return ts/86400+25569; //Format with datetime to get date in libreoffice
  },
  write_nr: 0,
  write: function excel_write(line){
    var line = line || this.header;
    this.write_nr =+1;
    console.log(options.dir + options.filename);
    console.log(this.write_nr + ': ' +line);
    if (line !== this.header) options.onData({filename: options.filename, line: line});
    fs.appendFile(options.dir + options.filename, line, function (err) {
      if (err) throw err;
    });
  }
};


function poll(){
	request.get(options.url, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    //console.log(body);
	    jsdom.env({
	      html: body,
	      scripts: [ 'jquery.js' ],
	      done: function(err, window){
	        var $ = window.$;
	        var data = {};
	        if (err) {console.log('Uhhh we had an error: ' + err);}
	        $('td[bgcolor=#FFFFFF]').each(function(key, val) {
	        	var val = parseFloat($(val).text().trim()),
	        	    key = excel.map[key];
	        	if (key) data[key] = val?val:'';
	        });
	        excel.line(data);
	        window.close();
	      }
	    });
	  }
	});
};

function getFileName(pre){
  pre = pre || 'kostal';
  var d = new Date();
  var date = d.getFullYear()*10000 + (d.getMonth()+1) * 100 + d.getDate();
  var time = d.getHours()*100+d.getMinutes();
  return pre + "_" + date + "_" + ((time<1000)?"0":"") + time + ".dat";
}


module.exports={
  start: function (opts) {
    extend(options, options_default, opts);
    if (!options.url) {throw new Error("Hey! Provide me with an url!");}
    options.filename = getFileName();
  	
    console.log('STARTING to poll from \033[36m' + options.url +
                '\033[39m every \033[36m' + options.interval + 's ' +
                '\033[39m and writing to \033[36m' + options.dir + options.filename +
                '\033[39m!');
    mkdirp(options.dir, function(err) { //make sure the logging dir exists
      excel.write(); // w/o argruments prints header
      poll();
      options.interval_handler = setInterval(poll, options.interval * 1000);
    });
  
  },
  stop: function(){
    if (options.interval_handler) clearInterval(options.interval_handler);
    if (options.filename) console.log('STOPPING on  \033[36m' + options.filename +
  	         '\033[39m!');

    options = {};
  },
  filename: function(){return options.filename;}
};




