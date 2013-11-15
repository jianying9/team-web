/**
 * User: aladdin
 * Date: 12/21/12
 * Time: 10:46 AM
 */
$.yyLoadListener('management-test', {
    finishedListener:{
        initListener:function (yy) {
            var actionInfo = yy.getContext('actionInfo');
            if (actionInfo) {
                var testForm = yy.findInModule('test-form');
                var importantParameter = actionInfo.importantParameter;
                var name;
                for (var index = 0; index < importantParameter.length; index++) {
                    name = importantParameter[index].name;
                    testForm.addInput(name, name);
                }
                var minorParameter = actionInfo.minorParameter;
                for (var index = 0; index < minorParameter.length; index++) {
                    name = minorParameter[index].name;
                    testForm.addInput(name, name);
                }
            }
            //
            var testResponseForm = yy.findInModule('test-response-form');
            $.yyAddMessageInterceptor({
                responseForm:testResponseForm,
                _parse:function(msg, indent) {
                    var result = '';
                    var type = typeof msg;
                    switch (type) {
                        case 'object':
                            var tab = '';
                            for(var index = 0; index < indent; index++) {
                                tab += '  ';
                            }
                            result += '{\n';
                            for(var id in msg) {
                                result += tab + '\"' + id + '\":' + this._parse(msg[id], indent + 1) + ',\n';
                            }
                            result = result.substr(0, result.length - 2);
                            result += '}\n';
                            break;
                        case 'number':
                            result =  msg;
                            break;
                        case 'string':
                            result = '\"' + msg + '\"';
                            break;
                        case 'array':
                            result += '[\n';
                            var type;
                            for(var index = 0; index < msg.length; index++) {
                                type = typeof msg[index];
                                switch (type) {
                                    case 'object':
                                        result += tab + this._parse(msg[index], indent + 1) + ',\n';
                                        break;
                                    case 'number':
                                        result += msg[index] + ',\n';
                                        break;
                                    case 'string':
                                        result += '\"' + msg[index] + '\",\n';
                                        break;
                                }
                            }
                            result = result.substr(0, result.length - 2);
                            result += ']\n';
                            break;
                    }
                    return result;
                },
                invoke:function(msg) {
                    var text = this._parse(msg, 1);
                    var data = {
                        responseData: text
                    };
                    this.responseForm.clear();
                    this.responseForm.loadData(data);
                }
            });
        }
    },
    eventListener:{
        testListener:{
            click:function (yy) {
                var testForm = yy.findInModule('test-form');
                var msg = testForm.getData();
                var actionName = yy.getContext('actionName');
                msg.act = actionName;
                msg.server = 'teamServer';
                yy.sendMessage(msg);
            }
        }
    },
    messageListener:{}
});


