function testService($http) {
    this.get = function () {
        return $http.get('http://server.godev.ro:8080/api/razvan/transactions/2016-02')
            .then(function (res) {
                return res.data;
            });
    };
};

function TestCtrl(testService) {
    var self = this;
    self.transactions = [];
    self.getMessage = function () {
        testService.get()
            .then(function (message) {
                $.each(message, function (index, value) {
                    self.transactions.push({date: value.date, description: value.description, amount: value.amount});
                });
            });
    };
};

var app = angular.module('app', []);

app.service('testService', testService);

app.controller('MainCtrl', function ($scope) {

});

app.controller('TestCtrl', TestCtrl);
