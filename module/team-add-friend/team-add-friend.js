/**
 * User: zoe
 * Date: 12/21/12
 * Time: 10:46 AM
 */
$.yyLoadListener('team-add-friend', {
    finishedListener:{
        initListener:function (yy) {
//            var searchUserList = yy.findInModule('search-user-list');
//            searchUserList.init({
//                key:'userId',
//                dataToHtml:function (data) {
//                    var result = data.nickName + '<div class="team_default_head"></div><div class="yy_button team_button" yyEventListener="team-add-friend.addFriendListener">添加好友</div>';
//                    return result;
//                }
//            });
        }
    },
    eventListener:{
        addFriendByUserEmailListener:{
            click:function (yy) {
                var addUserForm = yy.findInModule('add-user-email-form');
                var msg = addUserForm.getData();
                msg.act = 'INSERT_FRIEND_BY_USER_EMAIL';
                yy.sendMessage(msg);
            }
        }
//        addFriendListener:{
//            click:function (yy) {
//                var data = yy.group.getData();
//                yy.sendMessage({act:'INSERT_FRIEND', userId: data.userId});
//                yy.remove();
//            }
//        },
//        searchListener:{
//            change:function (yy) {
//                var searchUserList = yy.findInModule('search-user-list');
//                searchUserList.clear();
//                var searchUserMessagePanel = yy.findInModule('search-user-message-panel');
//                searchUserMessagePanel.setLabel('请输入用户昵称');
//                var msg = yy.getData();
//                if (msg.nickName != '') {
//                    msg.act = 'SEARCH_USER_BY_NICKNAME';
//                    msg.pageIndex = '';
//                    yy.loadData({pageIndex:''});
//                    yy.sendMessage(msg);
//                }
//            }
//        },
//        searchListListener:{
//            scrollHalf:function (yy) {
//                var searchUserForm = yy.findInModule('search-user-form');
//                var msg = searchUserForm.getData();
//                if (msg.nickName != '' && msg.pageIndex != '') {
//                    msg.act = 'SEARCH_USER_BY_NICKNAME';
//                    yy.sendMessage(msg);
//                }
//            }
//        }
    },
    messageListener:{
//        searchUserMessageListener:{
//            SEARCH_USER_BY_NICKNAME:function (yy, message) {
//                if (message.flag === 'SUCCESS') {
//                    var data = message.data;
//                    var searchUserList = yy.findInModule('search-user-list');
//                    var searchUserMessagePanel = yy.findInModule('search-user-message-panel');
//                    //显示搜索结果
//                    var label = searchUserMessagePanel.getLabel();
//                    if(label == '请输入用户昵称') {
//                        searchUserMessagePanel.setLabel('搜索到' + message.pageTotal + '位用户');
//                    }
//                    //设置分页参数
//                    var searchUserForm = yy.findInModule('search-user-form');
//                    searchUserForm.loadData({pageIndex:message.nextPageIndex});
//                    if (data.length > 0) {
//                        searchUserList.loadData(data);
//                    }
//                }
//            }
//        }
    }
});


