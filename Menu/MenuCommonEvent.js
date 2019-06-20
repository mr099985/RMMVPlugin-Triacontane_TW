//=============================================================================
// MenuCommonEvent.js
// ----------------------------------------------------------------------------
// (C)2017 Triacontane
// Translator : ReIris
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.3.2 2019/01/23 1.3.1の修正でGUI画面デザインプラグインと共存できなくなっていた問題を修正
// 1.3.1 2019/01/18 他のプラグインと連携しやすいように一部の実装を変更
// 1.3.0 2018/09/23 対象イベントの並列実行を停止するコマンドを追加
// 1.2.0 2017/12/24 公式ガチャプラグインと連携できるよう修正
// 1.1.3 2017/12/02 NobleMushroom.jsとの競合を解消
// 1.1.2 2017/11/18 コモンイベントを一切指定しない状態でメニューを開くとエラーになる現象を修正
// 1.1.1 2017/11/05 ヘルプとダウンロード先を追記
// 1.1.0 2017/11/05 タイマー有効化機能などいくつかの機能を追加
// 1.0.0 2017/11/04 初版
// ----------------------------------------------------------------------------
// [Blog]   : https://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc 選單公共事件插件
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @param CommonEventInfo
 * @text 公共事件情報
 * @desc 每個畫面執行公共事件的情報。
 * @default
 * @type struct<CommonEventInfo>[]
 *
 * @param MaxMenuPicture
 * @text 選單顯示圖片最大數
 * @desc 選單畫面顯示的圖片最大數量。
 * @default 10
 * @type number
 * @min 1
 * @max 100
 *
 * @param SaveInterpreterIndex
 * @text 記住執行位置
 * @desc 記住事件的執行位置。
 * 從另一個畫面返回時，從記住的位置恢復。
 * @default false
 * @type boolean
 *
 * @param ActivateTimer
 * @text 有效計時器
 * @desc 即使在選單畫面上也顯示計時器，然後運行計時器。
 * @default false
 * @type boolean
 *
 * @param CommandPrefix
 * @text 命令前綴
 * @desc 在命名其他插件備註字段或插件命令時指定的前綴。通常不需要指定它。
 * @default
 *
 * @help MenuCommonEvent.js
 *
 * 可以在選單畫面上或通過插件添加的畫面（*1）上並行執行公共事件。
 * 每個事件命令（*2）都可以執行訊息，圖片和變數操作。
 * 可以為每個畫面執行一個公共事件。
 *
 * ※1 如果是選單系統畫面，可以使用它。
 * 已確認與聲音測試插件和用語辭典插件的聯合使用。
 *
 * ※2 某些針對移動路線設置等命令不起作用。
 * 此外，插件添加的腳本和命令可能無法正常工作。
 *
 * 插件命令詳細
 * 事件命令中的「插件命令」執行。
 *  （參數中間使用半形空格區分）
 *
 * DISABLE_WINDOW_CONTROL  # 禁止在選單畫面上進行窗口操作。
 * ENABLE_WINDOW_CONTROL   # 允許在選單畫面上進行窗口操作。
 *
 * 如果插件注釋名稱與其他插件重疊，
 * 請在參數的「命令前綴」中設置一個值。
 *
 * 腳本詳細
 *  事件命令中的「腳本」「操作變數」執行。
 *
 * // 取得窗口對象
 * this.getSceneWindow(windowName);
 * 返回具有指定名稱的窗口對象。
 * 可以取得和設置屬性。高級用戶的功能。
 * 主要畫面的窗口名稱如下。
 *
 * ・主選單
 * commandWindow   命令窗口
 * statusWindow    狀態窗口
 * goldWindow      金錢窗口
 *
 * ・道具畫面
 * categoryWindow  分類窗口
 * itemWindow      物品窗口
 * actorWindow     角色選擇窗口
 *
 * ・技能畫面
 * skillTypeWindow 技能類型窗口
 * statusWindow    狀態窗口
 * itemWindow      技能窗口
 * actorWindow     角色選擇窗口
 *
 * ・裝備畫面
 * helpWindow      幫助窗口
 * commandWindow   命令窗口
 * slotWindow      裝備槽窗口
 * statusWindow    狀態窗口
 * itemWindow      裝備道具窗口
 *
 * ・狀態畫面
 * statusWindow    狀態窗口
 *
 * //窗口啟用判定
 * this.isWindowActive(windowName);
 * 如果具有指定名稱的窗口處於啟用狀態，則返回true。
 * 窗口格式範例與上面相同。
 *
 * //窗口索引取得
 * this.getSceneWindowIndex();
 * 獲取當前啟用窗口的索引。開頭是 0 。
 *
 * //取得選擇中的角色對象
 * $gameParty.menuActor();
 * 取得當前在裝備畫面或狀態畫面上選擇的角色訊息。
 * 高級用戶的腳本功能。(※1)
 *
 * //取得選擇中的角色ID
 * $gameParty.menuActor().actorId();
 * 取得當前在裝備畫面或狀態畫面上選擇的演員ID。
 *
 * ※1 是個現有的核心腳本，但因為很有用就記載了。
 *
 * // 用語辭典的顯示內容更新
 * this.refreshGlossary();
 * 更新用語辭典插件中的術語顯示。
 * 與相同插件聯合時使用。
 *
 * 〇其他插件聯合使用
 * 與圖片按鈕化插件（PictureCallCommon.js）的插件一起使用時，
 * 請使用「P_CALL_SWITCH」而不是「P_CALL_CE」。
 *
 * 插件 URL
 * https://raw.githubusercontent.com/triacontane/RPGMakerMV/master/MenuCommonEvent.js
 *
 * 幫助 URL
 * https://github.com/triacontane/RPGMakerMV/blob/master/ReadMe/MenuCommonEvent.md
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */
 
