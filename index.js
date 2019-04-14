// 后端主程序
var http = require('http');
var url = require('url');
var fs = require('fs');
var req = require('request');
http.createServer(function (request,response) {
   var pathname = url.parse(request.url).pathname;
   //设置为true，会把参数以对象返回
   var params = url.parse(request.url,true).query;
   // console.log(pathname);
   console.log(params);
   //  读文件,有可能读不成功，所以用try catch

    var is = isStaticRequest(pathname);
    // console.log(is);
    if(is){
        // 访问静态文件
        try {
            var data = fs.readFileSync('./page/' + pathname);
            // 响应头
            response.writeHead(200);
            // 响应体
            response.write(data);
            // 关闭
            response.end();
        }catch(e){
            response.writeHead(404);
            response.write("<html><body>404 not found</body></html>");
            response.end();
        }
    }else{
        // 访问功能
        if(pathname == '/chat'){
           var data = {
               "reqType":0,
               "perception": {
                   "inputText": {
                       "text": params.text
                   },
               },
               "userInfo": {
                   "apiKey": "125d6b6003a94da8b28ae59ada784e43",
                   "userId": "346334"
               }
           }
           var content = JSON.stringify(data);
            // 图宁接口http://openapi.tuling123.com/openapi/api/v2
           req({
               url:"http://openapi.tuling123.com/openapi/api/v2",
               method:'POST',
               header:{
                   'content-type':'application/json'
               },
               body:content
           },function(error,resp,body){
               // console.log(body);

               if(!error && resp.statusCode == 200){
                   var obj = JSON.parse(body);
                   if(obj && obj.results && obj.results.length > 0 && obj.results[0].values){
                      //允许跨域访问
                      var head = {
                          'Access-Control-Allow-Origin':'*',
                          'Access-Control-Allow-Method':"GET",
                          'Access-Control-Allow-Header': "x-requested-with,content-type"

                      }
                      response.writeHead(200,head);
                       response.write(JSON.stringify(obj.results[0].values));
                       response.end();
                   }

               }else{
                   response.write("{\"text\":\"不知道你在说什么\"}");
                   response.end();
               }
           });

        }
    }



}).listen(12306);
function isStaticRequest(pathName){
    var static = ['.html','.css','.jpg'];
    for(var i = 0 ; i < static.length; i ++){
        if(pathName.indexOf(static[i]) == pathName.length - static[i].length){
            return true;
        }
    }
    return false;
}