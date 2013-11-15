/**
 * User: zoe
 * Date: 12/30/12
 * Time: 10:11 AM
 */
$.yyLoadListener('team-chat-message', {
    finishedListener:{
        initListener:function (yy) {
            //初始化chat-message-list
            var friendId = yy.getContext('friendId');
            var chatMessageList = yy.findInModule('chat-message-list');
            chatMessageList.init({
                key:'messageId',
                dataToHtml:function (data) {
                    var friendId = this.getContext('friendId');
                    var result;
                    if (data.receiveId === friendId) {
                        result = '<div class="chat_message_me">';
                    } else {
                        result = '<div class="chat_message_friend">';
                    }
                    var createTime = data.createTime.substr(11);
                    result += '<div class="chat_message_time">' + createTime + '</div>';
                    result += '<div class="chat_message">' + data.message + '</div>';
                    result += '<div class="team_arrows chat_message_arrows"></div>';
                    result += '</div>';
                    return result;
                }
            });
            var receiveMessage = yy.getSession('receiveMessage');
            if(receiveMessage && receiveMessage[friendId]) {
                var itemData;
                var message = receiveMessage[friendId];
                for(var indexId in message) {
                    itemData = message[indexId];
                    chatMessageList.addItemData(itemData);
                }
                delete receiveMessage[friendId];
            }
            var chatCanvas = yy.findInModule('chat-canvas');
            chatCanvas.extend.friendId = friendId;
        }
    },
    eventListener:{
        sendMessageButtonListener:{
            click:function (yy) {
                var chatMessageForm = yy.findInModule('chat-message-form');
                var data = chatMessageForm.getData();
                chatMessageForm.clear();
                var friendId = yy.getContext('friendId');
                data.receiveId = friendId;
                data.act = 'INSERT_USER_MESSAGE';
                yy.sendMessage(data);
            }
        },
        messageFormListener: {
            enter:function (yy) {
                var data = yy.getData();
                yy.clear();
                var friendId = yy.getContext('friendId');
                data.receiveId = friendId;
                data.act = 'INSERT_USER_MESSAGE';
                yy.sendMessage(data);
            }
        },
        surpriseButtonListener:{
            click:function (yy) {
                var chatMessageForm = yy.findInModule('chat-message-form');
                var chatMessageList = yy.findInModule('chat-message-list');
                var chatCanvas = yy.findInModule('chat-canvas');
                if(chatMessageForm.isVisible()) {
                    chatMessageForm.hide();
                    chatMessageList.hide();
                    chatCanvas.show();
                } else {
                    chatCanvas.hide();
                    chatMessageForm.show();
                    chatMessageList.show();
                }
            }
        }
    },
    messageListener:{
        userMessageListener:{
            INSERT_USER_MESSAGE:function (yy, message) {
                if (message.flag === 'SUCCESS') {
                    var friendId = yy.getContext('friendId');
                    var data = message.data;
                    if (data.sendId === friendId || data.receiveId === friendId) {
                        var chatMessageList = yy.findInModule('chat-message-list');
                        chatMessageList.addItemData(message.data);
                    }
                }
            }
        },
        canvasMessageListener:{
            SEND_CANVAS_COMMAND:function (yy, message) {
                if (message.flag === 'SUCCESS') {
                    var friendId = yy.getContext('friendId');
                    var data = message.data;
                    if (data.sendId === friendId) {
                        yy.draw(data.x, data.y);
                    }
                }
            }
        }
    }
});