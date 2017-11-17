;(function(){

  // FILL THIS ENDPOINTS
const GET_ALL_USERS     = undefined
const POST_NEW_USER     = undefined
const DELETE_DEL_USER   = undefined
// FILL THIS ENDPOINST


const app = angular.module('app', [])
app.controller('cont1', ($scope, $http, $window)=>{

$scope.data;
$scope.name;
$scope.firstname;
$scope.city;
$scope.birth;
$scope.idToDelete;

$scope.assign = (id) =>{
  $scope.idToDelete = id;
}

if(!GET_ALL_USERS || !POST_NEW_USER || !DELETE_DEL_USER){
  $scope.visible = false;
  return;
}else{
  $scope.visible = true;
}

  $scope.seeAllUsers = ()=>{
    $scope.name =undefined;
    $scope.firstname=undefined;
    $scope.city=undefined;
    $scope.birth=undefined;
    $scope.idToDelete=undefined;
    document.getElementById('name').focus()

    // GET_ALL_USERS
    $http({
      method: 'GET',
      dataType: 'json',
      url: GET_ALL_USERS,
      headers: {
      'Content-Type': 'application/json'
      },
    }).then(function success(response){
      $scope.data = response.data;
      $scope.resGET = "Ok"
    },function error(response){
      $scope.resGET = response.data
    });
  }

  $scope.seeAllUsers()

  $scope.createUser = (name,firstname,city,birth)=>{

    if(!name || !firstname || !city || !birth)
      return

    let formData = {
      name:name,
      firstname:firstname,
      city: city,
      birth: birth
    }


    // POST_NEW_USER
    $http({
      method: 'POST',
      dataType: 'json',
      url: POST_NEW_USER,
      headers: {
      'Content-Type': 'application/json'
      },
      data: formData
    }).then(function success(response){
      $scope.resPOST = "Ok"
      $scope.seeAllUsers()
    },function error(response){
      $scope.resPOST = response.data
      $scope.seeAllUsers()
    });
  }

  $scope.deleteUser = (id)=>{
    if(!id)
      return

    //DELETE_DEL_USER
      $http({
        method: 'DELETE',
        url: `${DELETE_DEL_USER}/${id}` ,
      }).then(function success(response){
        $scope.resDELETE = "Ok"
      $scope.seeAllUsers()
      },function error(response){
        $scope.resDELETE = response.data
      $scope.seeAllUsers()
      });
  }
})


}());
