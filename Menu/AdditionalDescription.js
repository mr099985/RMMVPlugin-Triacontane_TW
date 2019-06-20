//=============================================================================
// AdditionalDescription.js
// ----------------------------------------------------------------------------
// Copyright (c) 2015 Triacontane
// Translator : ReIris
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.1.4 2017/01/12 メモ欄の値が空で設定された場合にエラーが発生するかもしれない問題を修正
// 1.1.3 2016/09/20 説明文の文字に「>」「<」を表示できるようエスケープ処理を追加
// 1.1.2 2016/09/07 同じ説明文のアイテムが連続していたときに切り替えメッセージが表示されない問題を修正
// 1.1.1 2016/09/06 親のウィンドウがアクティブなときのみ操作できるよう修正
// 1.1.0 2016/09/01 マウス操作、タッチ操作でも切り替えられる機能を追加
//                  切り替え中にキャンセルしたときに描画内容が一部残ってしまう不具合を修正
// 1.0.0 2016/09/01 初版
// ----------------------------------------------------------------------------
// [Blog]   : http://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc 幫助說明追加插件
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @param ButtonName
 * @text 按鈕名稱
 * @desc 切換幫助窗口的按鍵名稱。
 * (shift / control / tab)
 * @default shift
 *
 * @param KeyCode
 * @text 按鍵代碼
 * @desc 如果想使用按鈕名稱以外的按鈕，直接在此處寫下KeyCode。
 * @default 0
 *
 * @param ChangePage
 * @text 切換頁面提示
 * @desc 在窗口右下顯示頁面切換的提示文字。可以使用控制字元。
 * @default Push Shift
 *
 * @param ValidTouch
 * @text 可否點擊
 * @desc 是否透過觸碰點擊幫助窗口或左鍵點擊窗口來切換窗口。
 * @default ON
 *
 * @help 可以在幫助窗口中追加第二頁並輸入想要的情報。
 * 使用指定的按鍵切換窗口。
 *
 * 在資料庫中的物品、技能的注釋欄中輸入以下內容。
 * <ADDescription:sampleText>  # 顯示文字「sampleText」
 * <ADScript:sampleScript>     # 顯示「sampleScript」的評價結果
 *
 * 可以為兩者使用控制字元。
 * 此外，在腳本中，可以使用局部變量「item」引用目標資料。
 * 可以動態顯示消耗 MP 和價格等資料。
 *
 * 如果您想在訊息和腳本中使用不等式，描述內容如下。
 * < → &lt;
 * > → &gt;
 *
 * 這個插件沒有插件命令。
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */

