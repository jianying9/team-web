/**
 * User: zoe
 * Date: 12/30/12
 * Time: 10:11 AM
 */
$.yyLoadListener('team-chat', {
    finishedListener:{
        initListener:function (yy) {
            //初始化message-notify-list
            var messageNotifyList = yy.findInModule('message-notify-list');
            messageNotifyList.init({
                key:'userId',
                itemEventListener:'team-chat.messageNotifyItemListener',
                dataToHtml:function (data) {
                    var result = data.nickName + '<div class="team_default_head"></div>';
                    return result;
                }
            });
            //初始化contact-online-list
            var contactOnlineList = yy.findInModule('contact-online-list');
            contactOnlineList.init({
                key:'userId',
                itemEventListener:'team-chat.contactItemListener',
                dataToHtml:function (data) {
                    var result = data.nickName + '<div class="team_default_head"></div><div class="chat_contact_online"></div>';
                    return result;
                }
            });
            //初始化contact-offline-list
            var contactOfflineList = yy.findInModule('contact-offline-list');
            contactOfflineList.init({
                key:'userId',
                itemEventListener:'team-chat.contactItemListener',
                dataToHtml:function (data) {
                    var result = data.nickName + '<div class="team_default_head"></div>';
                    return result;
                }
            });
            contactOfflineList.sendMessage({act:'INQUIRE_FRIEND'});
            var contactTab = yy.findInModule('chat-contact-tab');
            contactTab.$this.click();
        }
    },
    eventListener:{
        contactTabListener:{
            click:function (yy) {
                var contactPanel = yy.findInModule('chat-contact-panel');
                var groupPanel = yy.findInModule('chat-group-panel');
                var lastPanel = yy.findInModule('chat-last-panel');
                groupPanel.hide();
                lastPanel.hide();
                contactPanel.show();
            }
        },
        groupTabListener:{
            click:function (yy) {
                var contactPanel = yy.findInModule('chat-contact-panel');
                var groupPanel = yy.findInModule('chat-group-panel');
                var lastPanel = yy.findInModule('chat-last-panel');
                lastPanel.hide();
                contactPanel.hide();
                groupPanel.show();
            }
        },
        lastTabListener:{
            click:function (yy) {
                var contactPanel = yy.findInModule('chat-contact-panel');
                var groupPanel = yy.findInModule('chat-group-panel');
                var lastPanel = yy.findInModule('chat-last-panel');
                groupPanel.hide();
                contactPanel.hide();
                lastPanel.show();
            }
        },
        contactItemListener:{
            click:function (yy) {
                var data = yy.getData();
                var teamChat = yy.findInModule('team-chat-message-area');
                var key = data.userId + '_window';
                var chatWindow = teamChat.openWindow({
                    class:'chat_window yy_hide',
                    key:key
                });
                chatWindow.setContext({friendId:data.userId});
                chatWindow.setHeaderLabel(data.nickName);
                chatWindow.loadModule('team-chat-message');
                if (chatWindow.isVisible()) {
                    chatWindow.bounceOut();
                } else {
                    chatWindow.bounceIn();
                }
            }
        },
        messageNotifyItemListener:{
            click:function (yy) {
                var itemData = yy.getData();
                var contactOfflineList = yy.findInModule('contact-offline-list');
                var friendItem = contactOfflineList.findInChildren(itemData.userId);
                friendItem.$this.click();
                var messageNotifyList = yy.findInModule('message-notify-list');
                messageNotifyList.removeItem(itemData.userId);
                var num = messageNotifyList.size();
                if (num == 0) {
                    messageNotifyList.hide();
                }
            }
        }
    },
    messageListener:{
        messageNotifyListener:{
            INSERT_USER_MESSAGE:function (yy, message) {
                if (message.flag === 'SUCCESS') {
                    var data = message.data;
                    var loginUserId = yy.getSession('loginUserId');
                    if (data.receiveId == loginUserId) {
                        //收到新的消息,查找对应的好友
                        var contactOfflineList = yy.findInModule('contact-offline-list');
                        var itemData = contactOfflineList.getItemData(data.sendId);
                        if (itemData) {
                            var key = data.sendId + '_window';
                            var teamChat = yy.findInModule('team-chat');
                            var chatWindow = teamChat.findInChildren(key);
                            var isNotify = false;
                            if (chatWindow) {
                                //如果窗口存在，但是隐藏，则闪烁头像
                                if (!chatWindow.isVisible()) {
                                    isNotify = true;
                                }
                            } else {
                                //如果窗口不存在，则闪烁头像，并且设置消息
                                var receiveMessage = yy.getSession('receiveMessage');
                                if (!receiveMessage) {
                                    receiveMessage = {};
                                    yy.setSession({receiveMessage:receiveMessage});
                                }
                                var message = receiveMessage[data.sendId];
                                if (!message) {
                                    message = {};
                                    receiveMessage[data.sendId] = message;
                                }
                                message[data.createTime] = data;
                                isNotify = true;
                            }
                            if (isNotify) {
                                if (!yy.isVisible()) {
                                    yy.show();
                                }
                                var notifyItemData = yy.getItemData(data.sendId);
                                if (!notifyItemData) {
                                    var notifyItem = yy.addItemData(itemData);
                                    notifyItem.flash();
                                }
                            }
                        }
                    }
                }
            }
        },
        onlineFriendListener:{
            LOGOUT:function (yy, message) {
                if (message.flag === 'SUCCESS') {
                    var data = message.data;
                    var loginUserId = yy.getSession('loginUserId');
                    if (loginUserId && loginUserId != data.userId) {
                        var contactOnlineList = yy.findInModule('contact-online-list');
                        var itemData = contactOnlineList.getItemData(data.userId);
                        if (itemData) {
                            contactOnlineList.removeItem(data.userId);
                            var contactOfflineList = yy.findInModule('contact-offline-list');
                            contactOfflineList.showItem(data.userId);
                        }
                    }
                }
            }
        },
        offlineFriendListener:{
            LOGIN:function (yy, message) {
                if (message.flag === 'SUCCESS') {
                    var data = message.data;
                    var loginUserId = yy.getSession('loginUserId');
                    if (loginUserId != data.userId) {
                        var contactOnlineList = yy.findInModule('contact-online-list');
                        var itemData = contactOnlineList.getItemData(data.userId);
                        if (!itemData) {
                            var contactOfflineList = yy.findInModule('contact-offline-list');
                            itemData = contactOfflineList.getItemData(data.userId);
                            contactOfflineList.hideItem(data.userId);
                            contactOnlineList.addItemData(itemData);
                        }
                    }
                }
            },
            ASSERT_FRIEND_ONLINE:function (yy, message) {
                if (message.flag === 'SUCCESS') {
                    var data = message.data;
                    var contactOnlineList = yy.findInModule('contact-online-list');
                    var itemData = contactOnlineList.getItemData(data.userId);
                    if (!itemData) {
                        var contactOfflineList = yy.findInModule('contact-offline-list');
                        itemData = contactOfflineList.getItemData(data.userId);
                        contactOfflineList.hideItem(data.userId);
                        contactOnlineList.addItemData(itemData);
                    }
                }
            },
            INQUIRE_FRIEND:function (yy, message) {
                if (message.flag === 'SUCCESS') {
                    var data = message.data;
                    yy.loadData(data);
                    var contactPanel = yy.findInModule('chat-contact-panel');
                    contactPanel.initScroll();
                    //发出在线请求判断
                    var times = 5;
                    var msg;
                    for (var dataIndex = 0; dataIndex < data.length; dataIndex++) {
                        msg = {
                            act:'ASSERT_FRIEND_ONLINE',
                            userId:data[dataIndex].userId
                        }
                        yy.addTimerTask({
                            _yy:yy,
                            times:times,
                            _msg:msg,
                            execute:function () {
                                this._yy.sendMessage(this._msg);
                            }
                        });
                        times += 5;
                    }
                }
            },
            INSERT_FRIEND_BY_USER_EMAIL:function (yy, message) {
                if (message.flag === 'SUCCESS') {
                    var data = message.data;
                    yy.addItemData(data);
                    var contactPanel = yy.findInModule('chat-contact-panel');
                    contactPanel.initScroll();
                }
            }
        }
    }
});