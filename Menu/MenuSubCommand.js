//=============================================================================
// MenuSubCommand.js
// ----------------------------------------------------------------------------
// (C) 2017 Triacontane
// Translator : ReIris
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 2.5.0 2018/11/25 サブメニューの絶対座標と揃えを設定できる機能を追加
//                  MOG_SceneMenu.jsとの競合を解消
// 2.4.1 2018/11/24 用語辞典プラグインと連携する方法をヘルプに記載
// 2.4.0 2018/09/26 サブコマンドを逐次消去するオプションを追加
// 2.3.0 2018/09/26 サブコマンドを横並べにするオプションを追加
// 2.2.1 2018/01/28 サブコマンドを選択後メニューに戻って通常コマンドを選択し、さらにメニューに戻ったときに最初のサブコマンドが展開される問題を修正
// 2.2.0 2018/01/07 同名の親コマンドを指定できる機能を追加
// 2.1.0 2017/12/24 対象メンバーを選択するサブコマンド選択時にメニューコマンドをその名前に置き換える処理を追加
//                  メニューへ戻った際に対象メンバー選択やサブコマンド選択に戻るように変更
// 2.0.1 2017/11/19 MOG_MenuCursor.jsとの併用時、カーソルがサブコマンドの下に隠れてしまう競合の解消
// 2.0.0 2017/09/04 メニューコマンドやサブコマンドを好きなだけ追加できるようパラメータの仕様を変更
// 1.1.0 2017/05/14 デフォルトのオプションとゲーム終了コマンドを削除できる機能を追加
//                  カンマ(,)を含むスクリプトを正しく実行できない問題を修正
// 1.0.3 2017/04/09 サブコマンドマップから戻ってきたときにイベント位置を復元できるよう修正
// 1.0.2 2017/04/08 サブコマンドマップから戻ってきたときにフォロワー位置を復元できるよう修正
// 1.0.1 2017/04/08 サブコマンドマップから戻ってきたタイミングでセーブしたときにロード時の位置がサブコマンドマップに
//                  なってしまう問題を修正
//                  戦闘リトライプラグインと併用したときにリトライ中は、マップ移動するメニューを使用禁止に設定
// 1.0.0 2017/04/01 初版
// ----------------------------------------------------------------------------
// [Blog]   : https://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================
/*:
 * @plugindesc 選單畫面的子命令插件
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @param サブコマンド
 * @text 子命令
 * @desc 子命令的設置。
 * @default
 * @type struct<SubCommand>[]
 *
 * @param コマンド追加位置
 * @text 命令追加位置
 * @desc 添加子命令組的位置。0:隊形下 1:設置下 2:存檔下 3:遊戲結束下
 * @default 0
 * @type select
 * @option 隊形下
 * @value 0
 * @option 設置下
 * @value 1
 * @option 存檔下
 * @value 2
 * @option 遊戲結束下
 * @value 3
 *
 * @param サブメニュー横幅
 * @text 子選單寬度
 * @desc 顯示子選單的窗口寬度。如果未指定，則應用默認「240」。
 * @default 0
 * @type number
 *
 * @param 選択アクターID変数
 * @text 選擇角色ID變數
 * @desc 保存移動到子選單時選擇的角色 ID 的變數 ID。
 * @default 0
 * @type variable
 *
 * @param ウィンドウスキン
 * @text 窗口樣式
 * @desc 為子命令窗口設置專用外觀。
 * @default
 * @require 1
 * @dir img/system/
 * @type file
 *
 * @param オプション消去
 * @text 隱藏設置
 * @desc 從主選單中隱藏設置。
 * @default false
 * @type boolean
 *
 * @param ゲーム終了消去
 * @text 隱藏遊戲結束
 * @desc 從主選單中隱藏遊戲結束。
 * @default false
 * @type boolean
 *
 * @param 横並びサブメニュー
 * @text 並排子選單
 * @desc 橫向並排子選單。
 * @default false
 * @type boolean
 *
 * @param サブメニュー逐次消去
 * @text 子選單順序消除
 * @desc 按順序消除子選單
 * @default true
 * @type boolean
 *
 * @param サブメニューX座標
 * @text 子選單 X 座標
 * @desc 如果指定，子選單的 X 坐標將變為固定值。
 * @default 0
 * @type number
 *
 * @param サブメニューY座標
 * @text 子選單 Y 座標
 * @desc 如果指定，子選單的 Y 坐標將變為固定值。
 * @default 0
 * @type number
 *
 * @param サブメニュー揃え
 * @text 子選單對齊方式
 * @desc 設置子命令對齊方式。
 * @default
 * @type select
 * @option 左對齊(默認)
 * @value
 * @option 中央
 * @value center
 * @option 右對齊
 * @value right
 *
 * @help MenuSubCommand.js
 *
 * 您可以將任意數量的命令和樹狀中顯示的子命令添加到主選單畫面。
 * 執行( 決定 )子命令時，將執行任意腳本或將其移動到指定的地圖。
 * ( 兩者都有可能 )
 *
 * 該腳本主要用於轉換到由腳本組成的另一個畫面。
 * 當然，您也可以轉換到其他插件添加的畫面。
 * 地圖移動主要用於通過事件轉換到自製選單畫面時。
 * 從主選單畫面返回時，再次打開選單。
 * 最初打開選單的位置是單獨存儲的，因此無需了解。
 *
 * 除了常規的垂直排版和選單畫面外，它還通過插件支持水平排版選單畫面。
 *
 * 通過選擇成員移動地圖時選擇的角色ID可以保存在變數中。
 *
 * 如果隱藏了所有子命令，則還隱藏父命令本身。
 * 同樣，如果禁止所有使用，也禁止父命令本身。
 *
 * 如果只有一個子命令，則不顯示子命令窗口，並在選擇父命令時執行子命令。
 *
 * 某些高級設置(例如子命令窗口的字體大小)直接在「使用者設置區域」中設置。
 * 它可以根據需要進行修改。
 *
 * 〇與用語辭典插件結合使用時
 * 當您同時使用「用語辭典插件」時，
 * 可以通過在腳本中執行以下操作來調用用語辭典畫面。
 * this.commandGlossary(1); // 調用術語類型[1]的用語辭典
 *
 * 這個插件沒有插件命令
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */

