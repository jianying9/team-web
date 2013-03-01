//
// User: zoe
// Date: 8/9/12
// Time: 11:25 AM
//
//
(function ($) {
    //--------------yy--start-------------创建框架根对象
    var YY = {
        $:$
    };
    //--------------index--start-------------创建计数器对象
    var index = {
        currentIndex:new Date().getTime(),
        zIndex:20,
        nextIndex:function () {
            return this.currentIndex++;
        },
        nextZIndex:function () {
            return this.zIndex++;
        }
    };
    YY.index = index;
    //--------------index--end-------------
    //--------------root---start----------
    var $body = $('body');
    var rootId = index.nextIndex();
    $body.attr({
        id:rootId,
        onselectstart:"return false"
    });
    var root = {
        type:'yy_root',
        id:rootId,
        $this:$body,
        children:{},
        extend:{}
    };

    //--------------root---end--------------

    //--------------context--start-------------创建全局上下文对象
    var el = document.compatMode === "CSS1Compat" ? document.documentElement : document.body;
    var context = {
        logLevel:4,
        modulePath:'module',
        bodyWidth:el.clientWidth,
        bodyHeight:el.clientHeight,
        set:function (config) {
            for (var name in config) {
                this[name] = config[name];
            }
        },
        get:function (name) {
            return this[name];
        }
    };
    $body.css({height:context.bodyHeight});
    YY.context = context;
    //初始化上下文对象
    //@param option={
    //    browserType:'浏览器类型',
    //    server:'后台服务地址',
    //    logger:'日志对象',
    //    logLevel:4,debug:4,info:3,waring:2,error:1
    //}
    $.yyConfig = function (config) {
        context.set(config);
    };
    //--------------context--end-------------

    //--------------logger--start-------------创建日志对象
    var impl = console ? console : null;
    var logger = {
        _context:context,
        _impl:impl,
        debug:function (msg) {
            if (this._impl && this._context.logLevel >= 4) {
                this._impl.debug(new Date() + ':' + msg);
            }
        },
        info:function (msg) {
            if (this._impl && this._context.logLevel >= 3) {
                this._impl.info(new Date() + ':' + msg);
            }
        },
        warn:function (msg) {
            if (this._impl && this._context.logLevel >= 2) {
                this._impl.warn(new Date() + ':' + msg);
            }
        },
        error:function (msg) {
            if (this._impl && this._context.logLevel >= 1) {
                this._impl.error(new Date() + ':' + msg);
            }
        }
    };
    //--------------logger--end-------------
    var session = {
        _logger:logger,
        _session:{},
        set:function (config) {
            for (var name in config) {
                this._session[name] = config[name];
            }
        },
        get:function (name) {
            return this._session[name];
        },
        clear:function() {
            for (var name in this._session) {
                delete this._session[name];
            }
        }
    };
    //--------------components--start-------------创建组件管理对象

    var listeners = {
        _moduleListenerMap:{},
        _index:index,
        putListener:function (moduleId, listener) {
            if (this._moduleListenerMap[moduleId]) {
                throw 'Repeat load moduleId:' + moduleId + ' listener.';
            } else {
                this._moduleListenerMap[moduleId] = listener;
            }
        },
        _getModule:function (moduleId) {
            var module = this._moduleListenerMap[moduleId];
            if (!module) {
                throw 'Can not find moduleId:' + moduleId + ' listener.';
            }
            return module;
        },
        getFinishedListener:function (moduleId, listenerName) {
            var module = this._getModule(moduleId);
            if (!module.finishedListener) {
                throw 'Can not find moduleId:' + moduleId + ' finishedListener.';
            }
            var finishedListener = module.finishedListener;
            if (!finishedListener[listenerName]) {
                throw 'Can not find moduleId:' + moduleId + ' finishedListener:' + listenerName;
            }
            return finishedListener;
        },
        getEventListener:function (moduleId, listenerName) {
            var module = this._getModule(moduleId);
            if (!module.eventListener) {
                throw 'Can not find moduleId:' + moduleId + ' eventListener.';
            }
            var eventListener = module.eventListener;
            if (!eventListener[listenerName]) {
                throw 'Can not find moduleId:' + moduleId + ' eventListener:' + listenerName;
            }
            var listener = eventListener[listenerName];
            return listener;
        },
        getMessageListener:function (moduleId, listenerName) {
            var module = this._getModule(moduleId);
            if (!module.messageListener) {
                throw 'Can not find moduleId:' + moduleId + ' messageListener.';
            }
            var messageListener = module.messageListener;
            if (!messageListener[listenerName]) {
                throw 'Can not find moduleId:' + moduleId + ' messageListener:' + listenerName;
            }
            var listener = messageListener[listenerName];
            return listener;
        },
        _createNewHandler:function (yy, type, handler) {
            var eventListener = yy.eventListener;
            var value = this._index.nextIndex();
            var oldId = type + '_' + value;
            eventListener[oldId] = eventListener[type];
            value = this._index.nextIndex();
            var newId = type + '_' + value;
            eventListener[newId] = handler;
            eventListener[type] = function (yy, event) {
                var ifStop = eventListener[oldId](yy, event);
                if (!ifStop) {
                    eventListener[newId](yy, event);
                }
            }
        },
        addEventListener:function (option) {
            if (option.target && option.type && option.handler) {
                var yy = option.target;
                if (!yy.eventListener) {
                    yy.eventListener = {};
                }
                if (yy.eventListener[option.type]) {
                    this._createNewHandler(yy, option.type, option.handler);
                } else {
                    yy.eventListener[option.type] = option.handler;
                }
            }
        },
        removeEventListener:function (option) {
            if (option.target && option.type) {
                var yy = option.target;
                if (yy.eventListener && yy.eventListener[option.type]) {
                    delete yy.eventListener[option.type];
                }
            }
        }
    };
    YY.listeners = listeners;

    $.yyLoadListener = function (moduleId, listener) {
        listeners.putListener(moduleId, listener);
        var scriptUrl = context.modulePath + '/' + moduleId + '/' + moduleId + '.js';
        scriptLoader.complete(scriptUrl);
    };
    var components = {
        _logger:logger,
        _root:root,
        _listeners:listeners,
        _findChildById:function (yy, id) {
            var result,
                child,
                children = yy.children;
            for (var indexId in children) {
                child = children[indexId];
                if (indexId == id) {
                    result = child;
                    break;
                } else {
                    result = this._findChildById(child, id);
                    if (result) {
                        break;
                    }
                }
            }
            return result;
        },
        _findChildByKey:function (yy, key) {
            var result,
                child,
                children = yy.children;
            for (var indexId in children) {
                child = children[indexId];
                if (child.key == key) {
                    result = child;
                    break;
                } else {
                    result = this._findChildByKey(child, key);
                    if (result) {
                        break;
                    }
                }
            }
            return result;
        },
        findByKey:function (loaderId, key) {
            var result;
            //查找loader
            var loader;
            if (loaderId == this._root.id) {
                loader = this._root;
            } else {
                loader = this._findChildById(this._root, loaderId);
            }
            //查找目标
            if (loader) {
                if (loader.key === key) {
                    result = loader;
                } else {
                    result = this._findChildByKey(loader, key);
                }
                if (!result) {
                    this._logger.warn('can not find obj by  key:' + key + ' in loaderId:' + loaderId);
                }
            } else {
                this._logger.error('can not find obj by id:' + loaderId);
            }
            return result;
        },
        findById:function (id) {
            var result;
            if (this._root.id == id) {
                result = this._root;
            } else {
                result = this._findChildById(this._root, id);
            }
            if (!result) {
                this._logger.error('can not find obj by id:' + id);
            }
            return result;
        }
    };
    //--------------components--end-------------

    //--------------taskManager---start--------
    var taskManager = {
        _index:index,
        _logger:logger,
        _taskQueue:{},
        addTask:function (task) {
            var id = this._index.nextIndex();
            this._taskQueue[id] = task;
        },
        start:function () {
            var task,
                complete;
            for (var id in this._taskQueue) {
                task = this._taskQueue[id];
                if(task.message) {
                    this._logger.debug(task.message);
                }
                complete = task.execute();
                if (complete) {
                    delete this._taskQueue[id];
                }
            }
        }
    };
    var timer = setInterval(function () {
        try {
            taskManager.start();
        } catch (err) {
            logger.error(err.message);
        }
    }, 100);
    YY.taskManager = taskManager;
    //--------------taskManager----end---------

    //--------------scriptLoader--start-------------创建脚本加载控制对象
    var scriptLoader = {
        _$head:$('head'),
        _scriptMap:{},
        _logger:logger,
        _taskManager:taskManager,
        load:function (url, callback) {
            var that = this;
            if (that._scriptMap[url]) {
                if (callback) {
                    callback();
                }
            } else {
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = url;
                this._$head[0].appendChild(script);
                if (callback) {
                    var task = {
                        message:'load script:' + url,
                        _scriptMap:this._scriptMap,
                        execute:function () {
                            var result = false;
                            if (that._scriptMap[url]) {
                                result = true;
                                callback();
                            }
                            return result;
                        }
                    };
                    this._taskManager.addTask(task);
                }
            }
        },
        complete:function (url) {
            this._scriptMap[url] = true;
        }
    };
    //--------------scriptLoader--end-------------

    //--------------htmlLoader--start-------------创建html加载控制对象
    var htmlLoader = {
//        _pattern:/\r?\n */g,
        load:function (url, callback) {
            var that = this;
            $.get(url, function (data) {
//                data = data.replace(that._pattern, '');
                callback(data);
            }, 'text');
        }
    };
    //--------------htmlLoader--end-------------

    //加载模块
    //--------------modelLoader--start-------------创建组件模型加载对象
    var modelLoader = {
        _logger:logger,
        _context:context,
        _components:components,
        _scriptLoader:scriptLoader,
        _htmlLoader:htmlLoader,
        load:function (loaderId, moduleId, callback) {
            var that = this;
            var yy = this._components.findByKey(loaderId, moduleId);
            if (yy) {
                yy.show();
            } else {
                var path = this._context.modulePath + '/' + moduleId + '/' + moduleId;
                var scriptUrl = path + '.js';
                var htmlUrl = path + '.html';
                //同步加载js,html
                that._scriptLoader.load(scriptUrl, function () {
                    that._htmlLoader.load(htmlUrl, function (htmlData) {
                        callback(htmlData);
                    });
                });
            }
        }
    };

    //--------------utils--start-------------创建工具类
    var utils = {
        $:$,
        attr:function (name, $target, defValue) {
            var value = $target.attr(name);
            if (!value) {
                value = defValue;
            }
            return value;
        },
        trim:function (value) {
            return this.$.trim(value);
        }
    };
    YY.utils = utils;
    //--------------utils--end-------------

    var services = {
        message:{
            SUCCESS:'操作成功',
            FAILURE:'操作失败',
            UN_LOGIN:'未登录',
            INVALID:'非法数据',
            DENIED:'无权限',
            UN_KNOWN:'非法链接',
            EXCEPTION:'系统异常',
            BUSY:'系统繁忙,请稍后再试'
        },
        serviceMap:{},
        put:function (service) {
            this.serviceMap[service.act] = service;
        },
        get:function (act) {
            return this.serviceMap[act];
        }
    };
    //扩展服务
    $.yyLoadService = function (option) {
        var service;
        for (var act in option) {
            service = option[act];
            service.act = act;
            services.put(service);
        }
    };

    var response = {
        _listeners:listeners,
        _services:services,
        _root:root,
        _notify:function (yy, msg) {
            if (yy && yy.messageListener && yy.messageListener[msg.act]) {
                yy.messageListener[msg.act](yy, msg);
            }
            var child,
                children = yy.children;
            for (var index in children) {
                child = children[index];
                this._notify(child, msg);
            }
        },
        read:function (message) {
            var res = eval('(' + message + ')');
            var info = this._services.message[res.flag];
            if (!info) {
                var service = this._services.get(res.act);
                if (service) {
                    info = service.message[res.flag];
                } else {
                    info = res.flag;
                }
            }
            res.info = info;
            this._notify(this._root, res);
        }
    };

    //webscoket
    var webSockets = {
        _context:context,
        _logger:logger,
        _webSocketMap:{},
        _session:session,
        _response:response,
        send:function (serverName, message) {
            var that = this;
            var webSocket = that._webSocketMap[serverName];
            if (webSocket && webSocket.readyState === 1) {
                webSocket.send(message);
                that._logger.debug('sendMessage:' + message);
            } else {
                if (webSocket && webSocket.readyState !== 1) {
                    delete that._webSocketMap[serverName];
                    webSocket.close();
                }
                var server = that._context[serverName];
                var Socket = "MozWebSocket" in window ? MozWebSocket : WebSocket;
                webSocket = new Socket(server);
                webSocket._serverName = serverName;
                webSocket._logger = that._logger;
                webSocket._webSocketMap = that._webSocketMap;
                webSocket._response = that._response;
                webSocket._session = that._session;
                webSocket.onopen = function (event) {
                    this._logger.debug('connect:' + server);
                    this._webSocketMap[this._serverName] = this;
                    this.send(message);
                    this._logger.debug('sendMessage:' + message);

                };
                webSocket.onmessage = function (event) {
                    this._logger.debug('onMessage:' + event.data);
                    this._response.read(event.data);
                };
                webSocket.onclose = function (event) {
                    var loginUserId = this._session.get('loginUserId');
                    if(loginUserId) {
                        this.send('{"act":"LOGOUT"}');
                    }
                    delete this._webSocketMap[this._serverName];
                    this._logger.debug('close:' + server);
                };
                webSocket.onerror = function (event) {
                    delete this._webSocketMap[this._serverName];
                    this._logger.debug('error:' + server);
                };
            }
        }
    };

    //--------------parser--start-------------控件解析对象
    var parsers = {
        _utils:utils,
        _index:index,
        _logger:logger,
        _typeMap:{},
        _listeners:listeners,
        _components:components,
        _modelLoader:modelLoader,
        _session:session,
        _context:context,
        _webSockets:webSockets,
        _taskManager:taskManager,
        _logger:logger,
        put:function (type, parser) {
            this._typeMap[type] = parser;
        },
        get:function (type) {
            return this._typeMap[type];
        },
        parse:function (ctx) {
            var parsers = this;
            var parser = parsers.get(ctx.type);
            var childParsers = parser.childParsers;
            if (ctx.type === 'yy_ignore') {
                for (var index = 0; index < childParsers.length; index++) {
                    var type = childParsers[index];
                    var $child = ctx.$this.children('.' + type);
                    $child.each(function () {
                        parsers.parse({
                            loaderId:ctx.loaderId,
                            type:type,
                            $this:$(this),
                            parent:ctx.parent,
                            group:ctx.group,
                            window:ctx.window
                        });
                    });
                }
            } else {
                if (parser) {
                    var key = ctx.$this.attr('id');
                    //注册组件
                    var id = parsers._index.nextIndex();
                    var group = ctx.group;
                    var yy = {
                        loaderId:ctx.loaderId,
                        id:id,
                        type:ctx.type,
                        $this:ctx.$this,
                        parent:ctx.parent,
                        key:key,
                        group:group,
                        window:ctx.window,
                        children:{},
                        extend:{},
                        _components:parsers._components,
                        _modelLoader:modelLoader,
                        _parsers:parsers,
                        _session:parsers._session,
                        _context:parsers._context,
                        _webSockets:parsers._webSockets,
                        _taskManager:parsers._taskManager,
                        _index:parsers._index,
                        _logger:logger
                    };
                    parsers._logger.debug('start parse ' + ctx.type + ' id:' + id + '...');
                    yy.$this.attr('id', id);
                    yy.parent.children[id] = yy;
                    //读取配置参数
                    var config = {};
                    var attrName,
                        attrValue;
                    for (var index = 0; index < parser.config.length; index++) {
                        attrName = parser.config[index];
                        attrValue = parsers._utils.attr(attrName, yy.$this);
                        config[attrName] = attrValue;
                    }
                    //解析前
                    if (parser.before) {
                        parser.before(yy, config);
                    }
                    //解析
                    if (parser.parse) {
                        parser.parse(yy, config);
                    }
                    //解析listener
                    var info,
                        moduleId,
                        listenerName,
                        methodName,
                        listener;
                    var yyEventListener = parsers._utils.attr('yyEventListener', yy.$this);
                    if (yyEventListener) {
                        info = yyEventListener.split('.');
                        moduleId = info[0];
                        listenerName = info[1];
                        listener = parsers._listeners.getEventListener(moduleId, listenerName);
                        if (listener) {
                            for (var eventType in listener) {
                                parsers._listeners.addEventListener({
                                    target:yy,
                                    type:eventType,
                                    handler:listener[eventType]
                                });
                            }
                        }
                    }
                    var yyMessageListener = parsers._utils.attr('yyMessageListener', yy.$this);
                    if (yyMessageListener) {
                        info = yyMessageListener.split('.');
                        moduleId = info[0];
                        listenerName = info[1];
                        listener = parsers._listeners.getMessageListener(moduleId, listenerName);
                        if (listener) {
                            yy.messageListener = listener;
                        }
                    }
                    if (parser.group) {
                        group = yy;
                    }
                    var loaderId = ctx.loaderId;
                    for (var index = 0; index < childParsers.length; index++) {
                        var type = childParsers[index];
                        var $child = ctx.$this.children('.' + type);
                        $child.each(function () {
                            parsers.parse({
                                loaderId:loaderId,
                                type:type,
                                $this:$(this),
                                parent:yy,
                                group:group,
                                window:yy.window
                            });
                        });
                    }
                    //
                    yy.check = function () {
                        if (this._check) {
                            this._check();
                        }
                    };
                    //绑定方法
                    //
                    yy.debug = function (msg) {
                        this._logger.debug(msg);
                    };
                    yy.info = function (msg) {
                        this._logger.info(msg);
                    };
                    yy.warn = function (msg) {
                        this._logger.warn(msg);
                    };
                    yy.error = function (msg) {
                        this._logger.error(msg);
                    };
                    //
                    yy.findInModule = function (key) {
                        return this._components.findByKey(this.loaderId, key);
                    };
                    yy.findInChildren = function (key) {
                        var child;
                        var result;
                        for (var indexId in this.children) {
                            child = this.children[indexId];
                            if (child.key == key) {
                                result = child;
                                break;
                            }
                        }
                        return result;
                    };
                    //timer
                    yy.addTimerTask = function (timer) {
                        if (!timer.times) {
                            timer.times = 2;
                        }
                        var task = {
                            _times:timer.times,
                            _handler:timer,
                            execute:function () {
                                var result = false;
                                if(this._times <= 0) {
                                    result = true;
                                    this._handler.execute();
                                } else {
                                    this._times--;
                                }
                                return result;
                            }
                        };
                        this._taskManager.addTask(task);
                    };
                    //动画
                    yy.flash = function() {
                        this.show();
                        this.$this.addClass('animated flash');
                    };
                    yy.stopFlash = function() {
                        this.$this.removeClass('animated flash');
                    };
                    yy.bounceIn = function() {
                        this.show();
                        this.$this.addClass('animated bounceIn');
                        this.addTimerTask({
                            yy:this,
                            times: 4,
                            execute:function() {
                                this.yy.$this.removeClass('animated bounceIn');
                            }
                        });
                    };
                    yy.bounceOut = function() {
                        this.$this.addClass('animated bounceOut');
                        this.addTimerTask({
                            yy:this,
                            times: 4,
                            execute:function() {
                                this.yy.$this.removeClass('animated bounceOut');
                                this.yy.hide();
                            }
                        });
                    };
                    yy.lightSpeedIn = function() {
                        this.show();
                        this.$this.addClass('animated lightSpeedIn');
                        this.addTimerTask({
                            yy:this,
                            times: 4,
                            execute:function() {
                                this.yy.$this.removeClass('animated lightSpeedIn');
                            }
                        });
                    };
                    yy.lightSpeedOut = function() {
                        this.$this.addClass('animated lightSpeedOut');
                        this.addTimerTask({
                            yy:this,
                            times: 2,
                            execute:function() {
                                this.yy.$this.removeClass('animated lightSpeedOut');
                                this.yy.hide();
                            }
                        });
                    };
                    yy.fadeInLeft = function() {
                        this.show();
                        this.$this.addClass('animated fadeInLeftBig');
                        this.addTimerTask({
                            yy:this,
                            times: 4,
                            execute:function() {
                                this.yy.$this.removeClass('animated fadeInLeftBig');
                            }
                        });
                    };
                    yy.fadeOutLeft = function() {
                        this.$this.addClass('animated fadeOutLeftBig');
                        this.addTimerTask({
                            yy:this,
                            times: 4,
                            execute:function() {
                                this.yy.$this.removeClass('animated fadeOutLeftBig');
                                this.yy.hide();
                            }
                        });
                    };
                    yy.fadeInRight = function() {
                        this.show();
                        this.$this.addClass('animated fadeInRightBig');
                        this.addTimerTask({
                            yy:this,
                            times: 4,
                            execute:function() {
                                this.yy.$this.removeClass('animated fadeInRightBig');
                            }
                        });
                    };
                    yy.fadeOutRight = function() {
                        this.$this.addClass('animated fadeOutRightBig');
                        this.addTimerTask({
                            yy:this,
                            times: 4,
                            execute:function() {
                                this.yy.$this.removeClass('animated fadeOutRightBig');
                                this.yy.hide();
                            }
                        });
                    };
                    yy.submitAnimate = function(action, times) {
                        if(this[action]) {
                            if(!times) {
                                times = 1;
                            }
                            var timer = {
                                times:times,
                                yy:this,
                                action:action,
                                execute:function () {
                                    this.yy[this.action]();
                                }
                            }
                            this.addTimerTask(timer);
                        }
                    };
                    yy.loadModule = function (moduleId, handler) {
                        var that = this;
                        that._modelLoader.load(that.id, moduleId, function (htmlData) {
                            //解析模块组件
                            that.$this.append(htmlData);
                            var $this = $('#' + moduleId);
                            var module = that._parsers.parse({
                                loaderId:that.id,
                                type:'yy_module',
                                $this:$this,
                                parent:that,
                                group:that.group,
                                window:that.window
                            });
                            if (handler) {
                                handler(module);
                            }
                        });
                    };
                    //isVisible
                    yy.isVisible = function () {
                        return this.$this.is(':visible');
                    };
                    yy.show = function () {
                        this.$this.show();
                    };
                    yy.hide = function () {
                        this.$this.hide();
                    };
                    yy.remove = function () {
                        delete this.parent.children[this.id];
                        this.$this.remove();
                    };
                    //label
                    yy.setLabel = function (label) {
                        this.$this.text(label);
                    };
                    yy.getLabel = function() {
                        return this.$this.text();
                    };
                    //session
                    yy.setSession = function (config) {
                        this._session.set(config);
                    };
                    yy.getSession = function (name) {
                        return this._session.get(name);
                    };
                    yy.clearSession = function () {
                        this._session.clear();
                    };
                    //
                    yy.sendMessage = function (message) {
                        var server = message.server;
                        if (server) {
                            delete message.server;
                        } else {
                            server = 'defaultServer';
                        }
                        var msg = '{';
                        for (var name in message) {
                            msg += '"' + name + '":"' + message[name] + '",';
                        }
                        msg = msg.substr(0, msg.length - 1);
                        msg += '}';
                        this._webSockets.send(server, msg);
                    };
                    //
                    yy.openWindow = function (option) {
                        var yyWindow;
                        if (option.key) {
                            yyWindow = this.findInModule(option.key);
                            if (!yyWindow) {
                                //计算偏移
                                var rx = 0;
                                var ry = 0;
                                if (this.extend.rx) {
                                    rx = this.extend.rx;
                                } else {
                                    this.extend.rx = rx;
                                }
                                if (this.extend.ry) {
                                    ry = this.extend.ry;
                                } else {
                                    this.extend.ry = ry;
                                }
                                if (ry > 240) {
                                    ry = 0;
                                }
                                //渲染窗口
                                var html = '<div id="' + option.key + '" class="yy_window ';
                                if (option.class) {
                                    html += ' ' + option.class;
                                }
                                html += '"></div>';
                                this.$this.append(html);
                                var $window = this.$this.children('#' + option.key);
                                yyWindow = this._parsers.parse({
                                    loaderId:this.loaderId,
                                    type:'yy_window',
                                    $this:$window,
                                    parent:this,
                                    group:this.group,
                                    window:this.window
                                });
                                //重新定位
                                if (rx > 0 || ry > 0) {
                                    var top = $window.css('top');
                                    var left = $window.css('left');
                                    var newTop = parseInt(top) + ry;
                                    var newLeft = parseInt(left) + rx;
                                    $window.css({top:newTop, left:newLeft});
                                }
                                rx += 20;
                                ry += 30;
                                this.extend.rx = rx;
                                this.extend.ry = ry;
                            }
                        }
                        var zIndex = this._index.nextZIndex();
                        yyWindow.$this.css({zIndex:zIndex});
                        return yyWindow;
                    };
                    //解析后
                    if (parser.after) {
                        parser.after(yy, config);
                    }
                    this._logger.debug('finish parse ' + ctx.type + ' id:' + id);
                    //触发控件渲染完成事件
                    var yyFinishedListener = parsers._utils.attr('yyFinishedListener', yy.$this);
                    if (yyFinishedListener) {
                        info = yyFinishedListener.split('.');
                        moduleId = info[0];
                        listenerName = info[1];
                        listener = parsers._listeners.getFinishedListener(moduleId, listenerName);
                        listener[listenerName](yy);
                    }
                    return yy;
                } else {
                    this._logger.error('can not find parser:' + ctx.type);
                }
            }
        }
    };
    YY.parsers = parsers;
//给根节点绑定加载模块的方法
    root._modelLoader = modelLoader;
    root._parsers = parsers;
    root._listeners = listeners,
        root.loadModule = function (moduleId, handler) {
            var that = this;
            that._modelLoader.load(that.id, moduleId, function (htmlData) {
                //解析模块组件
                that.$this.append(htmlData);
                var $this = $('#' + moduleId);
                var module = that._parsers.parse({
                    loaderId:that.id,
                    type:'yy_module',
                    $this:$this,
                    parent:that,
                    group:that.group,
                    window:that.window
                });
                if (handler) {
                    handler(module);
                }
            });
        };
    YY.root = root;
    //从根对象加载模块
    $.yyLoadModule = function (moduleId, handler) {
        root.loadModule(moduleId, handler);
    };
//加载js
    $.yyLoadPlugin = function (plugin) {
        plugin.load(YY);
    }
//--------------parser--end-------------

//初始化全局事件
    root.$this.click(function (event) {
        var target = event.target;
        while (target.id === '') {
            target = target.parentElement;
        }
        var targetId = target.id;
        var yy = components.findById(targetId);
        var result;
        while (yy) {
            if (yy && yy.eventListener && yy.eventListener.click) {
                result = yy.eventListener.click(yy, event);
                if (!result) {
                    break;
                }
            }
            yy = yy.parent;
        }
    });
    root.$this.dblclick(function (event) {
        var target = event.target;
        while (target.id === '') {
            target = target.parentElement;
        }
        var targetId = target.id;
        var yy = components.findById(targetId);
        if (yy && yy.eventListener && yy.eventListener.dbclick) {
            yy.eventListener.dbclick(yy, event);
        }
    });
    root.$this.mousedown(function (event) {
        var target = event.target;
        while (target.id === '') {
            target = target.parentElement;
        }
        var targetId = target.id;
        var yy = components.findById(targetId);
        if (yy && yy.eventListener && yy.eventListener.mousedown) {
            yy.eventListener.mousedown(yy, event);
        }
    });
    root.$this.mouseup(function (event) {
        var target = event.target;
        while (target.id === '') {
            target = target.parentElement;
        }
        var targetId = target.id;
        var yy = components.findById(targetId);
        var result;
        while (yy) {
            if (yy && yy.eventListener && yy.eventListener.mouseup) {
                result = yy.eventListener.mouseup(yy, event);
                if (!result) {
                    break;
                }
            }
            yy = yy.parent;
        }
    });
    root.$this.mousemove(function (event) {
        if (root.eventListener && root.eventListener.mousemove) {
            root.eventListener.mousemove(root, event);
        }
    });
    root.$this.mousewheel(function (event, delta, deltaX, deltaY) {
        var target = event.target;
        while (target.id === '') {
            target = target.parentElement;
        }
        var targetId = target.id;
        var yy = components.findById(targetId);
        var result;
        while (yy) {
            if (yy && yy.eventListener && yy.eventListener.mousewheel) {
                result = yy.eventListener.mousewheel(yy, event, delta, deltaX, deltaY);
                if (!result) {
                    break;
                }
            }
            yy = yy.parent;
        }
    });
    root.$this.keyup(function (event) {
        if (!event.ctrlKey) {
            var keyCode = event.keyCode;
            if (keyCode == 13) {
                var target = event.target;
                while (target.id === '') {
                    target = target.parentElement;
                }
                var targetId = target.id;
                var yy = components.findById(targetId);
                if (yy && yy.eventListener && yy.eventListener.enter) {
                    yy.eventListener.enter(yy, event);
                }
            }
            if (keyCode == 229 || (keyCode >= 65 && keyCode <= 90) || (keyCode >= 48 && keyCode <= 57) || keyCode == 8 || (keyCode >= 188 && keyCode <= 192) || (keyCode >= 219 && keyCode <= 222) || keyCode == 32 || keyCode == 46) {
                var target = event.target;
                while (target.id === '') {
                    target = target.parentElement;
                }
                var targetId = target.id;
                var yy = components.findById(targetId);
                if (yy && yy.type === 'yy_form' && yy.eventListener && yy.eventListener.change) {
                    if (yy.isChange()) {
                        yy.eventListener.change(yy, event);
                    }
                }
            }
        }
    });
}(jQuery));