/**
 * module组件
 * User: aladdin
 * Date: 9/12/12
 * Time: 6:19 PM
 */
$.yyLoadPlugin({
    load:function (YY) {
        var parsers = YY.parsers,
            cryptoJS = YY.CryptoJS,
            utils = YY.utils,
            listeners = YY.listeners,
            index = YY.index,
            root = YY.root;
        var totalParser = ['yy_ignore', 'yy_panel', 'yy_button', 'yy_form', 'yy_window', 'yy_tab', 'yy_list', 'yy_canvas', 'yy_scroll'];
        //
        parsers.put('yy_module', {
            group:true,
            config:[],
            childParsers:totalParser
        });
        //
        parsers.put('yy_ignore', {
            group:false,
            config:[],
            childParsers:totalParser
        });
        //
        parsers.put('yy_form', {
            group:true,
            config:[],
            childParsers:['yy_button', 'yy_datepicker', 'yy_datetimepicker'],
            _utils:utils,
            parse:function (yy, config) {
                yy.extend.field = {};
                yy.extend.lastData = {};
                yy._utils = this._utils;
                yy._cryptoJS = cryptoJS;
                yy._parse = function () {
                    var that = this;
                    var $fields = that.$this.children('input,textarea');
                    $fields.each(function () {
                        var $this = $(this);
                        var name = $this.attr('name');
                        if (name) {
                            that.extend.field[name] = $this;
                        }
                    });
                };
                yy._parse();
                yy.getData = function () {
                    var field = this.extend.field,
                        data = {};
                    var yyInputHandler;
                    var $field;
                    var value;
                    for (var name in field) {
                        $field = field[name];
                        value = $field.attr('value');
                        yyInputHandler = $field.attr('yyInputHandler');
                        if (yyInputHandler && yyInputHandler === 'MD5') {
                            value = this._cryptoJS.MD5(value);
                            $field.attr('value', '');
                        }
                        value = this._utils.trim(value);
                        data[name] = value;
                    }
                    return data;
                };
                yy.loadData = function (data) {
                    var field = this.extend.field;
                    var value;
                    for (var name in field) {
                        value = data[name];
                        if (value || value === '') {
                            field[name].attr('value', value);
                        }
                    }
                };
                yy.clear = function () {
                    var field = this.extend.field;
                    for (var name in field) {
                        field[name].attr('value', '');
                    }
                };
                yy.isChange = function () {
                    var result = false;
                    var newData = this.getData();
                    var lastData = this.extend.lastData;
                    for (var fieldName in newData) {
                        if (lastData[fieldName]) {
                            if (lastData[fieldName] != newData[fieldName]) {
                                result = true;
                                break;
                            }
                        } else {
                            result = true;
                            break;
                        }
                    }
                    if (result) {
                        this.extend.lastData = newData;
                    }
                    return result;
                };
                yy.addInput = function (label, name) {
                    var html = '<div class="yy_form_label">' + label + '</div>'
                        + '<input class="yy_form_input" type="text" name="' + name + '"/>';
                    this.$this.append(html);
                    this._parse();
                };
                yy.addTextarea = function (label, name) {
                    var html = '<div class="yy_form_label">' + label + '</div>'
                        + '<textarea class="yy_form_textarea" name="' + name + '"></textarea>';
                    this.$this.append(html);
                    this._parse();
                };
            }
        });
        //
        parsers.put('yy_button', {
            group:false,
            config:[],
            childParsers:[]
        });
        //
        parsers.put('yy_datepicker', {
            group:false,
            config:[],
            childParsers:[],
            parse:function (yy, config) {
                yy.$this.datepicker();
            }
        });
        //
        parsers.put('yy_datetimepicker', {
            group:false,
            config:[],
            childParsers:[],
            parse:function (yy, config) {
                yy.$this.datepicker();
            }
        });
        //
        parsers.put('yy_tab_item', {
            _listeners:listeners,
            group:false,
            config:[],
            childParsers:totalParser,
            parse:function (yy, config) {
                var tab = yy.group;
                tab.extend.tabItems[yy.id] = yy;
                this._listeners.addEventListener({
                    target:yy,
                    type:'click',
                    handler:function (yy, event) {
                        var ifStop = true;
                        //如果选中的tap没有变化，中断该控件其他click事件监听
                        var group = yy.group;
                        if (group.extend.selectedId != yy.id) {
                            yy.group.unSelectedAll();
                            yy.$this.addClass('yy_selected');
                            yy.group.extend.selectedId = yy.id;
                            ifStop = false;
                        }
                        return ifStop;
                    }
                });
            }
        });
        parsers.put('yy_tab', {
            group:true,
            config:[],
            childParsers:['yy_tab_item'],
            parse:function (yy, config) {
                yy.extend.tabItems = {};
                yy.extend.selectedId = -1;
                yy.unSelectedAll = function () {
                    var tabItems = this.extend.tabItems;
                    var tabItem;
                    for (var tabIndex in tabItems) {
                        tabItem = tabItems[tabIndex];
                        tabItem.$this.removeClass('yy_selected');
                    }
                };
            }
        });
        //
        parsers.put('yy_scroll', {
            group:false,
            config:[],
            childParsers:[],
            parse:function (yy, config) {
                yy.extend.scroll = false;
                yy.parent.extend.scroll = yy;
                yy.initScroll = function (clientHeight, scrollHeight) {
                    var $this = this.$this;
                    if (clientHeight < scrollHeight) {
                        this.extend.scroll = true;
                        this.extend.scrollHeight = scrollHeight;
                        var sHeight = parseInt(clientHeight * clientHeight / scrollHeight);
                        this.extend.seed = (scrollHeight - clientHeight) / (scrollHeight - sHeight);
                        this.extend.sHeight = sHeight;
                            $this.css({height:sHeight});
                    }
                };
                yy.scrollTop = function (top) {
                    if (this.extend.scroll) {
                        var $this = this.$this;
                        var seed = this.extend.seed;
                        var scrollHeight = this.extend.scrollHeight;
                        var sHeight = this.extend.sHeight;
                        var newTop = parseInt(top / seed);
                        if (newTop + sHeight > scrollHeight) {
                            newTop = scrollHeight - sHeight;
                        }
                        $this.css({top:newTop});
                    }
                };
            }
        });
        //
        parsers.put('yy_panel', {
            group:false,
            config:['yyScroll'],
            childParsers:totalParser,
            _listeners:listeners,
            parse:function (yy, config) {
                if (config.yyScroll && config.yyScroll == 'true') {
                    var html = '<div class="yy_scroll"></div>';
                    yy.$this.append(html);
                    yy.extend.scroll = {};
                    yy.initScroll = function () {
                        var $this = this.$this;
                        var scrollHeight = $this[0].scrollHeight;
                        var clientHeight = $this[0].clientHeight + 3;
                        if (clientHeight < scrollHeight) {
                            this.extend.hasScroll = true;
                            this.extend.scroll.initScroll(clientHeight, scrollHeight);
                        }
                    };
                    this._listeners.addEventListener({
                        target:yy,
                        type:'mousewheel',
                        handler:function (yy, event, delta, deltaX, deltaY) {
                            if (yy.extend.hasScroll = true) {
                                var speed = 50;
                                var scroll = yy.extend.scroll;
                                var $this = yy.$this;
                                var scrollHeight = $this[0].scrollHeight;
                                var clientHeight = $this[0].clientHeight;
                                var top = $this.scrollTop();
                                if (delta > 0) {
                                    speed = -speed;
                                }
                                var newTop = top + speed;
                                if (newTop > scrollHeight - clientHeight) {
                                    newTop = scrollHeight - clientHeight;
                                }
                                if (newTop < 0) {
                                    newTop = 0;
                                }
                                scroll.scrollTop(newTop);
                                $this.scrollTop(newTop);
                            }
                        }
                    });
                } else {
                    yy.initScroll = function () {
                    };
                }
            }
        });
        //
        parsers.put('yy_list_item', {
            group:true,
            config:[],
            childParsers:totalParser,
            parse:function (yy, config) {
                yy.getData = function () {
                    var data = this.group.extend.data;
                    return data[this.key];
                };
                yy.selected = function () {
                    this.parent.unSelectedAll();
                    this.$this.addClass('yy_selected');
                }
            }
        });
        parsers.put('yy_list', {
            group:true,
            config:['yyScroll'],
            childParsers:['yy_scroll', 'yy_list_item'],
            _parsers:parsers,
            _listeners:listeners,
            parse:function (yy, config) {
                if (config.yyScroll && config.yyScroll == 'true') {
                    var html = '<div class="yy_scroll"></div>';
                    yy.$this.append(html);
                    yy.extend.scroll = {};
                    yy.extend.pageIndex = 1;
                    yy.extend.pageSize = 15;
                    yy.extend.pageNum = 0;
                    yy.extend.pageTotal = 0;
                    yy._initScroll = function () {
                        var $this = this.$this;
                        var scrollHeight = $this[0].scrollHeight;
                        var clientHeight = $this[0].clientHeight + 3;
                        if (clientHeight < scrollHeight) {
                            this.extend.hasScroll = true;
                            this.extend.scroll.initScroll(clientHeight, scrollHeight);
                        } else {
                            this.extend.hasScroll = false;
                            this.extend.scroll.$this.css({height:0});
                        }
                    };
                    yy._scrollBottom = function () {
                        if (yy.extend.hasScroll = true) {
                            var scroll = yy.extend.scroll;
                            var $this = yy.$this;
                            var scrollHeight = $this[0].scrollHeight;
                            var clientHeight = $this[0].clientHeight;
                            var newTop = scrollHeight - clientHeight;
                            scroll.scrollTop(newTop);
                            $this.scrollTop(newTop);
                        }
                    };
                    yy._scrollTop = function () {
                        if (yy.extend.hasScroll = true) {
                            var scroll = yy.extend.scroll;
                            var $this = yy.$this;
                            scroll.scrollTop(0);
                            $this.scrollTop(0);
                        }
                    };
                    this._listeners.addEventListener({
                        target:yy,
                        type:'mousewheel',
                        handler:function (yy, event, delta, deltaX, deltaY) {
                            if (yy.extend.hasScroll = true) {
                                var scroll = yy.extend.scroll;
                                var $this = yy.$this;
                                var scrollHeight = $this[0].scrollHeight;
                                var clientHeight = $this[0].clientHeight;
                                var top = $this.scrollTop();
                                var speed = 50;
                                if (delta > 0) {
                                    speed = -speed;
                                }
                                var newTop = top + speed;
                                //触发滚动事件
                                if (newTop >= scrollHeight - clientHeight) {
                                    if (yy.eventListener && yy.eventListener.scrollBottom) {
                                        yy.eventListener.scrollBottom(yy);
                                    }
                                }
                                if (newTop > scrollHeight - clientHeight) {
                                    newTop = scrollHeight - clientHeight;
                                }
                                if (newTop < 0) {
                                    newTop = 0;
                                }
                                scroll.scrollTop(newTop);
                                $this.scrollTop(newTop);
                            }
                        }
                    });
                } else {
                    yy._initScroll = function () {
                    };
                    yy._scrollBottom = function () {
                    };
                }
                yy._parsers = this._parsers;
                yy.extend.data = {};
                yy._check = function () {
                    if (!this.extend.key) {
                        throw 'Un init list data key!id:' + this.id;
                    }
                    if (!this._dataToHtml) {
                        throw 'Un init list method dataToHtml!id:' + this.id;
                    }
                };
                yy.getPageIndex = function () {
                    return this.extend.pageIndex;
                };
                yy.setPageIndex = function (pageIndex) {
                    this.extend.pageIndex = pageIndex;
                };
                yy.getPageSize = function () {
                    return this.extend.pageSize;
                };
                yy.setPageSize = function (pageSize) {
                    this.extend.pageSize = pageSize;
                };
                yy.getPageNum = function () {
                    return this.extend.pageNum;
                };
                yy.setPageNum = function (pageNum) {
                    this.extend.pageNum = pageNum;
                };
                yy.getPageTotal = function () {
                    return this.extend.pageTotal;
                };
                yy.setPageTotal = function (pageTotal) {
                    this.extend.pageTotal = pageTotal;
                };
                yy.init = function (config) {
                    this._dataToHtml = config.dataToHtml;
                    this.extend.key = config.key;
                    this.extend.itemEventListener = config.itemEventListener;
                };
                yy.clear = function () {
                    var child;
                    for (var id in this.children) {
                        child = this.children[id];
                        if (child.type == 'yy_list_item') {
                            child.remove();
                        }
                    }
                    this._initScroll();
                };
                yy.getItemData = function (keyValue) {
                    return this.extend.data[keyValue];
                };
                yy.loadData = function (data) {
                    this.check();
                    var that = this;
                    var key = that.extend.key;
                    var itemEventListener = that.extend.itemEventListener;
                    var html = '';
                    var itemData;
                    var id;
                    var localData = that.extend.data;
                    for (var dataIndex = 0; dataIndex < data.length; dataIndex++) {
                        itemData = data[dataIndex];
                        id = itemData[key];
                        if (!id) {
                            throw 'list loadData error! can not find value by key:' + key;
                        }
                        localData[id] = itemData;
                        html += '<div id="' + id + '" class="yy_list_item"';
                        if (itemEventListener) {
                            html += ' yyEventListener="' + itemEventListener + '"';
                        }
                        html += '>';
                        html += that._dataToHtml(itemData);
                        html += '</div>';
                    }
                    that.$this.append(html);
                    //
                    var $child = that.$this.children('.yy_list_item');
                    $child.each(function () {
                        //判断子节点是否已经解析过，如果解析过就不在解析
                        var $this = $(this);
                        var id = $this.attr('id');
                        if (!that.children[id]) {
                            that._parsers.parse({
                                loaderId:that.loaderId,
                                type:'yy_list_item',
                                $this:$this,
                                parent:that,
                                group:that,
                                window:that.window
                            });
                        }
                    });
                    that._initScroll();
                };
                yy.addItemDataFirst = function (itemData) {
                    var item;
                    this.check();
                    var that = this;
                    var key = that.extend.key;
                    var html = '';
                    var localData = that.extend.data;
                    var id = itemData[key];
                    if (!id) {
                        throw 'list addItemDataToTop error! can not find value by key:' + key;
                    }
                    if (localData[id]) {
                        item = this.findInChildren(id);
                    } else {
                        var itemEventListener = that.extend.itemEventListener;
                        localData[id] = itemData;
                        html += '<div id="' + id + '" class="yy_list_item"';
                        if (itemEventListener) {
                            html += ' yyEventListener="' + itemEventListener + '"';
                        }
                        html += '>';
                        html += that._dataToHtml(itemData);
                        html += '</div>';

                        that.$this.children(':first-child').before(html);
                        //
                        item = that._parsers.parse({
                            loaderId:that.loaderId,
                            type:'yy_list_item',
                            $this:$('#' + id),
                            parent:that,
                            group:that,
                            window:that.window
                        });
                    }
                    that._initScroll();
                    that._scrollTop();
                    return item;
                };
                yy.addItemData = function (itemData) {
                    var item;
                    this.check();
                    var that = this;
                    var key = that.extend.key;
                    var html = '';
                    var localData = that.extend.data;
                    var id = itemData[key];
                    if (!id) {
                        throw 'list addItemData error! can not find value by key:' + key;
                    }
                    if (localData[id]) {
                        item = this.findInChildren(id);
                    } else {
                        var itemEventListener = that.extend.itemEventListener;
                        localData[id] = itemData;
                        html += '<div id="' + id + '" class="yy_list_item"';
                        if (itemEventListener) {
                            html += ' yyEventListener="' + itemEventListener + '"';
                        }
                        html += '>';
                        html += that._dataToHtml(itemData);
                        html += '</div>';
                        that.$this.append(html);
                        //
                        item = that._parsers.parse({
                            loaderId:that.loaderId,
                            type:'yy_list_item',
                            $this:$('#' + id),
                            parent:that,
                            group:that,
                            window:that.window
                        });
                    }
                    that._initScroll();
                    that._scrollBottom();
                    return item;
                };
                yy.getItem = function (keyValue) {
                    var child;
                    var result;
                    for (var id in this.children) {
                        child = this.children[id];
                        if (child.key == keyValue) {
                            result = child;
                            break;
                        }
                    }
                    return result;
                };
                yy.hideAllItem = function () {
                    var child;
                    for (var id in this.children) {
                        child = this.children[id];
                        child.hide();
                    }
                    this._initScroll();
                };
                yy.hideItem = function (keyValue) {
                    var child;
                    for (var id in this.children) {
                        child = this.children[id];
                        if (child.key == keyValue) {
                            child.hide();
                        }
                    }
                    this._initScroll();
                };
                yy.showAllItem = function () {
                    var child;
                    for (var id in this.children) {
                        child = this.children[id];
                        child.show();
                    }
                    this._initScroll();
                };
                yy.showItem = function (keyValue) {
                    var child;
                    for (var id in this.children) {
                        child = this.children[id];
                        if (child.key == keyValue) {
                            child.show();
                        }
                    }
                    this._initScroll();
                };
                yy.removeItem = function (keyValue) {
                    var child;
                    for (var id in this.children) {
                        child = this.children[id];
                        if (child.key == keyValue) {
                            child.remove();
                        }
                    }
                    delete this.extend.data[keyValue];
                    this._initScroll();
                };
                yy.size = function () {
                    var num = 0;
                    for (var id in this.extend.data) {
                        num++;
                    }
                    return num;
                };
                yy.unSelectedAll = function () {
                    for (var id in this.children) {
                        this.children[id].$this.removeClass('yy_selected');
                    }
                }
            }
        });
        //
        parsers.put('yy_window_close', {
            _listeners:listeners,
            group:false,
            config:[],
            childParsers:[],
            parse:function (yy, config) {
                this._listeners.addEventListener({
                    target:yy,
                    type:'click',
                    handler:function (yy, event) {
                        yy.group.bounceOut();
                    }
                });
            }
        });
        parsers.put('yy_window_header', {
            group:false,
            config:[],
            childParsers:[],
            _listeners:listeners,
            parse:function (yy, config) {
                yy.group.extend.header = yy;
                this._listeners.addEventListener({
                    target:yy,
                    type:'mousedown',
                    handler:function (yy, event) {
                        yy.group.move(event);
                    }
                });
            }
        });
        parsers.put('yy_window', {
            _listeners:listeners,
            _index:index,
            _root:root,
            group:true,
            config:[],
            childParsers:['yy_window_header', 'yy_window_close'],
            _html:'<div class="yy_window_header"></div><div class="yy_window_close"></div>',
            parse:function (yy, config) {
                yy.window = yy;
                yy._listeners = this._listeners;
                yy._root = this._root;
                yy._index = this._index;
                yy.extend.header = {};
                yy.extend.context = {};
                yy.$this.append(this._html);
                yy.setHeaderLabel = function (label) {
                    this.extend.header.setLabel(label);
                };
                yy.setContext = function (context) {
                    for (var cId in context) {
                        this.extend.context[cId] = context[cId];
                    }
                };
                yy.getContext = function (cId) {
                    return this.extend.context[cId];
                };
                yy.move = function (event) {
                    var top = this.$this.css('top');
                    var left = this.$this.css('left');
                    this.extend.relativeX = parseInt(left) - event.pageX;
                    this.extend.relativeY = parseInt(top) - event.pageY;
                    this._root.extend.moveWindow = this;
                    this.$this.addClass('yy_move');
                    this.$this.addClass('animated small_wiggle');
                    var zIndex = this._index.nextZIndex();
                    this.$this.css({zIndex:zIndex});
                    this._listeners.addEventListener({
                        target:this._root,
                        type:'mouseup',
                        handler:function (yy, event) {
                            yy.extend.moveWindow.$this.removeClass('yy_move');
                            yy.extend.moveWindow.$this.removeClass('animated small_wiggle');
                            yy.extend.moveWindow = undefined;
                            yy._listeners.removeEventListener({
                                target:yy,
                                type:'mouseup'
                            });
                            yy._listeners.removeEventListener({
                                target:yy,
                                type:'mousemove'
                            });
                        }
                    });
                    this._listeners.addEventListener({
                        target:this._root,
                        type:'mousemove',
                        handler:function (yy, event) {
                            if (yy.extend.moveWindow) {
                                var moveWindow = yy.extend.moveWindow;
                                var newTop = event.pageY + moveWindow.extend.relativeY;
                                var newLeft = event.pageX + moveWindow.extend.relativeX;
                                moveWindow.$this.css({top:newTop, left:newLeft});
                            } else {
                                yy._listeners.removeEventListener({
                                    target:yy,
                                    type:'mousemove'
                                });
                            }
                        }
                    });
                };
                this._listeners.addEventListener({
                    target:yy,
                    type:'click',
                    handler:function (yy, event) {
                        var zIndex = yy._index.nextZIndex();
                        yy.$this.css({zIndex:zIndex});
                    }
                });
            }
        });
        parsers.put('yy_canvas', {
            group:true,
            config:[],
            childParsers:[],
            _root:root,
            _listeners:listeners,
            parse:function (yy, config) {
                yy._root = this._root;
                yy._listeners = this._listeners;
                yy.draw = function (x, y) {
                    var ctx = this.$this[0].getContext("2d");
                    ctx.fillStyle = "rgb(200,0,0)";
                    ctx.fillRect(x, y, 1, 1);
                }
                yy.start = function () {
                    this._root.extend.moveCanvas = this;
                    this._listeners.addEventListener({
                        target:this._root,
                        type:'mouseup',
                        handler:function (yy, event) {
                            yy.extend.moveCanvas = undefined;
                            yy._listeners.removeEventListener({
                                target:yy,
                                type:'mouseup'
                            });
                            yy._listeners.removeEventListener({
                                target:yy,
                                type:'mousemove'
                            });
                        }
                    });
                    this._listeners.addEventListener({
                        target:this._root,
                        type:'mousemove',
                        handler:function (yy, event) {
                            if (yy.extend.moveCanvas) {
                                var moveCanvas = yy.extend.moveCanvas;
                                var offset = moveCanvas.$this.offset();
                                var y = event.pageY - offset.top;
                                var x = event.pageX - offset.left;
                                var width = moveCanvas.$this.attr('width');
                                var height = moveCanvas.$this.attr('height');
                                width = parseInt(width);
                                height = parseInt(height);
                                x = parseInt(x);
                                y = parseInt(y);
                                if (x >= 0 && y >= 0 && x <= offset.left + width && y <= offset.top + height) {
                                    moveCanvas.draw(x, y);
                                    moveCanvas.sendMessage({
                                        act:'SEND_CANVAS_COMMAND',
                                        receiveId:moveCanvas.extend.friendId,
                                        x:x,
                                        y:y
                                    });
                                }
                            } else {
                                yy._listeners.removeEventListener({
                                    target:yy,
                                    type:'mousemove'
                                });
                            }
                        }
                    });
                };
                this._listeners.addEventListener({
                    target:yy,
                    type:'mousedown',
                    handler:function (yy, event) {
                        yy.start();
                    }
                });
            }
        });
    }
});