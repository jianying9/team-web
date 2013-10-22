/**
 * User: aladdin
 * Date: 12/21/12
 * Time: 10:46 AM
 */
$.yyLoadListener('management-group', {
    finishedListener:{
        initListener:function (yy) {
            //初始化
            var groupName = yy.window.getContext('groupName');
            var serviceList = yy.findInModule('service-list');
            serviceList.init({
                key:'actionName',
                itemEventListener:'management-group.serviceItemListener',
                dataToHtml:function (data) {
                    var result = '<div class="actionName">' + data.actionName + '</div>'
                        + '<div class="description">' + data.description + '</div>';
                    return result;
                }
            });
            var serviceInfoList = yy.findInModule('service-info-list');
            serviceInfoList.init({
                key:'actionName',
                dataToHtml:function (data) {
                    var result = '<div class="info_detail">'
                        + '<div class="actionName">接口:' + data.actionName + '</div>'
                        + '<div class="description">描述:' + data.description + '</div>'
                        + '</div>'
                        + '<div class="info_request_list">请求参数'
                        + '<div class="info_request">'
                        + '<div>必填</div><div>参数名</div><div>类型</div><div>默认值</div><div>描述</div>'
                        + '</div>';
                    var parameterData = data.importantParameter;
                    for (var index = 0; index < parameterData.length; index++) {
                        result = result + '<div class="info_request">'
                            + '<div><div class="parameter_important"></div></div>'
                            + '<div>' + parameterData[index].name + '</div>'
                            + '<div>' + parameterData[index].type + '</div>'
                            + '<div>' + parameterData[index].defaultValue + '</div>'
                            + '<div>' + parameterData[index].description + '</div>'
                            + '</div>';
                    }
                    parameterData = data.minorParameter;
                    for (var index = 0; index < parameterData.length; index++) {
                        result = result + '<div class="info_request">'
                            + '<div class="parameter_mirror"></div>'
                            + '<div>' + parameterData[index].name + '</div>'
                            + '<div>' + parameterData[index].type + '</div>'
                            + '<div>' + parameterData[index].defaultValue + '</div>'
                            + '<div>' + parameterData[index].description + '</div>'
                            + '</div>';
                    }
                    result = result + '</div>';
                    result = result + '<div class="info_response_list">响应参数';
                    result = result + '<div class="info_response">'
                        + '<div>参数名</div><div>类型</div><div>描述</div>'
                        + '</div>';
                    parameterData = data.returnParameter;
                    for (var index = 0; index < parameterData.length; index++) {
                        result = result + '<div class="info_response">'
                            + '<div>' + parameterData[index].name + '</div>'
                            + '<div>' + parameterData[index].type + '</div>'
                            + '<div>' + parameterData[index].description + '</div>'
                            + '</div>';
                    }
                    result = result + '</div>';
                    return result;
                }
            });
            //查询group下的service
            var msg = {
                act:'SERVICES',
                group:groupName
            };
            yy.sendMessage(msg);
        }
    },
    eventListener:{
        serviceItemListener:{
            click:function (yy) {
                yy.selected();
                var data = yy.getData();
                yy.window.setContext({actionName:data.actionName});
                var serviceInfoList = yy.findInModule('service-info-list');
                var infoItem = serviceInfoList.getItem(data.actionName);
                serviceInfoList.hideAllItem();
                if (infoItem) {
                    serviceInfoList.showItem(data.actionName);
                } else {
                    var msg = {
                        act:'INFO',
                        actionName:data.actionName
                    };
                    yy.sendMessage(msg);
                }
                var serviceInfoPanel = yy.findInModule('service-info-panel');
                yy.parent.fadeOutLeft();
                serviceInfoPanel.fadeInRight();
            }
        },
        returnListener:{
            click:function (yy) {
                var serviceList = yy.findInModule('service-list');
                var serviceInfoPanel = yy.findInModule('service-info-panel');
                serviceInfoPanel.fadeOutRight();
                serviceList.fadeInLeft();
            }
        },
        testListener:{
            click:function (yy) {
                var actionName = yy.window.getContext('actionName');
                var serviceInfoList = yy.findInModule('service-info-list');
                var infoItem = serviceInfoList.getItem(actionName);
                if (infoItem) {
                    var testPanel = yy.findInModule('test-window-area');
                    var key = actionName + '_window';
                    var testWindow = testPanel.openWindow({
                        class:'test_window yy_hide',
                        key:key
                    });
                    var actionInfo = infoItem.getData();
                    testWindow.setContext({
                        actionName:actionName,
                        actionInfo:actionInfo
                    });
                    testWindow.setHeaderLabel(actionName + '接口测试');
                    testWindow.loadModule('management-test');
                    if (testWindow.isVisible()) {
                        testWindow.bounceOut();
                    } else {
                        testWindow.bounceIn();
                    }
                }
            }
        }
    },
    messageListener:{
        serviceListener:{
            SERVICES:function (yy, message) {
                var groupName = yy.window.getContext('groupName');
                if (groupName == message.group) {
                    yy.clear();
                    var data = message.data;
                    yy.loadData(data);
                }
            }
        },
        infoListener:{
            INFO:function (yy, message) {
                var actionName = yy.window.getContext('actionName');
                if (actionName == message.actionName) {
                    yy.addItemData(message.data);
                }
            }
        }
    }
});


