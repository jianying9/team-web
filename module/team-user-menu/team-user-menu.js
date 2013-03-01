/**
 * User: zoe
 * Date: 12/21/12
 * Time: 10:46 AM
 */
$.yyLoadListener('team-user-menu', {
    eventListener:{
        logoutListener:{
            click:function (yy) {
                yy.sendMessage({act:'LOGOUT'});
            }
        }
    }
});


