angular.module('ng-one-five-true-false', [])
  .directive('ngOneFiveTrueFalse', function(){

    function link($scope, $elem, $attrs){

      $scope.$watch('mode', function(c){
        console.log('ng true false --------------------->: ' , c);
      }, true);

      $scope.$watch('config', function(c){
        console.log('ng true false: ' , c);
      });

      $scope.$watch('session', function(c){
        console.log('ng true false - session: ' , c);
        if(c){
          $scope.session.other = {msg: 'hi'};
        }
      });
    }

    var template = [
      '<div>',
      '  {{config.model.prompt}}',
      '  <input type="checkbox" ng-disabled="mode.view !== \'gather\'"  ng-model="session.response"></input>',
      '  <input type="text"  ng-disabled="mode.view !== \'gather\'" ng-model="session.other.label"></input>',
      '</div>',
    ].join('\n');

    return {
      restrict: 'E',
      link: link,
      scope: {},
      template: template,
      replace: false
    };
  }
);
