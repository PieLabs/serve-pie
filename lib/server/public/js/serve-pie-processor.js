(function (root) {

  function $http(url, queryParams) {

    function xhr(method, body) {
      return new Promise(function (resolve, reject) {

        if (queryParams) {
          reject(new Error('Query Params object is not currently supported.'));
        } else {
          var client = new XMLHttpRequest();
          client.open(method, url);
          client.responseType = 'json';
          client.onload = function () {
            if (this.status >= 200 && this.status < 300) {
              resolve(this.response);
            } else {
              reject(new Error(this.response.error || this.statusText));
            }
          };

          client.onerror = function () {
            reject(new Error(this.statusText));
          };
          
          client.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
          client.send(JSON.stringify(body));
        }
      });
    }

    return {
      post: function (body) {
        return xhr('post', body);
      },
      put: function (body) {
        return xhr('put', body);
      }
    }
  };

  root.ServePieProcessor = function (endpoints) {

    this.model = function(questions, sessions, env){
        if (!endpoints || !endpoints.model) {
          return Promise.reject(new Error('missing endpoints'));
        } else {
          var url = endpoints.model.path;
          var method = endpoints.model.method.toLowerCase();
          return $http(url)[method]({
            questions: questions, 
            sessions: sessions,
            env: env
          })
        }
    }
  }
})(this);