(function() {
    'use strict';
    var pluginName    = 'AdditionalDescription';
    var metaTagPrefix = 'AD';

    var getParamOther = function(paramNames) {
        if (!Array.isArray(paramNames)) paramNames = [paramNames];
        for (var i = 0; i < paramNames.length; i++) {
            var name = PluginManager.parameters(pluginName)[paramNames[i]];
            if (name) return name;
        }
        return null;
    };

    var getParamString = function(paramNames) {
        var value = getParamOther(paramNames);
        return value === null ? '' : value;
    };

    var getParamNumber = function(paramNames, min, max) {
        var value = getParamOther(paramNames);
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(value, 10) || 0).clamp(min, max);
    };

    var getParamBoolean = function(paramNames) {
        var value = getParamOther(paramNames);
        return (value || '').toUpperCase() === 'ON';
    };

    var getArgString = function(arg, upperFlg) {
        arg = convertEscapeCharacters(arg);
        return upperFlg ? arg.toUpperCase() : arg;
    };

    var getMetaValue = function(object, name) {
        var metaTagName = metaTagPrefix + (name ? name : '');
        return object.meta.hasOwnProperty(metaTagName) ? object.meta[metaTagName] : undefined;
    };

    var getMetaValues = function(object, names) {
        if (!Array.isArray(names)) return getMetaValue(object, names);
        for (var i = 0, n = names.length; i < n; i++) {
            var value = getMetaValue(object, names[i]);
            if (value !== undefined) return value;
        }
        return undefined;
    };

    var convertEscapeCharacters = function(text) {
        if (text == null || text === true) text = '';
        text = text.replace(/&gt;?/gi, '>');
        text = text.replace(/&lt;?/gi, '<');
        var windowLayer = SceneManager._scene._windowLayer;
        return windowLayer ? windowLayer.children[0].convertEscapeCharacters(text) : text;
    };

    //=============================================================================
    // パラメータの取得と整形
    //=============================================================================
    var paramButtonName = getParamString(['ButtonName', 'ボタン名']);
    var paramKeyCode    = getParamNumber(['KeyCode', 'キーコード']);
    if (paramKeyCode) Input.keyMapper[paramKeyCode] = pluginName;
    var paramChangePage = getParamString(['ChangePage', 'ページ切り替え']);
    var paramValidTouch = getParamBoolean(['ValidTouch', 'タッチ操作有効']);

    //=============================================================================
    // Window_Selectable
    //  自分自身への参照をヘルプウィンドウに渡します。
    //=============================================================================
    var _Window_Selectable_setHelpWindow = Window_Selectable.prototype.setHelpWindow;
    Window_Selectable.prototype.setHelpWindow = function(helpWindow) {
        _Window_Selectable_setHelpWindow.apply(this, arguments);
        this._helpWindow.setParentWindow(this);
    };

    //=============================================================================
    // Window_Help
    //  追加ヘルプ情報の保持と表示
    //=============================================================================
    var _Window_Help_initialize = Window_Help.prototype.initialize;
    Window_Help.prototype.initialize = function(numLines) {
        _Window_Help_initialize.apply(this, arguments);
        this._parentWindows = [];
    };

    var _Window_Help_setItem      = Window_Help.prototype.setItem;
    Window_Help.prototype.setItem = function(item) {
        this._anotherText = null;
        this._item        = item;
        this._itemExist   = true;
        if (item) this.setAnother();
        _Window_Help_setItem.apply(this, arguments);
        this._originalText       = this._text;
        this._anotherTextVisible = false;
        this._item               = null;
        this._itemExist          = false;
    };

    var _Window_Help_setText = Window_Help.prototype.setText;
    Window_Help.prototype.setText = function(text) {
        if (this._text === text) {
            this.refresh();
        }
        _Window_Help_setText.apply(this, arguments);
    };

    Window_Help.prototype.setParentWindow = function(parentWindow) {
        if (!this._parentWindows.contains(parentWindow)) {
            this._parentWindows.push(parentWindow);
        }
    };

    Window_Help.prototype.setAnother = function() {
        this.setAnotherDescription();
        if (this._anotherText === null) this.setAnotherScript();
    };

    Window_Help.prototype.setAnotherScript = function() {
        var item  = this._item;
        var value = getMetaValues(item, ['スクリプト', 'Script']);
        if (value) {
            try {
                this._anotherText = String(eval(getArgString(value)));
            } catch (e) {
                console.error(e.stack);
            }
        }
    };

    Window_Help.prototype.setAnotherDescription = function() {
        var item  = this._item;
        var value = getMetaValues(item, ['説明', 'Description']);
        if (value) {
            this._anotherText = getArgString(value);
        }
    };

    var _Window_Help_refresh      = Window_Help.prototype.refresh;
    Window_Help.prototype.refresh = function() {
        _Window_Help_refresh.apply(this, arguments);
        this.refreshChangePage();
    };

    Window_Help.prototype.refreshChangePage = function() {
        if (paramChangePage && this._anotherText && this._itemExist) {
            var width = this.drawTextEx(paramChangePage, 0, this.contents.height);
            this.drawTextEx(paramChangePage, this.contentsWidth() - width, this.contentsHeight() - this.lineHeight());
        } else {
            this._anotherText  = null;
            this._originalText = null;
        }
    };

    var _Window_Help_update      = Window_Help.prototype.update;
    Window_Help.prototype.update = function() {
        if (this.hasOwnProperty('update')) {
            _Window_Help_update.apply(this, arguments);
        } else {
            Window_Base.prototype.update.call(this);
        }
        if (this.isOpen() && this.visible) {
            this.updateAnotherDesc();
        }
    };

    Window_Help.prototype.updateAnotherDesc = function() {
        if (this._anotherText && this.isAnotherTriggered() && this.isAnyParentActive()) {
            SoundManager.playCursor();
            this._anotherTextVisible = !this._anotherTextVisible;
            this._itemExist = true;
            this.setText(this._anotherTextVisible ? this._anotherText : this._originalText);
            this._itemExist = false;
        }
    };

    Window_Help.prototype.isAnotherTriggered = function() {
        return Input.isTriggered(this.getToggleDescButtonName()) ||
            (this.isTouchedInsideFrame() && TouchInput.isTriggered() && paramValidTouch);
    };

    Window_Help.prototype.isAnyParentActive = function() {
        return this._parentWindows.some(function(win) {
            return win.active;
        });
    };

    Window_Help.prototype.getToggleDescButtonName = function() {
        return paramKeyCode ? pluginName : paramButtonName;
    };

    Window_Help.prototype.isTouchedInsideFrame = Window_Selectable.prototype.isTouchedInsideFrame;
})();