/*~struct~CommonEventInfo:
 *
 * @param SceneName
 * @desc 公共事件執行的畫面。
 * 如果要獨自添加其他畫面，請直接輸入類名。
 * @type select
 * @default
 * @option 主選單畫面
 * @value Scene_Menu
 * @option 道具畫面
 * @value Scene_Item
 * @option 技能畫面
 * @value Scene_Skill
 * @option 裝備畫面
 * @value Scene_Equip
 * @option 狀態畫面
 * @value Scene_Status
 * @option 設置畫面
 * @value Scene_Options
 * @option 存檔畫面
 * @value Scene_Save
 * @option 讀取畫面
 * @value Scene_Load
 * @option 遊戲結束畫面
 * @value Scene_End
 * @option 商店畫面
 * @value Scene_Shop
 * @option 輸入名稱畫面
 * @value Scene_Name
 * @option DeBug畫面
 * @value Scene_Debug
 * @option 聲音測試畫面
 * @value Scene_SoundTest
 * @option 用語辭典畫面
 * @value Scene_Glossary
 * @option 公式轉蛋畫面
 * @value Scene_Gacha
 *
 * @param CommonEventId
 * @text 公共事件ID
 * @desc 在畫面上並行執行的公共事件ID。
 * 觸發條件不用並行，也不用任何開關。
 * @default 1
 * @type common_event
 *
 */