/*~struct~SubCommand:
 *
 * @param CommandId
 * @text 命令ID
 * @desc 子命令識別編號。命令按此編號和名稱分組。
 * 通常所有 0 都沒問題。
 * @default 0
 *
 * @param Name
 * @text 命令名稱
 * @desc 子命令中顯示的任意命令名稱。
 * @default アイテム
 *
 * @param ParentName
 * @text 父選單名稱
 * @desc 主命令中顯示的子命令的父名稱。具有相同父名稱的子命令組合在一起。
 * @default 親コマンド1
 *
 * @param HiddenSwitchId
 * @text 隱藏開關ID
 * @desc 打開時隱藏子命令的開關 ID。
 * @default 0
 * @type switch
 *
 * @param DisableSwitchId
 * @text 禁止使用ID
 * @desc 開啟時禁用子命令的開關 ID。
 * @default 0
 * @type switch
 *
 * @param Script
 * @text 執行腳本
 * @desc 確定命令時要執行的腳本
 * @default this.commandItem();
 *
 * @param MapId
 * @text 地圖ID
 * @desc 確定命令時要移動的地圖ID
 * @default 0
 * @type map_id
 *
 * @param SelectMember
 * @text 選擇對象
 * @desc 是否在執行命令之前選擇目標角色
 * @default false
 * @type boolean
 */

