/**
 * User: aladdin
 * Date: 12/21/12
 * Time: 10:46 AM
 */
$.yyLoadListener('management-main', {
    finishedListener:{
        initListener:function (yy) {
            //初始化
            var groupList = yy.findInModule('group-list');
            groupList.init({
                key:'groupName',
                itemEventListener:'management-main.groupItemListener',
                dataToHtml:function (data) {
                    return data.groupName;
                }
            });
            //发送接口分类查询
            var msg = {
                act:'GROUPS'
            };
            yy.sendMessage(msg);
        }
    },
    eventListener:{
        groupItemListener:{
            click:function (yy) {
                var data = yy.getData();
                var groupPanel = yy.findInModule('group-window-area');
                var key = data.groupName + '_window';
                var groupWindow = groupPanel.openWindow({
                    clazz:'group_window yy_hide',
                    key:key
                });
                groupWindow.setHeaderLabel(data.groupName);
                groupWindow.loadModule('management-group', {
                        groupName:data.groupName
                    });
                if (groupWindow.isVisible()) {
                    groupWindow.bounceOut();
                } else {
                    groupWindow.bounceIn();
                }
            }
        },
        md5Listener:{
            click:function (yy) {
                var inputForm = yy.findInModule('md5_input-form');
                var outputForm = yy.findInModule('md5_output-form');
                var msg = inputForm.getData();
                outputForm.loadData(msg);
            }
        }
    },
    messageListener:{
        groupListener:{
            GROUPS:function (yy, message) {
                var data = message.data;
                yy.loadData(data);
            }
        }
    }
});