(function() {
    'use strict';
    var pluginName = 'MenuCommonEvent';

    //=============================================================================
    // ローカル関数
    //  プラグインパラメータやプラグインコマンドパラメータの整形やチェックをします
    //=============================================================================
    var getParamString = function(paramNames) {
        if (!Array.isArray(paramNames)) paramNames = [paramNames];
        for (var i = 0; i < paramNames.length; i++) {
            var name = PluginManager.parameters(pluginName)[paramNames[i]];
            if (name !== undefined) return name;
        }
        return '';
    };

    var getParamNumber = function(paramNames, min, max) {
        var value = getParamString(paramNames);
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(value) || 0).clamp(min, max);
    };

    var getParamBoolean = function(paramNames) {
        var value = getParamString(paramNames);
        return value.toUpperCase() === 'TRUE';
    };

    var getParamArrayJson = function(paramNames, defaultValue) {
        var value = getParamString(paramNames) || null;
        try {
            value = JSON.parse(value);
            if (value === null) {
                value = defaultValue;
            } else {
                value = value.map(function(valueData) {
                    return JSON.parse(valueData);
                });
            }
        } catch (e) {
            alert('!!!Plugin param is wrong.!!!\nPlugin:.js\nName:[]\nValue:');
            value = defaultValue;
        }
        return value;
    };

    var convertEscapeCharacters = function(text) {
        if (isNotAString(text)) text = '';
        var windowLayer = SceneManager._scene._windowLayer;
        return windowLayer ? windowLayer.children[0].convertEscapeCharacters(text) : text;
    };

    var isNotAString = function(args) {
        return String(args) !== args;
    };

    var convertAllArguments = function(args) {
        return args.map(function(arg) {
            return convertEscapeCharacters(arg);
        });
    };

    var setPluginCommand = function(commandName, methodName) {
        pluginCommandMap.set(param.commandPrefix + commandName, methodName);
    };

    var getClassName = function(object) {
        return object.constructor.toString().replace(/function\s+(.*)\s*\([\s\S]*/m, '$1');
    };

    //=============================================================================
    // パラメータの取得と整形
    //=============================================================================
    var param                  = {};
    param.commonEventInfo      = getParamArrayJson(['CommonEventInfo', 'コモンイベント情報'], []);
    param.commandPrefix        = getParamString(['CommandPrefix', 'コマンド接頭辞']);
    param.maxMenuPicture       = getParamNumber(['MaxMenuPicture', 'ピクチャ表示最大数'], 1);
    param.saveInterpreterIndex = getParamBoolean(['SaveInterpreterIndex', '実行位置を記憶']);
    param.activateTimer        = getParamBoolean(['ActivateTimer', 'タイマー有効化']);

    var pluginCommandMap = new Map();
    setPluginCommand('ウィンドウ操作禁止', 'execDisableWindowControl');
    setPluginCommand('DISABLE_WINDOW_CONTROL', 'execDisableWindowControl');
    setPluginCommand('ウィンドウ操作許可', 'execEnableWindowControl');
    setPluginCommand('ENABLE_WINDOW_CONTROL', 'execEnableWindowControl');
    setPluginCommand('イベントの実行停止', 'execStopEvent');
    setPluginCommand('STOP_EVENT', 'execStopEvent');

    //=============================================================================
    // Game_Interpreter
    //  プラグインコマンドを追加定義します。
    //=============================================================================
    var _Game_Interpreter_pluginCommand      = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.apply(this, arguments);
        var pluginCommandMethod = pluginCommandMap.get(command.toUpperCase());
        if (pluginCommandMethod) {
            this[pluginCommandMethod](convertAllArguments(args));
        }
    };

    Game_Interpreter.prototype.execDisableWindowControl = function() {
        $gameTemp.setDisableWindowControl(true);
    };

    Game_Interpreter.prototype.execEnableWindowControl = function() {
        $gameTemp.setDisableWindowControl(false);
    };

    Game_Interpreter.prototype.isWindowActive = function(windowName) {
        var sceneWindow = this.getSceneWindow(windowName);
        return sceneWindow ? sceneWindow.active : false;
    };

    Game_Interpreter.prototype.getSceneWindow = function(windowName) {
        return SceneManager.getSceneWindow('_' + windowName);
    };

    Game_Interpreter.prototype.getSceneWindowIndex = function() {
        var index = -1;
        SceneManager.getSceneWindowList().some(function(sceneWindow) {
            if (sceneWindow instanceof Window_Selectable && sceneWindow.active) {
                index = sceneWindow.index();
                return true;
            } else {
                return false;
            }
        });
        return index;
    };

    Game_Interpreter.prototype.refreshGlossary = function() {
        var glossaryWindow = this.getSceneWindow('glossaryWindow');
        if (glossaryWindow.visible) {
            var glossaryListWindow = this.getSceneWindow('glossaryListWindow');
            glossaryWindow.refresh(glossaryListWindow.item());
        }
    };

    Game_Interpreter.prototype.execStopEvent = function() {
        this._menuCommonStop = true;
    };

    Game_Interpreter.prototype.isMenuCommonStop = function() {
        return this._menuCommonStop;
    };

    //=============================================================================
    // Game_Temp
    //  メニューコモンイベントを作成、更新します。
    //=============================================================================
    var _Game_Temp_initialize      = Game_Temp.prototype.initialize;
    Game_Temp.prototype.initialize = function() {
        _Game_Temp_initialize.apply(this, arguments);
        this._menuCommonEvent = {};
        this.clearSceneInformation();
    };

    Game_Temp.prototype.setupMenuCommonEvent = function(commonEventId, sceneName, sceneIndex) {
        this._sceneName  = sceneName;
        this._sceneIndex = sceneIndex;
        if (param.saveInterpreterIndex && this.isExistSameCommonEvent(commonEventId)) {
            return this._menuCommonEvent[sceneName];
        }
        return this._menuCommonEvent[sceneName] = this.createMenuCommonEvent(commonEventId);
    };

    Game_Temp.prototype.createMenuCommonEvent = function(commonEventId) {
        if (commonEventId > 0) {
            var commonEvent = new Game_MenuCommonEvent(commonEventId);
            if (commonEvent.event()) {
                return commonEvent;
            }
        }
        return null;
    };

    Game_Temp.prototype.isExistSameCommonEvent = function(commonEventId) {
        var commonEvent = this._menuCommonEvent[this._sceneName];
        return commonEvent && commonEvent.isSameEvent(commonEventId);
    };

    Game_Temp.prototype.setDisableWindowControl = function(value) {
        this._disableWindowControl = value;
    };

    Game_Temp.prototype.isDisableWindowControl = function() {
        return !!this._disableWindowControl;
    };

    Game_Temp.prototype.getSceneIndex = function() {
        return this._sceneIndex;
    };

    Game_Temp.prototype.isInMenu = function() {
        return this.getSceneIndex() >= 0;
    };

    Game_Temp.prototype.clearSceneInformation = function() {
        this._sceneIndex = -1;
        this._sceneName  = '';
    };

    //=============================================================================
    // Game_Screen
    //  シーンごとにピクチャを管理できるようにします。
    //=============================================================================
    if (param.maxMenuPicture > 0) {
        var _Game_Screen_realPictureId      = Game_Screen.prototype.realPictureId;
        Game_Screen.prototype.realPictureId = function(pictureId) {
            var sceneIndex = $gameTemp.getSceneIndex();
            if (sceneIndex >= 0) {
                return pictureId + this.maxMapPictures() * 2 + sceneIndex * this.maxPictures();
            } else {
                return _Game_Screen_realPictureId.apply(this, arguments);
            }
        };

        var _Game_Screen_maxPictures      = Game_Screen.prototype.maxPictures;
        Game_Screen.prototype.maxPictures = function() {
            return $gameTemp.isInMenu() ? param.maxMenuPicture : _Game_Screen_maxPictures.apply(this, arguments);
        };

        Game_Screen.prototype.maxMapPictures = function() {
            return _Game_Screen_maxPictures.apply(this, arguments);
        };
    }

    //=============================================================================
    // Game_MenuCommonEvent
    //  メニューコモンイベントを扱うクラスです。
    //=============================================================================
    function Game_MenuCommonEvent() {
        this.initialize.apply(this, arguments);
    }

    Game_MenuCommonEvent.prototype             = Object.create(Game_CommonEvent.prototype);
    Game_MenuCommonEvent.prototype.constructor = Game_MenuCommonEvent;

    Game_MenuCommonEvent.prototype.isActive = function() {
        return true;
    };

    Game_MenuCommonEvent.prototype.isSameEvent = function(commonEventId) {
        return this._commonEventId === commonEventId;
    };

    var _Game_MenuCommonEvent_update      = Game_MenuCommonEvent.prototype.update;
    Game_MenuCommonEvent.prototype.update = function() {
        if (this._interpreter) {
            if (!this._interpreter.isRunning()) {
                this._interpreter.execEnableWindowControl();
            }
            if (this._interpreter.isMenuCommonStop()) {
                return;
            }
        }
        _Game_MenuCommonEvent_update.apply(this, arguments);
    };

    //=============================================================================
    // Scene_MenuBase
    //  メニューコモンイベントを実行します。
    //=============================================================================
    var _Scene_MenuBase_create      = Scene_MenuBase.prototype.create;
    Scene_MenuBase.prototype.create = function() {
        _Scene_MenuBase_create.apply(this, arguments);
        this.createCommonEvent();
    };

    Scene_MenuBase.prototype.createCommonEvent = function() {
        this.setupCommonEvent();
        if (!this.hasCommonEvent()) {
            return;
        }
        this.createSpriteset();
        if (!this._messageWindow) {
            this.createMessageWindow();
        }
        if (!this._scrollTextWindow) {
            this.createScrollTextWindow();
        }
        this.changeParentMessageWindow();
    };

    var _Scene_MenuBase_start = Scene_MenuBase.prototype.start;
    Scene_MenuBase.prototype.start = function() {
        _Scene_MenuBase_start.apply(this, arguments);
        if (this.hasCommonEvent()) {
            this.addChild(this._messageWindow);
            this.addChild(this._scrollTextWindow);
            this._messageWindow.subWindows().forEach(function(win) {
                this.addChild(win);
            }, this);
        }
    };

    Scene_MenuBase.prototype.hasCommonEvent = function() {
        return !!this._commonEvent;
    };

    Scene_MenuBase.prototype.createMessageWindow = function() {
        Scene_Map.prototype.createMessageWindow.call(this);
    };

    Scene_MenuBase.prototype.createScrollTextWindow = function() {
        Scene_Map.prototype.createScrollTextWindow.call(this);
    };

    Scene_MenuBase.prototype.changeParentMessageWindow = function() {
        this.addChild(this._windowLayer.removeChild(this._messageWindow));
        this.addChild(this._windowLayer.removeChild(this._scrollTextWindow));
        this._messageWindow.subWindows().forEach(function(win) {
            this.addChild(this._windowLayer.removeChild(win));
        }, this);
    };

    // Resolve conflict for NobleMushroom.js
    Scene_MenuBase.prototype.changeImplementationWindowMessage  = Scene_Map.prototype.changeImplementationWindowMessage;
    Scene_MenuBase.prototype.restoreImplementationWindowMessage = Scene_Map.prototype.restoreImplementationWindowMessage;
    Scene_MenuBase.prototype.onPause                            = Scene_Map.prototype.onPause;
    Scene_MenuBase.prototype.offPause                           = Scene_Map.prototype.offPause;
    Scene_MenuBase._stopWindow = false;

    Scene_MenuBase.prototype.createSpriteset = function() {
        this._spriteset = new Spriteset_Menu();
        this.addChild(this._spriteset);
    };

    Scene_MenuBase.prototype.setupCommonEvent = function() {
        var commonEventItem = this.getCommonEventData();
        var commonEventId   = commonEventItem ? parseInt(commonEventItem['CommonEventId']) : 0;
        var sceneIndex      = param.commonEventInfo.indexOf(commonEventItem);
        this._commonEvent   = $gameTemp.setupMenuCommonEvent(commonEventId, this._sceneName, sceneIndex);
    };

    Scene_MenuBase.prototype.getCommonEventData = function() {
        this._sceneName = getClassName(this);
        return param.commonEventInfo.filter(function(data) {
            return data['SceneName'] === this._sceneName;
        }, this)[0];
    };

    var _Scene_MenuBase_updateChildren      = Scene_MenuBase.prototype.updateChildren;
    Scene_MenuBase.prototype.updateChildren = function() {
        Scene_MenuBase._stopWindow = this.hasCommonEvent() && this.isNeedStopWindow();
        _Scene_MenuBase_updateChildren.apply(this, arguments);
    };

    Scene_MenuBase.prototype.isNeedStopWindow = function() {
        return $gameTemp.isDisableWindowControl() || $gameMessage.isBusy();
    };

    Scene_MenuBase.prototype.updateCommonEvent = function() {
        if (!this.hasCommonEvent()) {
            return;
        }
        this._commonEvent.update();
        $gameScreen.update();
        if (param.activateTimer) {
            $gameTimer.update(true);
        }
        this.checkGameover();
        this.updateTouchPicturesIfNeed();
    };

    /**
     * updateTouchPicturesIfNeed
     * for PictureCallCommon.js
     */
    Scene_MenuBase.prototype.updateTouchPicturesIfNeed = function() {
        if (this.updateTouchPictures && param.maxMenuPicture > 0) {
            this.updateTouchPictures();
        }
    };

    //=============================================================================
    // Scene_Base
    //  メニューコモンイベントを更新します。
    //=============================================================================
    var _Scene_Base_update      = Scene_Base.prototype.update;
    Scene_Base.prototype.update = function() {
        this.updateCommonEvent();
        _Scene_Base_update.apply(this, arguments);
    };

    Scene_Base.prototype.updateCommonEvent = function() {
        // do nothing
    };

    var _Scene_Base_terminate      = Scene_Base.prototype.terminate;
    Scene_Base.prototype.terminate = function() {
        _Scene_Base_terminate.apply(this, arguments);
        if ($gameTemp) {
            $gameTemp.clearSceneInformation();
        }
    };

    //=============================================================================
    // Spriteset_Menu
    //  メニュー画面用のスプライトセットです。
    //=============================================================================
    function Spriteset_Menu() {
        this.initialize.apply(this, arguments);
    }

    Spriteset_Menu.prototype             = Object.create(Spriteset_Base.prototype);
    Spriteset_Menu.prototype.constructor = Spriteset_Menu;

    var _Spriteset_Menu_createBaseSprite      = Spriteset_Menu.prototype.createBaseSprite;
    Spriteset_Menu.prototype.createBaseSprite = function() {
        _Spriteset_Menu_createBaseSprite.apply(this, arguments);
        this._blackScreen.opacity = 0;
    };

    var _Spriteset_Menu_createTimer      = Spriteset_Menu.prototype.createTimer;
    Spriteset_Menu.prototype.createTimer = function() {
        if (param.activateTimer) {
            _Spriteset_Menu_createTimer.apply(this, arguments);
        }
    };

    //=============================================================================
    // SceneManager
    //  ウィンドウオブジェクトを取得します。
    //=============================================================================
    SceneManager.getSceneWindow = function(windowName) {
        var sceneWindow = this._scene[windowName];
        return sceneWindow instanceof Window ? sceneWindow : null;
    };

    SceneManager.getSceneWindowList = function() {
        var windowList = [];
        for (var sceneWindow in this._scene) {
            if (this._scene.hasOwnProperty(sceneWindow) && this._scene[sceneWindow] instanceof Window) {
                windowList.push(this._scene[sceneWindow]);
            }
        }
        return windowList;
    };

    //=============================================================================
    // Window_Selectable
    //  必要な場合にウィンドウの状態更新を停止します。
    //=============================================================================
    var _Window_Selectable_update = Window_Selectable.prototype.update;
    Window_Selectable.prototype.update = function() {
        if (Scene_MenuBase._stopWindow && this.isStopWindow()) {
            return;
        }
        _Window_Selectable_update.apply(this, arguments);
    };

    Window_Selectable.prototype.isStopWindow = function() {
        return !this._messageWindow;
    };
})();
