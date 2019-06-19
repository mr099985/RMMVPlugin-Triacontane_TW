//=============================================================================
// MessageWindowHidden.js
// ----------------------------------------------------------------------------
// (C)2015-2018 Triacontane
// Translator : ReIris
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 2.1.0 2018/10/10 戦闘中にプラグインを無効化できる機能を追加。
// 2.0.0 2018/03/31 消去するトリガーを複数指定できる機能を追加。パラメータの指定方法を見直し。
// 1.4.0 2018/03/10 指定したスイッチがONの間はウィンドウ消去を無効化できる機能を追加
// 1.3.2 2017/08/02 ponidog_BackLog_utf8.jsとの競合を解消
// 1.3.1 2017/07/03 古いYEP_MessageCore.jsのネーム表示ウィンドウが再表示できない不具合の修正(by DarkPlasmaさま)
// 1.3.0 2017/03/16 連動して非表示にできるピクチャを複数指定できる機能を追加
// 1.2.1 2017/02/07 端末依存の記述を削除
// 1.2.0 2016/01/02 メッセージウィンドウと連動して指定したピクチャの表示/非表示が自動で切り替わる機能を追加
// 1.1.0 2016/08/25 選択肢の表示中はウィンドウを非表示にできないよう仕様変更
// 1.0.4 2016/07/22 YEP_MessageCore.jsのネーム表示ウィンドウと連携する機能を追加
// 1.0.3 2016/01/24 メッセージウィンドウが表示されていないときも非表示にできてしまう現象の修正
// 1.0.2 2016/01/02 競合対策
// 1.0.1 2015/12/31 コメント追加＋英語対応（仕様に変化なし）
// 1.0.0 2015/12/30 初版
// ----------------------------------------------------------------------------
// [Blog]   : https://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================
/*:
 * @plugindesc 一時關閉訊息框插件
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @param triggerButton
 * @text 按鈕名稱
 * @desc 隱藏訊息窗口的按鈕。（可以複數按鈕） 如果插件添加可以輸入的按鈕，則直接輸入。
 * @default ["light_click"]
 * @type combo[]
 * @option light_click
 * @option shift
 * @option control
 * @option tab
 * @option pageup
 * @option pagedown
 * @option debug
 *
 * @param linkPictureNumbers
 * @text 連動圖片編號
 * @desc 窗口隱藏時連動不透明度為[0]的圖片編號。
 * @default
 * @type number[]
 *
 * @param disableSwitchId
 * @text 無效開關ID
 * @desc 指定開關ID為ON時，這個插件的功能無效。
 * @default 0
 * @type switch
 *
 * @param disableInBattle
 * @text 戰鬥中是否無效
 * @desc 輸入true的話，在戰鬥中此插件功能無效。
 * @default false
 * @type boolean
 *
 * @help 在訊息窗口顯示的時候按下指定按鍵可以隱藏訊息窗口，
 * 再按一次會顯示訊息窗口。
 *
 * 窗口隱藏時會連動不透明度[0]的指定圖片編號。
 * 使用在訊息窗口背景為特定圖片的情況下指定此圖片編號。
 * 再按一下顯示時則為不透明度[255]。
 *
 * ver2.0.0變更了一部分參數指定的方法。
 * 使用以前的參數指定的方法需要再設定。
 *
 * 這個插件沒有任何插件命令。
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */
(function() {
    'use strict';

    /**
     * Create plugin parameter. param[paramName] ex. param.commandPrefix
     * @param pluginName plugin name(EncounterSwitchConditions)
     * @returns {Object} Created parameter
     */
    var createPluginParameter = function(pluginName) {
        var paramReplacer = function(key, value) {
            if (value === 'null') {
                return value;
            }
            if (value[0] === '"' && value[value.length - 1] === '"') {
                return value;
            }
            try {
                return JSON.parse(value);
            } catch (e) {
                return value;
            }
        };
        var parameter     = JSON.parse(JSON.stringify(PluginManager.parameters(pluginName), paramReplacer));
        PluginManager.setParameters(pluginName, parameter);
        return parameter;
    };
    var param = createPluginParameter('MessageWindowHidden');

    //=============================================================================
    // Game_Picture
    //  メッセージウィンドウの表示可否と連動します。
    //=============================================================================
    Game_Picture.prototype.linkWithMessageWindow = function(opacity) {
        this._opacity       = opacity;
        this._targetOpacity = opacity;
    };

    //=============================================================================
    // Window_Message
    //  指定されたボタン押下時にウィンドウとサブウィンドウを非表示にします。
    //=============================================================================
    var _Window_Message_updateWait      = Window_Message.prototype.updateWait;
    Window_Message.prototype.updateWait = function() {
        if (!this.isClosed() && this.isTriggeredHidden() && !$gameMessage.isChoice()) {
            if (!this.isHidden()) {
                this.hideAllWindow();
            } else {
                this.showAllWindow();
            }
        }
        var wait = _Window_Message_updateWait.apply(this, arguments);
        if (this.isHidden() && this.visible) {
            this.hideAllWindow();
        }
        return wait;
    };

    Window_Message.prototype.hideAllWindow = function() {
        this.hide();
        this.subWindows().forEach(function(subWindow) {
            this.hideSubWindow(subWindow);
        }.bind(this));
        if (this.hasNameWindow() && !this.nameWindowIsSubWindow()) this.hideSubWindow(this._nameWindow);
        this.linkPictures(0);
        this._hideByMessageWindowHidden = true;
    };

    Window_Message.prototype.showAllWindow = function() {
        this.show();
        this.subWindows().forEach(function(subWindow) {
            this.showSubWindow(subWindow);
        }.bind(this));
        if (this.hasNameWindow() && !this.nameWindowIsSubWindow()) this.showSubWindow(this._nameWindow);
        this.linkPictures(255);
        this._hideByMessageWindowHidden = false;
    };

    Window_Message.prototype.isHidden = function() {
        return this._hideByMessageWindowHidden;
    };

    Window_Message.prototype.linkPictures = function(opacity) {
        if (!param.linkPictureNumbers) {
            return;
        }
        param.linkPictureNumbers.forEach(function(pictureId) {
            this.linkPicture(opacity, pictureId);
        }, this);
    };

    Window_Message.prototype.linkPicture = function(opacity, pictureId) {
        var picture = $gameScreen.picture(pictureId);
        if (picture) {
            picture.linkWithMessageWindow(opacity);
        }
    };

    Window_Message.prototype.hideSubWindow = function(subWindow) {
        subWindow.prevVisible = subWindow.visible;
        subWindow.hide();
    };

    Window_Message.prototype.showSubWindow = function(subWindow) {
        if (subWindow.prevVisible) subWindow.show();
        subWindow.prevVisible = undefined;
    };

    Window_Message.prototype.hasNameWindow = function() {
        return this._nameWindow && typeof Window_NameBox !== 'undefined';
    };

    // 古いYEP_MessageCore.jsでは、ネーム表示ウィンドウはsubWindowsに含まれる
    Window_Message.prototype.nameWindowIsSubWindow = function() {
        return this.subWindows().filter(function(subWindow) {
            return subWindow === this._nameWindow;
        }, this).length > 0;
    };

    Window_Message.prototype.disableWindowHidden = function () {
        return (param.disableSwitchId > 0 && $gameSwitches.value(param.disableSwitchId)) ||
            (param.disableInBattle && $gameParty.inBattle());
    };

    Window_Message.prototype.isTriggeredHidden = function() {
        if (this.disableWindowHidden()) {
            return false;
        }
        return param.triggerButton.some(function(button) {
            switch (button) {
                case '':
                case '右クリック':
                case 'light_click':
                    return TouchInput.isCancelled();
                case 'ok':
                    return false;
                default:
                    return Input.isTriggered(button);
            }
        });
    };

    var _Window_Message_updateInput      = Window_Message.prototype.updateInput;
    Window_Message.prototype.updateInput = function() {
        if (this.isHidden()) return true;
        return _Window_Message_updateInput.apply(this, arguments);
    };

    //=============================================================================
    // Window_ChoiceList、Window_NumberInput、Window_EventItem
    //  非表示の間は更新を停止します。
    //=============================================================================
    var _Window_ChoiceList_update      = Window_ChoiceList.prototype.update;
    Window_ChoiceList.prototype.update = function() {
        if (!this.visible) return;
        _Window_ChoiceList_update.apply(this, arguments);
    };

    var _Window_NumberInput_update      = Window_NumberInput.prototype.update;
    Window_NumberInput.prototype.update = function() {
        if (!this.visible) return;
        _Window_NumberInput_update.apply(this, arguments);
    };

    var _Window_EventItem_update      = Window_EventItem.prototype.update;
    Window_EventItem.prototype.update = function() {
        if (!this.visible) return;
        _Window_EventItem_update.apply(this, arguments);
    };
})();

