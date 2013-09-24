var options = {
  url: "",
  interval: 60,
  sep: ';',
  filename: (function (pre) {
  	 var d = new Date();
  	 var date = d.getFullYear()*10000 + (d.getMonth()+1) * 100 + d.getDate();
  	 var time = d.getHours()*100+d.getMinutes();
  	 return pre + "_" + date + "_" + ((time<1000)?"0":"") + time + ".dat";
  	 }('kostal'))
};

var request = require('request');
var jsdom = require('jsdom');
var fs = require('fs');
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
    console.log(this.write_nr + ': ' +line);
    fs.appendFile(options.filename, line, function (err) {
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
	        	//console.log(key, val);
	        	if (key) data[key] = val?val:'';
	        });
	        //console.log(data);
	        excel.line(data);
	        window.close();
	      }
	    });
	  }
	});
};

module.exports={
  start: function (opts) {
    extend(options, opts);
  	 if (!options.url) {throw new Error("Hey! Provide me with an url!");}
  	
  	 console.log('Starting to poll from \033[36m' + options.url +
  	             '\033[39m every \033[36m' + options.interval + 's ' +
  	             '\033[39m and writing to \033[36m' + options.filename +
  	             '\033[39m!');
  	 
    excel.write(); // w/o argruments prints header
    poll();
    setInterval(poll, options.interval * 1000);
  
  }
};



