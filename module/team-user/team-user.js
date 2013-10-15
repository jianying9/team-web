/**
 * User: zoe
 * Date: 12/21/12
 * Time: 10:46 AM
 */
$.yyLoadListener('team-user', {
    finishedListener:{
        initListener:function (yy) {
            var loginPanel = yy.findInModule('team-login-panel');
            loginPanel.lightSpeedIn();
        }
    },
    eventListener:{
        registerListener:{
            click:function (yy) {
                var registerForm = yy.findInModule('team-register-form');
                var msg = registerForm.getData();
                msg.act = 'REGISTER';
                registerForm.sendMessage(msg);
            }
        },
        registerToLoginListener:{
            click:function (yy) {
                var registerPanel = yy.findInModule('team-register-panel');
                var loginPanel = yy.findInModule('team-login-panel');
                registerPanel.fadeOutLeft();
                loginPanel.fadeInRight();
            }
        },
        getPasswordToLoginListener:{
            click:function (yy) {
                var loginPanel = yy.findInModule('team-login-panel');
                var getPasswordPanel = yy.findInModule('team-get-password-panel');
                getPasswordPanel.fadeOutRight();
                loginPanel.fadeInLeft();
            }
        },
        loginToRegisterListener:{
            click:function (yy) {
                var registerPanel = yy.findInModule('team-register-panel');
                var loginPanel = yy.findInModule('team-login-panel');
                loginPanel.fadeOutRight();
                registerPanel.fadeInLeft();
            }
        },
        loginListener:{
            click:function (yy) {
                var loginForm = yy.findInModule('team-login-form');
                var msg = loginForm.getData();
                msg.act = 'LOGIN';
                loginForm.sendMessage(msg);
            }
        },
        loginFormListener:{
            enter:function (yy) {
                var data = yy.getData();
                data.act = 'LOGIN';
                yy.sendMessage(data);
            }
        },
        loginToGetPasswordListener:{
            click:function (yy) {
                var loginPanel = yy.findInModule('team-login-panel');
                var getPasswordPanel = yy.findInModule('team-get-password-panel');
                loginPanel.fadeOutLeft();
                getPasswordPanel.fadeInRight();
            }
        },
        getPasswordListener:{
            click:function (yy) {
            }
        }
    },
    messageListener:{
        registerMessageListener:{
            REGISTER:function (yy, message) {
                if (message.flag === 'SUCCESS') {
                    var registerPanel = yy.findInModule('team-register-panel');
                    var loginPanel = yy.findInModule('team-login-panel');
                    registerPanel.fadeOutLeft();
                    loginPanel.fadeInRight();
                    var loginForm = yy.findInModule('team-login-form');
                    loginForm.loadData(message.data);
                }
            }
        },
        loginMessageListener:{
            LOGIN:function (yy, message) {
                if (message.flag === 'SUCCESS') {
                    var data = message.data;
                    yy.setSession({
                        loginNickName:data.nickName,
                        loginUserId:data.userId,
                        loginUserEmail:data.userEmail
                    });
                    var teamUserModule = yy.findInModule('team-user');
                    teamUserModule.remove();
                    $.yyLoadModule('team-main');
                }
            }
        }
    }
});
