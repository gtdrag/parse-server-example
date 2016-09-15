
Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});


Parse.Cloud.afterSave("HelloClass", function(request) {
   console.log('hello');
});

