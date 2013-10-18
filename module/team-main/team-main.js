/**
 * User: zoe
 * Date: 12/21/12
 * Time: 10:46 AM
 */
$.yyLoadListener('team-main', {
    finishedListener:{
        initListener:function (yy) {
            //初始化
            var userMenuButton = yy.findInModule('user-menu-button');
            var nickName = yy.getSession('loginNickName');
            userMenuButton.setLabel(nickName);
            //动画
            userMenuButton.bounceIn();
            //延时设定
            var times = 0;
            //
            times += 4;
            var addFriendButton = yy.findInModule('add-friend-button');
            addFriendButton.submitAnimate('bounceIn', times);
//            var userTeamButton = yy.findInModule('user-team-button');
//            userTeamButton.submitAnimate('fadeInLeft', 4);
            //
//            var userProjectButton = yy.findInModule('user-project-button');
//            userProjectButton.submitAnimate('fadeInLeft', 8);
            //
//            var userAttentionButton = yy.findInModule('user-attention-button');
//            userAttentionButton.submitAnimate('fadeInLeft', 12);
//            var chat = yy.findInModule('main-left-side');
//            chat.$this.click();
            //加载聊天模块
            times += 4;
            var chatPanel = yy.findInModule('main-chat');
            chatPanel.addTimerTask({
                yy:chatPanel,
                times:times,
                execute:function () {
                    this.yy.loadModule('team-chat');
                    this.yy.bounceIn();
                }
            });
        }
    },
    eventListener:{
        userMenuListener:{
            click:function (yy) {
                var userMenuWindow = yy.openWindow({
                    class:'user_menu_window yy_hide',
                    key:'user-menu-window'
                });
                var nickName = yy.getSession('loginNickName');
                userMenuWindow.setHeaderLabel(nickName);
                userMenuWindow.loadModule('team-user-menu');
                if (userMenuWindow.isVisible()) {
                    userMenuWindow.bounceOut();
                } else {
                    userMenuWindow.bounceIn();
                }
            }
        },
        addFriendListener:{
            click:function (yy) {
                var teamMain = yy.findInModule('team-main');
                var addFriendWindow = teamMain.openWindow({
                    class:'add_friend_window yy_hide',
                    key:'add-friend-window'
                });
                addFriendWindow.setHeaderLabel('添加好友');
                addFriendWindow.loadModule('team-add-friend');
                if (addFriendWindow.isVisible()) {
                    addFriendWindow.bounceOut();
                } else {
                    addFriendWindow.bounceIn();
                }
            }
        },
        chatButtonListener:{
            click:function (yy) {
                var chatPanel = yy.findInModule('main-content-chat');
                var centerPanel = yy.findInModule('main-content-center');
                if (chatPanel.isVisible()) {
                    yy.$this.removeClass('expanded');
                    chatPanel.hide();
                    centerPanel.$this.addClass('chat_hidden');
                } else {
                    yy.$this.addClass('expanded');
                    centerPanel.$this.removeClass('chat_hidden');
                    chatPanel.loadModule('team-chat');
                    chatPanel.show();
                }
            }
        },
        toolButtonListener:{
            click:function (yy) {
                var toolPanel = yy.findInModule('main-content-tool');
                var centerPanel = yy.findInModule('main-content-center');
                if (toolPanel.isVisible()) {
                    yy.$this.removeClass('expanded');
                    toolPanel.hide();
                    centerPanel.$this.addClass('tool_hidden');
                } else {
                    centerPanel.$this.removeClass('tool_hidden');
                    toolPanel.show();
                    yy.$this.addClass('expanded');
                }
            }
        }
    },
    messageListener:{
        logoutMessageListener:{
            LOGOUT:function (yy, message) {
                if (message.flag === 'SUCCESS') {
                    var data = message.data;
                    var loginUserId = yy.getSession('loginUserId');
                    if (loginUserId == data.userId) {
                        yy.clearSession();
                        yy.remove();
                        $.yyLoadModule('team-user');
                    }
                }
            },
            FORCED_LOGOUT:function (yy, message) {
                if (message.flag === 'SUCCESS') {
                    yy.clearSession();
                    yy.remove();
                    $.yyLoadModule('team-user');
                }
            }
        }
    }
});