(function() {
    'use strict';
    //=============================================================================
    // ユーザ設定領域 開始
    //=============================================================================
    var userSetting = {
        /**
         * サブコマンドウィンドウに関する設定です
         */
        subCommandWindow: {
            adjustX : 0,
            adjustY : 0,
            fontSize: null,
            padding : null,
        },
        /**
         * サブマップ移動時に自働でプレイヤーを透明にします。
         */
        autoTransparent : true
    };
    //=============================================================================
    // ユーザ設定領域 終了
    //=============================================================================
    var pluginName = 'MenuSubCommand';

    //=============================================================================
    // ローカル関数
    //  プラグインパラメータやプラグインコマンドパラメータの整形やチェックをします
    //=============================================================================
    var getParamBoolean = function(paramNames) {
        var value = getParamString(paramNames);
        return value.toUpperCase() === 'ON' || value.toUpperCase() === 'TRUE';
    };

    var getParamString = function(paramNames) {
        if (!Array.isArray(paramNames)) paramNames = [paramNames];
        for (let i = 0; i < paramNames.length; i++) {
            const name = PluginManager.parameters(pluginName)[paramNames[i]];
            if (name) return name;
        }
        return '';
    };

    var getParamNumber = function(paramNames, min, max) {
        const value = getParamString(paramNames);
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(value) || 0).clamp(min, max);
    };

    var convertEscapeCharacters = function(text) {
        if (isNotAString(text)) text = '';
        text = text.replace(/\\/g, '\x1b');
        text = text.replace(/\x1b\x1b/g, '\\');
        text = text.replace(/\x1bV\[(\d+)\]/gi, function() {
            return $gameVariables.value(parseInt(arguments[1]));
        }.bind(this));
        text = text.replace(/\x1bV\[(\d+)\]/gi, function() {
            return $gameVariables.value(parseInt(arguments[1]));
        }.bind(this));
        text = text.replace(/\x1bN\[(\d+)\]/gi, function() {
            var actor = parseInt(arguments[1]) >= 1 ? $gameActors.actor(parseInt(arguments[1])) : null;
            return actor ? actor.name() : '';
        }.bind(this));
        text = text.replace(/\x1bP\[(\d+)\]/gi, function() {
            var actor = parseInt(arguments[1]) >= 1 ? $gameParty.members()[parseInt(arguments[1]) - 1] : null;
            return actor ? actor.name() : '';
        }.bind(this));
        text = text.replace(/\x1bG/gi, TextManager.currencyUnit);
        return text;
    };

    var isNotAString = function(args) {
        return String(args) !== args;
    };

    var getArgBoolean = function(arg) {
        return arg.toUpperCase() === 'ON' || arg.toUpperCase() === 'TRUE';
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
            alert(`!!!Plugin param is wrong.!!!\nPlugin:${pluginName}.js\nName:[${paramNames}]\nValue:${value}`);
            value = defaultValue;
        }
        return value;
    };

    //=============================================================================
    // パラメータの取得と整形
    //=============================================================================
    var param                   = {};
    param.subCommands           = getParamArrayJson(['サブコマンド', 'SubCommand'], []);
    param.commandPosition       = getParamNumber(['CommandPosition', 'コマンド追加位置']);
    param.subMenuWidth          = getParamNumber(['SubMenuWidth', 'サブメニュー横幅']);
    param.selectActorIdVariable = getParamNumber(['SelectActorIdVariable', '選択アクターID変数']);
    param.windowSkin            = getParamString(['WindowSkin', 'ウィンドウスキン']);
    param.hideOption            = getParamBoolean(['HideOption', 'オプション消去']);
    param.hideGameEnd           = getParamBoolean(['HideGameEnd', 'ゲーム終了消去']);
    param.horizontalSubMenu     = getParamBoolean(['HorizontalSubMenu', '横並びサブメニュー']);
    param.clearSubMenuOneByObe  = getParamBoolean(['ClearSubMenuOneByOne', 'サブメニュー逐次消去']);
    param.subMenuX              = getParamNumber(['SubMenuX', 'サブメニューX座標']);
    param.subMenuY              = getParamNumber(['SubMenuY', 'サブメニューY座標']);
    param.subMenuAlign          = getParamString(['SubMenuAlign', 'サブメニュー揃え']);

    //=============================================================================
    // Game_Temp
    //  メニューコマンド情報を構築して保持します。
    //=============================================================================
    var _Game_Temp_initialize      = Game_Temp.prototype.initialize;
    Game_Temp.prototype.initialize = function() {
        _Game_Temp_initialize.apply(this, arguments);
        this.createMenuCommands();
    };

    Game_Temp.prototype.createMenuCommands = function() {
        this._menuParentCommands = new Map();
        param.subCommands.forEach(function(commands) {
            this.createMenuCommand(commands);
        }, this);
        /* 最後に選択したサブコマンド */
        this._lastSubCommand = {
            parent: null,
            index : 0
        };
    };

    Game_Temp.prototype.createMenuCommand = function(commands) {
        var parentName = commands.ParentName + commands.CommandId;
        if (!this._menuParentCommands.has(parentName)) {
            this._menuParentCommands.set(parentName, []);
        }
        var parent = this._menuParentCommands.get(parentName);
        parent.push(new Game_MenuSubCommand(commands));
    };

    Game_Temp.prototype.iterateMenuParents = function(callBackFunc, thisArg) {
        this._menuParentCommands.forEach(callBackFunc, thisArg);
    };

    Game_Temp.prototype.getSubMenuCommands = function(parentName) {
        return this._menuParentCommands.get(parentName);
    };

    /**
     * 最後に選択したサブコマンドを取得する
     */
    Game_Temp.prototype.getLastSubCommand = function() {
        return this._lastSubCommand;
    };

    Game_Temp.prototype.setLastSubCommandParent = function(parentName) {
        this._lastSubCommand.parent = parentName;
    };

    Game_Temp.prototype.setLastSubCommandIndex = function(index) {
        this._lastSubCommand.index = index;
    };

    /**
     * 最後に選択したサブコマンドをリセットする
     */
    Game_Temp.prototype.resetLastSubCommand = function() {
        this._lastSubCommand = {
            parent: null,
            index : 0
        };
    };

    //=============================================================================
    // Game_CharacterBase
    //  サブコマンドマップへ移動します。
    //=============================================================================
    Game_CharacterBase.prototype.savePosition = function() {
        this._originalX         = this.x;
        this._originalY         = this.y;
        this._originalDirection = this.direction();
    };

    Game_CharacterBase.prototype.restorePosition = function() {
        this.locate(this._originalX, this._originalY);
        this.setDirection(this._originalDirection);
    };

    //=============================================================================
    // Game_Player
    //  サブコマンドマップへ移動します。
    //=============================================================================
    Game_Player.prototype.reserveTransferToSubCommandMap = function(subCommandMapId) {
        this.saveOriginalMap();
        this.reserveTransfer(subCommandMapId, 0, 0, 0, 2);
        if (userSetting.autoTransparent) {
            this.setTransparent(true);
        }
    };

    Game_Player.prototype.reserveTransferToOriginalMap = function() {
        DataManager.loadMapData(this._originalMapId);
        this.reserveTransfer(this._originalMapId, this._originalX, this._originalY, this._originalDirection, 2);
        if (userSetting.autoTransparent) {
            this.setTransparent(this._originalTransparent);
        }
        this._originalMapId             = 0;
        this._transferringToOriginalMap = true;
    };

    Game_Player.prototype.isInSubCommandMap = function() {
        return this._originalMapId > 0;
    };

    Game_Player.prototype.isTransferringToOriginalMap = function() {
        return this._transferringToOriginalMap;
    };

    Game_Player.prototype.saveOriginalMap = function() {
        this._originalMapId       = $gameMap.mapId();
        this._originalTransparent = this._transparent;
        this.savePosition();
    };

    var _Game_Player_performTransfer      = Game_Player.prototype.performTransfer;
    Game_Player.prototype.performTransfer = function() {
        _Game_Player_performTransfer.apply(this, arguments);
        if (this.isTransferringToOriginalMap()) {
            this.restorePosition();
            this._transferringToOriginalMap = false;
        }
    };

    Game_Player.prototype.savePosition = function() {
        Game_CharacterBase.prototype.savePosition.call(this, arguments);
        this._followers.forEach(function(follower) {
            follower.savePosition();
        });
        $gameMap.saveAllEventPosition();
    };

    Game_Player.prototype.restorePosition = function() {
        Game_CharacterBase.prototype.restorePosition.call(this, arguments);
        this._followers.forEach(function(follower) {
            follower.restorePosition();
        });
        $gameMap.restoreAllEventPosition();
    };

    //=============================================================================
    // Game_Map
    //  すべてのイベントの位置を保存します。
    //=============================================================================
    Game_Map.prototype.saveAllEventPosition = function() {
        this._eventPositions = [];
        this.events().forEach(function(event) {
            var position                          = {};
            position.x                            = event.x;
            position.y                            = event.y;
            position.direction                    = event.direction();
            this._eventPositions[event.eventId()] = position;
        }, this);
    };

    Game_Map.prototype.restoreAllEventPosition = function() {
        this.events().forEach(function(event) {
            var position = this._eventPositions[event.eventId()];
            if (position) {
                event.locate(position.x, position.y);
                event.setDirection(position.direction);
            }
        }, this);
        this._eventPositions = [];
    };

    //=============================================================================
    // Game_Party
    //  無効なアクター設定時のエラーを回避します。
    //=============================================================================
    var _Game_Party_setMenuActor      = Game_Party.prototype.setMenuActor;
    Game_Party.prototype.setMenuActor = function(actor) {
        if (!actor) return;
        _Game_Party_setMenuActor.apply(this, arguments);
    };

    //=============================================================================
    // AudioManager
    //  システム効果音を消音します。
    //=============================================================================
    AudioManager.stopStaticSe = function() {
        this._staticBuffers.forEach(function(buffer) {
            buffer.stop();
        });
        this._staticBuffers = [];
    };

    //=============================================================================
    // SceneManager
    //  メニュー用マップではキャプチャを無効にします。
    //=============================================================================
    var _SceneManager_snapForBackground = SceneManager.snapForBackground;
    SceneManager.snapForBackground      = function() {
        if ($gamePlayer.isInSubCommandMap()) return;
        _SceneManager_snapForBackground.apply(this, arguments);
    };

    //=============================================================================
    // Scene_Map
    //  自作ゲーム用マップ遷移の場合、一部演出を無効化します。
    //=============================================================================
    var _Scene_Map_callMenu      = Scene_Map.prototype.callMenu;
    Scene_Map.prototype.callMenu = function() {
        _Scene_Map_callMenu.apply(this, arguments);
        if ($gamePlayer.isInSubCommandMap()) {
            AudioManager.stopStaticSe();
            SoundManager.playCancel();
        }
    };

    var _Scene_Map_onMapLoaded      = Scene_Map.prototype.onMapLoaded;
    Scene_Map.prototype.onMapLoaded = function() {
        _Scene_Map_onMapLoaded.apply(this, arguments);
        if ($gamePlayer.isInSubCommandMap()) {
            this._transfer = false;
        }
    };

    //=============================================================================
    // Scene_Menu
    //  メインメニューにコマンドを追加します。
    //=============================================================================
    var _Scene_Menu_create      = Scene_Menu.prototype.create;
    Scene_Menu.prototype.create = function() {
        _Scene_Menu_create.apply(this, arguments);
        this.loadSubCommandWindowSkin();
        if ($gamePlayer.isInSubCommandMap()) {
            $gamePlayer.reserveTransferToOriginalMap();
        }
        if (this._isSubCommandOkAfterCreate) {
            this.onSubCommandOk();
        }
    };

    Scene_Menu.prototype.loadSubCommandWindowSkin = function() {
        if (param.windowSkin) {
            ImageManager.loadSystem(param.windowSkin);
        }
    };

    var _Scene_Menu_isReady      = Scene_Menu.prototype.isReady;
    Scene_Menu.prototype.isReady = function() {
        return _Scene_Menu_isReady.apply(this, arguments) &&
            (!$gamePlayer.isTransferringToOriginalMap() || DataManager.isMapLoaded());
    };

    var _Scene_Menu_start      = Scene_Menu.prototype.start;
    Scene_Menu.prototype.start = function() {
        _Scene_Menu_start.apply(this, arguments);
        if ($gamePlayer.isTransferringToOriginalMap()) {
            $gamePlayer.performTransfer();
        }
    };

    var _Scene_Menu_createCommandWindow      = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function() {
        _Scene_Menu_createCommandWindow.apply(this, arguments);
        $gameTemp.iterateMenuParents(function(subCommands, parentName) {
            this._commandWindow.setHandler('parent' + parentName, this.commandParent.bind(this));
        }, this);

        /* 最後に選択していたメニューにカーソルを合わせる */
        this.selectLastCommand();
    };

    Scene_Menu.prototype.commandParent = function() {
        var parentName  = this._commandWindow.currentExt();
        var subCommands = $gameTemp.getSubMenuCommands(parentName);
        $gameTemp.setLastSubCommandParent(parentName);
        if (subCommands.length === 1) {
            this.onSubCommandOk(subCommands[0]);
        } else {
            if (!param.clearSubMenuOneByObe && this._subMenuWindow) {
                this._subMenuWindow.activate();
            } else {
                this.createSubMenuCommandWindow(parentName);
            }
        }
    };

    Scene_Menu.prototype.createSubMenuCommandWindow = function(parentName) {
        this._subMenuWindow = new Window_MenuSubCommand(this.x, this.y, parentName);
        this._subMenuWindow.updatePlacement(this._commandWindow);
        this._subMenuWindow.setHandler('ok', this.onSubCommandOk.bind(this));
        this._subMenuWindow.setHandler('cancel', this.onSubCommandCancel.bind(this));
        this.addChild(this._subMenuWindow);
    };

    Scene_Menu.prototype.removeSubMenuCommandWindow = function() {
        if (this._subMenuWindow) {
            this.removeChild(this._subMenuWindow);
        }
        this._subMenuWindow = null;
    };

    Scene_Menu.prototype.onSubCommandOk = function(subCommand) {
        this._subCommand = (this._subMenuWindow ? this._subMenuWindow.currentExt() : subCommand);
        $gameTemp.setLastSubCommandIndex(this._subMenuWindow ? this._subMenuWindow.index() : 0);
        if (this._subCommand.isNeedSelectMember()) {
            if (this._subMenuWindow) {
                this._commandWindow.maskCommand(this._subCommand.getName());
            }
            this._statusWindow.selectLast();
            this._statusWindow.activate();
            this._statusWindow.setHandler('ok', this.executeSubCommand.bind(this));
            this._statusWindow.setHandler('cancel', this.onPersonalCancel.bind(this));
            if (param.clearSubMenuOneByObe) {
                this.removeSubMenuCommandWindow();
            } else {
                this._subMenuWindow.deactivate();
            }
        } else {
            this.executeSubCommand();
        }
    };

    Scene_Menu.prototype.onSubCommandCancel = function() {
        this.removeSubMenuCommandWindow();
        this._commandWindow.activate();
    };

    var _Scene_Menu_onPersonalCancel      = Scene_Menu.prototype.onPersonalCancel;
    Scene_Menu.prototype.onPersonalCancel = function() {
        _Scene_Menu_onPersonalCancel.apply(this);
        this._commandWindow.maskOff();
        /* 最後に選択していたメニューにカーソルを合わせる */
        this.selectLastCommand();
    };

    /**
     * 最後に選択していたメニューにカーソルを合わせる
     */
    Scene_Menu.prototype.selectLastCommand = function() {
        var lastSubCommand = $gameTemp.getLastSubCommand();
        if (lastSubCommand.parent) {
            this._commandWindow.selectSymbol('parent' + lastSubCommand.parent);
            var subCommands = $gameTemp.getSubMenuCommands(lastSubCommand.parent);
            if (subCommands.length !== 1) {
                this.commandParent();
                this._commandWindow.deactivate();
                this._subMenuWindow.select(lastSubCommand.index);
                /* 別シーンからキャラ選択に戻った時 */
                var subCommand = subCommands[lastSubCommand.index];
                if (subCommand.isNeedSelectMember()) {
                    this._isSubCommandOkAfterCreate = true;
                }
            }
        }
    };

    Scene_Menu.prototype.executeSubCommand = function() {
        this.executeSubScript();
        this.moveSubCommandMap();
        if (!SceneManager.isSceneChanging()) {
            this.onSubCommandCancel();
            this._statusWindow.deselect();
            this._commandWindow.maskOff();
        } else {
            this._subCommandSelected = true;
        }
    };

    Scene_Menu.prototype.executeSubScript = function() {
        var script = this._subCommand.getSelectionScript();
        if (!script) return;
        try {
            eval(script);
        } catch (e) {
            SoundManager.playBuzzer();
            console.error(`実行スクリプトエラー[${script}] メッセージ[${e.message}]`);
        }
    };

    Scene_Menu.prototype.moveSubCommandMap = function() {
        var mapId = this._subCommand.getMoveTargetMap();
        if (mapId <= 0) return;
        $gamePlayer.reserveTransferToSubCommandMap(mapId);
        if (param.selectActorIdVariable && this._subCommand.isNeedSelectMember()) {
            $gameVariables.setValue(param.selectActorIdVariable, this._statusWindow.getSelectedActorId());
        }
        SceneManager.pop();
    };

    /**
     * メニューから抜ける際に最後に選択したサブコマンドをリセットする
     */
    var _Scene_Menu_terminate      = Scene_Menu.prototype.terminate;
    Scene_Menu.prototype.terminate = function() {
        _Scene_Menu_terminate.apply(this, arguments);
        if (!this._subCommandSelected) {
            $gameTemp.resetLastSubCommand();
        }
    };

    var _Scene_Menu_createField      = Scene_Menu.prototype.createField;
    Scene_Menu.prototype.createField = function() {
        _Scene_Menu_createField.apply(this, arguments);
        if (this._subMenuWindow) {
            this.addChild(this._subMenuWindow);
        }
    };

    //=============================================================================
    // Window_MenuCommand
    //  サブコマンドを追加します。
    //=============================================================================
    var _Window_MenuCommand_initialize          = Window_MenuCommand.prototype.initialize;
    Window_MenuCommand.prototype.initialize     = function() {
        this._maskedName = {};
        _Window_MenuCommand_initialize.apply(this);
    };
    var _Window_MenuCommand_initCommandPosition = Window_MenuCommand.initCommandPosition;
    Window_MenuCommand.initCommandPosition      = function() {
        if ($gamePlayer.isInSubCommandMap()) return;
        _Window_MenuCommand_initCommandPosition.apply(this, arguments);
    };

    var _Window_MenuCommand_addOriginalCommands      = Window_MenuCommand.prototype.addOriginalCommands;
    Window_MenuCommand.prototype.addOriginalCommands = function() {
        _Window_MenuCommand_addOriginalCommands.apply(this, arguments);
        if (param.commandPosition === 0) this.makeSubCommandList();
    };

    var _Window_MenuCommand_addOptionsCommand      = Window_MenuCommand.prototype.addOptionsCommand;
    Window_MenuCommand.prototype.addOptionsCommand = function() {
        _Window_MenuCommand_addOptionsCommand.apply(this, arguments);
        if (param.commandPosition === 1) this.makeSubCommandList();
    };

    var _Window_MenuCommand_addSaveCommand      = Window_MenuCommand.prototype.addSaveCommand;
    Window_MenuCommand.prototype.addSaveCommand = function() {
        _Window_MenuCommand_addSaveCommand.apply(this, arguments);
        if (param.commandPosition === 2) this.makeSubCommandList();
    };

    var _Window_MenuCommand_addGameEndCommand      = Window_MenuCommand.prototype.addGameEndCommand;
    Window_MenuCommand.prototype.addGameEndCommand = function() {
        if (this.needsCommand('gameEnd')) {
            _Window_MenuCommand_addGameEndCommand.apply(this, arguments);
        }
        if (param.commandPosition === 3) this.makeSubCommandList();
    };

    var _Window_MenuCommand_needsCommand      = Window_MenuCommand.prototype.needsCommand;
    Window_MenuCommand.prototype.needsCommand = function(name) {
        var need = _Window_MenuCommand_needsCommand.apply(this, arguments);
        if (name === 'options' && param.hideOption) {
            return false;
        }
        if (name === 'gameEnd' && param.hideGameEnd) {
            return false;
        }
        return need;
    };

    Window_MenuCommand.prototype.makeSubCommandList = function() {
        $gameTemp.iterateMenuParents(function(subCommands, parentName) {
            this._subCommands = subCommands;
            if (this.checkSubCommands('isVisible')) {
                var commandName = this._maskedName[parentName] ? this._maskedName[parentName] : subCommands[0].getParentName();
                this.addCommand(commandName, 'parent' + parentName, this.checkSubCommands('isEnable'), parentName);
            }
        }, this);
    };

    Window_MenuCommand.prototype.checkSubCommands = function(methodName) {
        return this._subCommands.some(function(subCommand) {
            return subCommand[methodName]();
        });
    };

    Window_MenuCommand.prototype.calculateSubCommandX = function(width) {
        var x = (this.isHorizontalMenu() ? this._cursorRect.x : this.x + this.width);
        x += userSetting.subCommandWindow.adjustX;
        return x.clamp(0, Graphics.boxWidth - width);
    };

    Window_MenuCommand.prototype.calculateSubCommandY = function(height) {
        var y = (this.isHorizontalMenu() ? this.y + this.height : this._cursorRect.y);
        y += userSetting.subCommandWindow.adjustY;
        return y.clamp(0, Graphics.boxHeight - height);
    };

    Window_MenuCommand.prototype.isHorizontalMenu = function() {
        return this.maxCols() >= this.maxPageRows();
    };

    Window_MenuCommand.prototype.maskCommand = function(maskName) {
        this._maskedName                                 = {};
        this._maskedName[this.commandName(this.index())] = maskName;
        this.refresh();
    };

    Window_MenuCommand.prototype.maskOff = function() {
        this._maskedName = {};
        this.refresh();
    };

    //=============================================================================
    // Window_MenuStatus
    //  選択しているアクターのIDを取得します。
    //=============================================================================
    Window_MenuStatus.prototype.getSelectedActorId = function() {
        return $gameParty.members()[this._index].actorId();
    };

    //=============================================================================
    // Window_MenuSubCommand
    //  サブコマンドウィンドウのクラスです。
    //=============================================================================
    function Window_MenuSubCommand() {
        this.initialize.apply(this, arguments);
    }

    Window_MenuSubCommand.prototype             = Object.create(Window_Command.prototype);
    Window_MenuSubCommand.prototype.constructor = Window_MenuSubCommand;

    Window_MenuSubCommand.prototype.initialize = function(x, y, parentName) {
        this._parentName = parentName;
        Window_Command.prototype.initialize.call(this, x, y);
    };

    Window_MenuSubCommand.prototype.makeCommandList = function() {
        var subMenus = $gameTemp.getSubMenuCommands(this._parentName);
        subMenus.forEach(function(subMenu) {
            if (subMenu.isVisible()) {
                this.addCommand(subMenu.getName(), 'ok', subMenu.isEnable(), subMenu);
            }
        }, this);
    };

    Window_MenuSubCommand.prototype.numVisibleRows = function() {
        return param.horizontalSubMenu ? 1 : Window_Command.prototype.numVisibleRows.call(this);
    };

    Window_MenuSubCommand.prototype.maxCols = function() {
        return param.horizontalSubMenu ? this.maxItems() : 1;
    };

    Window_MenuSubCommand.prototype.windowWidth = function() {
        return param.subMenuWidth || Window_Command.prototype.windowWidth.call(this);
    };

    Window_MenuSubCommand.prototype.lineHeight = function() {
        if (userSetting.subCommandWindow.fontSize) {
            return userSetting.subCommandWindow.fontSize + 8;
        } else {
            return Window_Command.prototype.lineHeight.call(this);
        }
    };

    Window_MenuSubCommand.prototype.updatePlacement = function(commandWindow) {
        this.x = param.subMenuX || commandWindow.calculateSubCommandX(this.width);
        this.y = param.subMenuY || commandWindow.calculateSubCommandY(this.height);
    };

    Window_MenuSubCommand.prototype.standardFontSize = function() {
        return userSetting.subCommandWindow.fontSize || Window_Command.prototype.standardFontSize.call(this);
    };

    Window_MenuSubCommand.prototype.standardPadding = function() {
        return userSetting.subCommandWindow.padding || Window_Command.prototype.standardPadding.call(this);
    };

    Window_MenuSubCommand.prototype.loadWindowskin = function() {
        if (param.windowSkin) {
            this.windowskin = ImageManager.loadSystem(param.windowSkin);
        } else {
            Window_Command.prototype.loadWindowskin.call(this);
        }
    };

    var _Window_MenuSubCommand_itemTextAlign = Window_MenuSubCommand.prototype.itemTextAlign;
    Window_MenuSubCommand.prototype.itemTextAlign = function() {
        return param.subMenuAlign || _Window_MenuSubCommand_itemTextAlign.apply(this, arguments);
    };

    //=============================================================================
    // Game_MenuSubCommand
    //  サブコマンドを扱うクラスです。
    //=============================================================================
    class Game_MenuSubCommand {
        constructor(subCommandData) {
            this._parentName      = subCommandData.ParentName;
            this._name            = subCommandData.Name;
            this._hiddenSwitchId  = subCommandData.HiddenSwitchId;
            this._disableSwitchId = subCommandData.DisableSwitchId;
            this._targetScript    = subCommandData.Script;
            this._targetMapId     = subCommandData.MapId;
            this._memberSelect    = getArgBoolean(subCommandData.SelectMember);
        }

        getName() {
            return this._name;
        }

        getParentName() {
            return this._parentName;
        }

        isVisible() {
            return !$gameSwitches.value(this.convert(this._hiddenSwitchId, true));
        }

        isEnable() {
            return !$gameSwitches.value(this.convert(this._disableSwitchId, true)) &&
                !(SceneManager.isSceneRetry && SceneManager.isSceneRetry() && this.getMoveTargetMap() > 0);
        }

        isNeedSelectMember() {
            return !!this._memberSelect;
        }

        getSelectionScript() {
            return this.convert(this._targetScript, false);
        }

        getMoveTargetMap() {
            return this.convert(this._targetMapId, true);
        }

        convert(text, isNumber) {
            var convertText = convertEscapeCharacters(text);
            return isNumber ? parseInt(convertText) : convertText;
        }
    }
})();

