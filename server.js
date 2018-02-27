var http = require('http');
var url = require('url');
var querystring = require('querystring');
var static = require('node-static');
var file = new static.Server('.', {
  cache: 0
});
var fs = require("fs");
var blockquote_list_require =  require('./blockquote_list_start');

var index;
function accept(req, res) {

  if (req.url == '/js/description.json') {
    // искусственная задержка для наглядности
    fs.writeFileSync('js/description.json',JSON.stringify(blockquote_list_require.blockquote_list));
    file.serve(req, res);
  } 
  else if(req.method == 'POST' ) {
    
    var jsonString = '';

    req.on('data', function (data) {
      jsonString += data;
    });

    req.on('end', function () {
      /* отримую обєкт з яким уже можна працювати*/
      var reg_body_list = JSON.parse(jsonString);
      /* прийшов обєкт з новою цитатою*/
      if(reg_body_list.author){
        blockquote_list_require.blockquote_list.push(reg_body_list);
        fs.writeFileSync('./blockquote_list_start.js','module.exports.blockquote_list = '+ JSON.stringify(blockquote_list_require.blockquote_list));
      }
      /* прийшов id по якому потрібно змінити к-сть вподобань*/
      else{
          index = +reg_body_list.id;
          blockquote_list_require.blockquote_list[index].preference = ++ blockquote_list_require.blockquote_list[index].preference;
         fs.writeFileSync('./blockquote_list_start.js','module.exports.blockquote_list = '+ JSON.stringify(blockquote_list_require.blockquote_list));
       }
    });

  }
  else{
    file.serve(req, res);
  }

}


// ------ запустить сервер -------

if (!module.parent) {
  http.createServer(accept).listen(8080);
} else {
  exports.accept = accept;
}


